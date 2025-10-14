"use client";
import React, {
  useState,
  useEffect,
  useRef,
  useContext,
  useCallback,
} from "react";
import axios from "axios";
import { useUserAuth } from "../../utilities/userAuthMiddleware";
import { IoArrowBack } from "react-icons/io5";
import { LiaSearchSolid } from "react-icons/lia";
import { IoMdClose } from "react-icons/io";
import { FaRegPaperPlane } from "react-icons/fa";
import UserProfileSidebar from "./UserProfileSidebar";
import GroupDetailsSidebar from "./GroupDetailsSidebar";
import LeadFormModal from "./LeadFormModal";
import ClickableAddress from "../ClickableAddress";
import socket from "../../utilities/socket";
import { OnlineUsersContext } from "../../contexts/OnlineUsersContext";
import toast from "react-hot-toast";

const GlobalChatWindow = ({
  chapterNo,
  selectedGroupId,
  groupName,
  groupImage,
  groupData,
  onBack,
  setActiveTab,
}) => {
  const { user } = useUserAuth();
  const { onlineCounts, onlineUsers } = useContext(OnlineUsersContext);
  const [messages, setMessages] = useState([]);
  const [leadModalOpen, setLeadModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [groupMembers, setGroupMembers] = useState([]);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [searchActive, setSearchActive] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [userInfoSidebar, setUserInfoSidebar] = useState({
    isOpen: false,
    userId: null,
  });
  const [selectedUser, setSelectedUser] = useState(null);
  const [showMembers, setShowMembers] = useState(false);
  const [groupDetailsSidebar, setGroupDetailsSidebar] = useState({
    isOpen: false,
    group: null,
  });
  const messagesEndRef = useRef(null);

  const fetchGroupMembers = useCallback(async () => {
    if (!selectedGroupId) {
      setGroupMembers([]);
      return;
    }
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_URL}/global-groups/${selectedGroupId}`,
        { withCredentials: true }
      );
      setGroupMembers(response.data.members || []);
    } catch (error) {
      console.error("Error fetching global group members:", error);
      setGroupMembers([]);
    }
  }, [selectedGroupId]);
  useEffect(() => {
    if (selectedGroupId) {
      fetchGlobalMessages();
      fetchGroupMembers();
    }
  }, [selectedGroupId, fetchGroupMembers]);

  useEffect(() => {
    // Add a small delay to ensure DOM has been updated before scrolling
    const timeoutId = setTimeout(() => {
      scrollToBottom();
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [messages]);

  // Listen for new-approved-lead socket event (for global leads)
  useEffect(() => {
    if (!user || !selectedGroupId || !socket || !socket.connected) return;
    const handler = (lead) => {
      if (
        lead.groupId === selectedGroupId ||
        (lead.groupId && lead.groupId._id === selectedGroupId)
      ) {
        setMessages((prev) => {
          if (prev.some((l) => l._id === lead._id)) return prev;
          return [...prev, lead];
        });
      }
    };
    socket.on("new-approved-global-lead", handler);
    return () => {
      if (socket && socket.connected) {
        socket.off("new-approved-global-lead", handler);
      }
    };
  }, [user, selectedGroupId, socket]);

  // Listen for global group membership changes
  useEffect(() => {
    if (!user || !selectedGroupId || !socket || !socket.connected) return;

    const handleUserJoined = (data) => {
      if (data.groupId === selectedGroupId) {
        // Refresh members list when someone joins
        fetchGroupMembers();
        // Optionally show a toast notification
        if (data.userId !== user._id) {
          toast.success(data.message);
        }
      }
    };

    const handleUserLeft = (data) => {
      if (data.groupId === selectedGroupId) {
        // Refresh members list when someone leaves
        fetchGroupMembers();
        // Optionally show a toast notification
        if (data.userId !== user._id) {
          toast.info(data.message);
        }
      }
    };

    socket.on("user-joined-global-group", handleUserJoined);
    socket.on("user-left-global-group", handleUserLeft);

    return () => {
      if (socket && socket.connected) {
        socket.off("user-joined-global-group", handleUserJoined);
        socket.off("user-left-global-group", handleUserLeft);
      }
    };
  }, [user, selectedGroupId, fetchGroupMembers, socket]);

  const fetchGlobalMessages = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_URL}/global-leads/${selectedGroupId}`,
        {
          withCredentials: true,
        }
      );
      setMessages(response.data.leads || []);
    } catch (error) {
      console.error("Error fetching global messages:", error);
      setError("Failed to load messages");
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (vals) => {
    try {
      setSending(true);
      setError("");

      // Check if user has countryCode
      if (!user?.countryCode) {
        toast.error(
          "Please update your profile with country information before creating leads."
        );
        setError("Country information required");
        return;
      }

      const form = new FormData();
      form.append("groupId", selectedGroupId);
      form.append("type", vals.leadType);
      if (chapterNo) {
        form.append("chapterNo", chapterNo);
      }
      form.append("hscode", vals.hscode.trim());
      form.append("description", vals.description.trim());
      form.append("quantity", vals.quantity);
      form.append("packing", vals.packing);
      form.append("targetPrice", vals.targetPrice);
      form.append("negotiable", vals.negotiable);
      form.append("buyerDeliveryAddress", vals.buyerDeliveryAddress);
      if (vals.buyerLat && vals.buyerLng) {
        form.append("buyerLat", vals.buyerLat);
        form.append("buyerLng", vals.buyerLng);
      }
      form.append("sellerPickupAddress", vals.sellerPickupAddress);
      if (vals.sellerLat && vals.sellerLng) {
        form.append("sellerLat", vals.sellerLat);
        form.append("sellerLng", vals.sellerLng);
      }
      form.append("specialRequest", vals.specialRequest);
      form.append("remarks", vals.remarks);
      if (vals.documents && vals.documents.length > 0) {
        vals.documents.forEach((file) => form.append("documents", file));
      }
      await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_URL}/global-leads/requested`,
        form,
        {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      setLeadModalOpen(false);
      toast.success("Your lead has been submitted for approval!");
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to send lead";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setSending(false);
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const handleUserAvatarClick = async (userId) => {
    try {
      // Fetch user info for the profile sidebar
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_URL}/user/${userId}`,
        { withCredentials: true }
      );
      setSelectedUser(response.data);
      setUserInfoSidebar({
        isOpen: true,
        userId: userId,
      });
    } catch (error) {
      console.error("Error fetching user info:", error);
    }
  };

  const closeUserInfoSidebar = () => {
    setUserInfoSidebar({
      isOpen: false,
      userId: null,
    });
    setSelectedUser(null);
  };

  const handleGroupNameClick = () => {
    if (selectedGroupId && groupName) {
      setGroupDetailsSidebar({
        isOpen: true,
        group: {
          _id: selectedGroupId,
          name: groupName,
          heading: groupData?.heading || "",
          image: groupImage || groupData?.image || "",
          chapterNumber: chapterNo,
          countryCode: groupData?.countryCode || "",
        },
      });
    }
  };

  const closeGroupDetailsSidebar = () => {
    setGroupDetailsSidebar({
      isOpen: false,
      group: null,
    });
  };

  const handleStartChat = (chat) => {
    // Switch to user-chat tab instead of navigating
    if (setActiveTab) {
      setActiveTab("user-chat");
    }
  };

  // Filtered messages for search
  const filteredMessages = searchTerm.trim()
    ? messages.filter((msg) => {
        const text = (msg.description || msg.content || "").toLowerCase();
        const hs = (msg.hscode || "").toLowerCase();
        return (
          text.includes(searchTerm.toLowerCase()) ||
          hs.includes(searchTerm.toLowerCase())
        );
      })
    : messages;

  // Always show messages oldest at top, newest at bottom
  const sortedMessages = [...filteredMessages].sort(
    (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
  );

  // Helper for date separator
  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    if (date.toDateString() === today.toDateString()) return "Today";
    if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      // Use scrollTop instead of scrollIntoView to prevent page-level scrolling
      const messagesContainer =
        messagesEndRef.current.closest(".overflow-y-auto");
      if (messagesContainer) {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
      } else {
        // Fallback to scrollIntoView with block: 'nearest' to prevent page scrolling
        messagesEndRef.current.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "nearest",
        });
      }
    }
  };

  if (!selectedGroupId) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-500">Select a group to start chatting</div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col h-full">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white sticky top-0 z-10">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {/* Back button for mobile */}
          {onBack && (
            <button
              onClick={onBack}
              className="md:hidden p-2 rounded-md hover:bg-gray-100 -ml-2"
            >
              <IoArrowBack className="w-5 h-5" />
            </button>
          )}

          {/* Group avatar and name */}
          <div
            className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-lg font-bold text-white overflow-hidden flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={handleGroupNameClick}
            title="Click to view group details"
          >
            {groupImage ? (
              <img
                src={
                  groupImage.includes("https")
                    ? groupImage
                    : `${process.env.NEXT_PUBLIC_BASE_URL}/upload/${groupImage}`
                }
                className="w-full h-full object-cover rounded-full"
                alt={groupName}
              />
            ) : (
              <span>{groupName?.charAt(0)?.toUpperCase() || "G"}</span>
            )}
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <span
              className="text-base font-semibold text-gray-900 cursor-pointer hover:text-blue-600 transition-colors"
              onClick={handleGroupNameClick}
              title={`Click to view group details - ${
                groupName || "Group Chat"
              }`}
            >
              {groupName && groupName.length > 50
                ? `${groupName.substring(0, 50)}...`
                : groupName || "Group Chat"}
            </span>
            <div className="text-xs text-gray-600 truncate">
              {Array.isArray(onlineUsers[selectedGroupId]) &&
              onlineUsers[selectedGroupId].length > 0
                ? onlineUsers[selectedGroupId]
                    .slice(0, 4)
                    .map((u) => u.name)
                    .join(", ") +
                  (onlineUsers[selectedGroupId].length > 4
                    ? ` +${onlineUsers[selectedGroupId].length - 4} more online`
                    : "")
                : "No one online"}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            className="p-2 rounded hover:bg-gray-100 flex items-center gap-1"
            onClick={() => setShowMembers((v) => !v)}
            title="Show members"
            type="button"
          >
            <span className="text-xs text-gray-700 hidden sm:inline">
              Members
            </span>
          </button>
          {/* Search icon/button */}
          {searchActive ? (
            <div className="flex items-center gap-2 bg-gray-100 px-2 py-1 rounded">
              <input
                autoFocus
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search in chat..."
                className="bg-transparent outline-none text-sm px-1 min-w-0"
              />
              <button
                onClick={() => {
                  setSearchActive(false);
                  setSearchTerm("");
                }}
              >
                <IoMdClose className="w-5 h-5 text-gray-500 flex-shrink-0" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setSearchActive(true)}
              className="p-2 rounded hover:bg-gray-100"
            >
              <LiaSearchSolid className="w-5 h-5 text-gray-600" />
            </button>
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-9 space-y-4 bg-[#faf7f4]">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : sortedMessages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="text-gray-400 text-4xl mb-2">💬</div>
              <p className="text-gray-500">No approved messages yet</p>
              <p className="text-gray-400 text-sm">
                Your messages will appear here after approval
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4 md:space-y-9">
            {/* Date separator logic */}
            {(() => {
              let lastDate = null;
              return sortedMessages.map((msg, idx) => {
                const isOwnMessage = msg.userId._id === user?._id;
                const msgDate = new Date(msg.createdAt);
                const dateLabel = formatDate(msg.createdAt);
                const showDate =
                  !lastDate ||
                  new Date(lastDate).toDateString() !== msgDate.toDateString();
                lastDate = msg.createdAt;
                return (
                  <React.Fragment key={msg._id}>
                    {showDate && (
                      <div className="flex justify-center my-2">
                        <span className="bg-[#e0ddd9] text-gray-600 text-xs px-3 py-1 rounded-md shadow-sm">
                          {dateLabel}
                        </span>
                      </div>
                    )}
                    <div
                      className={`flex ${
                        isOwnMessage ? "justify-end" : "justify-start"
                      }`}
                    >
                      {/* Only show avatar for others' messages on the left */}
                      {!isOwnMessage && (
                        <div className="order-1 mr-2">
                          <div
                            className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() =>
                              handleUserAvatarClick(msg.userId._id)
                            }
                          >
                            {msg.userId?.image ? (
                              <img
                                src={msg.userId.image}
                                alt={msg.userId.name}
                                className="w-8 h-8 rounded-full object-cover"
                              />
                            ) : (
                              <span className="text-xs text-gray-600 font-medium">
                                {msg.userId?.name?.charAt(0)?.toUpperCase()}
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                      <div
                        className={`max-w-[85%] sm:max-w-lg lg:max-w-2xl ${
                          isOwnMessage ? "order-2" : "order-1"
                        }`}
                      >
                        {msg.hscode || msg.description ? (
                          <div
                            className={`rounded-lg shadow-sm border overflow-hidden ${
                              msg.type === "buy"
                                ? "bg-blue-50 border-blue-200"
                                : msg.type === "sell"
                                ? "bg-green-50 border-green-200"
                                : msg.type === "high-sea-buy"
                                ? "bg-indigo-50 border-indigo-200"
                                : msg.type === "high-sea-sell"
                                ? "bg-purple-50 border-purple-200"
                                : "bg-white border-gray-200"
                            }`}
                          >
                            {/* Header with badges */}
                            <div
                              className={`px-3 py-2 border-b ${
                                msg.type === "buy"
                                  ? "bg-blue-100 border-blue-200"
                                  : msg.type === "sell"
                                  ? "bg-green-100 border-green-200"
                                  : msg.type === "high-sea-buy"
                                  ? "bg-indigo-100 border-indigo-200"
                                  : msg.type === "high-sea-sell"
                                  ? "bg-purple-100 border-purple-200"
                                  : "bg-gray-50 border-gray-200"
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span
                                    className={`px-2 py-0.5 rounded text-xs font-medium ${
                                      msg.type === "buy"
                                        ? "bg-blue-200 text-blue-800"
                                        : msg.type === "sell"
                                        ? "bg-green-200 text-green-800"
                                        : msg.type === "high-sea-buy"
                                        ? "bg-indigo-200 text-indigo-800"
                                        : msg.type === "high-sea-sell"
                                        ? "bg-purple-200 text-purple-800"
                                        : "bg-gray-200 text-gray-800"
                                    }`}
                                  >
                                    {msg.type === "buy"
                                      ? "BUY"
                                      : msg.type === "sell"
                                      ? "SELL"
                                      : msg.type === "high-sea-buy"
                                      ? "HIGH SEA BUY"
                                      : msg.type === "high-sea-sell"
                                      ? "HIGH SEA SELL"
                                      : "LEAD"}
                                  </span>
                                  {msg.hscode && (
                                    <span className="px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
                                      HS: {msg.hscode}
                                    </span>
                                  )}
                                  {msg.leadCode && (
                                    <span className="px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
                                      ID: {msg.leadCode}
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-1.5">
                                  {/* Admin Badge */}
                                  {msg.isAdminPost && (
                                    <span className="px-2 py-0.5 rounded text-xs font-medium text-violet-700">
                                      ~ Admin
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Main Content */}
                            <div className="p-3 space-y-3">
                              {/* Description */}
                              {msg.description && (
                                <div className="bg-white rounded p-2 border border-gray-200">
                                  <h3 className="text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">
                                    Description
                                  </h3>
                                  <p className="text-sm text-gray-800 leading-relaxed">
                                    {msg.description}
                                  </p>
                                </div>
                              )}

                              {/* Product Details Grid */}
                              {(msg.quantity ||
                                msg.packing ||
                                msg.targetPrice ||
                                msg.negotiable !== undefined) && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                  {msg.quantity && (
                                    <div className="bg-white rounded p-2 border border-gray-200">
                                      <div className="text-xs font-semibold text-blue-600 mb-1 uppercase tracking-wide">
                                        Quantity
                                      </div>
                                      <div className="text-sm text-gray-800 font-medium">
                                        {msg.quantity}
                                      </div>
                                    </div>
                                  )}
                                  {msg.packing && (
                                    <div className="bg-white rounded p-2 border border-gray-200">
                                      <div className="text-xs font-semibold text-green-600 mb-1 uppercase tracking-wide">
                                        Packing
                                      </div>
                                      <div className="text-sm text-gray-800 font-medium">
                                        {msg.packing}
                                      </div>
                                    </div>
                                  )}
                                  {(msg.targetPrice ||
                                    msg.negotiable !== undefined) && (
                                    <div className="bg-white rounded p-2 border border-gray-200">
                                      <div className="text-xs font-semibold text-yellow-600 mb-1 uppercase tracking-wide">
                                        Price
                                      </div>
                                      <div className="text-sm text-gray-800 font-medium">
                                        {msg.targetPrice || "Not specified"}
                                        {msg.negotiable && (
                                          <span className="ml-1 text-xs bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded">
                                            Negotiable
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* Location Information */}
                              {(msg.buyerDeliveryLocation?.address ||
                                msg.sellerPickupLocation?.address) && (
                                <div className="space-y-2">
                                  <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                                    Location Details
                                  </h3>
                                  <div className="grid gap-2">
                                    {msg.buyerDeliveryLocation?.address && (
                                      <div className="bg-white rounded p-2 border border-gray-200">
                                        <div className="text-xs font-semibold text-red-600 mb-1 uppercase tracking-wide">
                                          Delivery Location
                                        </div>
                                        <ClickableAddress
                                          address={
                                            msg.buyerDeliveryLocation.address
                                          }
                                          coordinates={
                                            msg.buyerDeliveryLocation.geo
                                              ?.coordinates &&
                                            Array.isArray(
                                              msg.buyerDeliveryLocation.geo
                                                .coordinates
                                            ) &&
                                            msg.buyerDeliveryLocation.geo
                                              .coordinates.length >= 2
                                              ? {
                                                  latitude:
                                                    msg.buyerDeliveryLocation
                                                      .geo.coordinates[1],
                                                  longitude:
                                                    msg.buyerDeliveryLocation
                                                      .geo.coordinates[0],
                                                }
                                              : null
                                          }
                                          label=""
                                          showLabel={false}
                                          className="w-full"
                                        />
                                      </div>
                                    )}
                                    {msg.sellerPickupLocation?.address && (
                                      <div className="bg-white rounded p-2 border border-gray-200">
                                        <div className="text-xs font-semibold text-green-600 mb-1 uppercase tracking-wide">
                                          Pickup Location
                                        </div>
                                        <ClickableAddress
                                          address={
                                            msg.sellerPickupLocation.address
                                          }
                                          coordinates={
                                            msg.sellerPickupLocation.geo
                                              ?.coordinates &&
                                            Array.isArray(
                                              msg.sellerPickupLocation.geo
                                                .coordinates
                                            ) &&
                                            msg.sellerPickupLocation.geo
                                              .coordinates.length >= 2
                                              ? {
                                                  latitude:
                                                    msg.sellerPickupLocation.geo
                                                      .coordinates[1],
                                                  longitude:
                                                    msg.sellerPickupLocation.geo
                                                      .coordinates[0],
                                                }
                                              : null
                                          }
                                          label=""
                                          showLabel={false}
                                          className="w-full"
                                        />
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* Additional Information */}
                              {(msg.specialRequest || msg.remarks) && (
                                <div className="space-y-2">
                                  <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                                    Additional Information
                                  </h3>
                                  <div className="space-y-1.5">
                                    {msg.specialRequest && (
                                      <div className="bg-white rounded p-2 border border-gray-200">
                                        <div className="text-xs font-semibold text-purple-600 mb-1 uppercase tracking-wide">
                                          Special Request
                                        </div>
                                        <p className="text-sm text-gray-800">
                                          {msg.specialRequest}
                                        </p>
                                      </div>
                                    )}
                                    {msg.remarks && (
                                      <div className="bg-white rounded p-2 border border-gray-200">
                                        <div className="text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">
                                          Notes
                                        </div>
                                        <p className="text-sm text-gray-800">
                                          {msg.remarks}
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* Administrative Information */}
                              {(msg.leadCode || msg.adminComment) && (
                                <div className="space-y-2">
                                  <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                                    Lead Information
                                  </h3>
                                  <div className="space-y-1.5">
                                    {msg.leadCode && (
                                      <div className="bg-white rounded p-2 border border-gray-200">
                                        <div className="text-xs font-semibold text-indigo-600 mb-1 uppercase tracking-wide">
                                          Lead ID
                                        </div>
                                        <p className="text-sm text-gray-800 font-mono">
                                          {msg.leadCode}
                                        </p>
                                      </div>
                                    )}
                                    {msg.adminComment && (
                                      <div className="bg-white rounded p-2 border border-gray-200">
                                        <div className="text-xs font-semibold text-orange-600 mb-1 uppercase tracking-wide">
                                          Admin Comment
                                        </div>
                                        <p className="text-sm text-gray-800">
                                          {msg.adminComment}
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* Documents */}
                              {Array.isArray(msg.documents) &&
                                msg.documents.length > 0 && (
                                  <div className="space-y-1.5">
                                    <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                                      Attachments ({msg.documents.length})
                                    </h3>
                                    <div className="flex flex-wrap gap-1.5">
                                      {msg.documents.map((doc, i) => (
                                        <a
                                          key={i}
                                          href={`${process.env.NEXT_PUBLIC_BASE_URL}/leadDocuments/${doc}`}
                                          target="_blank"
                                          rel="noreferrer"
                                          className="inline-flex items-center gap-1.5 px-2 py-1.5 rounded bg-white text-blue-700 hover:bg-blue-50 border border-gray-200 transition-colors text-xs font-medium"
                                        >
                                          <span className="text-xs">DOC</span>
                                          <span className="truncate max-w-[120px]">
                                            {doc}
                                          </span>
                                          <span className="text-xs bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">
                                            View
                                          </span>
                                        </a>
                                      ))}
                                    </div>
                                  </div>
                                )}
                            </div>
                          </div>
                        ) : (
                          <div className="bg-white rounded-2xl px-4 py-3 shadow-sm border border-gray-200">
                            <p className="text-sm break-words text-gray-800">
                              {msg.content}
                            </p>
                          </div>
                        )}
                        <div
                          className={`text-xs text-gray-500 mt-1 ${
                            isOwnMessage ? "text-right" : "text-left"
                          }`}
                        >
                          {formatTime(msg.createdAt)}
                        </div>
                      </div>
                    </div>
                  </React.Fragment>
                );
              });
            })()}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
      {/* Action bar */}
      <div className="p-3 md:p-4 border-t border-gray-200 flex-shrink-0 bg-white flex items-center justify-end">
        <button
          type="button"
          onClick={() => setLeadModalOpen(true)}
          className={`items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-black/90 ${
            leadModalOpen ? "hidden" : "inline-flex"
          }`}
        >
          <FaRegPaperPlane className="w-4 h-4" /> Post Lead
        </button>
      </div>

      <LeadFormModal
        isOpen={leadModalOpen}
        onClose={() => setLeadModalOpen(false)}
        groupHSCode={groupData?.heading || ""}
        groupName={groupName || ""}
        onSubmit={handleSendMessage}
        sending={sending}
        user={user}
        groupType="global"
      />
      {/* User Profile Sidebar */}
      <UserProfileSidebar
        user={selectedUser}
        isOpen={userInfoSidebar.isOpen}
        onClose={closeUserInfoSidebar}
        currentUser={user}
        onStartChat={handleStartChat}
        setActiveTab={setActiveTab}
      />

      <GroupDetailsSidebar
        isOpen={groupDetailsSidebar.isOpen}
        onClose={closeGroupDetailsSidebar}
        group={groupDetailsSidebar.group}
        groupType="global"
        onlineCount={onlineUsers[selectedGroupId]?.length || 0}
      />

      {showMembers && (
        <div className="absolute right-4 top-14 bg-white border border-gray-200 rounded shadow-lg z-20 min-w-[220px] max-h-80 overflow-y-auto">
          <div className="p-2 text-gray-700 border-b border-gray-100 text-sm">
            Members ({groupMembers.length})
          </div>
          <div className="py-1">
            {groupMembers.length > 0 ? (
              groupMembers.map((member) => {
                // Check if this member is online
                const isOnline = (onlineUsers[selectedGroupId] || []).some(
                  (onlineUser) => onlineUser.id === member._id
                );
                const onlineUserData = (
                  onlineUsers[selectedGroupId] || []
                ).find((onlineUser) => onlineUser.id === member._id);

                return (
                  <div
                    key={member._id}
                    className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleUserAvatarClick(member._id)}
                  >
                    <div className="relative">
                      <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden">
                        {member.image ? (
                          <img
                            src={`${process.env.NEXT_PUBLIC_BASE_URL}/uploads/${member.image}`}
                            alt={member.name}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-xs text-gray-600 font-medium">
                            {member.name?.charAt(0)?.toUpperCase()}
                          </span>
                        )}
                      </div>
                      {/* Online indicator */}
                      <span
                        className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
                          isOnline ? "bg-green-500" : "bg-gray-400"
                        }`}
                      ></span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-sm text-gray-900 truncate block">
                        {member.name}
                        {onlineUserData?.role === "admin" && (
                          <span className="ml-1 text-violet-600 font-medium text-xs">
                            (Admin)
                          </span>
                        )}
                      </span>
                      <span className="text-xs text-gray-500">
                        {isOnline ? "Online" : "Offline"}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="px-3 py-2 text-xs text-gray-500">
                No members found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default GlobalChatWindow;
