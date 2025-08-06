"use client";
import React, { useState, useEffect, useRef, useContext } from "react";
import axios from "axios";
import { useUserAuth } from "../../utilities/userAuthMiddleware";
import { OnlineUsersContext } from "../../app/userchat/page";
import toast from "react-hot-toast";
import socket from "../../utilities/socket";
import { LiaSearchSolid } from "react-icons/lia";
import { IoMdClose } from "react-icons/io";
import { FaRegPaperPlane, FaUserFriends } from "react-icons/fa";
import { MdOutlineGroup } from "react-icons/md";
import { IoArrowBack } from "react-icons/io5";
import UserInfoSidebar from "./UserInfoSidebar";

const ChatWindow = ({ selectedGroupId, groupName, groupImage, onBack }) => {
  const { user } = useUserAuth();
  const { onlineCounts, onlineUsers, socket } = useContext(OnlineUsersContext);
  const [leads, setLeads] = useState([]);
  const [newMessage, setNewMessage] = useState("");
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
  console.log("onlineUsers", onlineUsers, onlineCounts);

  useEffect(() => {
    if (selectedGroupId && user) {
      fetchLeads();
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
        lead.groupId === selectedGroupId ||
        (lead.groupId && lead.groupId._id === selectedGroupId)
      ) {
        setLeads((prev) => {
          if (prev.some((l) => l._id === lead._id)) return prev;
          return [...prev, lead];
        });
      }
    };
    socket.on("new-approved-lead", handler);
    return () => {
      socket.off("new-approved-lead", handler);
    };
  }, [user, selectedGroupId]);

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

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    try {
      setSending(true);
      setError("");
      await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_URL}/requested-leads`,
        {
          groupId: selectedGroupId,
          content: newMessage.trim(),
        },
        { withCredentials: true }
      );
      setNewMessage("");
      toast.success("Your message has been submitted for approval!");
    } catch (error) {
      console.error("Error sending message:", error);
      setError("Failed to send message");
    } finally {
      setSending(false);
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
    ? leads.filter((lead) =>
        lead.content.toLowerCase().includes(searchTerm.toLowerCase())
      )
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
    <div className="flex flex-col h-full">
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
                    : `${process.env.NEXT_PUBLIC_BASE_URL}/upload/${groupImage}`
                }
                className="w-full h-full object-cover rounded-full"
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
          {/* Members dropdown */}
          {showMembers && (
            <div className="absolute right-4 top-14 bg-white border border-gray-200 rounded shadow-lg z-20 min-w-[200px] max-h-72 overflow-y-auto">
              <div className="p-2 text-gray-700 border-b border-gray-100 text-sm">
                Online Members
              </div>
              {onlineUsers[selectedGroupId] &&
              onlineUsers[selectedGroupId].length > 0 ? (
                onlineUsers[selectedGroupId].map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50"
                  >
                    <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-700 overflow-hidden">
                      <span>{user.name?.charAt(0)?.toUpperCase()}</span>
                    </div>
                    <span className="text-xs text-gray-800 truncate">
                      {user.name}
                    </span>
                  </div>
                ))
              ) : (
                <div className="px-3 py-2 text-xs text-gray-500">
                  No members online
                </div>
              )}
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
                                src={lead.userId.image}
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
                          className={`rounded-xl px-3 md:px-4 py-2 shadow-sm ${
                            isOwnMessage
                              ? "bg-[#d9fdd3] text-gray-900 rounded-br-sm"
                              : "bg-white text-gray-900 rounded-bl-sm"
                          }`}
                        >
                          <p className="text-sm break-words">{lead.content}</p>
                        </div>
                        <div
                          className={`text-xs text-gray-500 mt-1 ${
                            isOwnMessage ? "text-right" : "text-left"
                          }`}
                        >
                          {formatTime(lead.createdAt)}
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
      {/* Input Form */}
      <div className="p-3 md:p-4 border-t border-gray-200 flex-shrink-0 bg-white">
        <form onSubmit={handleSendMessage} className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message (will be sent for approval)..."
            className="flex-1 px-3 py-2 md:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-transparent text-sm"
            disabled={sending}
          />
          <button
            suppressHydrationWarning={true}
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="px-4 py-2 bg-gray-800 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
          >
            {sending ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <FaRegPaperPlane />
            )}
          </button>
        </form>
        <p className="text-xs text-gray-500 mt-1">
          Messages are sent for admin approval before appearing in the chat
        </p>
      </div>

      {/* User Info Sidebar */}
      <UserInfoSidebar
        userId={userInfoSidebar.userId}
        isOpen={userInfoSidebar.isOpen}
        onClose={closeUserInfoSidebar}
      />
    </div>
  );
};

export default ChatWindow;
