"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { MdSearch, MdMoreVert, MdEdit, MdDelete } from "react-icons/md";
import { toast } from "react-hot-toast";

const SuperCategoriesGroups = ({
  chapterNumber,
  chapterName,
  onGroupSelect,
  selectedGroupId,
  onGroupUpdated,
}) => {
  const [groups, setGroups] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [openMenu, setOpenMenu] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [groupToEdit, setGroupToEdit] = useState(null);
  const [groupToDelete, setGroupToDelete] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: "",
    heading: "",
    image: "",
  });

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

  // Edit group handlers
  const handleEditGroup = (group) => {
    setGroupToEdit(group);
    setEditFormData({
      name: group.name,
      heading: group.heading,
      image: group.image || "",
    });
    setShowEditModal(true);
    setOpenMenu(null);
  };

  const handleCloseEditGroup = () => {
    setShowEditModal(false);
    setGroupToEdit(null);
    setEditFormData({ name: "", heading: "", image: "" });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!groupToEdit) return;

    try {
      setIsLoading(true);

      // Update the group using the global groups API
      await axios.patch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/global-groups/${groupToEdit._id}`,
        {
          name: editFormData.name,
          heading: editFormData.heading,
          image: editFormData.image,
        },
        {
          withCredentials: true,
        }
      );

      // Update the group in the local state
      setGroups((prevGroups) =>
        prevGroups.map((group) =>
          group._id === groupToEdit._id
            ? {
                ...group,
                name: editFormData.name,
                heading: editFormData.heading,
                image: editFormData.image,
              }
            : group
        )
      );

      setShowEditModal(false);
      setGroupToEdit(null);
      setEditFormData({ name: "", heading: "", image: "" });
      toast.success("Group updated successfully");

      if (onGroupUpdated) {
        onGroupUpdated();
      }
    } catch (error) {
      console.error("Error updating group:", error);
      toast.error("Failed to update group");
    } finally {
      setIsLoading(false);
    }
  };

  // Delete group handlers
  const handleDeleteGroup = (group) => {
    setGroupToDelete(group);
    setShowDeleteModal(true);
    setOpenMenu(null);
  };

  const confirmDeleteGroup = async () => {
    if (!groupToDelete) return;

    try {
      setIsLoading(true);

      await axios.delete(
        `${process.env.NEXT_PUBLIC_BASE_URL}/global-groups/${groupToDelete._id}`,
        {
          withCredentials: true,
        }
      );

      // Remove the group from the list
      setGroups((prevGroups) =>
        prevGroups.filter((group) => group._id !== groupToDelete._id)
      );

      setShowDeleteModal(false);
      setGroupToDelete(null);
      toast.success("Group deleted successfully");

      if (onGroupUpdated) {
        onGroupUpdated();
      }
    } catch (error) {
      console.error("Error deleting group:", error);
      toast.error("Failed to delete group");
    } finally {
      setIsLoading(false);
    }
  };

  const cancelDeleteGroup = () => {
    setShowDeleteModal(false);
    setGroupToDelete(null);
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openMenu && !event.target.closest(".dropdown-menu")) {
        setOpenMenu(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openMenu]);

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
                className={`p-2.5 sm:p-3 border border-gray-200 rounded-lg cursor-pointer transition-all hover:shadow-sm ${
                  selectedGroupId === group._id
                    ? "bg-blue-50 border-blue-300"
                    : "bg-white hover:bg-gray-100"
                }`}
                onClick={() => onGroupSelect && onGroupSelect(group)}
              >
                <div className="flex items-start space-x-3 min-w-0 flex-1">
                  {/* Group Image */}
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center flex-shrink-0 border border-gray-200 bg-gray-50">
                    {group.image ? (
                      <img
                        src={
                          group.image.includes("https")
                            ? group.image
                            : `${process.env.NEXT_PUBLIC_BASE_URL}/upload/${group.image}`
                        }
                        alt="group"
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center">
                        <span className="text-blue-600 font-semibold text-sm">
                          {group.name?.charAt(0)?.toUpperCase() || "G"}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Group Info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between">
                      <div className="min-w-0 flex-1">
                        <h3 className="font-medium text-gray-900 truncate">
                          {group.name}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {group.heading || "No description"}
                        </p>
                        <div className="mt-2 flex items-center space-x-4">
                          <span className="text-xs text-blue-600">
                            {group.members?.length || 0} members
                          </span>
                          <span className="text-xs text-gray-500">
                            ID: {group._id?.slice(-6) || "N/A"}
                          </span>
                        </div>
                      </div>

                      {/* Actions Menu */}
                      <div className="relative flex-shrink-0 ml-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenMenu(
                              openMenu === group._id ? null : group._id
                            );
                          }}
                          className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                          title="Group actions"
                        >
                          <MdMoreVert className="w-4 h-4 text-gray-500" />
                        </button>

                        {/* Dropdown Menu */}
                        {openMenu === group._id && (
                          <div className="dropdown-menu absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg min-w-[100px] sm:min-w-[120px] animate-dropdown z-50">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditGroup(group);
                              }}
                              className="w-full px-2 sm:px-3 py-2 text-left text-xs sm:text-sm hover:bg-gray-50 cursor-pointer transition-colors flex items-center space-x-1.5 sm:space-x-2"
                            >
                              <MdEdit className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600" />
                              <span>Edit</span>
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteGroup(group);
                              }}
                              className="w-full px-2 sm:px-3 py-2 text-left text-xs sm:text-sm hover:bg-gray-50 cursor-pointer transition-colors flex items-center space-x-1.5 sm:space-x-2 text-red-600"
                            >
                              <MdDelete className="w-3 h-3 sm:w-4 sm:h-4" />
                              <span>Delete</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Group Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/20 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 animate-dropdown">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Edit Group
                </h3>
                <button
                  onClick={handleCloseEditGroup}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <MdDelete className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Group Name
                  </label>
                  <input
                    type="text"
                    value={editFormData.name}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, name: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Group Heading
                  </label>
                  <input
                    type="text"
                    value={editFormData.heading}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        heading: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Image URL
                  </label>
                  <input
                    type="url"
                    value={editFormData.image}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        image: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {isLoading ? "Updating..." : "Update Group"}
                  </button>
                  <button
                    type="button"
                    onClick={handleCloseEditGroup}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Group Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/20 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 animate-dropdown">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-3">
                  <MdDelete className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Delete Group
                  </h3>
                  <p className="text-sm text-gray-500">
                    This action cannot be undone
                  </p>
                </div>
              </div>

              <p className="text-gray-600 mb-6">
                Are you sure you want to delete the group "{groupToDelete?.name}
                "? This will permanently remove the group and all its data.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={confirmDeleteGroup}
                  disabled={isLoading}
                  className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {isLoading ? "Deleting..." : "Delete Group"}
                </button>
                <button
                  onClick={cancelDeleteGroup}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperCategoriesGroups;
