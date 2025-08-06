"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useUserAuth } from "../../utilities/userAuthMiddleware";
import { LiaSearchSolid } from "react-icons/lia";

const ChaptersList = ({ onCategorySelect, selectedCategory }) => {
  const { user } = useUserAuth();
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

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
        console.log("Categories fetched:", response.data);
        setCategories(response.data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, [user]);

  const handleCategorySelect = (category) => {
    console.log("Category selected:", category);
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
      <div className="flex-shrink-0 flex items-center gap-3 p-2 py-[.35em] border border-gray-200 rounded-md text-gray-600 ">
        <LiaSearchSolid/>
        <input
          type="text"
          placeholder="Search or open a chapter"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="text-[.88em] outline-none placeholder:text-gray-500"
        />
      </div>

      {/* Categories List */}
      <div className="flex-1 overflow-y-auto mt-4 min-h-0">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-500 mt-2 text-sm">Loading chapters...</p>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 text-sm">No chapters found</p>
          </div>
        ) : (
          <div className="space-y-1">
            {filteredCategories.map((category, index) => (
              <div
                key={category._id}
                className={`p-3 rounded cursor-pointer transition-all ${
                  selectedCategory?._id === category._id
                    ? "bg-[#eaeaea] text-gray-800"
                    : "bg-white hover:bg-[#f4f4f4] text-gray-600"
                }`}
                onClick={() => handleCategorySelect(category)}
              >
                <div className="text-sm font-medium ">
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

export default ChaptersList;
