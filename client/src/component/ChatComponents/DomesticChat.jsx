"use client";
import React, { useState } from "react";
import ChaptersList from "./ChaptersList";
import MyGroups from "./MyGroups";
import GroupsList from "./GroupsList";
import ChatWindow from "./ChatWindow";

const DomesticChat = () => {
  const [activeTab, setActiveTab] = useState("groups"); // "groups" or "chapters"
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
  };

  const handleBackToChapters = () => {
    setSelectedCategory(null);
    setSelectedGroup(null);
  };

  const handleGroupSelect = (group) => {
    setSelectedGroup(group);
  };

  return (
    <div className="flex h-screen">
      {/* Left Section - Local Chat */}
      <div className="flex flex-col w-80 border-r-1 border-gray-200">
        {/* Header */}
        <div className="p-4 px-5 ">
          <h2 className="text-xl font-semibold text-gray-800">Local Chats</h2>
        </div>

        {/* Toggle Buttons */}
        <div className="px-2 mb-4">
          <div className="flex rounded-lg p-1 gap-5">
            <button
              suppressHydrationWarning={true}
              onClick={() => setActiveTab("groups")}
              className={`w-full py-[.6em] px-4 rounded-md text-xs font-medium transition-colors ${
                activeTab === "groups"
                  ? "bg-gray-800 text-white"
                  : "bg-gray-200 hover:text-gray-900"
              }`}
            >
              Groups
            </button>
            <button
              suppressHydrationWarning={true}
              onClick={() => setActiveTab("chapters")}
              className={`w-full py-[.6em] px-4 rounded-md text-xs font-medium transition-colors ${
                activeTab === "chapters"
                  ? "bg-gray-800 text-white"
                  : "bg-gray-200 hover:text-gray-900"
              }`}
            >
              Chapters
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden">
          {activeTab === "chapters" ? (
            <ChaptersList
              onCategorySelect={handleCategorySelect}
              selectedCategory={selectedCategory}
            />
          ) : (
            <MyGroups
              onGroupSelect={handleGroupSelect}
              selectedGroupId={selectedGroup?._id}
            />
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
