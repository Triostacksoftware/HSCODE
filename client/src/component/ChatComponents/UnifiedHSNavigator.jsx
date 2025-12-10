"use client";
import React, { useState, useMemo } from "react";
import { LiaSearchSolid } from "react-icons/lia";
import hsCodeData from "../../../hs_code_structure.json";
import ChapterInfoButton from "./ChapterInfoButton";
import ChapterImage from "./ChapterImage";

const UnifiedHSNavigator = ({
  scope = "local",
  onChapterSelect,
  selectedChapter,
  user,
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  // Flatten all chapters from all sections into a single array
  const allChapters = useMemo(() => {
    return hsCodeData.sections.flatMap((section) =>
      section.chapters.map((chapter) => ({
        ...chapter,
        sectionTitle: section.title,
        sectionNumber: section.section,
      }))
    );
  }, []);

  const handleChapterClick = (chapter) => {
    if (onChapterSelect) {
      onChapterSelect({
        _id: chapter.chapter.toString(),
        name: chapter.heading,
        chapter: chapter.chapter.toString(),
      });
    }
  };

  // Filter chapters based on search term
  const filteredChapters = allChapters.filter(
    (chapter) =>
      chapter.heading.toLowerCase().includes(searchTerm.toLowerCase()) ||
      chapter.chapter.toString().includes(searchTerm) ||
      chapter.sectionTitle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full px-3">
      {/* Search */}
      <div className="flex items-center gap-3 p-2 border border-gray-200 rounded-md mb-4">
        <LiaSearchSolid />
        <input
          type="text"
          placeholder="Search chapters..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full outline-none text-sm"
        />
      </div>

      {/* Content - All Chapters */}
      <div className="flex-1 overflow-y-auto">
        {filteredChapters.map((chapter) => (
          <div
            key={chapter.chapter}
            className={`p-3 rounded cursor-pointer transition-all mb-2 ${
              selectedChapter?.chapter === chapter.chapter.toString()
                ? "bg-[#eaeaea] text-gray-800"
                : "bg-white hover:bg-[#f4f4f4] text-gray-600"
            }`}
            onClick={() => handleChapterClick(chapter)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                {/* Chapter Image */}
                <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-gray-200 flex-shrink-0 overflow-hidden border border-gray-300">
                  <ChapterImage chapterNumber={chapter.chapter} />
                </div>
                
                <div className="text-sm grid font-medium flex-1 min-w-0">
                  <span className="truncate">Chapter {chapter.chapter}</span>
                  <span className="text-gray-400 text-xs truncate">{chapter.heading}</span>
                </div>
              </div>
              <ChapterInfoButton chapter={chapter} user={user} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UnifiedHSNavigator;
