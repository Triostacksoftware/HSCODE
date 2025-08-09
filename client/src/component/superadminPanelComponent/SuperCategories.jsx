"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  MdAdd,
  MdEdit,
  MdDelete,
  MdMoreVert,
  MdArrowBack,
} from "react-icons/md";
import SuperCategoriesGroups from "./SuperCategoriesGroups";
import SuperAddCategories from "./SuperAddCategories";

const SuperCategories = () => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [openMenu, setOpenMenu] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [showMobileGroups, setShowMobileGroups] = useState(false);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openMenu && !event.target.closest(".menu-container")) {
        setOpenMenu(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openMenu]);

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      setError("");

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_URL}/global-categories`,
        {
          withCredentials: true,
        }
      );

      setCategories(response.data || []);
    } catch (error) {
      console.error("Error fetching global categories:", error);
      setError("Failed to load global categories");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    // On mobile, show groups view
    if (window.innerWidth < 1024) {
      setShowMobileGroups(true);
    }
  };

  const handleBackToCategories = () => {
    setShowMobileGroups(false);
    setSelectedCategory(null);
  };

  const handleMenuToggle = (categoryId) => {
    setOpenMenu(openMenu === categoryId ? null : categoryId);
  };

  const handleEdit = (category) => {
    // TODO: Implement edit functionality
    console.log("Edit global category:", category);
    setOpenMenu(null);
  };

  const handleDelete = (category) => {
    setCategoryToDelete(category);
    setShowDeleteModal(true);
    setOpenMenu(null);
  };

  const confirmDelete = async () => {
    if (!categoryToDelete) return;

    try {
      setIsLoading(true);
      const response = await axios.delete(
        `${process.env.NEXT_PUBLIC_BASE_URL}/global-categories/${categoryToDelete._id}`,
        {
          withCredentials: true,
        }
      );

      // Remove the category from the list
      setCategories((prevCategories) =>
        prevCategories.filter(
          (category) => category._id !== categoryToDelete._id
        )
      );

      setShowDeleteModal(false);
      setCategoryToDelete(null);
    } catch (error) {
      console.error("Error deleting global category:", error);
      setError("Failed to delete global category");
    } finally {
      setIsLoading(false);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setCategoryToDelete(null);
  };

  const handleAddCategory = () => {
    setShowAddCategoryModal(true);
  };

  const handleCategoryCreated = (newCategory) => {
    // Add the new category to the list
    fetchCategories();
  };

  return (
    <div className="flex montserrat h-screen  flex-col lg:flex-row">
      {/* Mobile Groups View - Full Screen Overlay */}
      {showMobileGroups && selectedCategory && (
        <div className="lg:hidden fixed inset-0 z-50 bg-white">
          <div className="w-full h-full flex flex-col">
            {/* Mobile Header with Back Button */}
            <div className="p-4 border-b border-gray-200 flex items-center space-x-3">
              <button
                onClick={handleBackToCategories}
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <MdArrowBack className="w-5 h-5 text-gray-500" />
              </button>
              <div className="flex-1 min-w-0">
                <h2 className="text-lg text-gray-700 truncate">
                  {selectedCategory.name}
                </h2>
                <p className="text-sm text-gray-500">Global Category Groups</p>
              </div>
            </div>

            {/* Groups Component */}
            <div className="flex-1 overflow-hidden">
              <SuperCategoriesGroups
                categoryId={selectedCategory._id}
                categoryName={selectedCategory.name}
              />
            </div>
          </div>
        </div>
      )}

      {/* Left Section - Categories List */}
      <div className="w-full grid grid-rows-[auto_1fr] lg:w-1/3 border-b h-full lg:border-b-0 lg:border-r border-gray-200 transform transition-transform duration-300 ease-in-out animate-slide-in">
        {/* Header */}
        <div className="p-3 sm:p-4 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h2 className="text-base sm:text-lg text-gray-700">
              Global Categories
            </h2>
            <h2 className="text-[.7em] sm:text-[.8em] text-gray-500">
              No. of Global Categories - {categories.length}
            </h2>
          </div>
          <button
            onClick={handleAddCategory}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-200 cursor-pointer border-gray-200 border transition-colors"
          >
            <MdAdd className="w-5 h-5" />
          </button>
        </div>

        {/* Categories List */}
        <div className="p-2 overflow-y-auto scrollbar-hide">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-500 mt-2 text-sm">
                Loading global categories...
              </p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-500 text-sm">{error}</p>
              <button
                onClick={fetchCategories}
                className="mt-2 text-blue-600 hover:text-blue-700 underline text-sm"
              >
                Try again
              </button>
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 text-sm">
                No global categories found
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {categories.map((category, index) => (
                <div
                  key={category._id || index}
                  className={`p-3 hover:bg-gray-100 border border-gray-300 rounded-lg cursor-pointer transition-all ${
                    selectedCategory?._id === category._id
                      ? "bg-gray-100 "
                      : "bg-white  hover:border-gray-400"
                  }`}
                  onClick={() => handleCategorySelect(category)}
                >
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <span className="text-[.9em] sm:text-[.96em] text-gray-700 truncate block">
                        {category.name}
                      </span>
                      <span className="text-[.7em] text-gray-700 truncate block">
                        Chapter: {category.chapter}
                      </span>
                    </div>
                    <div className="relative menu-container cursor-pointer flex-shrink-0 ml-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMenuToggle(category._id);
                        }}
                        className="p-1 hover:bg-gray-200 rounded-full transition-colors cursor-pointer"
                      >
                        <MdMoreVert className="w-5 h-5 text-gray-500" />
                      </button>

                      {/* Dropdown Menu */}
                      {openMenu === category._id && (
                        <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[120px] animate-dropdown">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(category);
                            }}
                            className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 cursor-pointer transition-colors flex items-center space-x-2"
                          >
                            <MdEdit className="w-4 h-4 text-gray-600" />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(category);
                            }}
                            className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 cursor-pointer transition-colors flex items-center space-x-2 text-gray-600"
                          >
                            <MdDelete className="w-4 h-4" />
                            <span>Delete</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Section - Groups Component (Desktop Only) */}
      <div className="hidden lg:block w-2/3 bg-gray-50 flex-1">
        {selectedCategory ? (
          <SuperCategoriesGroups
            categoryId={selectedCategory._id}
            categoryName={selectedCategory.name}
          />
        ) : (
          <div className="flex items-center justify-center h-full min-h-[400px] lg:min-h-screen">
            <div className="text-center p-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-200 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <MdAdd className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 text-sm sm:text-base">
                Select a Global Category to view its groups
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/20 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 animate-dropdown">
            <div className="flex flex-row-reverse items-center justify-between mb-4">
              <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center mr-4">
                <MdDelete className="w-4 h-4 text-red-600" />
              </div>
              <div>
                <h3 className="text-md font-semibold text-gray-900">
                  Delete Global Category
                </h3>
                <p className="text-xs text-gray-500">
                  This action cannot be undone.
                </p>
              </div>
            </div>

            <p className="text-gray-700 mb-6 text-sm">
              Are you sure you want to delete{" "}
              <span className="font-semibold">"{categoryToDelete?.name}"</span>?
              This will also remove all associated global groups.
            </p>

            <div className="flex space-x-3">
              <button
                onClick={cancelDelete}
                disabled={isLoading}
                className="flex-1 px-2 py-2 border cursor-pointer border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={isLoading}
                className="flex-1 px-2 py-2 bg-red-600 cursor-pointer text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Deleting...
                  </>
                ) : (
                  "Yes, Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Category Modal */}
      {showAddCategoryModal && (
        <div className="fixed inset-0 bg-black/20 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 h-[80vh] max-h-[600px] animate-dropdown">
            <SuperAddCategories
              onClose={() => setShowAddCategoryModal(false)}
              onCategoryCreated={handleCategoryCreated}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperCategories;
