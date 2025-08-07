"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useUserAuth } from "../../utilities/userAuthMiddleware";
import { LiaSearchSolid } from "react-icons/lia";
import socket from "../../utilities/socket";

const GlobalGroupsList = ({
  categoryId,
  categoryName,
  onBack,
  onGroupSelect,
  selectedGroupId,
}) => {
  const { user, refreshUser } = useUserAuth();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (categoryId) {
      fetchGlobalGroups();
    }
  }, [categoryId]);

  // Listen for real-time global group updates
  useEffect(() => {
    const handleGroupUpdate = (data) => {
      // If the update is for this category, refresh the list
      if (data.categoryId === categoryId) {
        fetchGlobalGroups();
      }
    };
    if (socket && socket.on) {
      socket.on("global-group-updated", handleGroupUpdate);
      socket.on("global-group-created", handleGroupUpdate);
      socket.on("global-group-deleted", handleGroupUpdate);
    }
    return () => {
      if (socket && socket.off) {
        socket.off("global-group-updated", handleGroupUpdate);
        socket.off("global-group-created", handleGroupUpdate);
        socket.off("global-group-deleted", handleGroupUpdate);
      }
    };
  }, [categoryId]);

  const fetchGlobalGroups = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_URL}/global-groups/${categoryId}`,
        {
          withCredentials: true,
        }
      );

      console.log("Global groups fetched:", response.data);
      setGroups(response.data || []);
    } catch (error) {
      console.error("Error fetching global groups:", error);
      setError("Failed to load global groups");
    } finally {
      setLoading(false);
    }
  };

  const handleJoinGroup = async (group) => {
    try {
      console.log("Joining global group:", group);

      const response = await axios.patch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/user/join-global-group`,
        { groupId: group._id },
        { withCredentials: true }
      );

      console.log("Join global group response:", response.data);

      // Refresh user data to update groupsID
      await refreshUser();

      // Refresh the groups list to update join status
      fetchGlobalGroups();
    } catch (error) {
      console.error("Error joining global group:", error);
      if (error.response?.data?.message) {
        alert(error.response.data.message);
      } else {
        alert("Error joining global group. Please try again.");
      }
    }
  };

  const handleOpenGroup = (group) => {
    if (onGroupSelect) {
      onGroupSelect(group);
    }
    console.log("Opening global group:", group);
  };

  const isUserJoined = (groupId) => {
    return user?.globalGroupsID?.includes(groupId) || false;
  };

  const filteredGroups = groups.filter(
    (group) =>
      group.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      group.hscode?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full px-3">
      {/* Header with Back Button */}
      <div className="flex items-center justify-between py-4 md:py-[1.1em] border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 truncate">
          {categoryName}
        </h2>
        {onBack && (
          <button
            onClick={onBack}
            className="text-gray-600 hover:text-gray-800 transition-colors text-sm font-medium px-2 py-1 rounded hover:bg-gray-100"
          >
            ← Back
          </button>
        )}
      </div>

      {/* Search Bar */}
      <div className="flex-shrink-0 flex items-center gap-3 p-3 md:p-2 md:py-[.35em] border border-gray-200 rounded-md text-gray-600 mt-3 md:mt-0">
        <LiaSearchSolid className="flex-shrink-0" />
        <input
          type="text"
          placeholder="Search global groups"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="text-sm md:text-[.88em] w-full outline-none placeholder:text-gray-500 bg-transparent flex-1"
        />
      </div>

      {/* Groups List */}
      <div className="flex-1 overflow-y-auto mt-4 min-h-0">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-500 mt-2 text-sm">
              Loading global groups...
            </p>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-500 text-sm">{error}</p>
            <button
              onClick={fetchGlobalGroups}
              className="mt-2 text-blue-600 hover:text-blue-700 underline text-sm"
            >
              Try again
            </button>
          </div>
        ) : filteredGroups.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 text-sm">No global groups found</p>
          </div>
        ) : (
          <div className="space-y-2 md:space-y-1">
            {filteredGroups.map((group, index) => {
              const joined = isUserJoined(group._id);
              return (
                <div
                  key={group._id}
                  className={`p-4 md:p-3 rounded-lg md:rounded transition-all touch-manipulation ${
                    selectedGroupId === group._id && joined
                      ? "bg-[#eaeaea] text-gray-800"
                      : "bg-white hover:bg-[#f4f4f4] text-gray-600"
                  } ${joined ? "cursor-pointer" : ""}`}
                  onClick={joined ? () => handleOpenGroup(group) : undefined}
                  tabIndex={joined ? 0 : -1}
                  onKeyDown={
                    joined
                      ? (e) =>
                          (e.key === "Enter" || e.key === " ") &&
                          handleOpenGroup(group)
                      : undefined
                  }
                  role={joined ? "button" : undefined}
                  aria-pressed={
                    joined ? selectedGroupId === group._id : undefined
                  }
                >
                  <div className="flex items-center space-x-3 min-w-0 flex-1">
                    {/* Group Image/Avatar */}
                    <div className="w-12 h-12 md:w-10 md:h-10 rounded-full flex items-center justify-center bg-gray-200 flex-shrink-0 overflow-hidden">
                      {group.image ? (
                        <img
                          src={
                            group.image.includes("https")
                              ? group.image
                              : `${process.env.NEXT_PUBLIC_BASE_URL}/upload/${group.image}`
                          }
                          alt={group.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-sm md:text-sm text-gray-600 font-medium">
                          {group.name?.charAt(0)?.toUpperCase()}
                        </span>
                      )}
                    </div>

                    {/* Group Info */}
                    <div className="min-w-0 flex-1 grid">
                      <div className="text-sm md:text-sm font-medium truncate">
                        {group.name ||
                          `Global Group ${String(index + 1).padStart(2, "0")}`}
                      </div>
                      <div className="text-xs text-gray-500 truncate">
                        hscode: {group.hscode}
                      </div>
                    </div>
                    {/* Action Button for not joined */}
                    {!joined && (
                      <button
                        onClick={() => handleJoinGroup(group)}
                        className="ml-auto px-3 py-1 bg-blue-600 text-white rounded-md text-xs font-medium hover:bg-blue-700 transition-colors"
                      >
                        Join
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default GlobalGroupsList;
