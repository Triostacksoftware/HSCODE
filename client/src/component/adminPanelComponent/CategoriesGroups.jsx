import React, { useState, useEffect } from "react";
import axios from "axios";
import { MdAdd, MdEdit, MdDelete, MdSearch, MdMoreVert } from "react-icons/md";
import AddGroup from "./AddGroup";

const CategorisGroups = ({ categoryId, categoryName }) => {
  console.log(categoryId, categoryName);
  const [groups, setGroups] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [openMenu, setOpenMenu] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [groupToDelete, setGroupToDelete] = useState(null);
  const [showAddGroupModal, setShowAddGroupModal] = useState(false);

  useEffect(() => {
    if (categoryId) {
      fetchGroups();
    }
  }, [categoryId]);

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

  const fetchGroups = async () => {
    try {
      setIsLoading(true);
      setError("");

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_URL}/categories/${categoryId}/group`,
        {
          withCredentials: true,
        }
      );
      console.log(response.data);

      setGroups(response.data || []);
    } catch (error) {
      console.error("Error fetching groups:", error);
      setError("Failed to load groups");
    } finally {
      setIsLoading(false);
    }
  };

  const handleMenuToggle = (groupId) => {
    setOpenMenu(openMenu === groupId ? null : groupId);
  };

  const handleEdit = (group) => {
    // TODO: Implement edit functionality
    console.log("Edit group:", group);
    setOpenMenu(null);
  };

  const handleDelete = (group) => {
    setGroupToDelete(group);
    setShowDeleteModal(true);
    setOpenMenu(null);
  };

  const confirmDelete = async () => {
    if (!groupToDelete) return;

    try {
      setIsLoading(true);
      const response = await axios.delete(
        `${process.env.NEXT_PUBLIC_BASE_URL}/categories/${categoryId}/group/${groupToDelete._id}`,
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
    } catch (error) {
      console.error("Error deleting group:", error);
      setError("Failed to delete group");
    } finally {
      setIsLoading(false);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setGroupToDelete(null);
  };

  const handleAddGroup = () => {
    setShowAddGroupModal(true);
  };

  const handleCloseAddGroup = () => {
    setShowAddGroupModal(false);
    // Refresh groups after closing the modal
    fetchGroups();
  };

  const filteredGroups = groups.filter(
    (group) =>
      group.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      group.hscode?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const displayGroups = groups;

  return (
    <>
      {!showAddGroupModal ? (
        <div className="w-full h-full montserrat transform transition-transform duration-300 ease-in-out animate-slide-out flex flex-col">
          {/* Header */}
          <div className="p-3 sm:p-4 border-b border-gray-200 flex justify-between items-center gap-4 sm:gap-10 flex-shrink-0">
            <div className="min-w-0 flex-1">
              <h2 className="text-base sm:text-lg text-gray-700 truncate">
                Category - {categoryName || "01"}
              </h2>
              <h2 className="text-[.7em] sm:text-[.8em] text-gray-500">
                No. of Groups - {groups.length}
              </h2>
            </div>
            <button
              onClick={handleAddGroup}
              className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-200 cursor-pointer border-gray-200 border transition-colors flex-shrink-0"
            >
              <MdAdd className="w-5 h-5" />
            </button>
          </div>

          {/* Search Bar */}
          <div className="p-3 sm:p-4 flex-shrink-0">
            <div className="relative">
              <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="search group"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-transparent text-gray-800 text-sm sm:text-base"
              />
            </div>
          </div>

          {/* Groups List */}
          <div className="p-3 sm:p-4 flex-1 overflow-y-auto">
            {isLoading ? (
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
            ) : filteredGroups.length === 0 && displayGroups.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 text-sm">No groups found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {(searchTerm ? filteredGroups : displayGroups).map(
                  (group, index) => (
                    <div
                      key={group._id || index}
                      className="p-3 border border-gray-200 rounded-lg hover:bg-gray-100 cursor-pointer transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-end space-x-2 sm:space-x-3 min-w-0 flex-1">
                          <div className="w-8 h-8 sm:w-9 sm:h-9 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                            <img src={`${process.env.NEXT_PUBLIC_BASE_URL}/upload${group.image}`} alt="" />
                            {/* <span className="text-xs text-gray-600">G</span> */}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-[.9em] sm:text-[.96em] text-gray-700 truncate">
                              {group.name}
                            </div>
                            <div className="text-xs text-gray-500">
                              Hscode - {group.hscode}
                            </div>
                          </div>
                          <div className="text-xs text-gray-500 flex-shrink-0">
                            Members - 45
                          </div>
                        </div>
                        <div className="relative menu-container flex-shrink-0 ml-2">
                          <button
                            onClick={() => handleMenuToggle(group._id)}
                            className="p-1 hover:bg-gray-200 rounded-full transition-colors cursor-pointer"
                          >
                            <MdMoreVert className="w-5 h-5 text-gray-500" />
                          </button>

                          {/* Dropdown Menu */}
                          {openMenu === group._id && (
                            <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[120px] animate-dropdown">
                              <button
                                onClick={() => handleEdit(group)}
                                className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center space-x-2"
                              >
                                <MdEdit className="w-4 h-4 text-gray-600" />
                                <span>Edit</span>
                              </button>
                              <button
                                onClick={() => handleDelete(group)}
                                className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center space-x-2 text-gray-600"
                              >
                                <MdDelete className="w-4 h-4" />
                                <span>Delete</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="w-full h-full montserrat transform transition-transform duration-300 ease-in-out animate-slide-out">
          <AddGroup
            categoryId={categoryId}
            categoryName={categoryName}
            onClose={handleCloseAddGroup}
          />
        </div>
      )}

      {/* Delete Confirmation Modal - Outside the container */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/20 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 animate-dropdown">
            <div className="flex flex-row-reverse items-center justify-between mb-4">
              <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center mr-4">
                <MdDelete className="w-4 h-4 text-red-600" />
              </div>
              <div>
                <h3 className="text-md font-semibold text-gray-900">
                  Delete Group
                </h3>
                <p className="text-xs text-gray-500">
                  This action cannot be undone.
                </p>
              </div>
            </div>

            <p className="text-gray-700 mb-6 text-sm">
              Are you sure you want to delete{" "}
              <span className="font-semibold">"{groupToDelete?.name}"</span>?
              This action cannot be undone.
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
    </>
  );
};

export default CategorisGroups;
