"use client";
import React, { useState, useEffect } from "react";
import SectionsList from "./SectionsList";
import SectionChaptersList from "./SectionChaptersList";
import MyGroups from "./MyGroups";
import GroupsList from "./GroupsList";
import ChatWindow from "./ChatWindow";

const DomesticChat = () => {
  const [activeTab, setActiveTab] = useState("groups"); // "groups", "sections", or "chapters"
  const [selectedSection, setSelectedSection] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);

  const handleSectionSelect = (section) => {
    setSelectedSection(section);
    setActiveTab("chapters");
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
  };

  const handleBackToSections = () => {
    setSelectedSection(null);
    setSelectedCategory(null);
    setActiveTab("sections");
  };

  const handleBackToChapters = () => {
    setSelectedCategory(null);
    setActiveTab("chapters");
  };

  const handleGroupSelect = (group) => {
    setSelectedGroup(group);
  };

  const handleBackToGroups = () => {
    setSelectedGroup(null);
  };

  const handleTabChange = (tab) => {
    if (tab === "sections") {
      setSelectedSection(null);
      setSelectedCategory(null);
    }
    setActiveTab(tab);
  };

  return (
    <div className="flex h-screen">
      {/* Left Section - Sections/Chapters/Groups */}
      <div className="flex flex-col w-80 border-r-1 border-gray-200">
        {/* Header */}
        <div className="p-4 px-5 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-800">
              Domestic Chats
            </h2>
          </div>
        </div>

        {/* Toggle Buttons */}
        <div className="px-2 mb-4">
          <div className="flex rounded-lg p-1 gap-1 md:gap-5">
            <button
              suppressHydrationWarning={true}
              onClick={() => handleTabChange("groups")}
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
              onClick={() => handleTabChange("sections")}
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
            <MyGroups
              onGroupSelect={handleGroupSelect}
              selectedGroupId={selectedGroup?._id}
            />
          ) : activeTab === "sections" ? (
            <div>
              <SectionsList
                onSectionSelect={handleSectionSelect}
                selectedSection={selectedSection}
              />
            </div>
          ) : activeTab === "chapters" && selectedSection ? (
            <SectionChaptersList
              selectedSection={selectedSection}
              onBack={handleBackToSections}
              onCategorySelect={handleCategorySelect}
              selectedCategory={selectedCategory}
            />
          ) : (
            <div className="p-4 text-center text-gray-500">
              No content for tab: {activeTab}
            </div>
          )}
        </div>
      </div>

      {/* Middle Section - Groups (only show when chapters tab is active AND a category is selected) */}
      {activeTab === "chapters" && selectedCategory && (
        <div className="w-80 border-r border-gray-200 flex overflow-hidden flex-col animate-slide-in-groups ">
          <GroupsList
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
        className={`flex flex-col ${
          (activeTab === "chapters" && selectedCategory) ||
          activeTab === "groups"
            ? "flex-1"
            : "flex-1 ml-0"
        }`}
      >
        {selectedGroup ? (
          <ChatWindow
            chapterNo={selectedGroup.categoryId.chapter}
            selectedGroupId={selectedGroup._id}
            groupName={selectedGroup.name}
            groupImage={selectedGroup.image}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="text-2xl font-handwriting text-gray-700 mb-2">
                Leadsup for website
              </div>
              <div className="text-gray-500 text-sm">
                lorem ipsum dolor sit amet consectetur adipiscing elit
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DomesticChat;
