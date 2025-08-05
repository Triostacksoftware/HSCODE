"use client";
import React, { useState } from "react";
import ChaptersList from "./ChaptersList";
import MyGroups from "./MyGroups";
import GroupsList from "./GroupsList";
import ChatWindow from "./ChatWindow";

const DomesticChat = () => {
  const [activeTab, setActiveTab] = useState("groups"); // "groups" or "chapters"
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedGroupId, setSelectedGroupId] = useState(null);

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
  };

  const handleBackToChapters = () => {
    setSelectedCategory(null);
    setSelectedGroupId(null);
  };

  const handleGroupSelect = (groupId) => {
    setSelectedGroupId(groupId);
  };

  return (
    <div className="flex h-screen montserrat">
      {/* Left Section - Local Chat */}
      <div className="w-80 border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-700">Local Chat</h2>
        </div>

        {/* Toggle Buttons */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              suppressHydrationWarning={true}
              onClick={() => setActiveTab("groups")}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === "groups"
                  ? "bg-gray-800 text-white"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              groups
            </button>
            <button
              suppressHydrationWarning={true}
              onClick={() => setActiveTab("chapters")}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === "chapters"
                  ? "bg-gray-800 text-white"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              chapters
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
              selectedGroupId={selectedGroupId}
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
            selectedGroupId={selectedGroupId}
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
        {selectedGroupId ? (
          <ChatWindow selectedGroupId={selectedGroupId} />
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
