"use client";
import React, { useState } from "react";
import axios from "axios";
import { MdClose, MdAdd } from "react-icons/md";

const SuperAddLocalCategories = ({
  countryCode,
  onClose,
  onCategoryCreated,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    chapter: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.chapter.trim()) {
      setError("Please fill in all fields");
      return;
    }

    try {
      setIsLoading(true);
      setError("");
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_URL}/categories`,
        {
          name: formData.name.trim(),
          chapter: formData.chapter.trim(),
          countryCode: countryCode,
        },
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      setSuccess("Local category created successfully!");

      // Call the callback to refresh categories list
      if (onCategoryCreated) {
        onCategoryCreated(response.data);
      }

      // Close modal after a short delay to show success message
      setTimeout(() => {
        onClose();
      }, 500);
    } catch (error) {
      console.error("Error creating local category:", error);
      setError(
        error.response?.data?.message || "Failed to create local category"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">
          Add Local Category
        </h2>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
        >
          <MdClose className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      {/* Form */}
      <div className="flex-1 p-4 overflow-y-auto">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter category name"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Chapter Number
            </label>
            <input
              type="text"
              name="chapter"
              value={formData.chapter}
              onChange={handleInputChange}
              placeholder="Enter chapter number"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-sm text-gray-600">
              <strong>Country:</strong> {countryCode}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              This category will be created for the selected country.
            </p>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Creating...
              </>
            ) : (
              <>
                <MdAdd className="w-4 h-4 mr-2" />
                Create Local Category
              </>
            )}
          </button>
        </form>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg mx-4 mb-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg mx-4 mb-4">
          <p className="text-sm text-green-700">{success}</p>
        </div>
      )}
    </div>
  );
};

export default SuperAddLocalCategories;
