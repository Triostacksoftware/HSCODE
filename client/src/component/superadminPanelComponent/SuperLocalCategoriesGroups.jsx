"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { MdSearch } from "react-icons/md";

const SuperLocalCategoriesGroups = ({
  chapterNumber,
  chapterName,
  onGroupSelect,
  selectedGroupId,
  selectedCountryCode,
}) => {
  const [groups, setGroups] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (chapterNumber && selectedCountryCode) {
      fetchGroups();
    }
  }, [chapterNumber, selectedCountryCode]);

  const fetchGroups = async () => {
    try {
      setIsLoading(true);
      setError("");

      console.log(`🔍 Fetching local groups for:`, {
        chapterNumber,
        selectedCountryCode,
        url: `${process.env.NEXT_PUBLIC_BASE_URL}/groups?chapterNumber=${chapterNumber}&countryCode=${selectedCountryCode}`,
      });

      // Fetch local groups by chapter number and country code
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_URL}/groups?chapterNumber=${chapterNumber}&countryCode=${selectedCountryCode}`,
        {
          withCredentials: true,
        }
      );

      console.log(`✅ Local groups response:`, {
        data: response.data,
        count: response.data?.length || 0,
      });

      setGroups(response.data || []);
    } catch (error) {
      console.error("❌ Error fetching local groups:", error);
      setError("Failed to load local groups");
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
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
      </div>

      {/* Groups List */}
      <div className="flex-1 overflow-y-auto p-2">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600 mx-auto"></div>
            <p className="text-gray-500 mt-2 text-xs">Loading groups...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-500 text-xs">{error}</p>
            <button
              onClick={fetchGroups}
              className="mt-2 text-green-600 hover:text-green-700 underline text-xs"
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
                    ? "bg-green-50 border-green-300"
                    : "bg-white hover:bg-gray-100"
                }`}
                onClick={() => onGroupSelect && onGroupSelect(group)}
              >
                <h3 className="font-medium text-gray-900">{group.name}</h3>
                <p className="text-sm text-gray-600 mt-1">
                  {group.heading || "No description"}
                </p>
                <div className="mt-2">
                  <span className="text-xs text-green-600">
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

export default SuperLocalCategoriesGroups;
