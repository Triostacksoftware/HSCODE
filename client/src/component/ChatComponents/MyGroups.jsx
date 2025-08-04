"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useUserAuth } from "../../utilities/userAuthMiddleware";

const MyGroups = ({ onGroupSelect, selectedGroupId }) => {
  const { user } = useUserAuth();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (user && user.groupsID && user.groupsID.length > 0) {
      fetchMyGroups();
    }
  }, [user]);

  const fetchMyGroups = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_URL}/user/groups`,
        { groupIds: user.groupsID },
        { withCredentials: true }
      );

      console.log("My groups fetched:", response.data);
      setGroups(response.data || []);
    } catch (error) {
      console.error("Error fetching my groups:", error);
      setError("Failed to load your groups");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenGroup = (group) => {
    // Call the onGroupSelect callback with the group ID
    if (onGroupSelect) {
      onGroupSelect(group._id);
    }
    console.log("Opening group:", group);
  };

  const filteredGroups = groups.filter(
    (group) =>
      group.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      group.hscode?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full">
      {/* Search Bar */}
      <div className="p-4 border-b border-gray-200 flex-shrink-0">
        <input
          type="text"
          placeholder="search my groups"
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
            <p className="text-gray-500 mt-2 text-sm">Loading your groups...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-500 text-sm">{error}</p>
            <button
              onClick={fetchMyGroups}
              className="mt-2 text-blue-600 hover:text-blue-700 underline text-sm"
            >
              Try again
            </button>
          </div>
        ) : !user?.groupsID || user.groupsID.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-gray-200 rounded-lg mx-auto mb-4 flex items-center justify-center">
              <span className="text-gray-400 text-xl">👥</span>
            </div>
            <p className="text-gray-500 text-sm">
              You haven't joined any groups yet
            </p>
            <p className="text-gray-400 text-xs mt-1">
              Switch to chapters to discover groups
            </p>
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
                        {group.name ||
                          `Group ${String(index + 1).padStart(2, "0")}`}
                      </div>
                      <div className="text-xs text-gray-500">
                        User: {group.creator?.name || "Unknown"},{" "}
                        {group.hscode || "N/A"} unit, ₹
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="flex-shrink-0 ml-3">
                    <button
                      onClick={() => handleOpenGroup(group)}
                      className="px-4 py-2 bg-green-500 text-white text-xs font-medium rounded-lg hover:bg-green-600 transition-colors"
                    >
                      Open
                    </button>
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

export default MyGroups;
