"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useUserAuth } from "../../utilities/userAuthMiddleware";
import { LiaSearchSolid } from "react-icons/lia";
import { IoArrowBack } from "react-icons/io5";

const SectionChaptersList = ({
  selectedSection,
  onBack,
  onCategorySelect,
  selectedCategory,
}) => {
  const { user } = useUserAuth();
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredCategories, setFilteredCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      if (!user || !user.countryCode) {
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BASE_URL}/categories`,
          {
            withCredentials: true,
          }
        );

        // Filter categories to only show those from the selected section
        // Filter by chapter numbers based on the selected section
        let filtered = [];

        if (selectedSection.sectionNumber === "I") {
          // Section I: Chapters 01-05
          filtered = response.data.filter((category) =>
            ["01", "02", "03", "04", "05"].includes(category.chapter)
          );
        } else if (selectedSection.sectionNumber === "II") {
          // Section II: Chapters 06-14
          filtered = response.data.filter((category) =>
            ["06", "07", "08", "09", "10", "11", "12", "13", "14"].includes(
              category.chapter
            )
          );
        } else if (selectedSection.sectionNumber === "III") {
          // Section III: Chapter 15
          filtered = response.data.filter(
            (category) => category.chapter === "15"
          );
        } else if (selectedSection.sectionNumber === "IV") {
          // Section IV: Chapters 16-24
          filtered = response.data.filter((category) =>
            ["16", "17", "18", "19", "20", "21", "22", "23", "24"].includes(
              category.chapter
            )
          );
        } else if (selectedSection.sectionNumber === "V") {
          // Section V: Chapters 25-27
          filtered = response.data.filter((category) =>
            ["25", "26", "27"].includes(category.chapter)
          );
        } else if (selectedSection.sectionNumber === "VI") {
          // Section VI: Chapters 28-38
          filtered = response.data.filter((category) =>
            [
              "28",
              "29",
              "30",
              "31",
              "32",
              "33",
              "34",
              "35",
              "36",
              "37",
              "38",
            ].includes(category.chapter)
          );
        } else if (selectedSection.sectionNumber === "VII") {
          // Section VII: Chapters 39-40
          filtered = response.data.filter((category) =>
            ["39", "40"].includes(category.chapter)
          );
        } else if (selectedSection.sectionNumber === "VIII") {
          // Section VIII: Chapters 41-43
          filtered = response.data.filter((category) =>
            ["41", "42", "43"].includes(category.chapter)
          );
        } else if (selectedSection.sectionNumber === "IX") {
          // Section IX: Chapters 44-46
          filtered = response.data.filter((category) =>
            ["44", "45", "46"].includes(category.chapter)
          );
        } else if (selectedSection.sectionNumber === "X") {
          // Section X: Chapters 47-49
          filtered = response.data.filter((category) =>
            ["47", "48", "49"].includes(category.chapter)
          );
        } else if (selectedSection.sectionNumber === "XI") {
          // Section XI: Chapters 50-63
          filtered = response.data.filter((category) =>
            [
              "50",
              "51",
              "52",
              "53",
              "54",
              "55",
              "56",
              "57",
              "58",
              "59",
              "60",
              "61",
              "62",
              "63",
            ].includes(category.chapter)
          );
        } else if (selectedSection.sectionNumber === "XII") {
          // Section XII: Chapters 64-67
          filtered = response.data.filter((category) =>
            ["64", "65", "66", "67"].includes(category.chapter)
          );
        } else if (selectedSection.sectionNumber === "XIII") {
          // Section XIII: Chapters 68-70
          filtered = response.data.filter((category) =>
            ["68", "69", "70"].includes(category.chapter)
          );
        } else if (selectedSection.sectionNumber === "XIV") {
          // Section XIV: Chapter 71
          filtered = response.data.filter(
            (category) => category.chapter === "71"
          );
        } else if (selectedSection.sectionNumber === "XV") {
          // Section XV: Chapters 72-83
          filtered = response.data.filter((category) =>
            [
              "72",
              "73",
              "74",
              "75",
              "76",
              "77",
              "78",
              "79",
              "80",
              "81",
              "82",
              "83",
            ].includes(category.chapter)
          );
        } else if (selectedSection.sectionNumber === "XVI") {
          // Section XVI: Chapters 84-85
          filtered = response.data.filter((category) =>
            ["84", "85"].includes(category.chapter)
          );
        } else if (selectedSection.sectionNumber === "XVII") {
          // Section XVII: Chapters 86-89
          filtered = response.data.filter((category) =>
            ["86", "87", "88", "89"].includes(category.chapter)
          );
        } else if (selectedSection.sectionNumber === "XVIII") {
          // Section XVIII: Chapters 90-92
          filtered = response.data.filter((category) =>
            ["90", "91", "92"].includes(category.chapter)
          );
        } else if (selectedSection.sectionNumber === "XIX") {
          // Section XIX: Chapter 93
          filtered = response.data.filter(
            (category) => category.chapter === "93"
          );
        } else if (selectedSection.sectionNumber === "XX") {
          // Section XX: Chapters 94-96
          filtered = response.data.filter((category) =>
            ["94", "95", "96"].includes(category.chapter)
          );
        } else {
          // For any other sections, show all categories for now
          filtered = response.data;
        }

        setCategories(filtered);
        setFilteredCategories(filtered);
      } catch (error) {
        console.error("Error fetching categories:", error);
        // Set empty array on error
        setCategories([]);
        setFilteredCategories([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, [user, selectedSection]);

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
          placeholder={`Search chapters in Section ${selectedSection.sectionNumber}...`}
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
            <p className="text-gray-500 mt-2 text-sm">Loading chapters...</p>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 text-sm">
              No chapters found in this section
            </p>
            <div className="text-xs text-gray-400 mt-1">
              Available categories: {categories.length}
            </div>
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

export default SectionChaptersList;
