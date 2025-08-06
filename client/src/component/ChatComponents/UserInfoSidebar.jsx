"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { IoClose } from "react-icons/io5";
import {
  HiOutlinePhone,
  HiOutlineEnvelope,
  HiOutlineMapPin,
  HiOutlineClock,
  HiOutlineUser,
  HiOutlineCalendar,
  HiOutlineUserGroup,
} from "react-icons/hi2";
import { useUserAuth } from "../../utilities/userAuthMiddleware";

const UserInfoSidebar = ({ userId, isOpen, onClose }) => {
  const { user } = useUserAuth();
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [freemember, setFreemember] = useState();

  useEffect(() => {
    if (user?.membership == "free") {
      setFreemember(true);
      return;
    }

    if (userId && isOpen) {
      fetchUserInfo();
    }
  }, [user, userId, isOpen]);

  const fetchUserInfo = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_URL}/user/${userId}`,
        { withCredentials: true }
      );

      setUserInfo(response.data);
    } catch (error) {
      console.error("Error fetching user info:", error);
      setError("Failed to load user information");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Not available";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return "Not available";
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 w-90 bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col h-full">
        <div className="flex items-center justify-between p-4">
          <h2 className="text-md font-semibold text-gray-800">Contact info</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-md hover:bg-gray-100 transition-colors"
          >
            <IoClose className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {freemember ? (
          <div className="h-full right-0 w-90 bg-white shadow-xl z-50 flex flex-col items-center justify-center p-6 text-center">
            <h2 className="text-md font-semibold text-gray-800 mb-2">
              Upgrade Required
            </h2>
            <p className="text-gray-600 mb-4 text-sm">
              This feature is available to premium members only. To view
              detailed user information like contact, groups, and account
              history, please upgrade your plan.
            </p>
            <button
              onClick={() => {
                // redirect or open upgrade page/modal
                window.location.href = "/pricing"; // Change this route based on your app
              }}
              className="px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-700 cursor-pointer transition-colors text-sm"
            >
              Upgrade to Premium
            </button>
          </div>
        ) : (
          <div className="flex-1 overflow-y-scroll">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : error ? (
              <div className="p-4 text-center">
                <p className="text-red-500 text-sm">{error}</p>
                <button
                  onClick={fetchUserInfo}
                  className="mt-2 text-blue-600 hover:text-blue-700 underline text-sm"
                >
                  Try again
                </button>
              </div>
            ) : userInfo ? (
              <div className="p-4 space-y-6 ">
                <div className="text-center">
                  <div className="w-24 h-24 rounded-full bg-gray-300 flex items-center justify-center mx-auto mb-4 overflow-hidden">
                    {userInfo.image ? (
                      <img
                        src={
                          userInfo.image.includes("https")
                            ? userInfo.image
                            : `${process.env.NEXT_PUBLIC_BASE_URL}/upload/${userInfo.image}`
                        }
                        alt={userInfo.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-2xl text-gray-600 font-medium">
                        {userInfo.name?.charAt(0)?.toUpperCase()}
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800">
                    {userInfo.name
                      ? userInfo.name.charAt(0).toUpperCase() +
                        userInfo.name.slice(1)
                      : "Unknown User"}
                  </h3>
                  {userInfo.email && (
                    <p className="text-gray-500 text-sm mt-1">
                      {userInfo.email}
                    </p>
                  )}
                </div>

                <div className="space-y-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                      <HiOutlineUser className="w-4 h-4 text-gray-800" />
                      About
                    </h4>
                    <p className="text-gray-600 text-sm bg-gray-50 p-3 rounded-lg">
                      {userInfo.about || "Hey there! I am using this chat app."}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">
                      Contact Information
                    </h4>
                    <div className="space-y-3">
                      {userInfo.phone && (
                        <div className="flex items-center gap-3 text-sm p-2 bg-gray-50 rounded-lg">
                          <HiOutlinePhone className="w-4 h-4 text-gray-800" />
                          <span className="text-gray-700 font-medium">
                            {userInfo.phone}
                          </span>
                        </div>
                      )}
                      {userInfo.email && (
                        <div className="flex items-center gap-3 text-sm p-2 bg-gray-50 rounded-lg">
                          <HiOutlineEnvelope className="w-4 h-4 text-gray-800" />
                          <span className="text-gray-700 font-medium">
                            {userInfo.email}
                          </span>
                        </div>
                      )}
                      {userInfo.countryCode && (
                        <div className="flex items-center gap-3 text-sm p-2 bg-gray-50 rounded-lg">
                          <HiOutlineMapPin className="w-4 h-4 text-gray-800" />
                          <span className="text-gray-700 font-medium">
                            {userInfo.countryCode}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">
                      Account Information
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-sm p-2 bg-gray-50 rounded-lg">
                        <HiOutlineCalendar className="w-4 h-4 text-gray-800" />
                        <div>
                          <span className="text-gray-600 text-xs">Joined</span>
                          <div className="text-gray-700 font-medium">
                            {formatDate(userInfo.createdAt)}
                          </div>
                          <div className="text-gray-500 text-xs">
                            {formatTime(userInfo.createdAt)}
                          </div>
                        </div>
                      </div>
                      {userInfo.groupsID && (
                        <div className="flex items-center gap-3 text-sm p-2 bg-gray-50 rounded-lg">
                          <HiOutlineUserGroup className="w-4 h-4 text-gray-800" />
                          <div>
                            <span className="text-gray-600 text-xs">
                              Groups
                            </span>
                            <div className="text-gray-700 font-medium">
                              {userInfo.groupsID.length} groups
                            </div>
                          </div>
                        </div>
                      )}
                      <div className="flex items-center gap-3 text-sm p-2 bg-gray-50 rounded-lg">
                        <HiOutlineClock className="w-4 h-4 text-gray-800" />
                        <div>
                          <span className="text-gray-600 text-xs">
                            Last Updated
                          </span>
                          <div className="text-gray-700 font-medium">
                            {formatDate(userInfo.updatedAt)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 text-center">
                <p className="text-gray-500">No user information available</p>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default UserInfoSidebar;
