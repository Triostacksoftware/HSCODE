"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import UnifiedHSNavigator from "./UnifiedHSNavigator";
import MyGroups from "./MyGroups";
import GroupsList from "./GroupsList";
import ChatWindow from "./ChatWindow";

const DomesticChat = ({ user, refreshUser }) => {
  const [activeTab, setActiveTab] = useState("groups");
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);

  // Handle chapter selection and fetch groups
  const handleChapterSelect = async (chapterData) => {
    setSelectedChapter(chapterData);
    setSelectedGroup(null);
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
  };

  const handleTabChange = (tab) => {
    if (tab === "navigator") {
      setSelectedChapter(null);
      setSelectedGroup(null);
      setGroups([]);
    }
    setActiveTab(tab);
  };

  return (
    <div className="flex h-screen">
      {/* Left Section */}
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
              My Groups
            </button>
            <button
              suppressHydrationWarning={true}
              onClick={() => handleTabChange("navigator")}
              className={`flex-1 py-3 md:py-[.6em] px-4 rounded-md text-sm md:text-xs font-medium transition-colors ${
                activeTab === "navigator"
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
          ) : activeTab === "navigator" ? (
            <UnifiedHSNavigator
              scope="local"
              onChapterSelect={handleChapterSelect}
              selectedChapter={selectedChapter}
            />
          ) : null}
        </div>
      </div>

      {/* Middle Section - Groups List */}
      {activeTab === "navigator" && selectedChapter && (
        <div className="w-80 border-r border-gray-200 flex flex-col animate-slide-in-groups">
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <h3 className="text-sm font-semibold text-gray-900 mb-1">
              Local Groups
            </h3>
            <p className="text-xs text-gray-600">
              Chapter {selectedChapter.chapter}: {selectedChapter.name}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {loading
                ? "Loading..."
                : `${groups.length} group${
                    groups.length !== 1 ? "s" : ""
                  } available`}
            </p>
          </div>

          <div className="flex-1 overflow-hidden">
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

      {/* Right Section - Chat Window */}
      {selectedGroup ? (
        <div className="flex-1 flex flex-col">
          <ChatWindow
            chapterNo={selectedGroup.chapterNumber}
            selectedGroupId={selectedGroup._id}
            groupName={selectedGroup.name}
            groupImage={selectedGroup.image}
            groupData={selectedGroup}
            onBack={() => setSelectedGroup(null)}
          />
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <div className="text-6xl mb-4">💬</div>
            <h3 className="text-lg font-medium mb-2">Select a Group</h3>
            <p className="text-sm">
              Choose a group from My Groups or browse HS Code chapters to find
              local trading groups
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DomesticChat;
