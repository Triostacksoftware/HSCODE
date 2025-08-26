"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FaComments, FaCircle, FaUser } from "react-icons/fa";
import axios from "axios";

const UserChatList = ({ user, onChatSelect, selectedChatId }) => {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalUnread, setTotalUnread] = useState(0);
  const router = useRouter();

  useEffect(() => {
    if (user?.membership === "premium" || user?.role === "admin") {
      fetchUserChats();
      fetchUnreadCount();
    }
  }, [user]);

  const fetchUserChats = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_URL}/user-chat`,
        { withCredentials: true }
      );
      setChats(response.data.chats || []);
    } catch (error) {
      console.error("Error fetching user chats:", error);
      setError("Failed to load chats");
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_URL}/user-chat/unread/count`,
        { withCredentials: true }
      );
      setTotalUnread(response.data.unreadCount || 0);
    } catch (error) {
      console.error("Error fetching unread count:", error);
    }
  };

  const formatLastMessage = (message) => {
    if (!message) return "No messages yet";

    const content = message.content || "";
    if (content.length > 30) {
      return content.substring(0, 30) + "...";
    }
    return content;
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return "";

    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (diffInHours < 48) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString();
    }
  };

  const handleChatSelect = (chat) => {
    onChatSelect(chat);
  };

  if (!user || (user.membership !== "premium" && user.role !== "admin")) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center">
        <FaComments className="text-4xl text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold text-gray-700 mb-2">
          Premium Feature
        </h3>
        <p className="text-gray-500 text-sm mb-4">
          Upgrade to premium to chat directly with other users
        </p>
        <button
          onClick={() => router.push("/subscription")}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          Upgrade Now
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center">
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={fetchUserChats}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (chats.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center">
        <FaComments className="text-4xl text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold text-gray-700 mb-2">
          No Chats Yet
        </h3>
        <p className="text-gray-500 text-sm">
          Start chatting with other users by clicking on their profiles
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Direct Chats</h3>
          {totalUnread > 0 && (
            <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-500 rounded-full">
              {totalUnread}
            </span>
          )}
        </div>
      </div>

      {/* Chats List */}
      <div className="flex-1 overflow-y-auto">
        {chats.map((chat) => (
          <div
            key={chat._id}
            onClick={() => handleChatSelect(chat)}
            className={`flex items-center p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
              selectedChatId === chat._id
                ? "bg-purple-50 border-purple-200"
                : ""
            }`}
          >
            {/* User Avatar */}
            <div className="relative flex-shrink-0">
              {chat.otherUser?.image ? (
                <img
                  src={chat.otherUser.image}
                  alt={chat.otherUser.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                  <FaUser className="text-gray-600 text-lg" />
                </div>
              )}
              {chat.unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-500 rounded-full">
                  {chat.unreadCount > 9 ? "9+" : chat.unreadCount}
                </span>
              )}
            </div>

            {/* Chat Info */}
            <div className="ml-3 flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-gray-900 truncate">
                  {chat.otherUser?.name || "Unknown User"}
                </h4>
                <span className="text-xs text-gray-500">
                  {formatTime(chat.lastMessageAt)}
                </span>
              </div>
              <div className="flex items-center justify-between mt-1">
                <p className="text-sm text-gray-600 truncate">
                  {formatLastMessage(chat.lastMessage)}
                </p>
                {chat.unreadCount > 0 && (
                  <FaCircle className="text-xs text-purple-600" />
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserChatList;
