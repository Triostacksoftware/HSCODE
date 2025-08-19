"use client";
import React, { useState } from "react";
import { IoArrowBack } from "react-icons/io5";
import SectionsList from "./SectionsList";
import GlobalSectionChaptersList from "./GlobalSectionChaptersList";
import GlobalMyGroups from "./GlobalMyGroups";
import GlobalGroupsList from "./GlobalGroupsList";
import GlobalChatWindow from "./GlobalChatWindow";

const GlobalChat = () => {
  const [activeTab, setActiveTab] = useState("groups"); // "groups", "sections", or "chapters"
  const [selectedSection, setSelectedSection] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [showGroupsList, setShowGroupsList] = useState(false);

  const handleSectionSelect = (section) => {
    setSelectedSection(section);
    setActiveTab("chapters");
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setShowGroupsList(true);
  };

  const handleBackToSections = () => {
    setSelectedSection(null);
    setSelectedCategory(null);
    setShowGroupsList(false);
    setActiveTab("sections");
  };

  const handleBackToChapters = () => {
    setSelectedCategory(null);
    setShowGroupsList(false);
    setActiveTab("chapters");
  };

  const handleGroupSelect = (group) => {
    setSelectedGroup(group);
  };

  const handleBackToGroups = () => {
    setSelectedGroup(null);
    setShowGroupsList(false);
  };

  return (
    <div className="flex h-full relative">
      {/* Left Section - Global Chat */}
      <div
        className={`
          flex flex-col border-r-1 border-gray-200 transition-all duration-300
          ${selectedGroup ? "hidden md:flex md:w-80" : "w-full md:w-80"}
        `}
      >
        {/* Header */}
        <div className="p-4 px-5">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-800">
              Global Chats
            </h2>
            {selectedGroup && (
              <button
                onClick={handleBackToGroups}
                className="md:hidden p-2 rounded-md hover:bg-gray-100"
              >
                <IoArrowBack className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Toggle Buttons */}
        <div className="px-2 mb-4">
          <div className="flex rounded-lg p-1 gap-1 md:gap-5">
            <button
              suppressHydrationWarning={true}
              onClick={() => setActiveTab("groups")}
              className={`flex-1 py-3 md:py-[.6em] px-4 rounded-md text-sm md:text-xs font-medium transition-colors ${
                activeTab === "groups"
                  ? "bg-gray-800 text-white"
                  : "bg-gray-200 hover:text-gray-900"
              }`}
            >
              Groups
            </button>
            <button
              suppressHydrationWarning={true}
              onClick={() => setActiveTab("sections")}
              className={`flex-1 py-3 md:py-[.6em] px-4 rounded-md text-sm md:text-xs font-medium transition-colors ${
                activeTab === "sections"
                  ? "bg-gray-800 text-white"
                  : "bg-gray-200 hover:text-gray-900"
              }`}
            >
              Sections
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden">
          {activeTab === "groups" ? (
            <GlobalMyGroups
              onGroupSelect={handleGroupSelect}
              selectedGroupId={selectedGroup?._id}
            />
          ) : activeTab === "sections" && !selectedSection ? (
            <SectionsList
              onSectionSelect={handleSectionSelect}
              selectedSection={selectedSection}
            />
          ) : activeTab === "chapters" && selectedSection ? (
            <GlobalSectionChaptersList
              selectedSection={selectedSection}
              onBack={handleBackToSections}
              onCategorySelect={handleCategorySelect}
              selectedCategory={selectedCategory}
            />
          ) : null}
        </div>
      </div>

      {/* Middle Section - Groups (only show when chapters tab is active AND a category is selected) */}
      {activeTab === "chapters" && selectedCategory && showGroupsList && (
        <div
          className={`
            border-r border-gray-200 flex overflow-hidden flex-col animate-slide-in-groups
            ${showGroupsList ? "w-full md:w-80" : "hidden"}
          `}
        >
          <GlobalGroupsList
            categoryId={selectedCategory._id}
            categoryName={selectedCategory.name}
            onBack={handleBackToChapters}
            onGroupSelect={handleGroupSelect}
            selectedGroupId={selectedGroup?._id}
          />
        </div>
      )}

      {/* Right Section - Chat Area */}
      <div
        className={`
          flex flex-col flex-1
          ${selectedGroup ? "block" : "hidden md:block"}
        `}
      >
        {selectedGroup ? (
          <GlobalChatWindow
            chapterNo={selectedGroup.categoryId.chapter}
            selectedGroupId={selectedGroup._id}
            groupName={selectedGroup.name}
            groupImage={selectedGroup.image}
            onBack={handleBackToGroups}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="text-2xl font-handwriting text-gray-700 mb-2">
                Global Leadsup
              </div>
              <div className="text-gray-500 text-sm">
                Connect with businesses worldwide
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GlobalChat;
