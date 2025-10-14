"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import UnifiedHSNavigator from "./UnifiedHSNavigator";
import GlobalMyGroups from "./GlobalMyGroups";
import GlobalGroupsList from "./GlobalGroupsList";
import GlobalChatWindow from "./GlobalChatWindow";

const GlobalChat = ({ user, refreshUser, setMainActiveTab }) => {
  const [activeTab, setActiveTab] = useState("groups");
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showGroupsList, setShowGroupsList] = useState(false);

  // Handle chapter selection and fetch groups
  const handleChapterSelect = async (chapterData) => {
    setSelectedChapter(chapterData);
    setSelectedGroup(null);
    setLoading(true);
    setShowGroupsList(true);

    try {
      // Fetch groups for this chapter
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_URL}/global-groups?chapterNumber=${chapterData.chapter}`,
        { withCredentials: true }
      );
      setGroups(response.data || []);
    } catch (error) {
      console.error("Error fetching global groups:", error);
      setGroups([]);
    } finally {
      setLoading(false);
    }
  };

  const handleGroupSelect = (group) => {
    setSelectedGroup(group);
  };

  const handleBackToGroups = () => {
    setSelectedGroup(null);
    setShowGroupsList(false);
  };

  const handleTabChange = (tab) => {
    if (tab === "navigator") {
      setSelectedChapter(null);
      setSelectedGroup(null);
      setGroups([]);
      setShowGroupsList(false);
    }
    setActiveTab(tab);
  };

  return (
    <div className="flex h-full relative min-w-0">
      {/* Left Section */}
      <div
        className={`
          flex flex-col border-r-1 border-gray-200 transition-all duration-300 flex-shrink-0
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
                <svg
                  className="w-5 h-5"
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
          </div>
        </div>

        {/* Toggle Buttons */}
        <div className="px-2 mb-4">
          <div className="flex rounded-lg p-1 gap-1 md:gap-5">
            <button
              suppressHydrationWarning={true}
              onClick={() => handleTabChange("navigator")}
              className={`flex-1 py-3 md:py-[.6em] px-4 rounded-md text-sm md:text-xs font-medium transition-colors ${
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
              className={`flex-1 py-3 md:py-[.6em] px-4 rounded-md text-sm md:text-xs font-medium transition-colors ${
                activeTab === "groups"
                  ? "bg-gray-800 text-white"
                  : "bg-gray-200 hover:text-gray-900"
              }`}
            >
              My Groups
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
          ) : activeTab === "navigator" ? (
            <UnifiedHSNavigator
              scope="global"
              onChapterSelect={handleChapterSelect}
              selectedChapter={selectedChapter}
            />
          ) : null}
        </div>
      </div>

      {/* Middle Section - Groups List */}
      {activeTab === "navigator" && selectedChapter && showGroupsList && (
        <div className="w-80 border-r border-gray-200 flex flex-col animate-slide-in-groups flex-shrink-0">
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <p className="text-xs text-gray-900 font-semibold">
              Chapter {selectedChapter.chapter}: {selectedChapter.name}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {loading
                ? "Loading..."
                : `${groups.length} Group${
                    groups.length !== 1 ? "s" : ""
                  } Available`}
            </p>
          </div>

          <div className="flex-1 overflow-hidden">
            <GlobalGroupsList
              categoryId={selectedChapter._id}
              categoryName={selectedChapter.name}
              onGroupSelect={handleGroupSelect}
              selectedGroupId={selectedGroup?._id}
              groups={groups}
              scope="global"
              user={user}
              refreshUser={refreshUser}
            />
          </div>
        </div>
      )}

      {/* Right Section - Chat Window */}
      {selectedGroup ? (
        <div className="flex-1 flex flex-col min-w-0">
          <GlobalChatWindow
            chapterNo={selectedGroup.chapterNumber}
            selectedGroupId={selectedGroup._id}
            groupName={selectedGroup.name}
            groupImage={selectedGroup.image}
            groupData={selectedGroup}
            onBack={handleBackToGroups}
            setActiveTab={setMainActiveTab}
          />
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <div className="text-6xl mb-4 hidden md:block">🌍</div>
            <h3 className="text-lg font-medium mb-2 hidden md:block">
              Select a Global Group
            </h3>
            <p className="text-sm hidden md:block">
              Choose a group from My Groups or browse HS Code chapters to find
              global trading groups
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default GlobalChat;
