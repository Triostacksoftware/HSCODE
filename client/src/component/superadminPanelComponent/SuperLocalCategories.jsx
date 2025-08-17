"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import {
  MdAdd,
  MdEdit,
  MdDelete,
  MdMoreVert,
  MdArrowBack,
  MdChat,
  MdSearch,
} from "react-icons/md";
import SuperLocalCategoriesGroups from "./SuperLocalCategoriesGroups";
import SuperAddLocalCategories from "./SuperAddLocalCategories";
import SuperAddLocalGroup from "./SuperAddLocalGroup";

const SuperLocalCategories = () => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [groupLeads, setGroupLeads] = useState([]);
  const [leadsLoading, setLeadsLoading] = useState(false);
  const [messageInput, setMessageInput] = useState("");
  const [postingMessage, setPostingMessage] = useState(false);
  const [showMembers, setShowMembers] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [openMenu, setOpenMenu] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [showAddGroupModal, setShowAddGroupModal] = useState(false);
  const [view, setView] = useState("categories"); // "categories", "groups", "chat"
  const [selectedCountry, setSelectedCountry] = useState("IN"); // Default to India
  const [countries] = useState([
    { code: "IN", name: "India" },
    { code: "US", name: "United States" },
    { code: "GB", name: "United Kingdom" },
    { code: "DE", name: "Germany" },
    { code: "FR", name: "France" },
    { code: "CA", name: "Canada" },
    { code: "AU", name: "Australia" },
    { code: "JP", name: "Japan" },
    { code: "CN", name: "China" },
    { code: "BR", name: "Brazil" },
  ]);

  useEffect(() => {
    if (selectedCountry) {
      fetchCategories();
    }
  }, [selectedCountry]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openMenu && !event.target.closest(".menu-container")) {
        setOpenMenu(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openMenu]);

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      setError("");
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_URL}/superadmin/categories/${selectedCountry}`,
        {
          withCredentials: true,
        }
      );
      console.log("category", response.data);
      setCategories(response.data || []);
    } catch (error) {
      console.error("Error fetching local categories:", error);
      setError("Failed to load local categories");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchGroups = async (categoryId) => {
    try {
      setIsLoading(true);
      setError("");
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_URL}/categories/${categoryId}/groups`,
        {
          withCredentials: true,
        }
      );
      setGroups(response.data || []);
    } catch (error) {
      console.error("Error fetching local groups:", error);
      setError("Failed to load local groups");
    } finally {
      setIsLoading(false);
    }
  };

  const handleMenuToggle = (categoryId) => {
    setOpenMenu(openMenu === categoryId ? null : categoryId);
  };

  const handleEdit = (category) => {
    // TODO: Implement edit functionality
    console.log("Edit category:", category);
  };

  const handleDelete = (category) => {
    setCategoryToDelete(category);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!categoryToDelete) return;

    try {
      setIsLoading(true);
      await axios.delete(
        `${process.env.NEXT_PUBLIC_BASE_URL}/categories/${categoryToDelete._id}`,
        { withCredentials: true }
      );
      setCategories((prev) =>
        prev.filter((cat) => cat._id !== categoryToDelete._id)
      );
      setShowDeleteModal(false);
      setCategoryToDelete(null);
      toast.success("Local category deleted successfully!");
    } catch (error) {
      console.error("Error deleting local category:", error);
      toast.error("Failed to delete local category");
    } finally {
      setIsLoading(false);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setCategoryToDelete(null);
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setSelectedGroup(null);
    setView("groups");
    fetchGroups(category._id);
  };

  const handleGroupSelect = (group) => {
    setSelectedGroup(group);
    setView("chat");
    fetchGroupLeads(group._id);
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

  const handleAddCategory = () => {
    setShowAddCategoryModal(true);
  };

  const handleAddGroup = () => {
    setShowAddGroupModal(true);
  };

  const handleCategoryCreated = (newCategory) => {
    // Add the new category to the list
    setCategories((prev) => [...prev, newCategory]);
    // Refresh the list to ensure consistency
    fetchCategories();
  };

  const handleGroupCreated = () => {
    // Refresh groups if we're on groups view
    if (view === "groups" && selectedCategory) {
      // The SuperLocalCategoriesGroups component will handle refreshing
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

  const renderCategoriesView = () => (
    <div className="w-full h-full flex flex-col">
      {/* Header */}
      <div className="p-3 sm:p-4 border-b border-gray-200 flex justify-between items-center">
        <div>
          <h2 className="text-base sm:text-lg text-gray-700">
            Local Categories -{" "}
            {countries.find((c) => c.code === selectedCountry)?.name}
          </h2>
          <p className="text-[.7em] sm:text-[.8em] text-gray-500">
            No. of Local Categories - {categories.length}
          </p>
        </div>
        <button
          onClick={handleAddCategory}
          className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-200 cursor-pointer border-gray-200 border transition-colors"
        >
          <MdAdd className="w-5 h-5" />
        </button>
      </div>

      {/* Categories List */}
      <div className="p-2 overflow-y-auto scrollbar-hide flex-1">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-500 mt-2 text-sm">
              Loading local categories...
            </p>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-500 text-sm">{error}</p>
            <button
              onClick={fetchCategories}
              className="mt-2 text-blue-600 hover:text-blue-700 underline text-sm"
            >
              Try again
            </button>
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 text-sm">No local categories found</p>
          </div>
        ) : (
          <div className="space-y-2">
            {categories.map((category, index) => (
              <div
                key={category._id || index}
                className={`p-3 hover:bg-gray-100 border border-gray-300 rounded-lg cursor-pointer transition-all ${
                  selectedCategory?._id === category._id
                    ? "bg-gray-100 "
                    : "bg-white  hover:border-gray-400"
                }`}
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
                  <div className="relative menu-container cursor-pointer flex-shrink-0 ml-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMenuToggle(category._id);
                      }}
                      className="p-1 hover:bg-gray-200 rounded-full transition-colors cursor-pointer"
                    >
                      <MdMoreVert className="w-5 h-5 text-gray-500" />
                    </button>

                    {/* Dropdown Menu */}
                    {openMenu === category._id && (
                      <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[120px] animate-dropdown">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(category);
                          }}
                          className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 cursor-pointer transition-colors flex items-center space-x-2"
                        >
                          <MdEdit className="w-4 h-4 text-gray-600" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(category);
                          }}
                          className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 cursor-pointer transition-colors flex items-center space-x-2 text-gray-600"
                        >
                          <MdDelete className="w-4 h-4" />
                          <span>Delete</span>
                        </button>
                      </div>
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
        <button
          onClick={handleAddGroup}
          className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-200 cursor-pointer border-gray-200 border transition-colors"
        >
          <MdAdd className="w-5 h-5" />
        </button>
      </div>

      {/* Groups Component */}
      <div className="flex-1 overflow-hidden">
        <SuperLocalCategoriesGroups
          categoryId={selectedCategory?._id}
          categoryName={selectedCategory?.name}
          onGroupSelect={handleGroupSelect}
          selectedGroupId={selectedGroup?._id}
        />
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
    <div className="flex montserrat h-screen flex-col lg:flex-row">
      {/* Left Section - Categories List */}
      <div className="w-full grid grid-rows-[auto_1fr] lg:w-3/4 border-b h-full lg:border-b-0 lg:border-r border-gray-200 transform transition-transform duration-300 ease-in-out animate-slide-in">
        {/* Main Content Area */}
        <div className="flex-1 overflow-hidden">
          {view === "categories" && renderCategoriesView()}
          {view === "groups" && renderGroupsView()}
          {view === "chat" && renderChatView()}
        </div>
      </div>

      {/* Right Section - Country Selector */}
      <div className="hidden lg:block flex-1 h-full overflow-scroll bg-gray-50 ">
        <div className="p-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Countries
          </h2>

          {/* Search Bar */}
          <div className="mb-4">
            <div className="relative">
              <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search country code..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
          </div>

          {/* Countries List */}
          <div className="space-y-2">
            {countries.map((country) => (
              <div
                key={country.code}
                className={`p-3 border border-gray-300 rounded-lg cursor-pointer transition-all ${
                  selectedCountry === country.code
                    ? "bg-blue-100 border-blue-400"
                    : "bg-white hover:bg-gray-50 hover:border-gray-400"
                }`}
                onClick={() => {
                  setSelectedCountry(country.code);
                  // Reset view and fetch categories for new country
                  setView("categories");
                  setSelectedCategory(null);
                  setSelectedGroup(null);
                }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium text-gray-900">
                      {country.name}
                    </span>
                    <span className="text-xs text-gray-500 block">
                      {country.code}
                    </span>
                  </div>
                  {selectedCountry === country.code && (
                    <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/20 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 animate-dropdown">
            <div className="flex flex-row-reverse items-center justify-between mb-4">
              <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center mr-4">
                <MdDelete className="w-4 h-4 text-red-600" />
              </div>
              <div>
                <h3 className="text-md font-semibold text-gray-900">
                  Delete Local Category
                </h3>
                <p className="text-xs text-gray-500">
                  This action cannot be undone.
                </p>
              </div>
            </div>

            <p className="text-gray-700 mb-6 text-sm">
              Are you sure you want to delete{" "}
              <span className="font-semibold">"{categoryToDelete?.name}"</span>?
              This will also remove all associated local groups.
            </p>

            <div className="flex space-x-3">
              <button
                onClick={cancelDelete}
                disabled={isLoading}
                className="flex-1 px-2 py-2 border cursor-pointer border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={isLoading}
                className="flex-1 px-2 py-2 bg-red-600 cursor-pointer text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Deleting...
                  </>
                ) : (
                  "Yes, Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Category Modal */}
      {showAddCategoryModal && (
        <div className="fixed inset-0 bg-black/20 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 h-[80vh] max-h-[600px] animate-dropdown">
            <SuperAddLocalCategories
              countryCode={selectedCountry}
              onClose={() => setShowAddCategoryModal(false)}
              onCategoryCreated={handleCategoryCreated}
            />
          </div>
        </div>
      )}

      {/* Add Group Modal */}
      {showAddGroupModal && (
        <div className="fixed inset-0 bg-black/20 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 h-[80vh] max-h-[600px] animate-dropdown">
            <SuperAddLocalGroup
              categoryId={selectedCategory?._id}
              categoryName={selectedCategory?.name}
              onClose={() => setShowAddGroupModal(false)}
              onGroupCreated={handleGroupCreated}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperLocalCategories;
