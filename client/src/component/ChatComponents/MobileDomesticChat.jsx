"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import UnifiedHSNavigator from "./UnifiedHSNavigator";
import MyGroups from "./MyGroups";
import GroupsList from "./GroupsList";
import ChatWindow from "./ChatWindow";

const MobileDomesticChat = ({ user, refreshUser, setMainActiveTab }) => {
  const [activeTab, setActiveTab] = useState("groups");
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentView, setCurrentView] = useState("chapters"); // chapters, groups, chat

  // Handle chapter selection and fetch groups
  const handleChapterSelect = async (chapterData) => {
    setSelectedChapter(chapterData);
    setSelectedGroup(null);
    setCurrentView("groups");
    setLoading(true);

    try {
      // Fetch groups for this chapter
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_URL}/groups?chapterNumber=${chapterData.chapter}`,
        { withCredentials: true }
      );
      setGroups(response.data || []);
    } catch (error) {
      console.error("Error fetching groups:", error);
      setGroups([]);
    } finally {
      setLoading(false);
    }
  };

  const handleGroupSelect = (group) => {
    setSelectedGroup(group);
    setCurrentView("chat");
  };

  const handleBackToChapters = () => {
    setCurrentView("chapters");
    setSelectedChapter(null);
    setSelectedGroup(null);
    setGroups([]);
  };

  const handleBackToGroups = () => {
    setCurrentView("groups");
    setSelectedGroup(null);
    // Ensure selectedChapter is still available for the groups view
    if (!selectedChapter) {
      setCurrentView("chapters");
    }
  };

  const handleTabChange = (tab) => {
    if (tab === "navigator") {
      setCurrentView("chapters");
      setSelectedChapter(null);
      setSelectedGroup(null);
      setGroups([]);
    } else if (tab === "groups") {
      setCurrentView("chapters");
    }
    setActiveTab(tab);
  };

  return (
    <div className="flex h-screen">
      {/* Main Content Area - WhatsApp-like progressive navigation */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="p-3 sm:p-4 px-4 sm:px-5 border-b border-gray-200 bg-white">
          <div className="flex items-center gap-3">
            {/* Back Button - Only show when exploring All Chapters (navigator tab) */}
            {currentView !== "chapters" && activeTab === "navigator" && (
              <button
                onClick={
                  currentView === "chat"
                    ? handleBackToGroups
                    : handleBackToChapters
                }
                className="p-1.5 sm:p-2 rounded-md hover:bg-gray-100 -ml-1 sm:-ml-2"
              >
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
            )}

            <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
              {currentView === "chapters" && "Domestic Chats"}
              {currentView === "groups" &&
                selectedChapter &&
                `Chapter ${selectedChapter.chapter}: ${selectedChapter.name}`}
              {currentView === "groups" && !selectedChapter && "Domestic Chats"}
              {currentView === "chat" && selectedGroup?.name}
            </h2>
          </div>
        </div>

        {/* Toggle Buttons - Only show in chapters view */}
        {currentView === "chapters" && (
          <div className="px-2 py-3 sm:py-4 border-b border-gray-200">
            <div className="flex rounded-lg p-1 gap-1 sm:gap-2">
              <button
                suppressHydrationWarning={true}
                onClick={() => handleTabChange("navigator")}
                className={`flex-1 py-2.5 sm:py-3 px-3 sm:px-4 rounded-md text-xs sm:text-sm font-medium transition-colors ${
                  activeTab === "navigator"
                    ? "bg-gray-800 text-white"
                    : "bg-gray-200 hover:text-gray-900"
                }`}
              >
                All Chapters
              </button>
              <button
                suppressHydrationWarning={true}
                onClick={() => handleTabChange("groups")}
                className={`flex-1 py-2.5 sm:py-3 px-3 sm:px-4 rounded-md text-xs sm:text-sm font-medium transition-colors ${
                  activeTab === "groups"
                    ? "bg-gray-800 text-white"
                    : "bg-gray-200 hover:text-gray-900"
                }`}
              >
                My Groups
              </button>
            </div>
          </div>
        )}

        {/* Content Area */}
        <div className="flex-1 overflow-hidden">
          {currentView === "chapters" && (
            <div className="h-full">
              {activeTab === "groups" ? (
                <MyGroups
                  onGroupSelect={handleGroupSelect}
                  selectedGroupId={selectedGroup?._id}
                />
              ) : activeTab === "navigator" ? (
                <UnifiedHSNavigator
                  scope="local"
                  onChapterSelect={handleChapterSelect}
                  selectedChapter={selectedChapter}
                />
              ) : null}
            </div>
          )}

          {currentView === "groups" && selectedChapter && (
            <div className="h-full">
              <div className="p-3 sm:p-4 border-b border-gray-200 bg-gray-50">
                <h3 className="text-sm font-semibold text-gray-900 mb-1">
                  Local Groups
                </h3>
                <p className="text-xs text-gray-500">
                  {loading
                    ? "Loading..."
                    : `${groups.length} group${
                        groups.length !== 1 ? "s" : ""
                      } available`}
                </p>
              </div>
              <div className="h-full overflow-hidden">
                <GroupsList
                  categoryId={selectedChapter._id}
                  categoryName={selectedChapter.name}
                  onGroupSelect={handleGroupSelect}
                  selectedGroupId={selectedGroup?._id}
                  groups={groups}
                  scope="local"
                  user={user}
                  refreshUser={refreshUser}
                />
              </div>
            </div>
          )}

          {currentView === "chat" && selectedGroup && (
            <div className="h-full">
              <ChatWindow
                chapterNo={selectedGroup.chapterNumber}
                selectedGroupId={selectedGroup._id}
                groupName={selectedGroup.name}
                groupImage={selectedGroup.image}
                groupData={selectedGroup}
                onBack={handleBackToGroups}
                setActiveTab={setMainActiveTab}
              />
            </div>
          )}

          {/* Empty State */}
          {currentView === "chapters" &&
            activeTab === "navigator" &&
            !selectedChapter && (
              <div className="flex items-center justify-center h-full p-4">
                <div className="text-center text-gray-500">
                  <div className="text-4xl sm:text-6xl mb-3 sm:mb-4">📚</div>
                  <h3 className="text-base sm:text-lg font-medium mb-2">
                    Browse Chapters
                  </h3>
                  <p className="text-xs sm:text-sm">
                    Select a chapter to find local trading groups
                  </p>
                </div>
              </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default MobileDomesticChat;
