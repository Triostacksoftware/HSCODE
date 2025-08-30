"use client";
import React, { useState, useEffect, useContext } from "react";
import { FaComments, FaUser, FaCircle } from "react-icons/fa";
import { useRouter } from "next/navigation";
import axios from "axios";
import { OnlineUsersContext } from "../../contexts/OnlineUsersContext";

const UserChatList = ({ user, onChatSelect, selectedChatId }) => {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalUnread, setTotalUnread] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const router = useRouter();
  const { socket } = useContext(OnlineUsersContext);

  // Fetch chats on component mount
  useEffect(() => {
    if (user) {
      fetchUserChats();
    }
  }, [user]);

  // Listen for new messages to update unread counts in real-time
  useEffect(() => {
    if (!socket || !user) return;

    const handleNewMessage = (data) => {
      console.log("New message received:", data);

      // Update the specific chat's unread count and last message
      setChats((prevChats) => {
        const updatedChats = prevChats.map((chat) => {
          if (chat._id === data.chatId) {
            const updatedChat = {
              ...chat,
              lastMessage: {
                content: data.message?.content || data.content || data.message,
                createdAt:
                  data.message?.createdAt ||
                  data.createdAt ||
                  new Date().toISOString(),
              },
              lastMessageAt:
                data.message?.createdAt ||
                data.createdAt ||
                new Date().toISOString(),
            };

            // Only increment unread count if this chat is not currently selected
            if (selectedChatId !== chat._id) {
              updatedChat.unreadCount = (chat.unreadCount || 0) + 1;
            }

            return updatedChat;
          }
          return chat;
        });
        return updatedChats;
      });

      // Update total unread count (only if not in the current chat)
      if (selectedChatId !== data.chatId) {
        setTotalUnread((prev) => prev + 1);
      }
    };

    // Listen for new user messages
    socket.on("new-user-message", handleNewMessage);

    return () => {
      socket.off("new-user-message", handleNewMessage);
    };
  }, [socket, user, selectedChatId]);

  // Refresh unread counts when returning to chat list
  useEffect(() => {
    if (selectedChatId === null) {
      fetchUserChats();
    }
  }, [selectedChatId]);

  const fetchUserChats = async () => {
    try {
      setRefreshing(true);
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_URL}/user-chat`,
        { withCredentials: true }
      );

      const fetchedChats = response.data.chats || [];
      setChats(fetchedChats);

      // Calculate total unread from fetched chats
      const totalUnreadFromChats = fetchedChats.reduce(
        (total, chat) => total + (chat.unreadCount || 0),
        0
      );
      setTotalUnread(totalUnreadFromChats);
    } catch (error) {
      console.error("Error fetching user chats:", error);
      setError("Failed to load chats");
    } finally {
      setRefreshing(false);
    }
  };

  // Clear unread count for a specific chat when it's selected
  const handleChatSelect = async (chat) => {
    try {
      // Clear unread count for this chat
      if (chat.unreadCount > 0) {
        await axios.patch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/user-chat/${chat._id}/read`,
          {},
          { withCredentials: true }
        );

        // Update local state to reflect the cleared unread count
        setChats((prevChats) =>
          prevChats.map((c) =>
            c._id === chat._id ? { ...c, unreadCount: 0 } : c
          )
        );

        // Update total unread count
        setTotalUnread((prev) => Math.max(0, prev - chat.unreadCount));
      }

      // Call the parent handler
      onChatSelect(chat);
    } catch (error) {
      console.error("Error clearing unread count:", error);
      // Still call the parent handler even if clearing fails
      onChatSelect(chat);
    }
  };

  const formatLastMessage = (message) => {
    if (!message) return "No messages yet";

    // Handle image messages
    if (message.messageType === "image") {
      const caption =
        message.content && message.content !== "📷 Image"
          ? message.content
          : "";
      if (caption) {
        return caption.length > 30 ? caption.substring(0, 30) + "..." : caption;
      }
      return "📷 Image";
    }

    // Handle document messages
    if (message.messageType === "file") {
      const caption =
        message.content && message.content !== "📄 Document"
          ? message.content
          : "";
      if (caption) {
        return caption.length > 30 ? caption.substring(0, 30) + "..." : caption;
      }
      return "📄 Document";
    }

    // Handle text messages
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
    <div className="flex flex-col h-full" data-chat-list>
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Direct Chats</h3>
          <div className="flex items-center space-x-2">
            {totalUnread > 0 && (
              <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-500 rounded-full">
                {totalUnread}
              </span>
            )}
            <button
              onClick={fetchUserChats}
              className="p-1 hover:bg-gray-200 rounded transition-colors"
              disabled={refreshing}
            >
              {refreshing ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
              ) : (
                <svg
                  className="w-4 h-4 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.001 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              )}
            </button>
          </div>
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
