"use client";
import React, { useState, useEffect, useRef, useContext } from "react";
import axios from "axios";
import { useUserAuth } from "../../utilities/userAuthMiddleware";
import { OnlineUsersContext } from "../../app/userchat/page";
import toast from "react-hot-toast";
import socket from "../../utilities/socket";

const ChatWindow = ({ selectedGroupId }) => {
  const { user } = useUserAuth();
  const { onlineCounts, onlineUsers, socket } = useContext(OnlineUsersContext);
  const [leads, setLeads] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const messagesEndRef = useRef(null);

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
    <div className="flex flex-col  mt- h-full">
      {/* Header with Online Users */}
      <div className="p-4 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-700">Group Chat</h3>
          <span className="text-xs text-gray-500">
            {onlineCounts[selectedGroupId] || 0} online
          </span>
        </div>

        {/* Online Users List */}
        {onlineUsers[selectedGroupId] &&
          onlineUsers[selectedGroupId].length > 0 && (
            <div className="mt-2">
              <div className="text-xs text-gray-500 mb-1">Online:</div>
              <div className="flex flex-wrap gap-1">
                {onlineUsers[selectedGroupId].map((user, index) => (
                  <span
                    key={user.id}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800"
                  >
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                    {user.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
      </div>
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : leads.length === 0 ? (
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
          <div className="space-y-4">
            {leads.map((lead) => {
              const isOwnMessage = lead.userId._id === user?._id;

              return (
                <div
                  key={lead._id}
                  className={`flex  ${
                    isOwnMessage ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md ${
                      isOwnMessage ? "order-2" : "order-1"
                    }`}
                  >
                    <div
                      className={`rounded-lg px-4 py-2 ${
                        isOwnMessage
                          ? "bg-blue-500 text-white"
                          : "bg-gray-200 text-gray-800"
                      }`}
                    >
                      <p className="text-sm">{lead.content}</p>
                    </div>
                    <div
                      className={`text-xs text-gray-500 mt-1 ${
                        isOwnMessage ? "text-right" : "text-left"
                      }`}
                    >
                      {formatTime(lead.createdAt)}
                    </div>
                  </div>
                  {!isOwnMessage && (
                    <div className="order-1 ml-2">
                      <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
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
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
      {/* Input Form */}
      <div className="p-4 border-t border-gray-200 flex-shrink-0">
        <form onSubmit={handleSendMessage} className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message (will be sent for approval)..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
            disabled={sending}
          />
          <button
            suppressHydrationWarning={true}
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {sending ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              "Send"
            )}
          </button>
        </form>
        <p className="text-xs text-gray-500 mt-1">
          Messages are sent for admin approval before appearing in the chat
        </p>
      </div>
    </div>
  );
};

export default ChatWindow;
