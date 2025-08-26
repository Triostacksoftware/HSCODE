"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  MdAdd,
  MdEdit,
  MdDelete,
  MdMoreVert,
  MdArrowBack,
  MdSearch,
} from "react-icons/md";
import AddGroup from "./AddGroup";
import hsCodeData from "../../../hs_code_structure.json";

const Categories = () => {
  const [activeSection, setActiveSection] = useState(null);
  const [activeChapter, setActiveChapter] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddGroupModal, setShowAddGroupModal] = useState(false);

  // Groups state
  const [groups, setGroups] = useState([]);
  const [groupsSearchTerm, setGroupsSearchTerm] = useState("");
  const [groupsLoading, setGroupsLoading] = useState(false);
  const [groupsError, setGroupsError] = useState("");
  const [openMenu, setOpenMenu] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [groupToDelete, setGroupToDelete] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [groupToEdit, setGroupToEdit] = useState(null);
  const [editFormData, setEditFormData] = useState({ name: "", heading: "" });

  // Filter sections based on search
  const filteredSections = hsCodeData.sections.filter(
    (section) =>
      section.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      section.section.toString().includes(searchTerm)
  );

  // Filter chapters based on search and active section
  const filteredChapters =
    activeSection?.chapters.filter(
      (chapter) =>
        chapter.heading.toLowerCase().includes(searchTerm.toLowerCase()) ||
        chapter.chapter.toString().includes(searchTerm)
    ) || [];

  // Filter groups based on search
  const filteredGroups = groups.filter(
    (group) =>
      group.name?.toLowerCase().includes(groupsSearchTerm.toLowerCase()) ||
      group.heading?.toLowerCase().includes(groupsSearchTerm.toLowerCase())
  );

  const handleSectionClick = (section) => {
    setActiveSection(section);
    setActiveChapter(null);
    setSearchTerm("");
    setGroups([]);
  };

  const handleChapterClick = (chapter) => {
    setActiveChapter(chapter);
    fetchGroups(chapter.chapter.toString());
  };

  const handleBackToSections = () => {
    setActiveSection(null);
    setActiveChapter(null);
    setSearchTerm("");
    setGroups([]);
  };

  const handleBackToChapters = () => {
    setActiveChapter(null);
    setGroupsSearchTerm("");
    setGroups([]);
  };

  const handleAddGroup = () => {
    setShowAddGroupModal(true);
  };

  const handleCloseAddGroup = () => {
    setShowAddGroupModal(false);
  };

  const handleEditGroup = (group) => {
    setGroupToEdit(group);
    setEditFormData({ name: group.name, heading: group.heading });
    setShowEditModal(true);
    setOpenMenu(null);
  };

  const handleCloseEditGroup = () => {
    setShowEditModal(false);
    setGroupToEdit(null);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!groupToEdit) return;

    try {
      setGroupsLoading(true);

      // Update the group using the groups API
      await axios.patch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/groups/${groupToEdit._id}`,
        {
          name: editFormData.name,
          heading: editFormData.heading,
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
              }
            : group
        )
      );

      setShowEditModal(false);
      setGroupToEdit(null);
      setEditFormData({ name: "", heading: "" });
    } catch (error) {
      console.error("Error updating group:", error);
      setGroupsError("Failed to update group");
    } finally {
      setGroupsLoading(false);
    }
  };

  // Fetch groups for a chapter
  const fetchGroups = async (chapterId) => {
    try {
      setGroupsLoading(true);
      setGroupsError("");

      // Use direct groups endpoint with chapter number filter
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_URL}/groups?chapterNumber=${chapterId}`,
        {
          withCredentials: true,
        }
      );
      setGroups(response.data || []);
    } catch (error) {
      console.error("Error fetching groups:", error);
      setGroupsError("Failed to load groups");
      setGroups([]);
    } finally {
      setGroupsLoading(false);
    }
  };

  // Delete group
  const handleDeleteGroup = (group) => {
    console.log("check is working");
    setGroupToDelete(group);
    setShowDeleteModal(true);
    setOpenMenu(null);
  };

  const confirmDeleteGroup = async () => {
    if (!groupToDelete) return;

    try {
      setGroupsLoading(true);

      // Use direct groups endpoint
      await axios.delete(
        `${process.env.NEXT_PUBLIC_BASE_URL}/groups/${groupToDelete._id}`,
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
      setGroupsError("Failed to delete group");
    } finally {
      setGroupsLoading(false);
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
    <div className="flex montserrat h-screen flex-col lg:flex-row">
      {/* Left Section - Sections/Chapters List */}
      <div className="w-full grid grid-rows-[auto_1fr] lg:w-1/3 xl:w-1/4 border-b h-full lg:border-b-0 lg:border-r border-gray-200 transform transition-transform duration-300 ease-in-out animate-slide-in">
        {/* Header */}
        <div className="p-3 sm:p-4 lg:p-4 border-b border-gray-200">
          <div className="flex justify-between items-start sm:items-center mb-3 gap-2">
            <div className="min-w-0 flex-1">
              <h2 className="text-sm sm:text-base lg:text-lg text-gray-700 font-medium truncate">
                {!activeSection
                  ? "HS Code Sections"
                  : activeSection && !activeChapter
                  ? `Section ${activeSection.section}`
                  : `Chapter ${activeChapter?.chapter}`}
              </h2>
              <h3 className="text-xs sm:text-sm text-gray-500 mt-1">
                {!activeSection
                  ? `${hsCodeData.sections.length} Sections`
                  : activeSection && !activeChapter
                  ? `${activeSection.chapters.length} Chapters`
                  : `Groups in right panel`}
              </h3>
            </div>
            {activeChapter && (
              <button
                onClick={handleAddGroup}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center hover:bg-gray-200 cursor-pointer border-gray-200 border transition-colors flex-shrink-0"
              >
                <MdAdd className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            )}
          </div>

          {/* Search Bar */}
          <div className="relative">
            <input
              type="text"
              placeholder={
                !activeSection ? "Search sections..." : "Search chapters..."
              }
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-2 sm:px-3 py-2 pl-8 sm:pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent text-xs sm:text-sm"
            />
            <MdSearch className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
          </div>

          {/* Single Back Button - Goes back one level */}
          {(activeSection || activeChapter) && (
            <button
              onClick={
                activeChapter ? handleBackToChapters : handleBackToSections
              }
              className="mt-2 p-1.5 sm:p-2 text-xs sm:text-sm cursor-pointer flex items-center justify-center hover:bg-gray-100 rounded-full text-gray-600 transition-colors"
            >
              <MdArrowBack className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
              <span className="hidden sm:inline">
                {activeChapter ? "Back to Chapters" : "Back to Sections"}
              </span>
              <span className="sm:hidden">
                {activeChapter ? "Chapters" : "Sections"}
              </span>
            </button>
          )}
        </div>

        {/* Content List */}
        <div className="p-2 sm:p-3 overflow-y-auto scrollbar-hide">
          <div className="space-y-1.5 sm:space-y-2">
            {!activeSection
              ? // Display Sections
                filteredSections.map((section) => (
                  <div
                    key={section.section}
                    className={`p-2.5 sm:p-3 rounded-lg cursor-pointer transition-all border border-gray-200 hover:shadow-sm ${
                      activeSection && activeSection.section === section.section
                        ? "bg-gray-200 text-gray-800 border-gray-300"
                        : "bg-white hover:bg-[#f4f4f4] text-gray-600"
                    }`}
                    onClick={() => handleSectionClick(section)}
                  >
                    <div className="text-xs sm:text-sm grid font-medium">
                      <span className="font-semibold">
                        Section {section.section}
                      </span>
                      <span className="text-gray-400 text-xs truncate">
                        {section.title}
                      </span>
                    </div>
                  </div>
                ))
              : activeSection && !activeChapter
              ? // Display Chapters
                filteredChapters.map((chapter) => (
                  <div
                    key={chapter.chapter}
                    className={`p-2.5 sm:p-3 rounded-lg cursor-pointer transition-all border border-gray-200 hover:shadow-sm ${
                      activeChapter && activeChapter.chapter === chapter.chapter
                        ? "bg-gray-200 text-gray-800 border-gray-300"
                        : "bg-white hover:bg-[#f4f4f4] text-gray-600"
                    }`}
                    onClick={() => handleChapterClick(chapter)}
                  >
                    <div className="text-xs sm:text-sm grid font-medium">
                      <span className="font-semibold">
                        Chapter {chapter.chapter}
                      </span>
                      <span className="text-gray-400 text-xs truncate">
                        {chapter.heading}
                      </span>
                    </div>
                  </div>
                ))
              : activeChapter
              ? // Show chapters with the selected one highlighted
                filteredChapters.map((chapter) => (
                  <div
                    key={chapter.chapter}
                    className={`p-2.5 sm:p-3 rounded-lg cursor-pointer transition-all border border-gray-200 hover:shadow-sm ${
                      activeChapter && activeChapter.chapter === chapter.chapter
                        ? "bg-gray-200 text-gray-800 border-gray-300"
                        : "bg-white hover:bg-[#f4f4f4] text-gray-600"
                    }`}
                    onClick={() => handleChapterClick(chapter)}
                  >
                    <div className="text-xs sm:text-sm grid font-medium">
                      <span className="font-semibold">
                        Chapter {chapter.chapter}
                      </span>
                      <span className="text-gray-400 text-xs truncate">
                        {chapter.heading}
                      </span>
                    </div>
                  </div>
                ))
              : null}
          </div>
        </div>
      </div>

      {/* Right Section - Groups */}
      {activeChapter && (
        <div className="flex-1 flex flex-col min-h-0">
          {/* Groups Header */}
          <div className="p-3 sm:p-4 border-b border-gray-200 flex-shrink-0">
            <div className="flex justify-between items-start sm:items-center mb-3 gap-2">
              <div className="min-w-0 flex-1">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                  Groups
                </h3>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">
                  {groupsLoading
                    ? "Loading..."
                    : `${filteredGroups.length} groups`}
                </p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={handleAddGroup}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center hover:bg-gray-200 cursor-pointer border-gray-200 border transition-colors flex-shrink-0"
                >
                  <MdAdd className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
            </div>

            {/* Groups Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search groups..."
                value={groupsSearchTerm}
                onChange={(e) => setGroupsSearchTerm(e.target.value)}
                className="w-full px-2 sm:px-3 py-2 pl-8 sm:pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent text-xs sm:text-sm"
              />
              <MdSearch className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
            </div>
          </div>

          {/* Groups List */}
          <div className="p-2 sm:p-4 flex-1 overflow-y-auto">
            {groupsLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-500 mt-2 text-sm">Loading groups...</p>
              </div>
            ) : groupsError ? (
              <div className="text-center py-8">
                <p className="text-red-500 text-sm">{groupsError}</p>
              </div>
            ) : filteredGroups.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 text-sm">No groups found</p>
              </div>
            ) : (
              <div className="space-y-2 sm:space-y-3">
                {filteredGroups.map((group, index) => (
                  <div
                    key={group._id || index}
                    className="p-2.5 sm:p-3 border border-gray-200 rounded-lg hover:bg-gray-100 cursor-pointer transition-all hover:shadow-sm"
                  >
                    <div className="flex items-start space-x-3 min-w-0 flex-1">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center flex-shrink-0 border border-gray-200 bg-gray-50">
                        {group.image ? (
                          <img
                            src={
                              group.image.includes("https")
                                ? group.image
                                : `${process.env.NEXT_PUBLIC_BASE_URL}/uploads/${group.image}`
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
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between">
                          <div className="min-w-0 flex-1">
                            <div className="text-xs sm:text-sm font-medium text-gray-700 truncate">
                              {group.name}
                            </div>
                            <div className="text-xs text-gray-500 mt-1 line-clamp-2">
                              {group.heading || "No description"}
                            </div>
                          </div>

                          {/* Action Menu */}
                          <div className="relative ml-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                console.log(
                                  "Three dots clicked for group:",
                                  group._id,
                                  "Current openMenu:",
                                  openMenu
                                );
                                if (openMenu === group._id) {
                                  setOpenMenu(null);
                                } else {
                                  setOpenMenu(group._id);
                                }
                              }}
                              className="p-1 hover:bg-gray-200 rounded-full transition-colors cursor-pointer"
                            >
                              <MdMoreVert className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
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

                        {/* Group Details */}
                        <div className="mt-2 flex flex-wrap gap-2 text-xs">
                          {group.chapterNumber && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                              Chapter {group.chapterNumber}
                            </span>
                          )}
                          {group.countryCode && (
                            <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full">
                              {group.countryCode}
                            </span>
                          )}
                          <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full">
                            {group.members?.length || 0} members
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Group Modal */}
      {showAddGroupModal && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-lg w-full max-w-sm sm:max-w-md max-h-[90vh] overflow-hidden">
            <AddGroup
              categoryId={activeChapter._id || activeChapter.chapter.toString()}
              categoryName={`Chapter ${activeChapter.chapter} - ${activeChapter.heading}`}
              onClose={handleCloseAddGroup}
              onSuccess={() => {
                // Refresh groups after successful addition
                if (activeChapter) {
                  fetchGroups(activeChapter.chapter.toString());
                }
              }}
            />
          </div>
        </div>
      )}

      {/* Delete Group Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-lg p-4 sm:p-6 max-w-sm sm:max-w-md w-full mx-3 sm:mx-4 animate-dropdown">
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
            </p>

            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
              <button
                onClick={cancelDeleteGroup}
                disabled={groupsLoading}
                className="w-full sm:flex-1 px-3 py-2 border cursor-pointer border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 text-sm"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteGroup}
                disabled={groupsLoading}
                className="w-full sm:flex-1 px-3 py-2 bg-red-600 cursor-pointer text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center text-sm"
              >
                {groupsLoading ? (
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

      {/* Edit Group Modal */}
      {showEditModal && groupToEdit && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-lg w-full max-w-sm sm:max-w-md max-h-[90vh] overflow-hidden">
            <div className="p-3 sm:p-4 border-b border-gray-200">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                Edit Group
              </h3>
            </div>
            <div className="p-3 sm:p-4">
              <form onSubmit={handleEditSubmit}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Group Name
                    </label>
                    <input
                      type="text"
                      value={editFormData.name}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          name: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Heading
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none  focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={handleCloseEditGroup}
                    className="w-full sm:flex-1 px-3 sm:px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={groupsLoading}
                    className="w-full sm:flex-1 px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 text-sm"
                  >
                    {groupsLoading ? "Updating..." : "Update Group"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Categories;
