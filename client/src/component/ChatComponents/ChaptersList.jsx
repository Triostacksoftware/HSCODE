"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useUserAuth } from "../../utilities/userAuthMiddleware";

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
    <div className="flex  flex-col  h-full">
      {/* Search Bar */}
      <div className="p-4 border-b border-gray-200 flex-shrink-0">
        <input
          type="text"
          placeholder="search chapter"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Categories List */}
      <div className="flex-1 overflow-y-auto p-4 min-h-0">
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
          <div className="space-y-2">
            {filteredCategories.map((category, index) => (
              <div
                key={category._id}
                className={`p-3 border border-gray-200 rounded-lg cursor-pointer transition-all hover:shadow-md ${
                  selectedCategory?._id === category._id
                    ? "bg-blue-50 border-blue-300"
                    : "bg-white hover:bg-gray-50 hover:border-gray-300"
                }`}
                onClick={() => handleCategorySelect(category)}
              >
                <div className="text-sm font-medium text-gray-700">
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
