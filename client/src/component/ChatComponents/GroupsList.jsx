"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useUserAuth } from "../../utilities/userAuthMiddleware";

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
    // Call the onGroupSelect callback with the group ID
    if (onGroupSelect) {
      onGroupSelect(group._id);
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
    <div className="flex flex-col h-full">
      {/* Header with Back Button */}
      <div className="p-4 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-700">
            {categoryName}
          </h2>
          {onBack && (
            <button
              onClick={onBack}
              className="text-gray-600 hover:text-gray-800 transition-colors"
            >
              ← Back
            </button>
          )}
        </div>
      </div>

      {/* Search Bar */}
      <div className="p-4 border-b border-gray-200 flex-shrink-0">
        <input
          type="text"
          placeholder="search group"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Groups List */}
      <div className="flex-1 overflow-y-auto p-4 min-h-0">
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
          <div className="space-y-3">
            {filteredGroups.map((group, index) => (
              <div
                key={group._id}
                className={`p-3 border rounded-lg transition-all ${
                  selectedGroupId === group._id
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center justify-between">
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
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium text-gray-700 truncate">
                        Item {String(index + 1).padStart(2, "0")}
                      </div>
                      <div className="text-xs text-gray-500">
                        User: {group.creator?.name || "Rice"},{" "}
                        {group.hscode || "1000"} unit, ₹
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="flex-shrink-0 ml-3">
                    {isUserJoined(group._id) ? (
                      <button
                        onClick={() => handleOpenGroup(group)}
                        className="px-4 py-2 bg-green-500 text-white text-xs font-medium rounded-lg hover:bg-green-600 transition-colors"
                      >
                        Open
                      </button>
                    ) : (
                      <button
                        onClick={() => handleJoinGroup(group)}
                        className="px-4 py-2 bg-gray-800 text-white text-xs font-medium rounded-lg hover:bg-gray-900 transition-colors"
                      >
                        Join
                      </button>
                    )}
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

export default GroupsList;
