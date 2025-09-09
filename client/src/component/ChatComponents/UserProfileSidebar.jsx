"use client";
import React, { useState } from "react";
import {
  FaTimes,
  FaComments,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaGlobe,
  FaMapMarkerAlt,
} from "react-icons/fa";
import axios from "axios";

const UserProfileSidebar = ({
  user,
  isOpen,
  onClose,
  currentUser,
  onStartChat,
  setActiveTab,
}) => {
  const [startingChat, setStartingChat] = useState(false);

  if (!isOpen || !user) return null;

  const handleStartChat = async () => {
    if (
      !currentUser ||
      (currentUser.membership !== "premium" && currentUser.role !== "admin")
    ) {
      return;
    }

    try {
      setStartingChat(true);
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_URL}/user-chat/create`,
        { otherUserId: user._id },
        { withCredentials: true }
      );

      if (response.data.success) {
        // Switch to user-chat tab instead of calling onStartChat
        if (setActiveTab) {
          setActiveTab("user-chat");
        }
        onClose();
      }
    } catch (error) {
      console.error("Error starting chat:", error);
      if (error.response?.data?.message) {
        alert(error.response.data.message);
      } else {
        alert("Failed to start chat. Please try again.");
      }
    } finally {
      setStartingChat(false);
    }
  };

  const canStartChat =
    currentUser &&
    (currentUser.membership === "premium" || currentUser.role === "admin");

  const isPremium =
    currentUser &&
    (currentUser.membership === "premium" || currentUser.role === "admin");

  return (
    <div className="fixed inset-y-0 right-0 w-80 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-50">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">User Profile</h3>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <FaTimes className="text-gray-600" />
        </button>
      </div>

      {/* User Info */}
      <div className="p-6">
        {/* Avatar and Name */}
        <div className="text-center mb-6">
          {user.image ? (
            <img
              src={user.image}
              alt={user.name}
              className="w-24 h-24 rounded-full object-cover mx-auto mb-4 border-4 border-gray-200"
            />
          ) : (
            <div className="w-24 h-24 bg-gray-300 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-gray-200">
              <FaUser className="text-gray-600 text-3xl" />
            </div>
          )}
          <h2 className="text-xl font-bold text-gray-900">{user.name}</h2>
          {user.role === "admin" && (
            <span className="inline-block px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full mt-2">
              Admin
            </span>
          )}
        </div>

        {/* Contact Information */}
        <div className={`space-y-4 ${!isPremium ? "relative" : ""}`}>
          <div className="flex items-center space-x-3">
            <FaEnvelope className="text-gray-400 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-gray-900">Email</p>
              <p className="text-sm text-gray-600">Email:XXXXXXXXX</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <FaPhone className="text-gray-400 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-gray-900">Phone</p>
              <p className="text-sm text-gray-600">Phone:XXXXXXXXX</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <FaMapMarkerAlt className="text-gray-400 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-gray-900">Country</p>
              <p className="text-sm text-gray-600">Country:XX</p>
            </div>
          </div>

          {user.email && isPremium && (
            <div className="flex items-center space-x-3">
              <FaEnvelope className="text-gray-400 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-gray-900">Email</p>
                <p className="text-sm text-gray-600">{user.email}</p>
              </div>
            </div>
          )}

          {user.phone && isPremium && (
            <div className="flex items-center space-x-3">
              <FaPhone className="text-gray-400 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-gray-900">Phone</p>
                <p className="text-sm text-gray-600">{user.phone}</p>
              </div>
            </div>
          )}

          {user.countryCode && isPremium && (
            <div className="flex items-center space-x-3">
              <FaMapMarkerAlt className="text-gray-400 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-gray-900">Country</p>
                <p className="text-sm text-gray-600">{user.countryCode}</p>
              </div>
            </div>
          )}

          {user.companyWebsite && isPremium && (
            <div className="flex items-center space-x-3">
              <FaGlobe className="text-gray-400 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-gray-900">Website</p>
                <a
                  href={user.companyWebsite}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                >
                  {user.companyWebsite}
                </a>
              </div>
            </div>
          )}

          {user.about && isPremium && (
            <div className="pt-4 border-t border-gray-200">
              <h4 className="text-sm font-medium text-gray-900 mb-2">About</h4>
              <p className="text-sm text-gray-600">{user.about}</p>
            </div>
          )}
        </div>

        {/* Chat Button */}
        {canStartChat && (
          <div className="mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={handleStartChat}
              disabled={startingChat}
              className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {startingChat ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <>
                  <FaComments />
                  <span>Start Chat</span>
                </>
              )}
            </button>
            <p className="text-xs text-gray-500 text-center mt-2">
              Send direct messages to this user
            </p>
          </div>
        )}

        {!canStartChat && (
          <div className="mt-8 pt-6 border-t border-gray-200 text-center">
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6 border border-purple-200">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaComments className="text-2xl text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Premium Feature
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Upgrade to premium to start chatting and view contact details
              </p>
              <button
                onClick={() => window.open("/subscription", "_blank")}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium shadow-lg hover:shadow-xl"
              >
                Upgrade to Premium
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfileSidebar;
