"use client";
import React, { useState, useEffect, useContext } from "react";
import { useUserAuth } from "../../utilities/userAuthMiddleware";
import { useSearchParams } from "next/navigation";
import UserChatList from "../../component/ChatComponents/UserChatList";
import IndividualUserChat from "../../component/ChatComponents/IndividualUserChat";
import { FaComments, FaArrowLeft } from "react-icons/fa";
import axios from "axios";
import { OnlineUsersContext } from "../../contexts/OnlineUsersContext";
import toast from "react-hot-toast";

const UserChatPage = ({ onChatOpened }) => {
  const { user } = useUserAuth();
  const [selectedChat, setSelectedChat] = useState(null);
  const [showChatList, setShowChatList] = useState(true);
  const [totalUnread, setTotalUnread] = useState(0);
  const searchParams = useSearchParams();
  const chatId = searchParams.get("chat");
  const { socket } = useContext(OnlineUsersContext);

  // Auto-open chat if chatId is provided in URL
  useEffect(() => {
    if (chatId && user) {
      fetchAndOpenChat(chatId);
    }
  }, [chatId, user]);

  // Listen for new messages to update total unread count
  useEffect(() => {
    if (!socket || !user) return;

    const handleNewMessage = (data) => {
      console.log("New message in user chat page:", data);

      // Update total unread count if not in the current chat
      if (selectedChat?._id !== data.chatId) {
        setTotalUnread((prev) => prev + 1);
      }
    };

    // Listen for new user messages
    socket.on("new-user-message", handleNewMessage);

    // Listen for chat switch requests (from notifications)
    const handleSwitchToChat = (data) => {
      console.log("Switch to chat requested:", data);

      // Find the chat by ID
      if (data.chatId) {
        // Fetch the chat details and switch to it
        handleSwitchToChatById(data.chatId);
      }
    };

    socket.on("switch-to-chat", handleSwitchToChat);

    return () => {
      socket.off("new-user-message", handleNewMessage);
      socket.off("switch-to-chat", handleSwitchToChat);
    };
  }, [socket, user, selectedChat]);

  // Fetch total unread count
  const fetchTotalUnreadCount = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_URL}/user-chat/unread/count`,
        { withCredentials: true }
      );
      setTotalUnread(response.data.unreadCount || 0);
    } catch (error) {
      console.error("Error fetching total unread count:", error);
    }
  };

  // Update total unread count when returning to chat list
  useEffect(() => {
    if (showChatList) {
      fetchTotalUnreadCount();
    }
  }, [showChatList]);

  const fetchAndOpenChat = async (chatId) => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_URL}/user-chat/${chatId}`,
        { withCredentials: true }
      );

      if (response.data.success) {
        setSelectedChat(response.data.chat);
        setShowChatList(false);
      }
    } catch (error) {
      console.error("Error fetching chat:", error);
      // If chat not found, stay on chat list
      setShowChatList(true);
    }
  };

  const handleChatSelect = (chat) => {
    setSelectedChat(chat);
    setShowChatList(false);

    // Notify parent that a chat was opened
    if (onChatOpened) {
      onChatOpened();
    }
  };

  const handleBackToList = () => {
    setSelectedChat(null);
    setShowChatList(true);
    // Clear URL parameter
    window.history.replaceState({}, document.title, "/user-chat");
  };

  const handleMessageSent = () => {
    // Refresh the chat list to show updated last message
    if (selectedChat) {
      // Force refresh of chat list
      const chatListElement = document.querySelector("[data-chat-list]");
      if (chatListElement) {
        // Trigger a refresh by updating the selectedChat
        setSelectedChat({ ...selectedChat });
      }
    }
  };

  const handleSwitchToChatById = async (chatId) => {
    try {
      // Fetch the chat details
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_URL}/user-chat/${chatId}`,
        { withCredentials: true }
      );

      if (response.data.chat) {
        // Switch to the new chat
        setSelectedChat(response.data.chat);
        setShowChatList(false);

        // Update URL parameter
        window.history.replaceState(
          {},
          document.title,
          `/user-chat?chat=${chatId}`
        );

        // Show success message
        toast.success(
          "Switched to chat with " + response.data.chat.otherUser.name
        );

        // Notify parent that a chat was opened
        if (onChatOpened) {
          onChatOpened();
        }
      }
    } catch (error) {
      console.error("Error switching to chat:", error);
      toast.error("Failed to switch to chat");
    }
  };

  // Update selectedChatId when chat changes
  useEffect(() => {
    if (selectedChat) {
      // Update the selectedChatId to trigger unread count clearing
      setSelectedChat(selectedChat);

      // Notify parent that a chat was opened
      if (onChatOpened) {
        onChatOpened();
      }
    }
  }, [selectedChat, onChatOpened]);

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Left Sidebar - Chat List */}
      <div
        className={`w-80 bg-white border-r border-gray-200 flex-shrink-0 ${
          showChatList ? "block" : "hidden md:block"
        }`}
      >
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <FaComments className="text-2xl text-purple-600" />
              {totalUnread > 0 && (
                <span className="absolute -top-2 -right-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-500 rounded-full min-w-[20px] h-5">
                  {totalUnread > 99 ? "99+" : totalUnread}
                </span>
              )}
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Direct Chats</h1>
              <p className="text-sm text-gray-600">
                Chat with other users privately
              </p>
            </div>
          </div>
        </div>
        <UserChatList
          user={user}
          onChatSelect={handleChatSelect}
          selectedChatId={selectedChat?._id}
        />
      </div>

      {/* Right Side - Chat Window */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {selectedChat ? (
          <IndividualUserChat
            chat={selectedChat}
            onBack={handleBackToList}
            user={user}
            onMessageSent={handleMessageSent}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <FaComments className="text-6xl text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Select a Chat
              </h3>
              <p className="text-gray-500">
                Choose a conversation from the left sidebar to start messaging
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Back Button */}
      {!showChatList && (
        <button
          onClick={handleBackToList}
          className="md:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-full shadow-lg border border-gray-200"
        >
          <FaArrowLeft className="text-gray-600" />
        </button>
      )}
    </div>
  );
};

export default UserChatPage;
