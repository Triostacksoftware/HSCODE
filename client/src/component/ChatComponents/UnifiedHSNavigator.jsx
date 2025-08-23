"use client";
import React, { useState } from "react";
import { LiaSearchSolid } from "react-icons/lia";
import { IoIosArrowBack } from "react-icons/io";
import hsCodeData from "../../../hs_code_structure.json"

const UnifiedHSNavigator = ({ 
  scope = "local",
  onChapterSelect,
  selectedChapter 
}) => {
  const [activeSection, setActiveSection] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const handleSectionClick = (section) => {
    setActiveSection(section);
  };

  const handleChapterClick = (chapter) => {
    if (onChapterSelect) {
      onChapterSelect({
        _id: chapter.chapter.toString(),
        name: chapter.heading,
        chapter: chapter.chapter.toString()
      });
    }
  };

  const handleBackToSections = () => {
    setActiveSection(null);
  };

  return (
    <div className="flex flex-col h-full px-3">
      {/* Search */}
      <div className="flex items-center gap-3 p-2 border border-gray-200 rounded-md mb-4">
        <LiaSearchSolid />
        <input
          type="text"
          placeholder={activeSection ? "Search chapters..." : "Search sections..."}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full outline-none text-sm"
        />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {!activeSection ? (
          // Sections
          hsCodeData.sections
            .filter(section => 
              section.title.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .map((section) => (
              <div
                key={section.section}
                className="p-3 rounded cursor-pointer transition-all bg-white hover:bg-[#f4f4f4] text-gray-600 mb-2"
                onClick={() => handleSectionClick(section)}
              >
                <div className="text-sm grid font-medium">
                  <span>Section {section.section}</span>
                  <span className="text-gray-400 text-xs">{section.title}</span> 
                </div>
              </div>
            ))
        ) : (
          // Chapters
          <div>
            <button
              onClick={handleBackToSections}
              className="p-2 text-sm cursor-pointer flex items-center justify-center hover:bg-gray-100 rounded-full mb-2"
            >
              <IoIosArrowBack/> back
            </button>
            
            {activeSection.chapters
              .filter(chapter => 
                chapter.heading.toLowerCase().includes(searchTerm.toLowerCase()) ||
                chapter.chapter.toString().includes(searchTerm)
              )
              .map((chapter) => (
                <div
                  key={chapter.chapter}
                  className={`p-3 rounded cursor-pointer transition-all mb-2 ${
                    selectedChapter?.chapter === chapter.chapter.toString()
                      ? "bg-[#eaeaea] text-gray-800"
                      : "bg-white hover:bg-[#f4f4f4] text-gray-600"
                  }`}
                  onClick={() => handleChapterClick(chapter)}
                >
                  <div className="text-sm grid font-medium">
                    <span>Chapter {chapter.chapter}</span>
                    <span className="text-gray-400 text-xs">{chapter.heading}</span> 
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UnifiedHSNavigator;
