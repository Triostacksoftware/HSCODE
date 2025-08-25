"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import {
  MdArrowBack,
  MdChat,
  MdSearch,
  MdAdd,
  MdEdit,
  MdDelete,
  MdMoreVert,
} from "react-icons/md";
import hsCodeData from "../../../hs_code_structure.json";
import SuperAdminChatWindow from "./SuperAdminChatWindow";

const SuperLocalChats = () => {
  const [view, setView] = useState("countries"); // "countries", "sections", "chapters", "groups", "chat"
  const [countries, setCountries] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [activeSection, setActiveSection] = useState(null);
  const [activeChapter, setActiveChapter] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [groupLeads, setGroupLeads] = useState([]);
  const [leadsLoading, setLeadsLoading] = useState(false);
  const [messageInput, setMessageInput] = useState("");
  const [postingMessage, setPostingMessage] = useState(false);
  const [showMembers, setShowMembers] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [groups, setGroups] = useState([]);

  useEffect(() => {
    if (view === "countries") {
      fetchCountries();
    }
  }, [view]);

  const fetchCountries = async () => {
    try {
      setIsLoading(true);
      setError("");
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_URL}/superadmin/local-leads/countries`,
        { withCredentials: true }
      );
      setCountries(response.data || []);
    } catch (error) {
      console.error("Error fetching countries:", error);
      setError("Failed to load countries");
    } finally {
      setIsLoading(false);
    }
  };

  // Filter sections based on search
  const filteredSections = hsCodeData.sections.filter(
    (section) =>
      section.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      section.section.toString().includes(searchTerm)
  );

  // Filter chapters based on search and active section
  const filteredChapters =
    activeSection?.chapters.filter(
      (chapter) =>
        chapter.heading.toLowerCase().includes(searchTerm.toLowerCase()) ||
        chapter.chapter.toString().includes(searchTerm)
    ) || [];

  const fetchGroups = async (chapterId) => {
    try {
      setIsLoading(true);
      setError("");
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_URL}/groups?chapterNumber=${chapterId}&countryCode=${selectedCountry?.countryCode}`,
        { withCredentials: true }
      );
      return response.data || [];
    } catch (error) {
      console.error("Error fetching groups:", error);
      setError("Failed to load groups");
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const fetchGroupLeads = async (groupId) => {
    try {
      setLeadsLoading(true);
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_URL}/leads/${groupId}`,
        { withCredentials: true }
      );
      setGroupLeads(response.data.leads || []);
    } catch (error) {
      console.error("Error fetching group leads:", error);
    } finally {
      setLeadsLoading(false);
    }
  };

  const handleCountrySelect = async (country) => {
    setSelectedCountry(country);
    setActiveSection(null);
    setActiveChapter(null);
    setSearchTerm("");
    setView("sections");
  };

  const handleSectionClick = (section) => {
    setActiveSection(section);
    setActiveChapter(null);
    setSearchTerm("");
    setView("chapters");
  };

  const handleChapterClick = async (chapter) => {
    setActiveChapter(chapter);
    const groups = await fetchGroups(chapter.chapter.toString());
    if (groups.length > 0) {
      setGroups(groups);
      setSelectedGroup(null);
      setView("groups");
    } else {
      toast.error("No groups found for this chapter");
    }
  };

  const handleGroupSelect = async (group) => {
    setSelectedGroup(group);
    setView("chat");
    fetchGroupLeads(group._id);
  };

  const handleBackToCountries = () => {
    setSelectedCountry(null);
    setActiveSection(null);
    setActiveChapter(null);
    setSearchTerm("");
    setView("countries");
  };

  const handleBackToSections = () => {
    setActiveSection(null);
    setActiveChapter(null);
    setSearchTerm("");
    setView("sections");
  };

  const handleBackToChapters = () => {
    setActiveChapter(null);
    setSearchTerm("");
    setView("chapters");
  };

  const handleBackToGroups = () => {
    setSelectedGroup(null);
    setView("groups");
  };

  const handlePostMessage = async () => {
    if (!messageInput.trim() || !selectedGroup) return;

    try {
      setPostingMessage(true);
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_URL}/leads/${selectedGroup._id}/post`,
        {
          content: messageInput.trim(),
          type: "lead",
          description: messageInput.trim(),
        },
        { withCredentials: true }
      );

      if (response.data.success) {
        setMessageInput("");
        toast.success("Message posted successfully");
        // Refresh leads to show the new message
        fetchGroupLeads(selectedGroup._id);
      }
    } catch (error) {
      console.error("Error posting message:", error);
      toast.error("Failed to post message");
    } finally {
      setPostingMessage(false);
    }
  };

  const renderCountriesView = () => (
    <div className="w-full h-full flex flex-col">
      {/* Header */}
      <div className="p-3 sm:p-4 border-b border-gray-200">
        <h2 className="text-base sm:text-lg text-gray-700">Select Country</h2>
        <p className="text-[.7em] sm:text-[.8em] text-gray-500">
          Choose a country to view local chats
        </p>
      </div>

      {/* Countries List */}
      <div className="p-2 overflow-y-auto scrollbar-hide flex-1">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-500 mt-2 text-sm">Loading countries...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-500 text-sm">{error}</p>
            <button
              onClick={fetchCountries}
              className="mt-2 text-blue-600 hover:text-blue-700 underline text-sm"
            >
              Try again
            </button>
          </div>
        ) : countries.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 text-sm">No countries found</p>
          </div>
        ) : (
          <div className="space-y-2">
            {countries.map((country, index) => (
              <div
                key={country.countryCode || index}
                className="p-3 hover:bg-gray-100 border border-gray-300 rounded-lg cursor-pointer transition-all bg-white hover:border-gray-400"
                onClick={() => handleCountrySelect(country)}
              >
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <span className="text-[.9em] sm:text-[.96em] text-gray-700 truncate block">
                      {country.name}
                    </span>
                    <span className="text-[.7em] text-gray-700 truncate block">
                      Code: {country.countryCode}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MdChat className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderSectionsView = () => (
    <div className="w-full h-full flex flex-col">
      {/* Header */}
      <div className="p-3 sm:p-4 border-b border-gray-200 flex justify-between items-center">
        <div>
          <h2 className="text-base sm:text-lg text-gray-700">
            HS Code Sections - {selectedCountry?.name}
          </h2>
          <p className="text-[.7em] sm:text-[.8em] text-gray-500">
            No. of Sections - {hsCodeData.sections.length}
          </p>
        </div>
        <button
          onClick={handleBackToCountries}
          className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-200 cursor-pointer border-gray-200 border transition-colors"
        >
          <MdArrowBack className="w-5 h-5" />
        </button>
      </div>

      {/* Search Bar */}
      <div className="p-3 sm:p-4 border-b border-gray-200">
        <div className="relative">
          <input
            type="text"
            placeholder="Search sections..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
          />
          <MdSearch className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
        </div>
      </div>

      {/* Sections List */}
      <div className="p-2 overflow-y-auto scrollbar-hide flex-1">
        <div className="space-y-2">
          {filteredSections.map((section) => (
            <div
              key={section.section}
              className="p-3 hover:bg-gray-100 border border-gray-300 rounded-lg cursor-pointer transition-all bg-white hover:border-gray-400"
              onClick={() => handleSectionClick(section)}
            >
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <span className="text-[.9em] sm:text-[.96em] text-gray-700 truncate block">
                    Section {section.section}
                  </span>
                  <span className="text-[.7em] text-gray-700 truncate block">
                    {section.title}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-500">
                    {section.chapters.length} chapters
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderChaptersView = () => (
    <div className="w-full h-full flex flex-col">
      {/* Header */}
      <div className="p-3 sm:p-4 border-b border-gray-200 flex justify-between items-center">
        <div>
          <h2 className="text-base sm:text-lg text-gray-700">
            Section {activeSection.section} - {activeSection.title}
          </h2>
          <p className="text-[.7em] sm:text-[.8em] text-gray-500">
            No. of Chapters - {activeSection.chapters.length}
          </p>
        </div>
        <button
          onClick={handleBackToSections}
          className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-200 cursor-pointer border-gray-200 border transition-colors"
        >
          <MdArrowBack className="w-5 h-5" />
        </button>
      </div>

      {/* Search Bar */}
      <div className="p-3 sm:p-4 border-b border-gray-200">
        <div className="relative">
          <input
            type="text"
            placeholder="Search chapters..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
          />
          <MdSearch className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
        </div>
      </div>

      {/* Chapters List */}
      <div className="p-2 overflow-y-auto scrollbar-hide flex-1">
        <div className="space-y-2">
          {filteredChapters.map((chapter) => (
            <div
              key={chapter.chapter}
              className="p-3 hover:bg-gray-100 border border-gray-300 rounded-lg cursor-pointer transition-all bg-white hover:border-gray-400"
              onClick={() => handleChapterClick(chapter)}
            >
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <span className="text-[.9em] sm:text-[.96em] text-gray-700 truncate block">
                    Chapter {chapter.chapter}
                  </span>
                  <span className="text-[.7em] text-gray-700 truncate block">
                    {chapter.heading}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <MdChat className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderGroupsView = () => (
    <div className="w-full h-full flex flex-col">
      {/* Header with Back Button */}
      <div className="p-3 sm:p-4 border-b border-gray-200 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <button
            onClick={handleBackToChapters}
            className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <MdArrowBack className="w-5 h-5 text-gray-500" />
          </button>
          <div>
            <h2 className="text-base sm:text-lg text-gray-700">
              {activeChapter?.heading} - Groups
            </h2>
            <p className="text-[.7em] sm:text-[.8em] text-gray-500">
              Select a group to view chat
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <MdChat className="w-5 h-5 text-gray-500" />
        </div>
      </div>

      {/* Groups List */}
      <div className="p-2 overflow-y-auto scrollbar-hide flex-1">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-500 mt-2 text-sm">Loading groups...</p>
          </div>
        ) : groups.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 text-sm">
              No groups found for this chapter
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {groups.map((group, index) => (
              <div
                key={group._id || index}
                className="p-3 hover:bg-gray-100 border border-gray-300 rounded-lg cursor-pointer transition-all bg-white hover:border-gray-400"
                onClick={() => handleGroupSelect(group)}
              >
                <div className="flex items-start space-x-3">
                  {/* Group Image */}
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 border border-gray-200 bg-gray-50">
                    {group.image ? (
                      <img
                        src={
                          group.image.includes("https")
                            ? group.image
                            : `${process.env.NEXT_PUBLIC_BASE_URL}/uploads/${group.image}`
                        }
                        alt={group.name}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center">
                        <span className="text-blue-600 font-semibold text-lg">
                          {group.name?.charAt(0)?.toUpperCase() || "G"}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Group Information */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between">
                      <div className="min-w-0 flex-1">
                        <h3 className="text-sm font-semibold text-gray-900 truncate">
                          {group.name}
                        </h3>
                        <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                          {group.heading || "No description"}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MdChat className="w-4 h-4 text-gray-400" />
                      </div>
                    </div>

                    {/* Group Details */}
                    <div className="mt-2 flex flex-wrap gap-2 text-xs">
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                        Chapter {group.chapterNumber}
                      </span>
                      {group.countryCode && (
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full">
                          {group.countryCode}
                        </span>
                      )}
                      <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full">
                        {group.members?.length || 0} members
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderChatView = () => (
    <SuperAdminChatWindow
      chapterNo={activeChapter?.chapter}
      selectedGroupId={selectedGroup?._id}
      groupName={selectedGroup?.name}
      groupImage={selectedGroup?.image}
      onBack={handleBackToGroups}
      isGlobal={false}
    />
  );

  return (
    <div className="flex montserrat h-full flex-col">
      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden">
        {view === "countries" && renderCountriesView()}
        {view === "sections" && renderSectionsView()}
        {view === "chapters" && renderChaptersView()}
        {view === "groups" && renderGroupsView()}
        {view === "chat" && renderChatView()}
      </div>
    </div>
  );
};

export default SuperLocalChats;
