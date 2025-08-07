"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useUserAuth } from "../../utilities/userAuthMiddleware";
import { LiaSearchSolid } from "react-icons/lia";

const GlobalChaptersList = ({ onCategorySelect, selectedCategory }) => {
  const { user } = useUserAuth();
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchGlobalCategories = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BASE_URL}/global-categories`,
          {
            withCredentials: true,
          }
        );
        console.log("Global categories fetched:", response.data);
        setCategories(response.data);
      } catch (error) {
        console.error("Error fetching global categories:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchGlobalCategories();
  }, []);

  const handleCategorySelect = (category) => {
    console.log("Global category selected:", category);
    if (onCategorySelect) {
      onCategorySelect(category);
    }
  };

  const filteredCategories = categories.filter((category) =>
    category.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full px-3">
      {/* Search Bar */}
      <div className="flex-shrink-0 flex items-center gap-3 p-3 md:p-2 md:py-[.35em] border border-gray-200 rounded-md text-gray-600 mt-3 md:mt-0">
        <LiaSearchSolid className="flex-shrink-0" />
        <input
          type="text"
          placeholder="Search global chapters"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="text-sm md:text-[.88em] w-full outline-none placeholder:text-gray-500"
        />
      </div>

      {/* Categories List */}
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
            <p className="text-gray-500 text-sm">No global chapters found</p>
          </div>
        ) : (
          <div className="space-y-2 md:space-y-1">
            {filteredCategories.map((category, index) => (
              <div
                key={category._id}
                className={`p-4 md:p-3 rounded-lg md:rounded cursor-pointer transition-all touch-manipulation ${
                  selectedCategory?._id === category._id
                    ? "bg-[#eaeaea] text-gray-800"
                    : "bg-white hover:bg-[#f4f4f4] text-gray-600"
                }`}
                onClick={() => handleCategorySelect(category)}
                tabIndex={0}
                onKeyDown={(e) =>
                  (e.key === "Enter" || e.key === " ") &&
                  handleCategorySelect(category)
                }
                role="button"
                aria-pressed={selectedCategory?._id === category._id}
              >
                <div className="text-sm md:text-sm font-medium">
                  {category.name}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default GlobalChaptersList;
