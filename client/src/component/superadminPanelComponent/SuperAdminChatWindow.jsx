"use client";
import React, { useState, useEffect, useRef, useContext } from "react";
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
import UserInfoSidebar from "../ChatComponents/UserInfoSidebar";
import LeadFormModal from "../ChatComponents/LeadFormModal";

const SuperAdminChatWindow = ({
  chapterNo,
  selectedGroupId,
  groupName,
  groupImage,
  onBack,
  isGlobal = false,
}) => {
  const { user } = useUserAuth();
  const { onlineUsers, socket } = useContext(OnlineUsersContext);
  const [leads, setLeads] = useState([]);
  const [broadcastLeads, setBroadcastLeads] = useState([]);
  const [processingBroadcast, setProcessingBroadcast] = useState({});
  const [leadModalOpen, setLeadModalOpen] = useState(false);

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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (selectedGroupId && user) {
      fetchLeads();
      fetchBroadcastLeads();
    }
  }, [selectedGroupId, user]);

  useEffect(() => {
    scrollToBottom();
  }, [leads]);

  // Listen for new-approved-lead socket event
  useEffect(() => {
    if (!user || !selectedGroupId) return;
    const handler = (lead) => {
      if (
        lead.selectedGroupId === selectedGroupId ||
        (lead.selectedGroupId &&
          lead.selectedGroupId._id === selectedGroupId) ||
        lead.groupId === selectedGroupId ||
        (lead.groupId && lead.groupId._id === selectedGroupId)
      ) {
        setLeads((prev) => {
          if (prev.some((l) => l._id === lead._id)) return prev;
          return [...prev, lead];
        });
      }
    };

    // Listen for both local and global lead events
    if (socket && socket.on) {
      socket.on("new-approved-lead", handler);
      socket.on("new-approved-global-lead", handler);
    }

    return () => {
      if (socket && socket.off) {
        socket.off("new-approved-lead", handler);
        socket.off("new-approved-global-lead", handler);
      }
    };
  }, [user, selectedGroupId, socket]);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      setError("");
      const endpoint = isGlobal
        ? `/superadmin/global-leads/${selectedGroupId}`
        : `/superadmin/leads/${selectedGroupId}`;

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_URL}${endpoint}`,
        { withCredentials: true }
      );

      // Handle both response formats
      const leadsData = response.data.leads || response.data || [];
      setLeads(leadsData);
    } catch (error) {
      console.error("Error fetching leads:", error);
      setError("Failed to load leads");
    } finally {
      setLoading(false);
    }
  };

  const fetchBroadcastLeads = async () => {
    try {
      const endpoint = isGlobal
        ? `/superadmin/global-leads/${selectedGroupId}`
        : `/superadmin/leads/${selectedGroupId}`;

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_URL}${endpoint}`,
        { withCredentials: true }
      );

      const leadsData = response.data.leads || response.data || [];
      const broadcasts = leadsData.filter(
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
      element.scrollIntoView({ behavior: "smooth", block: "center" });
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
                {broadcastLeads.map((lead, index) => (
                  <span
                    key={lead._id}
                    onClick={() => scrollToLead(lead._id)}
                    className="inline-block mx-4 cursor-pointer hover:underline font-medium"
                    title="Click to scroll to this lead"
                  >
                    📢 {lead.hscode ? `HS: ${lead.hscode}` : "Lead"}:{" "}
                    {lead.description || lead.content || "Text message"}
                  </span>
                ))}
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
          {/* Members dropdown: show online first, then others if provided */}
          {showMembers && (
            <div className="absolute right-4 top-14 bg-white border border-gray-200 rounded shadow-lg z-20 min-w-[220px] max-h-80 overflow-y-auto">
              <div className="p-2 text-gray-700 border-b border-gray-100 text-sm">
                Members
              </div>
              <div className="py-1">
                {(onlineUsers[selectedGroupId] || []).map((m) => (
                  <div
                    key={`on-${m.id}`}
                    className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-50"
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        m.role === "admin" ? "bg-violet-500" : "bg-green-500"
                      }`}
                    ></span>
                    <span className="text-xs text-gray-900 truncate">
                      {m.name}
                      {m.role === "admin" && (
                        <span className="ml-1 text-violet-600 font-medium">
                          (Admin)
                        </span>
                      )}
                    </span>
                  </div>
                ))}
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
              <p className="text-gray-500">No messages yet</p>
              <p className="text-gray-400 text-sm">
                Start the conversation by posting a lead
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4 md:space-y-9">
            {/* Date separator logic */}
            {(() => {
              let lastDate = null;
              return sortedLeads.map((lead, idx) => {
                const isOwnMessage = lead.userId?._id === user?._id;
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
                              handleUserAvatarClick(lead.userId?._id)
                            }
                          >
                            {lead.userId?.image ? (
                              <img
                                src={`${process.env.NEXT_PUBLIC_BASE_URL}/uploads/${lead.userId.image}`}
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
                                {lead.type && (
                                  <span
                                    className={`px-2 py-0.5 rounded-full text-[11px] ${
                                      lead.type === "buy"
                                        ? "bg-blue-100 text-blue-700"
                                        : "bg-green-100 text-green-700"
                                    }`}
                                  >
                                    {lead.type.toUpperCase()}
                                  </span>
                                )}
                                {lead.hscode && (
                                  <span className="px-2 py-0.5 rounded-full text-[11px] bg-gray-100 text-gray-700">
                                    HS: {lead.hscode}
                                  </span>
                                )}
                              </div>
                              {lead.description && (
                                <div className="text-gray-900">
                                  {lead.description}
                                </div>
                              )}
                              {lead.quantity && (
                                <div className="text-gray-600 text-xs">
                                  Quantity: {lead.quantity}
                                </div>
                              )}
                              {lead.packing && (
                                <div className="text-gray-600 text-xs">
                                  Packing: {lead.packing}
                                </div>
                              )}
                              {lead.targetPrice && (
                                <div className="text-gray-600 text-xs">
                                  Price: {lead.targetPrice}
                                  {lead.negotiable && (
                                    <span className="ml-1 text-green-600">
                                      (Negotiable)
                                    </span>
                                  )}
                                </div>
                              )}
                              {lead.buyerDeliveryAddress && (
                                <div className="text-gray-600 text-xs">
                                  Delivery: {lead.buyerDeliveryAddress}
                                </div>
                              )}
                              {lead.sellerPickupAddress && (
                                <div className="text-gray-600 text-xs">
                                  Pickup: {lead.sellerPickupAddress}
                                </div>
                              )}
                              {lead.specialRequest && (
                                <div className="text-gray-600 text-xs">
                                  Special Request: {lead.specialRequest}
                                </div>
                              )}
                              {lead.remarks && (
                                <div className="text-gray-600 text-xs">
                                  Remarks: {lead.remarks}
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="text-gray-900">
                              {lead.content || "Text message"}
                            </div>
                          )}
                        </div>
                        <div
                          className={`text-xs text-gray-500 mt-1 ${
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

            // For superadmin, post directly to approved leads
            const endpoint = isGlobal
              ? "/superadmin/global-lead-direct"
              : "/superadmin/lead-direct";

            const response = await axios.post(
              `${process.env.NEXT_PUBLIC_BASE_URL}${endpoint}`,
              form,
              {
                withCredentials: true,
                headers: { "Content-Type": "multipart/form-data" },
              }
            );

            if (response.data.success) {
              setLeadModalOpen(false);
              toast.success("Lead posted successfully!");
              // Refresh leads to show the new lead
              fetchLeads();
            }
          } catch (err) {
            console.error("Error sending lead:", err);
            toast.error("Failed to post lead");
          } finally {
            setSending(false);
          }
        }}
        sending={sending}
      />

      {/* User Info Sidebar */}
      <UserInfoSidebar
        userId={userInfoSidebar.userId}
        isOpen={userInfoSidebar.isOpen}
        onClose={closeUserInfoSidebar}
      />
    </div>
  );
};

export default SuperAdminChatWindow;
