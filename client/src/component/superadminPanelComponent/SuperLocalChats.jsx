"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import {
  MdArrowBack,
  MdChat,
  MdSearch,
  MdAdd,
  MdEdit,
  MdDelete,
  MdMoreVert,
} from "react-icons/md";

const SuperLocalChats = () => {
  const [view, setView] = useState("countries"); // "countries", "categories", "groups", "chat"
  const [countries, setCountries] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [groupLeads, setGroupLeads] = useState([]);
  const [leadsLoading, setLeadsLoading] = useState(false);
  const [messageInput, setMessageInput] = useState("");
  const [postingMessage, setPostingMessage] = useState(false);
  const [showMembers, setShowMembers] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [categories, setCategories] = useState([]);
  const [groups, setGroups] = useState([]);

  useEffect(() => {
    if (view === "countries") {
      fetchCountries();
    }
  }, [view]);

  const fetchCountries = async () => {
    try {
      setIsLoading(true);
      setError("");
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_URL}/superadmin/local-leads/countries`,
        { withCredentials: true }
      );
      setCountries(response.data || []);
    } catch (error) {
      console.error("Error fetching countries:", error);
      setError("Failed to load countries");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async (countryCode) => {
    try {
      setIsLoading(true);
      setError("");
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_URL}/categories?countryCode=${countryCode}`,
        { withCredentials: true }
      );
      return response.data || [];
    } catch (error) {
      console.error("Error fetching categories:", error);
      setError("Failed to load categories");
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const fetchGroups = async (categoryId) => {
    try {
      setIsLoading(true);
      setError("");
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_URL}/groups/${categoryId}`,
        { withCredentials: true }
      );
      return response.data || [];
    } catch (error) {
      console.error("Error fetching groups:", error);
      setError("Failed to load groups");
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const fetchGroupLeads = async (groupId) => {
    try {
      setLeadsLoading(true);
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_URL}/leads/${groupId}`,
        { withCredentials: true }
      );
      setGroupLeads(response.data.leads || []);
    } catch (error) {
      console.error("Error fetching group leads:", error);
    } finally {
      setLeadsLoading(false);
    }
  };

  const handleCountrySelect = async (country) => {
    setSelectedCountry(country);
    const categories = await fetchCategories(country.countryCode);
    if (categories.length > 0) {
      setCategories(categories);
      setSelectedCategory(null);
      setSelectedGroup(null);
      setView("categories");
    } else {
      toast.error("No categories found for this country");
    }
  };

  const handleCategorySelect = async (category) => {
    setSelectedCategory(category);
    const groups = await fetchGroups(category._id);
    if (groups.length > 0) {
      setGroups(groups);
      setSelectedGroup(null);
      setView("groups");
    } else {
      toast.error("No groups found for this category");
    }
  };

  const handleGroupSelect = (group) => {
    setSelectedGroup(group);
    setView("chat");
    fetchGroupLeads(group._id);
  };

  const handleBackToCountries = () => {
    setSelectedCountry(null);
    setSelectedCategory(null);
    setSelectedGroup(null);
    setView("countries");
  };

  const handleBackToCategories = () => {
    setSelectedCategory(null);
    setSelectedGroup(null);
    setView("categories");
  };

  const handleBackToGroups = () => {
    setSelectedGroup(null);
    setView("groups");
  };

  const handlePostMessage = async () => {
    if (!messageInput.trim() || !selectedGroup) return;

    try {
      setPostingMessage(true);
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_URL}/superadmin/local-leads/post/${selectedGroup._id}`,
        {
          content: messageInput.trim(),
          type: "lead",
          description: messageInput.trim(),
        },
        { withCredentials: true }
      );

      // Add the new message to the leads list
      setGroupLeads((prev) => [response.data.lead, ...prev]);
      setMessageInput("");
      toast.success("Message posted successfully!");
    } catch (error) {
      console.error("Error posting message:", error);
      toast.error("Failed to post message");
    } finally {
      setPostingMessage(false);
    }
  };

  const renderCountriesView = () => (
    <div className="w-full h-full flex flex-col">
      {/* Header */}
      <div className="p-3 sm:p-4 border-b border-gray-200 flex justify-between items-center">
        <div>
          <h2 className="text-base sm:text-lg text-gray-700">
            Local Chats by Country
          </h2>
          <p className="text-[.7em] sm:text-[.8em] text-gray-500">
            Select a country to view local categories and groups
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <MdChat className="w-5 h-5 text-gray-500" />
        </div>
      </div>

      {/* Countries List */}
      <div className="p-2 overflow-y-auto scrollbar-hide flex-1">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-500 mt-2 text-sm">Loading countries...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-500 text-sm">{error}</p>
            <button
              onClick={fetchCountries}
              className="mt-2 text-blue-600 hover:text-blue-700 underline text-sm"
            >
              Try again
            </button>
          </div>
        ) : countries.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 text-sm">
              No countries with pending leads found
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {countries.map((country, index) => (
              <div
                key={country.countryCode || index}
                className="p-3 hover:bg-gray-100 border border-gray-300 rounded-lg cursor-pointer transition-all bg-white hover:border-gray-400"
                onClick={() => handleCountrySelect(country)}
              >
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <span className="text-[.9em] sm:text-[.96em] text-gray-700 truncate block">
                      {country.countryCode}
                    </span>
                    <span className="text-[.7em] text-gray-700 truncate block">
                      Pending Leads: {country.count}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500">
                      {country.count}
                    </span>
                    <MdChat className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderCategoriesView = () => (
    <div className="w-full h-full flex flex-col">
      {/* Header with Back Button */}
      <div className="p-3 sm:p-4 border-b border-gray-200 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <button
            onClick={handleBackToCountries}
            className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <MdArrowBack className="w-5 h-5 text-gray-500" />
          </button>
          <div>
            <h2 className="text-base sm:text-lg text-gray-700">
              {selectedCountry?.countryCode} - Categories
            </h2>
            <p className="text-[.7em] sm:text-[.8em] text-gray-500">
              Select a category to view groups
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <MdChat className="w-5 h-5 text-gray-500" />
        </div>
      </div>

      {/* Categories List */}
      <div className="p-2 overflow-y-auto scrollbar-hide flex-1">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-500 mt-2 text-sm">Loading categories...</p>
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 text-sm">
              No categories found for this country
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {categories.map((category, index) => (
              <div
                key={category._id || index}
                className="p-3 hover:bg-gray-100 border border-gray-300 rounded-lg cursor-pointer transition-all bg-white hover:border-gray-400"
                onClick={() => handleCategorySelect(category)}
              >
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <span className="text-[.9em] sm:text-[.96em] text-gray-700 truncate block">
                      {category.name}
                    </span>
                    <span className="text-[.7em] text-gray-700 truncate block">
                      Chapter: {category.chapter}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MdChat className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderGroupsView = () => (
    <div className="w-full h-full flex flex-col">
      {/* Header with Back Button */}
      <div className="p-3 sm:p-4 border-b border-gray-200 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <button
            onClick={handleBackToCategories}
            className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <MdArrowBack className="w-5 h-5 text-gray-500" />
          </button>
          <div>
            <h2 className="text-base sm:text-lg text-gray-700">
              {selectedCategory?.name} - Groups
            </h2>
            <p className="text-[.7em] sm:text-[.8em] text-gray-500">
              Select a group to view chat
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <MdChat className="w-5 h-5 text-gray-500" />
        </div>
      </div>

      {/* Groups List */}
      <div className="p-2 overflow-y-auto scrollbar-hide flex-1">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-500 mt-2 text-sm">Loading groups...</p>
          </div>
        ) : groups.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 text-sm">
              No groups found for this category
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {groups.map((group, index) => (
              <div
                key={group._id || index}
                className="p-3 hover:bg-gray-100 border border-gray-300 rounded-lg cursor-pointer transition-all bg-white hover:border-gray-400"
                onClick={() => handleGroupSelect(group)}
              >
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <span className="text-[.9em] sm:text-[.96em] text-gray-700 truncate block">
                      {group.name}
                    </span>
                    <span className="text-[.7em] text-gray-700 truncate block">
                      {group.heading || "No description"}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MdChat className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderChatView = () => (
    <div className="w-full h-full flex flex-col">
      {/* Header with Back Button */}
      <div className="p-3 sm:p-4 border-b border-gray-200 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <button
            onClick={handleBackToGroups}
            className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <MdArrowBack className="w-5 h-5 text-gray-500" />
          </button>
          <div>
            <h2 className="text-base sm:text-lg text-gray-700">
              {selectedGroup?.name} - Chat
            </h2>
            <p className="text-[.7em] sm:text-[.8em] text-gray-500">
              Local Group Chat
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowMembers(!showMembers)}
            className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <span className="text-xs text-gray-600">Members</span>
          </button>
          <MdChat className="w-5 h-5 text-gray-500" />
        </div>
      </div>

      {/* Members Section */}
      {showMembers && (
        <div className="p-3 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-700">Group Members</h3>
            <span className="text-xs text-gray-500">
              {selectedGroup?.members?.length || 0} members
            </span>
          </div>
          <div className="text-xs text-gray-600">
            <p>
              Online:{" "}
              {Math.floor(
                Math.random() * (selectedGroup?.members?.length || 0)
              ) + 1}
            </p>
            <p>Total: {selectedGroup?.members?.length || 0}</p>
          </div>
        </div>
      )}

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        {leadsLoading ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : groupLeads.length === 0 ? (
          <div className="flex justify-center">
            <div className="bg-white border border-gray-200 rounded-lg p-4 max-w-md">
              <div className="text-center">
                <div className="w-12 h-12 bg-gray-200 rounded-lg mx-auto mb-3 flex items-center justify-center">
                  <MdChat className="w-6 h-6 text-gray-400" />
                </div>
                <p className="text-gray-500 text-sm">
                  No messages yet in this group
                </p>
                <p className="text-gray-400 text-xs mt-1">
                  Be the first to post a message!
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {groupLeads.map((lead, index) => (
              <div
                key={lead._id || index}
                className={`bg-white border border-gray-200 rounded-lg p-4 max-w-md ${
                  lead.isAdminPost ? "border-violet-200 bg-violet-50" : ""
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0">
                    {lead.userId?.image ? (
                      <img
                        src={lead.userId.image}
                        alt={lead.userId.name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-xs text-gray-600 font-medium">
                        {lead.userId?.name?.charAt(0)?.toUpperCase() || "U"}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-sm font-medium text-gray-900">
                        {lead.userId?.name || "Unknown User"}
                      </span>
                      {lead.isAdminPost && (
                        <span className="px-2 py-0.5 rounded-full text-xs bg-violet-100 text-violet-700">
                          ADMIN
                        </span>
                      )}
                      {lead.type && (
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs ${
                            lead.type === "buy"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-green-100 text-green-700"
                          }`}
                        >
                          {lead.type.toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-800 mb-2">
                      {lead.content || lead.description || "No content"}
                    </div>
                    {lead.hscode && (
                      <div className="text-xs text-gray-600 mb-1">
                        HS Code: {lead.hscode}
                      </div>
                    )}
                    {lead.quantity && (
                      <div className="text-xs text-gray-600 mb-1">
                        Quantity: {lead.quantity}
                      </div>
                    )}
                    {lead.targetPrice && (
                      <div className="text-xs text-gray-600 mb-1">
                        Price: {lead.targetPrice}
                      </div>
                    )}
                    <div className="text-xs text-gray-500 mt-2">
                      {new Date(lead.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Post Message Section */}
      <div className="p-3 border-t border-gray-200 bg-white">
        <div className="flex space-x-2">
          <input
            type="text"
            placeholder="Type your message..."
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handlePostMessage()}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
          <button
            onClick={handlePostMessage}
            disabled={postingMessage || !messageInput.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {postingMessage ? "Posting..." : "Post"}
          </button>
        </div>
        <div className="mt-2 text-xs text-gray-500">
          As superadmin, your messages are posted directly without approval
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex montserrat h-full flex-col">
      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden">
        {view === "countries" && renderCountriesView()}
        {view === "categories" && renderCategoriesView()}
        {view === "groups" && renderGroupsView()}
        {view === "chat" && renderChatView()}
      </div>
    </div>
  );
};

export default SuperLocalChats;
