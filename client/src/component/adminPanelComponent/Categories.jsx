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

  // Filter sections based on search
  const filteredSections = hsCodeData.sections.filter(section => 
    section.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    section.section.toString().includes(searchTerm)
  );

  // Filter chapters based on search and active section
  const filteredChapters = activeSection?.chapters.filter(chapter => 
    chapter.heading.toLowerCase().includes(searchTerm.toLowerCase()) ||
    chapter.chapter.toString().includes(searchTerm)
  ) || [];

  // Filter groups based on search
  const filteredGroups = groups.filter(group =>
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
      if (openMenu && !event.target.closest(".menu-container")) {
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
      <div className="w-full grid grid-rows-[auto_1fr] lg:w-1/3 border-b h-full lg:border-b-0 lg:border-r border-gray-200 transform transition-transform duration-300 ease-in-out animate-slide-in">
        {/* Header */}
        <div className="p-3 sm:p-4 border-b border-gray-200">
          <div className="flex justify-between items-center mb-3">
            <div>
              <h2 className="text-base sm:text-lg text-gray-700">
                {!activeSection ? "HS Code Sections" : 
                 activeSection && !activeChapter ? `Section ${activeSection.section}` : 
                 `Chapter ${activeChapter?.chapter}`}
              </h2>
              <h2 className="text-[.7em] sm:text-[.8em] text-gray-500">
                {!activeSection ? `${hsCodeData.sections.length} Sections` : 
                 activeSection && !activeChapter ? `${activeSection.chapters.length} Chapters` : 
                 `Groups in right panel`}
              </h2>
            </div>
            {activeChapter && (
              <button
                onClick={handleAddGroup}
                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-200 cursor-pointer border-gray-200 border transition-colors"
              >
                <MdAdd className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Search Bar */}
          <div className="relative">
            <input
              type="text"
              placeholder={!activeSection ? "Search sections..." : "Search chapters..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent text-sm"
            />
            <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          </div>

          {/* Single Back Button - Goes back one level */}
          {(activeSection || activeChapter) && (
            <button
              onClick={activeChapter ? handleBackToChapters : handleBackToSections}
              className="mt-2 p-2 text-sm cursor-pointer flex items-center justify-center hover:bg-gray-100 rounded-full text-gray-600"
            >
              <MdArrowBack className="w-4 h-4 mr-1" />
              {activeChapter ? "Back to Chapters" : "Back to Sections"}
            </button>
          )}
        </div>

        {/* Content List */}
        <div className="p-2 overflow-y-auto scrollbar-hide">
          <div className="space-y-2">
              {!activeSection ? (
                // Display Sections
                filteredSections.map((section) => (
                  <div
                    key={section.section}
                    className={`p-3 rounded cursor-pointer transition-all border border-gray-200 ${
                      activeSection && activeSection.section === section.section
                        ? "bg-gray-200 text-gray-800"
                        : "bg-white hover:bg-[#f4f4f4] text-gray-600"
                    }`}
                    onClick={() => handleSectionClick(section)}
                  >
                    <div className="text-sm grid font-medium">
                      <span>Section {section.section}</span>
                      <span className="text-gray-400 text-xs">{section.title}</span>
                    </div>
                  </div>
                ))
              ) : activeSection && !activeChapter ? (
                // Display Chapters
                filteredChapters.map((chapter) => (
                  <div
                    key={chapter.chapter}
                    className={`p-3 rounded cursor-pointer transition-all border border-gray-200 ${
                      activeChapter && activeChapter.chapter === chapter.chapter
                        ? "bg-gray-200 text-gray-800"
                        : "bg-white hover:bg-[#f4f4f4] text-gray-600"
                    }`}
                    onClick={() => handleChapterClick(chapter)}
                  >
                    <div className="text-sm grid font-medium">
                      <span>Chapter {chapter.chapter}</span>
                      <span className="text-gray-400 text-xs">{chapter.heading}</span>
                    </div>
                  </div>
                ))
                             ) : activeChapter ? (
                 // Show chapters with the selected one highlighted
                 filteredChapters.map((chapter) => (
                   <div
                     key={chapter.chapter}
                     className={`p-3 rounded cursor-pointer transition-all border border-gray-200 ${
                       activeChapter && activeChapter.chapter === chapter.chapter
                         ? "bg-gray-200 text-gray-800"
                         : "bg-white hover:bg-[#f4f4f4] text-gray-600"
                     }`}
                     onClick={() => handleChapterClick(chapter)}
                   >
                     <div className="text-sm grid font-medium">
                       <span>Chapter {chapter.chapter}</span>
                       <span className="text-gray-400 text-xs">{chapter.heading}</span>
                     </div>
                   </div>
                 ))
               ) : null}
            </div>
        </div>
      </div>

      {/* Right Section - Groups */}
      {activeChapter && (
        <div className="flex-1">
          {/* Groups Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex justify-between items-center mb-3">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Groups</h3>
                <p className="text-sm text-gray-500">
                  {groupsLoading ? "Loading..." : `${filteredGroups.length} groups`}
                </p>
              </div>
              <button
                onClick={handleAddGroup}
                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-200 cursor-pointer border-gray-200 border transition-colors"
              >
                <MdAdd className="w-5 h-5" />
              </button>
            </div>

            {/* Groups Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search groups..."
                value={groupsSearchTerm}
                onChange={(e) => setGroupsSearchTerm(e.target.value)}
                className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent text-sm"
              />
              <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
          </div>

          {/* Groups List */}
          <div className="p-4 overflow-y-auto">
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
              <div className="space-y-3">
                {filteredGroups.map((group, index) => (
                  <div
                    key={group._id || index}
                    className="p-3 border border-gray-200 rounded-lg hover:bg-gray-100 cursor-pointer transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-end space-x-2 sm:space-x-3 min-w-0 flex-1">
                        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden border border-gray-200">
                          {group.image ? (
                            <img
                              src={
                                group.image.includes("https")
                                  ? group.image
                                  : `${process.env.NEXT_PUBLIC_BASE_URL}/upload/${group.image}`
                              }
                              alt="group"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-xs text-gray-600">G</span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-gray-700 truncate">
                            {group.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            Heading: {group.heading}
                          </div>
                        </div>
                      </div>
                      <div className="relative menu-container flex-shrink-0 ml-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenMenu(openMenu === group._id ? null : group._id);
                          }}
                          className="p-1 hover:bg-gray-200 rounded-full transition-colors cursor-pointer"
                        >
                          <MdMoreVert className="w-5 h-5 text-gray-500" />
                        </button>

                        {/* Dropdown Menu */}
                        {openMenu === group._id && (
                          <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[120px] animate-dropdown">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                // TODO: Implement edit functionality
                                setOpenMenu(null);
                              }}
                              className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 cursor-pointer transition-colors flex items-center space-x-2"
                            >
                              <MdEdit className="w-4 h-4 text-gray-600" />
                              <span>Edit</span>
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteGroup(group);
                              }}
                              className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 cursor-pointer transition-colors flex items-center space-x-2 text-red-600"
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
      )}

      {/* Add Group Modal */}
      {showAddGroupModal && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-hidden">
            <AddGroup
              categoryId={activeChapter._id || activeChapter.chapter.toString()}
              categoryName={`Chapter ${activeChapter.chapter} - ${activeChapter.heading}`}
              onClose={handleCloseAddGroup}
            />
          </div>
        </div>
      )}

      {/* Delete Group Modal */}
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
            </p>

            <div className="flex space-x-3">
              <button
                onClick={cancelDeleteGroup}
                disabled={groupsLoading}
                className="flex-1 px-2 py-2 border cursor-pointer border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteGroup}
                disabled={groupsLoading}
                className="flex-1 px-2 py-2 bg-red-600 cursor-pointer text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center"
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
    </div>
  );
};

export default Categories;
