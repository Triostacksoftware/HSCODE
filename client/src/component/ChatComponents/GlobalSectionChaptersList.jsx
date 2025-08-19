"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { LiaSearchSolid } from "react-icons/lia";
import { IoArrowBack } from "react-icons/io5";
import { getChaptersBySection } from "../../utilities/hsSectionsData";

const GlobalSectionChaptersList = ({
  selectedSection,
  onBack,
  onCategorySelect,
  selectedCategory,
}) => {
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredCategories, setFilteredCategories] = useState([]);

  useEffect(() => {
    const fetchGlobalCategories = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BASE_URL}/global-categories`,
          {
            withCredentials: true,
          }
        );

        // Filter categories to only show those from the selected section
        const sectionChapters = getChaptersBySection(
          selectedSection.sectionNumber
        );
        const sectionChapterNumbers = sectionChapters.map(
          (ch) => ch.chapterNumber
        );

        const filtered = response.data.filter((category) =>
          sectionChapterNumbers.includes(category.chapter)
        );

        setCategories(filtered);
        setFilteredCategories(filtered);
      } catch (error) {
        console.error("Error fetching global categories:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchGlobalCategories();
  }, [selectedSection]);

  useEffect(() => {
    // Filter categories based on search term
    const filtered = categories.filter(
      (category) =>
        category.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category.chapter?.includes(searchTerm)
    );
    setFilteredCategories(filtered);
  }, [searchTerm, categories]);

  const handleCategorySelect = (category) => {
    if (onCategorySelect) {
      onCategorySelect(category);
    }
  };

  return (
    <div className="flex flex-col h-full px-3">
      {/* Header with Back Button */}
      <div className="flex-shrink-0 flex items-center gap-2 p-2 border-b border-gray-200">
        <button
          onClick={onBack}
          className="p-1 rounded-md hover:bg-gray-100 transition-colors"
        >
          <IoArrowBack className="w-4 h-4" />
        </button>
        <div className="flex-1">
          <div className="text-sm font-medium text-gray-800">
            Section {selectedSection.sectionNumber}
          </div>
          <div className="text-xs text-gray-500">{selectedSection.title}</div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex-shrink-0 flex items-center gap-3 p-2 py-[.35em] border border-gray-200 rounded-md text-gray-600 mt-2">
        <LiaSearchSolid />
        <input
          type="text"
          placeholder={`Search global chapters in Section ${selectedSection.sectionNumber}...`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="text-[.88em] w-full outline-none placeholder:text-gray-500"
        />
      </div>

      {/* Chapters List */}
      <div className="flex-1 overflow-y-auto mt-4 min-h-0">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-500 mt-2 text-sm">
              Loading global chapters...
            </p>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 text-sm">
              No global chapters found in this section
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {filteredCategories.map((category) => (
              <div
                key={category._id}
                className={`chapter-item p-3 rounded cursor-pointer transition-all ${
                  selectedCategory?._id === category._id
                    ? "bg-[#eaeaea] text-gray-800"
                    : "bg-white hover:bg-[#f4f4f4] text-gray-600"
                }`}
                onClick={() => handleCategorySelect(category)}
              >
                <div className="text-sm font-medium">{category.name}</div>
                <div className="text-[.7em] text-gray-400 font-medium">
                  Chapter No. - {category.chapter}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default GlobalSectionChaptersList;
