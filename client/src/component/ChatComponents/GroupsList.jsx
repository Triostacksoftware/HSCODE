"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useUserAuth } from "../../utilities/userAuthMiddleware";
import { LiaSearchSolid } from "react-icons/lia";

const GroupsList = ({
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
      fetchGroups();
    }
  }, [categoryId]);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_URL}/categories/${categoryId}/groups`,
        {
          withCredentials: true,
        }
      );

      console.log("Groups fetched:", response.data);
      setGroups(response.data || []);
    } catch (error) {
      console.error("Error fetching groups:", error);
      setError("Failed to load groups");
    } finally {
      setLoading(false);
    }
  };

  const handleJoinGroup = async (group) => {
    try {
      console.log("Joining group:", group);

      const response = await axios.patch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/user/join-group`,
        { groupId: group._id },
        { withCredentials: true }
      );

      console.log("Join response:", response.data);

      // Refresh user data to update groupsID
      await refreshUser();

      // Refresh the groups list to update join status
      fetchGroups();
    } catch (error) {
      console.error("Error joining group:", error);
      if (error.response?.data?.message) {
        alert(error.response.data.message);
      } else {
        alert("Error joining group. Please try again.");
      }
    }
  };

  const handleOpenGroup = (group) => {
    // Call the onGroupSelect callback with the group object
    if (onGroupSelect) {
      onGroupSelect(group);
    }
    console.log("Opening group:", group);
  };

  const isUserJoined = (groupId) => {
    return user?.groupsID?.includes(groupId) || false;
  };

  const filteredGroups = groups.filter(
    (group) =>
      group.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      group.hscode?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full px-3">
      {/* Header with Back Button */}
      <div className="flex items-center justify-between py-[1.1em]">
        <h2 className="text-lg  text-gray-900">{categoryName}</h2>
        {onBack && (
          <button
            onClick={onBack}
            className="text-gray-600 hover:text-gray-800 transition-colors text-sm font-medium"
          >
            ← Back
          </button>
        )}
      </div>

      {/* Search Bar */}
      <div className="flex-shrink-0 flex items-center gap-3 p-2 py-[.35em] border border-gray-200 rounded-md text-gray-600 ">
        <LiaSearchSolid />
        <input
          type="text"
          placeholder="Search or open a group"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="text-[.88em] outline-none placeholder:text-gray-500 bg-transparent flex-1"
        />
      </div>

      {/* Groups List */}
      <div className="flex-1 overflow-y-auto mt-4 min-h-0">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-500 mt-2 text-sm">Loading groups...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-500 text-sm">{error}</p>
            <button
              onClick={fetchGroups}
              className="mt-2 text-blue-600 hover:text-blue-700 underline text-sm"
            >
              Try again
            </button>
          </div>
        ) : filteredGroups.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 text-sm">No groups found</p>
          </div>
        ) : (
          <div className="space-y-1">
            {filteredGroups.map((group, index) => {
              const joined = isUserJoined(group._id);
              return (
                <div
                  key={group._id}
                  className={`p-3 rounded transition-all ${
                    selectedGroupId === group._id && joined
                      ? "bg-[#eaeaea] text-gray-800"
                      : "bg-white hover:bg-[#f4f4f4] text-gray-600"
                  } ${joined ? "cursor-pointer" : ""}`}
                  onClick={joined ? () => handleOpenGroup(group) : undefined}
                  tabIndex={joined ? 0 : -1}
                  onKeyDown={joined ? (e => (e.key === 'Enter' || e.key === ' ') && handleOpenGroup(group)) : undefined}
                  role={joined ? "button" : undefined}
                  aria-pressed={joined ? selectedGroupId === group._id : undefined}
                >
                  <div className="flex items-center space-x-3 min-w-0 flex-1">
                    {/* Group Image/Avatar */}
                    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-200 flex-shrink-0 overflow-hidden">
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
                        <span className="text-sm text-gray-600 font-medium">
                          {group.name?.charAt(0)?.toUpperCase()}
                        </span>
                      )}
                    </div>

                    {/* Group Info */}
                    <div className="min-w-0 flex-1 grid">
                      <div className="text-sm font-medium truncate">
                        {group.name || `Group ${String(index + 1).padStart(2, "0")}`}
                      </div>
                      <div className="text-xs text-gray-500 truncate">
                        hscode: {group.hscode}
                      </div>
                    </div>
                    {/* Action Button for not joined */}
                    {!joined && (
                      <button
                        suppressHydrationWarning={true}
                        onClick={e => { e.stopPropagation(); handleJoinGroup(group); }}
                        className="ml-3 px-4 py-2 bg-gray-800 text-white text-xs font-medium rounded-md hover:bg-gray-900 transition-colors"
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

export default GroupsList;
