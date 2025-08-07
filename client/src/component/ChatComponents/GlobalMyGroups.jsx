"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useUserAuth } from "../../utilities/userAuthMiddleware";
import { LiaSearchSolid } from "react-icons/lia";
import socket from "../../utilities/socket";

const GlobalMyGroups = ({ onGroupSelect, selectedGroupId }) => {
  const { user } = useUserAuth();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (user && user.globalGroupsID && user.globalGroupsID.length > 0) {
      fetchMyGlobalGroups();
    }
  }, [user]);

  // Listen for real-time global group join/leave events
  useEffect(() => {
    const handleGroupUpdate = (data) => {
      // If the update is for a group the user is in, refresh the list
      if (
        user &&
        user.globalGroupsID &&
        user.globalGroupsID.includes(data.groupId)
      ) {
        fetchMyGlobalGroups();
      }
    };
    if (socket && socket.on) {
      socket.on("global-group-joined", handleGroupUpdate);
      socket.on("global-group-left", handleGroupUpdate);
      socket.on("global-group-updated", handleGroupUpdate);
      socket.on("global-group-deleted", handleGroupUpdate);
    }
    return () => {
      if (socket && socket.off) {
        socket.off("global-group-joined", handleGroupUpdate);
        socket.off("global-group-left", handleGroupUpdate);
        socket.off("global-group-updated", handleGroupUpdate);
        socket.off("global-group-deleted", handleGroupUpdate);
      }
    };
  }, [user]);

  const fetchMyGlobalGroups = async () => {
    try {
      setLoading(true);
      setError("");
      console.log("user global groups", user.globalGroupsID);
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_URL}/user/global-groups`,
        { groupIds: user.globalGroupsID },
        { withCredentials: true }
      );

      console.log("My global groups fetched:", response.data);
      setGroups(response.data || []);
    } catch (error) {
      console.error("Error fetching my global groups:", error);
      setError("Failed to load your global groups");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenGroup = (group) => {
    // Call the onGroupSelect callback with the group object
    if (onGroupSelect) {
      onGroupSelect(group);
    }
    console.log("Opening global group:", group);
  };

  const filteredGroups = groups.filter(
    (group) =>
      group.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      group.hscode?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full px-3">
      {/* Search Bar */}
      <div className="flex-shrink-0 flex items-center gap-3 p-3 md:p-2 md:py-[.35em] border border-gray-200 rounded-md text-gray-600 mt-3 md:mt-0">
        <LiaSearchSolid className="flex-shrink-0" />
        <input
          type="text"
          placeholder="Search your global groups"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="text-sm md:text-[.88em] outline-none placeholder:text-gray-500 bg-transparent flex-1"
        />
      </div>

      {/* Groups List */}
      <div className="flex-1 overflow-y-auto mt-4 min-h-0">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-500 mt-2 text-sm">
              Loading your global groups...
            </p>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-500 text-sm">{error}</p>
            <button
              onClick={fetchMyGlobalGroups}
              className="mt-2 text-blue-600 hover:text-blue-700 underline text-sm"
            >
              Try again
            </button>
          </div>
        ) : !user?.globalGroupsID || user.globalGroupsID.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-gray-200 rounded-lg mx-auto mb-4 flex items-center justify-center">
              <span className="text-gray-400 text-xl">🌍</span>
            </div>
            <p className="text-gray-500 text-sm">
              You haven't joined any global groups yet
            </p>
            <p className="text-gray-400 text-xs mt-1">
              Switch to chapters to discover global groups
            </p>
          </div>
        ) : filteredGroups.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 text-sm">No global groups found</p>
          </div>
        ) : (
          <div className="space-y-2 md:space-y-1">
            {filteredGroups.map((group, index) => (
              <div
                key={group._id}
                className={`p-4 md:p-3 rounded-lg md:rounded-md cursor-pointer transition-all touch-manipulation ${
                  selectedGroupId === group._id
                    ? "bg-[#eaeaea] text-gray-800"
                    : "bg-white hover:bg-[#f4f4f4] text-gray-600"
                }`}
                onClick={() => handleOpenGroup(group)}
                tabIndex={0}
                onKeyDown={(e) =>
                  (e.key === "Enter" || e.key === " ") && handleOpenGroup(group)
                }
                role="button"
                aria-pressed={selectedGroupId === group._id}
              >
                <div className="flex space-x-3 flex-1">
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
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default GlobalMyGroups;
