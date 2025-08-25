"use client";
import React, { useState } from "react";
import { MdAdd, MdArrowBack } from "react-icons/md";
import SuperLocalCategoriesGroups from "./SuperLocalCategoriesGroups";
import SuperAddGroup from "./SuperAddGroup";
import hsCodeData from "../../../hs_code_structure.json";
import SuperAdminChatWindow from "./SuperAdminChatWindow";

const SuperLocalCategories = () => {
  const [activeSection, setActiveSection] = useState(null);
  const [activeChapter, setActiveChapter] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [showAddGroupModal, setShowAddGroupModal] = useState(false);
  const [view, setView] = useState("countries"); // "countries", "sections", "chapters", "groups", "chat"
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

  const handleCountrySelect = (country) => {
    setSelectedCountry(country);
    setActiveSection(null);
    setActiveChapter(null);
    setSelectedGroup(null);
    setView("sections");
  };

  const handleSectionClick = (section) => {
    setActiveSection(section);
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
    setActiveSection(null);
    setActiveChapter(null);
    setSelectedGroup(null);
  };

  const handleBackToSections = () => {
    setView("sections");
    setActiveSection(null);
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

  const renderSectionsSidebar = () => (
    <div className="w-64 bg-white border-r border-gray-200 h-full overflow-y-auto">
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            {selectedCountry?.name} - HS Code
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {activeSection
              ? `Section ${activeSection.section}`
              : "Select a section"}
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
        {!activeSection ? (
          // Show sections
          <>
            <h3 className="text-sm font-medium text-gray-700 mb-2 px-2">
              Sections
            </h3>
            {hsCodeData.sections.map((section) => (
              <div
                key={section.section}
                className="p-3 hover:bg-gray-100 border border-gray-200 rounded-lg cursor-pointer transition-all mb-2"
                onClick={() => handleSectionClick(section)}
              >
                <h3 className="font-medium text-gray-900">
                  Section {section.section}
                </h3>
                <p className="text-sm text-gray-600 mt-1">{section.title}</p>
              </div>
            ))}
          </>
        ) : (
          // Show chapters for selected section
          <>
            <div className="flex items-center mb-2 px-2">
              <button
                onClick={handleBackToSections}
                className="p-1 hover:bg-gray-200 rounded-lg transition-colors mr-2"
              >
                <MdArrowBack className="w-4 h-4 text-gray-500" />
              </button>
              <h3 className="text-sm font-medium text-gray-700">
                Chapters - Section {activeSection.section}
              </h3>
            </div>
            {activeSection.chapters?.map((chapter) => (
              <div
                key={chapter.chapter}
                className="p-3 hover:bg-gray-100 border border-gray-200 rounded-lg cursor-pointer transition-all mb-2"
                onClick={() => handleChapterClick(chapter)}
              >
                <h3 className="font-medium text-gray-900">
                  Chapter {chapter.chapter}
                </h3>
                <p className="text-sm text-gray-600 mt-1">{chapter.heading}</p>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );

  const renderChaptersSidebar = () => (
    <div className="w-64 bg-white border-r border-gray-200 h-full overflow-y-auto">
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Section {activeSection?.section}
          </h2>
          <p className="text-sm text-gray-500 mt-1">{activeSection?.title}</p>
        </div>
        <button
          onClick={handleBackToSections}
          className="p-1 hover:bg-gray-200 rounded-lg transition-colors"
        >
          <MdArrowBack className="w-5 h-5 text-gray-500" />
        </button>
      </div>
      <div className="p-2">
        {activeSection?.chapters?.map((chapter) => (
          <div
            key={chapter.chapter}
            className="p-3 hover:bg-gray-100 border border-gray-200 rounded-lg cursor-pointer transition-all mb-2"
            onClick={() => handleChapterClick(chapter)}
          >
            <h3 className="font-medium text-gray-900">
              Chapter {chapter.chapter}
            </h3>
            <p className="text-sm text-gray-600 mt-1">{chapter.heading}</p>
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

      {/* Left Sidebar - Countries + Middle Sidebar - Sections & Chapters */}
      {(view === "sections" || view === "chapters") && (
        <>
          {renderCountriesSidebar()}
          {renderSectionsSidebar()}
        </>
      )}

      {/* Left Sidebar - Countries + Middle Sidebar - Sections & Chapters + Right Sidebar - Groups + Chat Area */}
      {view === "groups" && (
        <>
          {renderCountriesSidebar()}
          {renderSectionsSidebar()}
          {renderGroupsSidebar()}
          {renderChatArea()}
        </>
      )}

      {/* Chat View */}
      {view === "chat" && (
        <>
          {renderCountriesSidebar()}
          {renderSectionsSidebar()}
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
