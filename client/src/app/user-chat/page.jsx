"use client";
import React, { useState, useEffect } from "react";
import { useUserAuth } from "../../utilities/userAuthMiddleware";
import { useSearchParams } from "next/navigation";
import UserChatList from "../../component/ChatComponents/UserChatList";
import IndividualUserChat from "../../component/ChatComponents/IndividualUserChat";
import { FaComments, FaArrowLeft } from "react-icons/fa";
import axios from "axios";

const UserChatPage = () => {
  const { user } = useUserAuth();
  const [selectedChat, setSelectedChat] = useState(null);
  const [showChatList, setShowChatList] = useState(true);
  const searchParams = useSearchParams();
  const chatId = searchParams.get("chat");

  // Auto-open chat if chatId is provided in URL
  useEffect(() => {
    if (chatId && user) {
      fetchAndOpenChat(chatId);
    }
  }, [chatId, user]);

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
  };

  const handleBackToList = () => {
    setSelectedChat(null);
    setShowChatList(true);
    // Clear URL parameter
    window.history.replaceState({}, document.title, "/user-chat");
  };

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
    <div className="flex h-screen bg-gray-50">
      {/* Left Sidebar - Chat List */}
      <div
        className={`w-80 bg-white border-r border-gray-200 ${
          showChatList ? "block" : "hidden md:block"
        }`}
      >
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center space-x-3">
            <FaComments className="text-2xl text-purple-600" />
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
      <div className="flex-1 flex flex-col">
        {selectedChat ? (
          <IndividualUserChat
            chat={selectedChat}
            onBack={handleBackToList}
            user={user}
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
