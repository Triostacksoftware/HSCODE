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
import UserInfoSidebar from "./UserInfoSidebar";
import MapPicker from "./MapPicker";
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
}) => {
  console.log("GlobalChatWindow props:", {
    chapterNo,
    selectedGroupId,
    groupName,
    groupImage,
    groupData,
  });
  const { user } = useUserAuth();
  const { onlineCounts, onlineUsers } = useContext(OnlineUsersContext);
  const [messages, setMessages] = useState([]);
  // Lead form state
  const [leadType, setLeadType] = useState("buy");
  const [hscode, setHscode] = useState("");
  const [description, setDescription] = useState("");
  const [quantity, setQuantity] = useState("");
  const [packing, setPacking] = useState("");
  const [targetPrice, setTargetPrice] = useState("");
  const [negotiable, setNegotiable] = useState(false);
  const [buyerDeliveryAddress, setBuyerDeliveryAddress] = useState("");
  const [sellerPickupAddress, setSellerPickupAddress] = useState("");
  const [specialRequest, setSpecialRequest] = useState("");
  const [remarks, setRemarks] = useState("");
  const [documents, setDocuments] = useState([]);
  const [docPreviews, setDocPreviews] = useState([]);
  const [mapPicker, setMapPicker] = useState({ open: false, role: "buyer" });
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
  const [showMembers, setShowMembers] = useState(false);
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
    scrollToBottom();
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

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (
      !hscode.trim() ||
      !description.trim() ||
      !quantity.trim() ||
      !packing.trim() ||
      !targetPrice.trim()
    ) {
      toast.error("Please fill required fields");
      return;
    }
    try {
      setSending(true);
      setError("");
      const form = new FormData();
      form.append("groupId", selectedGroupId);
      form.append("type", leadType);
      if (chapterNo) {
        form.append("chapterNo", chapterNo);
      }
      form.append("hscode", hscode.trim());
      form.append("description", description.trim());
      form.append("quantity", quantity);
      form.append("packing", packing);
      form.append("targetPrice", targetPrice);
      form.append("negotiable", negotiable);
      if (leadType === "buy") {
        form.append("buyerDeliveryAddress", buyerDeliveryAddress);
      } else {
        form.append("sellerPickupAddress", sellerPickupAddress);
      }
      form.append("specialRequest", specialRequest);
      form.append("remarks", remarks);
      if (documents && documents.length > 0) {
        documents.forEach((file) => form.append("documents", file));
      }
      await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_URL}/global-leads/requested`,
        form,
        {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      // reset
      setLeadType("buy");
      setHscode("");
      setDescription("");
      setQuantity("");
      setPacking("");
      setTargetPrice("");
      setNegotiable(false);
      setBuyerDeliveryAddress("");
      setSellerPickupAddress("");
      setSpecialRequest("");
      setRemarks("");
      setDocuments([]);
      setDocPreviews([]);
      setLeadModalOpen(false);
      toast.success("Your lead has been submitted for approval!");
    } catch (error) {
      console.error("Error sending global lead:", error);
      setError("Failed to send lead");
    } finally {
      setSending(false);
    }
  };

  // file previews
  useEffect(() => {
    const previews = (documents || []).map((file) => ({
      name: file.name,
      type: file.type,
      url: file.type?.startsWith("image/") ? URL.createObjectURL(file) : null,
    }));
    setDocPreviews((old) => {
      old?.forEach((p) => p.url && URL.revokeObjectURL(p.url));
      return previews;
    });
    return () => {
      previews.forEach((p) => p.url && URL.revokeObjectURL(p.url));
    };
  }, [documents]);

  const appendDocuments = (fileList) => {
    const incoming = Array.from(fileList || []);
    setDocuments((prev) => {
      const dedupeMap = new Map(
        (prev || []).map((f) => [`${f.name}-${f.size}-${f.lastModified}`, f])
      );
      incoming.forEach((f) =>
        dedupeMap.set(`${f.name}-${f.size}-${f.lastModified}`, f)
      );
      return Array.from(dedupeMap.values());
    });
  };

  const removeDocumentAt = (indexToRemove) => {
    setDocuments((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const handleUserAvatarClick = (userId) => {
    setUserInfoSidebar({
      isOpen: true,
      userId: userId,
    });
  };

  const closeUserInfoSidebar = () => {
    setUserInfoSidebar({
      isOpen: false,
      userId: null,
    });
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
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
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
          <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-lg font-bold text-white overflow-hidden flex-shrink-0">
            {groupImage ? (
              <img
                src={
                  groupImage.includes("https")
                    ? groupImage
                    : `${process.env.NEXT_PUBLIC_BASE_URL}/uploads/${groupImage}`
                }
                className="w-full h-full object-cover rounded-full"
                alt={groupName}
              />
            ) : (
              <span>{groupName?.charAt(0)?.toUpperCase() || "G"}</span>
            )}
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-base font-semibold text-gray-900 truncate">
              {groupName || "Group Chat"}
            </span>
            <span className="text-xs text-gray-500">
              {onlineCounts[selectedGroupId] || 0} online
            </span>
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
                        className={`max-w-[75%] sm:max-w-xs lg:max-w-md ${
                          isOwnMessage ? "order-2" : "order-1"
                        }`}
                      >
                        <div
                          className={`rounded-xl px-3 md:px-4 py-2 shadow-sm border ${
                            msg.isAdminPost
                              ? "bg-violet-100 border-violet-200 text-gray-900"
                              : msg.type === "buy"
                              ? "bg-blue-50 border-blue-100 text-gray-900"
                              : msg.type === "sell"
                              ? "bg-green-50 border-green-100 text-gray-900"
                              : "bg-white border-gray-200 text-gray-900"
                          }`}
                        >
                          {msg.hscode || msg.description ? (
                            <div className="text-sm space-y-2">
                              <div className="flex items-center gap-2">
                                {msg.isAdminPost && (
                                  <span className="px-2 py-0.5 rounded-full text-[11px] bg-violet-100 text-violet-700">
                                    ADMIN
                                  </span>
                                )}
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[11px] ${
                                    msg.type === "buy"
                                      ? "bg-blue-100 text-blue-700"
                                      : "bg-green-100 text-green-700"
                                  }`}
                                >
                                  {(msg.type || "Lead").toUpperCase()}
                                </span>
                                {msg.hscode && (
                                  <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 text-[11px]">
                                    HS: {msg.hscode}
                                  </span>
                                )}
                                {msg.leadCode && (
                                  <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 text-[11px]">
                                    ID: {msg.leadCode}
                                  </span>
                                )}
                              </div>
                              {msg.description && (
                                <div className="text-gray-800 font-medium leading-6">
                                  {msg.description}
                                </div>
                              )}
                              <div className="flex flex-wrap gap-2 text-[11px] text-gray-700">
                                {msg.quantity && <div>Qty: {msg.quantity}</div>}
                                {msg.packing && (
                                  <div>Packing: {msg.packing}</div>
                                )}
                                {(msg.targetPrice ||
                                  msg.negotiable !== undefined) && (
                                  <div>
                                    Target: {msg.targetPrice || "-"}{" "}
                                    {msg.negotiable ? "(Negotiable)" : ""}
                                  </div>
                                )}
                              </div>
                              <div className="text-xs text-gray-700 space-y-1">
                                {msg.buyerDeliveryLocation?.address && (
                                  <div>
                                    Delivery:{" "}
                                    {msg.buyerDeliveryLocation.address}
                                  </div>
                                )}
                                {msg.sellerPickupLocation?.address && (
                                  <div>
                                    Pickup: {msg.sellerPickupLocation.address}
                                  </div>
                                )}
                              </div>
                              {Array.isArray(msg.documents) &&
                                msg.documents.length > 0 && (
                                  <div className="mt-2 flex flex-col gap-1">
                                    {msg.documents.map((doc, i) => (
                                      <a
                                        key={i}
                                        href={`${process.env.NEXT_PUBLIC_BASE_URL}/leadDocuments/${doc}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-xs text-blue-700 underline break-all"
                                      >
                                        {doc}
                                      </a>
                                    ))}
                                  </div>
                                )}
                            </div>
                          ) : (
                            <p className="text-sm break-words">{msg.content}</p>
                          )}
                        </div>
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

      {/* Lead Form Modal */}
      {leadModalOpen && (
        <div className="absolute inset-0 z-50 flex items-end md:items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50 animate-fade-in-overlay"
            onClick={() => setLeadModalOpen(false)}
          />
          <div className="relative bg-white w-full md:w-[900px] h-1/2 md:h-auto rounded-t-2xl md:rounded-xl shadow-xl animate-slide-up-modal">
            <div className="flex items-center justify-between px-8 py-4 border-b border-gray-200">
              <div className="font-semibold text-xl">Create Lead</div>
              <button
                className="text-sm text-gray-600"
                onClick={() => setLeadModalOpen(false)}
              >
                Close
              </button>
            </div>
            <form
              onSubmit={handleSendMessage}
              className="p-4 px-8 space-y-3 text-gray-600 text-sm"
            >
              <div>
                <div className="text-xs text-gray-500 mb-1">
                  Select lead type
                </div>
                <div className="inline-flex rounded border border-gray-300 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setLeadType("buy")}
                    className={`px-4 py-1.5 text-sm ${
                      leadType === "buy"
                        ? "bg-sky-500 text-white"
                        : "bg-white text-gray-700"
                    }`}
                  >
                    Buy
                  </button>
                  <button
                    type="button"
                    onClick={() => setLeadType("sell")}
                    className={`px-4 py-1.5 text-sm border-l border-gray-300 ${
                      leadType === "sell"
                        ? "bg-green-500 text-white"
                        : "bg-white text-gray-700"
                    }`}
                  >
                    Sell
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="md:col-span-1">
                  <label className="text-[.8em] font-medium">
                    HS Code<span className="text-red-500">*</span>
                  </label>
                  <input
                    className="mt-1 w-full border border-gray-200 p-2 outline-none focus:ring-1 focus:ring-gray-700 rounded text-sm"
                    placeholder="e.g. 7099900"
                    value={hscode}
                    onChange={(e) => setHscode(e.target.value)}
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-[.8em] font-medium">
                    Product / Item Description
                    <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    className="mt-1 w-full border border-gray-200 p-2 outline-none focus:ring-1 focus:ring-gray-700 rounded text-sm"
                    rows={2}
                    placeholder="Brief details to help others understand your need/offer"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div>
                  <label className="text-[.8em] font-medium">
                    Quantity<span className="text-red-500">*</span>
                  </label>
                  <input
                    className="mt-1 w-full border border-gray-200 p-2 outline-none focus:ring-1 focus:ring-gray-700 rounded text-sm"
                    placeholder="e.g. 5 kg or 12 pcs"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="text-[.8em] font-medium">
                    Packing<span className="text-red-500">*</span>
                  </label>
                  <input
                    className="mt-1 w-full border border-gray-200 p-2 outline-none focus:ring-1 focus:ring-gray-700 rounded text-sm"
                    placeholder="e.g. 25 kg bags"
                    value={packing}
                    onChange={(e) => setPacking(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="text-[.8em] font-medium">
                    Target / Expected Price
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    className="mt-1 w-full border border-gray-200 p-2 outline-none focus:ring-1 focus:ring-gray-700 rounded text-sm"
                    placeholder="e.g. 100 USD/MT"
                    value={targetPrice}
                    onChange={(e) => setTargetPrice(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="text-[.8em] font-medium">
                    Price Negotiable
                  </label>
                  <label className="mt-1 inline-flex border-gray-200 items-center gap-2 text-sm w-full border rounded p-2 justify-center cursor-pointer select-none focus-within:ring-1 focus-within:ring-gray-700">
                    <input
                      type="checkbox"
                      checked={negotiable}
                      onChange={(e) => setNegotiable(e.target.checked)}
                    />
                    Negotiable
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {leadType === "buy" ? (
                  <div className="md:col-span-2">
                    <label className="text-[.8em] font-medium">
                      Delivery address
                    </label>
                    <input
                      className="mt-1 w-full border border-gray-200 p-2 outline-none focus:ring-1 focus:ring-gray-700 rounded text-sm"
                      placeholder="Type full address or pick from map"
                      value={buyerDeliveryAddress}
                      onChange={(e) => setBuyerDeliveryAddress(e.target.value)}
                    />
                    <div className="flex items-center gap-3 mt-2">
                      <button
                        type="button"
                        onClick={() =>
                          setMapPicker({ open: true, role: "buyer" })
                        }
                        className="text-xs underline text-blue-700"
                      >
                        Pick on map
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="md:col-span-2">
                    <label className="text-[.8em] font-medium">
                      Pickup address
                    </label>
                    <input
                      className="mt-1 w-full border border-gray-200 p-2 outline-none focus:ring-1 focus:ring-gray-700 rounded text-sm"
                      placeholder="Type full address or pick from map"
                      value={sellerPickupAddress}
                      onChange={(e) => setSellerPickupAddress(e.target.value)}
                    />
                    <div className="flex items-center gap-3 mt-2">
                      <button
                        type="button"
                        onClick={() =>
                          setMapPicker({ open: true, role: "seller" })
                        }
                        className="text-xs underline text-blue-700"
                      >
                        Pick on map
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-[.8em] font-medium">
                    Any special request
                  </label>
                  <textarea
                    className="mt-1 w-full border border-gray-200 p-2 outline-none focus:ring-1 focus:ring-gray-700 rounded text-sm"
                    rows={2}
                    value={specialRequest}
                    onChange={(e) => setSpecialRequest(e.target.value)}
                    placeholder="Optional notes like delivery schedule, quality, specs, etc."
                  />
                </div>
                <div>
                  <label className="text-[.8em] font-medium">
                    Remarks / Notes
                  </label>
                  <textarea
                    className="mt-1 w-full border border-gray-200 p-2 outline-none focus:ring-1 focus:ring-gray-700 rounded text-sm"
                    rows={2}
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    placeholder="Anything else to add."
                  />
                </div>
              </div>

              <div>
                <label className="text-[.8em] font-medium">
                  Upload supported documents
                </label>
                <div className="mt-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="md:col-span-1">
                    <div className="flex items-center gap-2">
                      <input
                        key={documents.length}
                        type="file"
                        accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.csv,.txt"
                        onChange={(e) => appendDocuments(e.target.files)}
                        className="w-fit border border-gray-200 p-2 outline-none focus:ring-1 focus:ring-gray-700 file:bg-gray-600 file:text-white file:px-2 file:rounded-md file:py-1 rounded text-sm"
                      />
                    </div>
                    <p className="text-[11px] text-gray-500 mt-1">
                      Attach specs, brochures, lab reports, etc. Images will
                      show previews.
                    </p>
                  </div>
                  <div className="border border-gray-200 rounded p-2 max-h-28 overflow-auto text-xs grid grid-cols-4 gap-2 md:col-span-2">
                    {docPreviews?.length ? (
                      docPreviews.map((p, idx) => (
                        <div
                          key={idx}
                          className="border border-gray-300 rounded p-1 flex flex-col items-center justify-center relative"
                        >
                          <button
                            type="button"
                            className="absolute -top-2 -right-2 bg-black/70 text-white rounded-full w-5 h-5 text-[10px]"
                            onClick={() => removeDocumentAt(idx)}
                          >
                            ×
                          </button>
                          {p.url ? (
                            <img
                              src={p.url}
                              alt={p.name}
                              className="h-14 w-full object-cover rounded"
                            />
                          ) : (
                            <div className="h-14 w-full bg-gray-100 text-[10px] text-gray-600 flex items-center justify-center rounded break-words p-1">
                              {p.name}
                            </div>
                          )}
                          <div className="mt-1 truncate w-full" title={p.name}>
                            {p.name}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-gray-500 col-span-4">
                        No files selected
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-end">
                <p className="text-xs text-gray-500">
                  Leads are reviewed by admins before appearing in the chat.
                </p>
                <button
                  suppressHydrationWarning={true}
                  type="submit"
                  disabled={sending}
                  className="px-4 py-2 bg-gray-900 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sending ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <span>Submit for approval</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Map Picker Modal */}
      <MapPicker
        isOpen={mapPicker.open}
        onClose={() => setMapPicker({ open: false, role: "buyer" })}
        onPick={({ lat, lng }) => {
          if (mapPicker.role === "buyer") {
            setBuyerDeliveryAddress("Selected on map");
          } else {
            setSellerPickupAddress("Selected on map");
          }
        }}
        initial={{ lat: 20, lng: 78 }}
      />
      {/* User Info Sidebar */}
      <UserInfoSidebar
        userId={userInfoSidebar.userId}
        isOpen={userInfoSidebar.isOpen}
        onClose={closeUserInfoSidebar}
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
