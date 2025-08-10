"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useUserAuth } from "../../utilities/userAuthMiddleware";
import { LiaSearchSolid } from "react-icons/lia";

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

  const handleOpenGroup = async (group) => {
    // Call the onGroupSelect callback with the group object
    if (onGroupSelect) {
      onGroupSelect(group);
    }
    // mark as read
    try {
      await axios.patch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/user/mark-group-read`,
        { groupId: group._id },
        { withCredentials: true }
      );
      // update local badge
      setGroups((prev) => prev.map((g) => g._id === group._id ? { ...g, unreadCount: 0 } : g));
    } catch (_) {}
    console.log("Opening group:", group);
  };

  const filteredGroups = groups.filter(
    (group) =>
      group.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (group.heading || group.hscode)?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full px-3">
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
          <div className="space-y-1">
            {filteredGroups.map((group, index) => (
              <div
                key={group._id}
                className={`p-3 rounded-md cursor-pointer transition-all ${
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
                      {group.name ||
                        `Group ${String(index + 1).padStart(2, "0")}`}
                    </div>
                    <div className="text-xs text-gray-500 truncate">
                      heading: {group.heading || group.hscode}
                    </div>
                  </div>
                  {(group.unreadBuyCount > 0 || group.unreadSellCount > 0) && (
                    <div className="ml-auto flex items-center gap-1">
                      {group.unreadBuyCount > 0 && (
                        <span title="New buy leads" className="inline-flex items-center justify-center min-w-[22px] h-5 px-1 rounded-full text-white text-[11px] bg-blue-600">
                          {group.unreadBuyCount}
                        </span>
                      )}
                      {group.unreadSellCount > 0 && (
                        <span title="New sell leads" className="inline-flex items-center justify-center min-w-[22px] h-5 px-1 rounded-full text-white text-[11px] bg-green-600">
                          {group.unreadSellCount}
                        </span>
                      )}
                    </div>
                  )}
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
