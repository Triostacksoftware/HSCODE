import React, { useState, useEffect } from "react";
import axios from "axios";
import { MdAdd, MdEdit, MdDelete, MdMoreVert } from "react-icons/md";
import CategorisGroups from "./CategorisGroups";

const Categories = () => {
  const [categories, setCategories] = useState([
    {
      _id: "1",
      name: "Chapter 1",
      country: "India",
      info: "This is the first chapter",
      groupsize: 17,
    },
    {
      _id: "2",
      name: "Chapter 2",
      country: "USA",
      info: "This is the second chapter",
      groupsize: 21,
    },
    {
      _id: "3",
      name: "Chapter 3",
      country: "UK",
      info: "This is the third chapter",
      groupsize: 6,
    },
    {
      _id: "4",
      name: "Chapter 4",
      country: "Canada",
      info: "This is the fourth chapter",
      groupsize: 12,
    },
  ]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [openMenu, setOpenMenu] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);

  useEffect(() => {
    // Commented out for now since we're using dummy data
    // fetchCategories();
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
        `${process.env.NEXT_PUBLIC_BASE_URL}/admin/categories`,
        {
          withCredentials: true,
        }
      );

      if (response.status === 200) {
        setCategories(response.data.categories || []);
        console.log("Categories response:", response.data);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      setError("Failed to load categories");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
  };

  const handleMenuToggle = (categoryId) => {
    setOpenMenu(openMenu === categoryId ? null : categoryId);
  };

  const handleEdit = (category) => {
    // TODO: Implement edit functionality
    console.log("Edit category:", category);
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
        `${process.env.NEXT_PUBLIC_BASE_URL}/admin/categories/${categoryToDelete._id}`,
        {
          withCredentials: true,
        }
      );

      if (response.status === 200) {
        // Remove the category from the list
        setCategories((prevCategories) =>
          prevCategories.filter((cat) => cat._id !== categoryToDelete._id)
        );

        // If the deleted category was selected, clear selection
        if (selectedCategory?._id === categoryToDelete._id) {
          setSelectedCategory(null);
        }

        setShowDeleteModal(false);
        setCategoryToDelete(null);
      }
    } catch (error) {
      console.error("Error deleting category:", error);
      setError("Failed to delete category");
    } finally {
      setIsLoading(false);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setCategoryToDelete(null);
  };

  return (
    <div className="flex min-h-screen montserrat">
      {/* Left Section - Chapters List */}
      <div className="w-1/3 border-r border-gray-200 bg-white transform transition-transform duration-300 ease-in-out animate-slide-in">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-800">Chapters</h2>
          <button className="w-8 h-8   rounded-lg flex items-center justify-center hover:bg-gray-200 cursor-pointer border-gray-200 border transition-colors">
            <MdAdd className="w-5 h-5" />
          </button>
        </div>

        {/* Categories List */}
        <div className="p-2">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-500 mt-2">Loading categories...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-500">{error}</p>
              <button
                onClick={fetchCategories}
                className="mt-2 text-blue-600 hover:text-blue-700 underline"
              >
                Try again
              </button>
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No categories found</p>
            </div>
          ) : (
            <div className="space-y-2">
              {categories.map((category, index) => (
                <div
                  key={category._id || index}
                  className={`p-3 hover:bg-gray-100 rounded-lg cursor-pointer transition-all ${
                    selectedCategory?._id === category._id
                      ? "bg-gray-100 "
                      : "bg-white border-gray-300 hover:border-gray-400"
                  }`}
                  onClick={() => handleCategorySelect(category)}
                >
                  <div className="flex items-center  justify-between">
                    <div>
                      <span className="font-medium text-gray-800">
                        {category.name}
                      </span>

                      <div className="text-xs text-gray-500 mt-1">
                        {category.info}
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      total groups: {category.groupsize}
                    </div>
                    <div className="relative menu-container cursor-pointer">
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

      {/* Right Section - Groups Component */}
      <div className="w-2/3 bg-gray-50 ">
        {selectedCategory ? (
          <CategorisGroups
            categoryId={selectedCategory._id}
            categoryName={selectedCategory.name}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-200 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <MdAdd className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500">
                Select a chapter to view its groups
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
                  Delete Category
                </h3>
                <p className="text-xs text-gray-500">
                  This action cannot be undone.
                </p>
              </div>
            </div>

            <p className="text-gray-700 mb-6 text-sm">
              Are you sure you want to delete{" "}
              <span className="font-semibold">"{categoryToDelete?.name}"</span>?
              This will also remove all associated groups.
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
    </div>
  );
};

export default Categories;
