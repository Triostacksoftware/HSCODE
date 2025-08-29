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
import { OnlineUsersContext } from "../../contexts/OnlineUsersContext";
import toast from "react-hot-toast";
import { LiaSearchSolid } from "react-icons/lia";
import { IoMdClose } from "react-icons/io";
import { FaRegPaperPlane, FaUserFriends } from "react-icons/fa";
import { MdOutlineGroup } from "react-icons/md";
import { IoArrowBack } from "react-icons/io5";
import { HiMegaphone } from "react-icons/hi2";
import UserProfileSidebar from "./UserProfileSidebar";
import LeadFormModal from "./LeadFormModal";

const ChatWindow = ({
  chapterNo,
  selectedGroupId,
  groupName,
  groupImage,
  onBack,
}) => {
  const { user } = useUserAuth();
  const { onlineUsers, socket } = useContext(OnlineUsersContext);
  const [leads, setLeads] = useState([]);
  const [broadcastLeads, setBroadcastLeads] = useState([]);
  const [processingBroadcast, setProcessingBroadcast] = useState({});
  const [leadModalOpen, setLeadModalOpen] = useState(false);
  const [groupMembers, setGroupMembers] = useState([]);

  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const messagesEndRef = useRef(null);
  const [searchActive, setSearchActive] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showMembers, setShowMembers] = useState(false);
  const [userInfoSidebar, setUserInfoSidebar] = useState({
    isOpen: false,
    userId: null,
  });
  const [selectedUser, setSelectedUser] = useState(null);

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
  const fetchGroupMembers = useCallback(async () => {
    if (!selectedGroupId) {
      setGroupMembers([]);
      return;
    }
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_URL}/groups/${selectedGroupId}`,
        { withCredentials: true }
      );
      setGroupMembers(response.data.members || []);
    } catch (error) {
      console.error("Error fetching group members:", error);
      setGroupMembers([]);
    }
  }, [selectedGroupId]);

  useEffect(() => {
    if (selectedGroupId && user) {
      fetchLeads();
      fetchBroadcastLeads();
      fetchGroupMembers();
    }
  }, [selectedGroupId, user, fetchGroupMembers]);

  useEffect(() => {
    // Add a small delay to ensure DOM has been updated before scrolling
    const timeoutId = setTimeout(() => {
      scrollToBottom();
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [leads]);

  // Listen for new-approved-lead socket event
  useEffect(() => {
    if (!user || !selectedGroupId || !socket || !socket.connected) return;
    const handler = (lead) => {
      if (
        lead.selectedGroupId === selectedGroupId ||
        (lead.selectedGroupId && lead.selectedGroupId._id === selectedGroupId)
      ) {
        setLeads((prev) => {
          if (prev.some((l) => l._id === lead._id)) return prev;
          return [...prev, lead];
        });
      }
    };
    socket.on("new-approved-lead", handler);
    return () => {
      if (socket && socket.connected) {
        socket.off("new-approved-lead", handler);
      }
    };
  }, [user, selectedGroupId, socket]);

  // Listen for group membership changes
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

    socket.on("user-joined-group", handleUserJoined);
    socket.on("user-left-group", handleUserLeft);

    return () => {
      if (socket && socket.connected) {
        socket.off("user-joined-group", handleUserJoined);
        socket.off("user-left-group", handleUserLeft);
      }
    };
  }, [user, selectedGroupId, fetchGroupMembers, socket]);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_URL}/leads/${selectedGroupId}`,
        { withCredentials: true }
      );
      setLeads(response.data.leads || []);
    } catch (error) {
      console.error("Error fetching leads:", error);
      setError("Failed to load leads");
    } finally {
      setLoading(false);
    }
  };

  const fetchBroadcastLeads = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_URL}/leads/${selectedGroupId}`,
        { withCredentials: true }
      );
      const approvedLeads = response.data.leads || [];
      const broadcasts = approvedLeads.filter(
        (lead) => lead.broadcast === "approved"
      );
      setBroadcastLeads(broadcasts);
    } catch (error) {
      console.error("Error fetching broadcast leads:", error);
    }
  };

  const handleBroadcastRequest = async (leadId) => {
    try {
      setProcessingBroadcast((prev) => ({ ...prev, [leadId]: true }));

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_URL}/leads/broadcast-request/${leadId}`,
        {},
        { withCredentials: true }
      );

      if (response.data.success) {
        toast.success("Broadcast request submitted successfully!");
        // Update the lead in the local state
        setLeads((prev) =>
          prev.map((lead) =>
            lead._id === leadId
              ? {
                  ...lead,
                  broadcast: "pending",
                  broadcastRequestedAt: new Date(),
                }
              : lead
          )
        );
      }
    } catch (error) {
      console.error("Error requesting broadcast:", error);
      toast.error(
        error.response?.data?.message || "Failed to request broadcast"
      );
    } finally {
      setProcessingBroadcast((prev) => ({ ...prev, [leadId]: false }));
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

  const handleStartChat = (chat) => {
    // Navigate to user chat page
    window.location.href = `/user-chat?chat=${chat._id}`;
  };

  // Filtered leads for search
  const filteredLeads = searchTerm.trim()
    ? leads.filter((lead) => {
        const text = (lead.description || lead.content || "").toLowerCase();
        return text.includes(searchTerm.toLowerCase());
      })
    : leads;

  // Always show messages oldest at top, newest at bottom
  const sortedLeads = [...filteredLeads].sort(
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

  const scrollToLead = (leadId) => {
    const element = document.getElementById(`lead-${leadId}`);
    if (element) {
      // Find the messages container to ensure scrolling happens within it
      const messagesContainer = element.closest(".overflow-y-auto");
      if (messagesContainer) {
        // Calculate the element position relative to the container
        const containerRect = messagesContainer.getBoundingClientRect();
        const elementRect = element.getBoundingClientRect();
        const scrollTop =
          messagesContainer.scrollTop +
          elementRect.top -
          containerRect.top -
          containerRect.height / 2 +
          elementRect.height / 2;

        messagesContainer.scrollTo({
          top: scrollTop,
          behavior: "smooth",
        });
      } else {
        // Fallback with constrained scrollIntoView
        element.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "nearest",
        });
      }

      // Add highlight effect
      element.classList.add("ring-2", "ring-blue-500", "ring-opacity-50");
      setTimeout(() => {
        element.classList.remove("ring-2", "ring-blue-500", "ring-opacity-50");
      }, 3000);
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
      {/* Broadcast Marquee */}
      {broadcastLeads.length > 0 && (
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 px-4 overflow-hidden">
          <div className="flex items-center justify-center space-x-4">
            <HiMegaphone className="w-5 h-5 flex-shrink-0" />
            <div className="flex-1 overflow-hidden">
              <div className="animate-marquee whitespace-nowrap">
                {broadcastLeads.map((lead, index) => {
                  // Determine background color based on lead type
                  let bgColor = "bg-gray-600"; // default
                  if (lead.type === "buy") {
                    bgColor = "bg-red-600";
                  } else if (lead.type === "sell") {
                    bgColor = "bg-green-600";
                  } else if (lead.type === "high-sea-buy") {
                    bgColor = "bg-red-700";
                  } else if (lead.type === "high-sea-sell") {
                    bgColor = "bg-green-700";
                  }

                  return (
                    <span
                      key={lead._id}
                      onClick={() => scrollToLead(lead._id)}
                      className={`inline-block mx-4 cursor-pointer hover:underline font-medium px-3 py-1 rounded-lg ${bgColor} text-white text-xs shadow-sm`}
                      title="Click to scroll to this lead"
                    >
                      📢 {lead.hscode ? `HS: ${lead.hscode}` : "Lead"}:{" "}
                      {lead.description || lead.content || "Text message"}
                    </span>
                  );
                })}
              </div>
            </div>
            <HiMegaphone className="w-5 h-5 flex-shrink-0" />
          </div>
        </div>
      )}

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
          {/* Members button */}
          <button
            className="p-2 rounded hover:bg-gray-100 flex items-center gap-1"
            onClick={() => setShowMembers((v) => !v)}
            title="Show members"
            type="button"
          >
            <MdOutlineGroup className="w-5 h-5 text-gray-600" />
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
          {/* Members dropdown: show all members with online indicators */}
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
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-9 space-y-4 bg-[#faf7f4]">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : sortedLeads.length === 0 ? (
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
              return sortedLeads.map((lead, idx) => {
                const isOwnMessage = lead.userId._id === user?._id;
                const msgDate = new Date(lead.createdAt);
                const dateLabel = formatDate(lead.createdAt);
                const showDate =
                  !lastDate ||
                  new Date(lastDate).toDateString() !== msgDate.toDateString();
                lastDate = lead.createdAt;
                return (
                  <React.Fragment key={lead._id}>
                    {showDate && (
                      <div className="flex justify-center my-2">
                        <span className="bg-[#e0ddd9] text-gray-600 text-xs px-3 py-1 rounded-md shadow-sm">
                          {dateLabel}
                        </span>
                      </div>
                    )}
                    <div
                      id={`lead-${lead._id}`}
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
                              handleUserAvatarClick(lead.userId._id)
                            }
                          >
                            {lead.userId?.image ? (
                              <img
                                src={`${process.env.NEXT_PUBLIC_BASE_URL}/upload/${lead.userId.image}`}
                                alt={lead.userId.name}
                                className="w-8 h-8 rounded-full object-cover"
                              />
                            ) : (
                              <span className="text-xs text-gray-600 font-medium">
                                {lead.userId?.name?.charAt(0)?.toUpperCase()}
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
                            lead.type === "buy"
                              ? "bg-blue-50 border-blue-100 text-gray-900"
                              : lead.type === "sell"
                              ? "bg-green-50 border-green-100 text-gray-900"
                              : "bg-white border-gray-200 text-gray-900"
                          }`}
                        >
                          {lead.hscode || lead.description ? (
                            <div className="text-sm space-y-2">
                              <div className="flex items-center gap-2">
                                {lead.isAdminPost && (
                                  <span className="px-2 py-0.5 rounded-full text-[11px] bg-violet-100 text-violet-700">
                                    ADMIN
                                  </span>
                                )}
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[11px] ${
                                    lead.type === "buy"
                                      ? "bg-blue-100 text-blue-700"
                                      : "bg-green-100 text-green-700"
                                  }`}
                                >
                                  {(lead.type || "Lead").toUpperCase()}
                                </span>
                                {lead.hscode && (
                                  <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 text-[11px]">
                                    HS: {lead.hscode}
                                  </span>
                                )}
                                {/* Broadcast Status Badge */}
                                {lead.broadcast === "approved" && (
                                  <span className="px-2 py-0.5 rounded-full text-[11px] bg-green-100 text-green-700 flex items-center gap-1">
                                    <HiMegaphone className="w-3 h-3" />
                                    BROADCAST
                                  </span>
                                )}
                                {lead.broadcast === "pending" && (
                                  <span className="px-2 py-0.5 rounded-full text-[11px] bg-yellow-100 text-yellow-700 flex items-center gap-1">
                                    <HiMegaphone className="w-3 h-3" />
                                    PENDING
                                  </span>
                                )}
                              </div>
                              {lead.description && (
                                <div className="text-gray-800 font-medium leading-6">
                                  {lead.description}
                                </div>
                              )}
                              <div className="flex flex-wrap gap-2 text-[11px] text-gray-700">
                                {lead.quantity && (
                                  <div>Qty: {lead.quantity}</div>
                                )}
                                {lead.packing && (
                                  <div>Packing: {lead.packing}</div>
                                )}
                                {(lead.targetPrice ||
                                  lead.negotiable !== undefined) && (
                                  <div>
                                    Target: {lead.targetPrice || "-"}{" "}
                                    {lead.negotiable ? "(Negotiable)" : ""}
                                  </div>
                                )}
                              </div>
                              <div className="text-xs text-gray-700 space-y-1">
                                {lead.buyerDeliveryLocation?.address && (
                                  <div>
                                    Delivery:{" "}
                                    {lead.buyerDeliveryLocation.address}
                                  </div>
                                )}
                                {lead.sellerPickupLocation?.address && (
                                  <div>
                                    Pickup: {lead.sellerPickupLocation.address}
                                  </div>
                                )}
                                {lead.specialRequest && (
                                  <div>
                                    Special request: {lead.specialRequest}
                                  </div>
                                )}
                                {lead.remarks && (
                                  <div>Notes: {lead.remarks}</div>
                                )}
                              </div>
                              {Array.isArray(lead.documents) &&
                                lead.documents.length > 0 && (
                                  <div className="mt-2 flex flex-wrap gap-2">
                                    {lead.documents.map((doc, i) => (
                                      <a
                                        key={i}
                                        href={`${process.env.NEXT_PUBLIC_BASE_URL}/leadDocuments/${doc}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-100 text-blue-700 hover:bg-gray-200 text-[11px]"
                                      >
                                        <span>📄</span>
                                        <span className="truncate max-w-[140px]">
                                          {doc}
                                        </span>
                                      </a>
                                    ))}
                                  </div>
                                )}
                            </div>
                          ) : (
                            <p className="text-sm break-words">
                              {lead.content}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <div
                            className={`text-xs text-gray-500 ${
                              isOwnMessage ? "text-right" : "text-left"
                            }`}
                          >
                            {formatTime(lead.createdAt)}
                          </div>
                          {/* Broadcast Button - Only show for own leads that haven't been broadcasted */}
                          {isOwnMessage &&
                            (!lead.broadcast || lead.broadcast === "none") && (
                              <button
                                onClick={() => handleBroadcastRequest(lead._id)}
                                disabled={processingBroadcast[lead._id]}
                                className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors disabled:opacity-50"
                                title="Request broadcast for this lead"
                              >
                                <HiMegaphone className="w-3 h-3" />
                                {processingBroadcast[lead._id]
                                  ? "Requesting..."
                                  : "Boost"}
                              </button>
                            )}
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
        onSubmit={async (vals) => {
          // reuse existing submit logic with vals
          try {
            setSending(true);
            setError("");
            const form = new FormData();
            form.append("groupId", selectedGroupId);
            form.append("type", vals.leadType);
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
            form.append("chapterNo", chapterNo);
            (vals.documents || []).forEach((file) =>
              form.append("documents", file)
            );
            await axios.post(
              `${process.env.NEXT_PUBLIC_BASE_URL}/requested-leads`,
              form,
              {
                withCredentials: true,
                headers: { "Content-Type": "multipart/form-data" },
              }
            );
            setLeadModalOpen(false);
            toast.success("Your lead has been submitted for approval!");
          } catch (err) {
            console.error("Error sending lead:", err);
            setError("Failed to send lead");
          } finally {
            setSending(false);
          }
        }}
        sending={sending}
        user={user}
        groupType="local"
      />

      {/* User Profile Sidebar */}
      <UserProfileSidebar
        user={selectedUser}
        isOpen={userInfoSidebar.isOpen}
        onClose={closeUserInfoSidebar}
        currentUser={user}
        onStartChat={handleStartChat}
      />
    </div>
  );
};

export default ChatWindow;
