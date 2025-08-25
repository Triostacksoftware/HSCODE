"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { MdSearch } from "react-icons/md";

const SuperCategoriesGroups = ({
  chapterNumber,
  chapterName,
  onGroupSelect,
  selectedGroupId,
}) => {
  const [groups, setGroups] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (chapterNumber) {
      fetchGroups();
    }
  }, [chapterNumber]);

  const fetchGroups = async () => {
    try {
      setIsLoading(true);
      setError("");

      console.log(`🌍 Fetching global groups for:`, {
        chapterNumber,
        url: `${process.env.NEXT_PUBLIC_BASE_URL}/global-groups?chapterNumber=${chapterNumber}`,
      });

      // Fetch global groups by chapter number
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_URL}/global-groups?chapterNumber=${chapterNumber}`,
        {
          withCredentials: true,
        }
      );

      console.log(`✅ Global groups response:`, {
        data: response.data,
        count: response.data?.length || 0,
      });

      setGroups(response.data || []);
    } catch (error) {
      console.error("❌ Error fetching global groups:", error);
      setError("Failed to load global groups");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredGroups = groups.filter(
    (group) =>
      group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (group.heading || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col">
      {/* Search Bar */}
      <div className="p-3 border-b border-gray-200">
        <div className="relative">
          <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search groups..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Groups List */}
      <div className="flex-1 overflow-y-auto p-2">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-500 mt-2 text-xs">Loading groups...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-500 text-xs">{error}</p>
            <button
              onClick={fetchGroups}
              className="mt-2 text-blue-600 hover:text-blue-700 underline text-xs"
            >
              Try again
            </button>
          </div>
        ) : filteredGroups.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 text-xs">
              {searchTerm ? "No groups found" : "No groups in this chapter"}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredGroups.map((group, index) => (
              <div
                key={group._id || index}
                className={`p-3 border border-gray-200 rounded-lg cursor-pointer transition-all ${
                  selectedGroupId === group._id
                    ? "bg-blue-50 border-blue-300"
                    : "bg-white hover:bg-gray-100"
                }`}
                onClick={() => onGroupSelect && onGroupSelect(group)}
              >
                <h3 className="font-medium text-gray-900">{group.name}</h3>
                <p className="text-sm text-gray-600 mt-1">
                  {group.heading || "No description"}
                </p>
                <div className="mt-2">
                  <span className="text-xs text-blue-600">
                    {group.members?.length || 0} members
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SuperCategoriesGroups;
