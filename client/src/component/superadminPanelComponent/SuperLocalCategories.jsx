"use client";
import React, { useState } from "react";
import { MdAdd, MdArrowBack } from "react-icons/md";
import SuperLocalCategoriesGroups from "./SuperLocalCategoriesGroups";
import SuperAddGroup from "./SuperAddGroup";
import hsCodeData from "../../../hs_code_structure.json";
import SuperAdminChatWindow from "./SuperAdminChatWindow";
import ChapterImage from "../ChatComponents/ChapterImage";

const SuperLocalCategories = () => {
  const [activeChapter, setActiveChapter] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [showAddGroupModal, setShowAddGroupModal] = useState(false);
  const [view, setView] = useState("countries"); // "countries", "chapters", "groups", "chat"
  const [selectedCountry, setSelectedCountry] = useState(null);

  // Available countries for local categories
  const countries = [
    { code: "US", name: "United States" },
    { code: "IN", name: "India" },
    { code: "GB", name: "United Kingdom" },
    { code: "DE", name: "Germany" },
    { code: "FR", name: "France" },
    { code: "CA", name: "Canada" },
    { code: "AU", name: "Australia" },
    { code: "JP", name: "Japan" },
    { code: "CN", name: "China" },
    { code: "BR", name: "Brazil" },
  ];

  // Flatten all chapters from all sections into a single array
  const allChapters = hsCodeData.sections.flatMap(section => 
    section.chapters.map(chapter => ({
      ...chapter,
      sectionTitle: section.title,
      sectionNumber: section.section
    }))
  );

  const handleCountrySelect = (country) => {
    setSelectedCountry(country);
    setActiveChapter(null);
    setSelectedGroup(null);
    setView("chapters");
  };

  const handleChapterClick = (chapter) => {
    setActiveChapter(chapter);
    setSelectedGroup(null);
    setView("groups");
  };

  const handleGroupSelect = (group) => {
    setSelectedGroup(group);
    setView("chat");
  };

  const handleBackToCountries = () => {
    setView("countries");
    setSelectedCountry(null);
    setActiveChapter(null);
    setSelectedGroup(null);
  };

  const handleBackToChapters = () => {
    setView("chapters");
    setActiveChapter(null);
    setSelectedGroup(null);
  };

  const handleBackToGroups = () => {
    setView("groups");
    setSelectedGroup(null);
  };

  const handleAddGroup = () => {
    setShowAddGroupModal(true);
  };

  const handleGroupCreated = () => {
    setShowAddGroupModal(false);
  };

  const renderCountriesSidebar = () => (
    <div className="w-64 bg-white border-r border-gray-200 h-full overflow-y-auto">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Select Country</h2>
        <p className="text-sm text-gray-500 mt-1">
          Choose a country for local categories
        </p>
      </div>
      <div className="p-2">
        {countries.map((country) => (
          <div
            key={country.code}
            className="p-3 hover:bg-gray-100 border border-gray-200 rounded-lg cursor-pointer transition-all mb-2"
            onClick={() => handleCountrySelect(country)}
          >
            <h3 className="font-medium text-gray-900">{country.name}</h3>
            <p className="text-sm text-gray-600 mt-1">Code: {country.code}</p>
          </div>
        ))}
      </div>
    </div>
  );

  const renderChaptersSidebar = () => (
    <div className="w-64 bg-white border-r border-gray-200 h-full overflow-y-auto">
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            {selectedCountry?.name} - All Chapters
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {allChapters.length} chapters available
          </p>
        </div>
        <button
          onClick={handleBackToCountries}
          className="p-1 hover:bg-gray-200 rounded-lg transition-colors"
        >
          <MdArrowBack className="w-5 h-5 text-gray-500" />
        </button>
      </div>
      <div className="p-2">
        {allChapters.map((chapter) => (
          <div
            key={chapter.chapter}
            className={`p-3 hover:bg-gray-100 border border-gray-200 rounded-lg cursor-pointer transition-all mb-2 ${
              activeChapter && activeChapter.chapter === chapter.chapter
                ? "bg-gray-200 border-gray-300"
                : ""
            }`}
            onClick={() => handleChapterClick(chapter)}
          >
            <div className="flex items-center space-x-3">
              {/* Chapter Image */}
              <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-gray-200 flex-shrink-0 overflow-hidden border border-gray-300">
                <ChapterImage chapterNumber={chapter.chapter} />
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-gray-900 truncate">
                  Chapter {chapter.chapter}
                </h3>
                <p className="text-sm text-gray-600 mt-1 truncate">{chapter.heading}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );


  const renderGroupsSidebar = () => (
    <div className="w-64 bg-white border-r border-gray-200 h-full overflow-y-auto">
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Chapter {activeChapter?.chapter} Groups
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {selectedCountry?.name} - {activeChapter?.heading}
          </p>
        </div>
        <button
          onClick={handleAddGroup}
          className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <MdAdd className="w-5 h-5" />
        </button>
      </div>
      <div className="p-2">
        <SuperLocalCategoriesGroups
          chapterNumber={activeChapter?.chapter.toString()}
          chapterName={`Chapter ${activeChapter?.chapter} - ${activeChapter?.heading}`}
          onGroupSelect={handleGroupSelect}
          selectedGroupId={selectedGroup?._id}
          selectedCountryCode={selectedCountry?.code}
        />
      </div>
    </div>
  );

  const renderChatArea = () => (
    <div className="flex-1 h-full">
      {selectedGroup ? (
        <SuperAdminChatWindow
          chapterNo={activeChapter?.chapter}
          selectedGroupId={selectedGroup?._id}
          groupName={selectedGroup?.name}
          groupImage={selectedGroup?.image}
          onBack={handleBackToGroups}
          isGlobal={false}
        />
      ) : (
        <div className="h-full flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Select a Group
            </h3>
            <p className="text-gray-500">
              Choose a group from the sidebar to start chatting
            </p>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="h-full flex">
      {/* Left Sidebar - Countries */}
      {view === "countries" && renderCountriesSidebar()}

      {/* Left Sidebar - Countries + Middle Sidebar - Chapters */}
      {view === "chapters" && (
        <>
          {renderCountriesSidebar()}
          {renderChaptersSidebar()}
        </>
      )}

      {/* Left Sidebar - Countries + Middle Sidebar - Chapters + Right Sidebar - Groups + Chat Area */}
      {view === "groups" && (
        <>
          {renderCountriesSidebar()}
          {renderChaptersSidebar()}
          {renderGroupsSidebar()}
          {renderChatArea()}
        </>
      )}

      {/* Chat View */}
      {view === "chat" && (
        <>
          {renderCountriesSidebar()}
          {renderChaptersSidebar()}
          {renderGroupsSidebar()}
          {renderChatArea()}
        </>
      )}

      {/* Add Group Modal */}
      {showAddGroupModal && (
        <div className="fixed inset-0 bg-black/20 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 h-[80vh] max-h-[600px] animate-dropdown">
            <SuperAddGroup
              chapterNumber={activeChapter?.chapter.toString()}
              chapterName={`Chapter ${activeChapter?.chapter} - ${activeChapter?.heading}`}
              groupType="local"
              onClose={() => setShowAddGroupModal(false)}
              onGroupCreated={handleGroupCreated}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperLocalCategories;
