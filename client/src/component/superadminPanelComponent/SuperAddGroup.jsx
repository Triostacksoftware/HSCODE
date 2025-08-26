"use client";

import React, { useState } from "react";
import {
  MdClose,
  MdSave,
  MdArrowBack,
  MdUpload,
  MdFileUpload,
} from "react-icons/md";
import axios from "axios";

const SuperAddGroup = ({
  chapterNumber,
  chapterName,
  groupType,
  onClose,
  onGroupCreated,
}) => {
  console.log("📝 SuperAddGroup received props:", {
    chapterNumber,
    chapterName,
    groupType,
  });

  const [formData, setFormData] = useState({
    name: "",
    heading: "",
    chapterNumber: chapterNumber || "",
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isBulkLoading, setIsBulkLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Prevent editing chapter number as it should be auto-filled
    if (name === "chapterNumber") {
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = [
        "text/csv",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      ];

      if (!allowedTypes.includes(file.type)) {
        setError("Please select a CSV or Excel file");
        return;
      }

      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        setError("File size should be less than 10MB");
        return;
      }

      setSelectedFile(file);
      setError("");
      setSuccess("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const submitFormData = new FormData();
      submitFormData.append("name", formData.name);
      submitFormData.append("heading", formData.heading);
      submitFormData.append("chapterNumber", formData.chapterNumber);

      if (selectedFile) {
        submitFormData.append("file", selectedFile);
      }

      // Determine API endpoint based on group type
      const endpoint = groupType === "global" ? "/global-groups" : "/groups";

      console.log("🚀 Creating group with:", {
        groupType,
        endpoint,
        fullUrl: `${process.env.NEXT_PUBLIC_BASE_URL}${endpoint}`,
        chapterNumber: formData.chapterNumber,
        name: formData.name,
      });

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_URL}${endpoint}`,
        submitFormData,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const groupTypeText = groupType === "global" ? "Global" : "Local";
      setSuccess(`${groupTypeText} group created successfully!`);

      // Close modal after a short delay to show success message
      setTimeout(() => {
        if (onGroupCreated) onGroupCreated();
        onClose();
      }, 500);
    } catch (error) {
      const groupTypeText = groupType === "global" ? "global" : "local";
      console.error(`Error creating ${groupTypeText} group:`, error);
      setError(
        error.response?.data?.message ||
          `Failed to create ${groupTypeText} group`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleBulkSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setError("Please select a file to upload");
      return;
    }

    setIsBulkLoading(true);
    setError("");
    setSuccess("");

    try {
      const bulkFormData = new FormData();
      bulkFormData.append("file", selectedFile);
      bulkFormData.append("chapterNumber", chapterNumber);

      // Determine API endpoint based on group type
      const endpoint =
        groupType === "global" ? "/global-groups/bulk" : "/groups/bulk";

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_URL}${endpoint}`,
        bulkFormData,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const groupTypeText = groupType === "global" ? "Global" : "Local";
      setSuccess(`${groupTypeText} groups imported successfully!`);

      // Close modal after a short delay to show success message
      setTimeout(() => {
        if (onGroupCreated) onGroupCreated();
        onClose();
      }, 500);
    } catch (error) {
      const groupTypeText = groupType === "global" ? "global" : "local";
      console.error(`Error importing ${groupTypeText} groups:`, error);
      setError(
        error.response?.data?.message ||
          `Failed to import ${groupTypeText} groups`
      );
    } finally {
      setIsBulkLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <MdArrowBack className="w-5 h-5 text-gray-500" />
          </button>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Add {groupType === "global" ? "Global" : "Local"} Group
            </h2>
            <p className="text-sm text-gray-500">
              Create a new {groupType === "global" ? "global" : "local"} group
              in {chapterName}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
        >
          <MdClose className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Single Group Form */}
        <div className="mb-8">
          <h3 className="text-md font-semibold text-gray-800 mb-4">
            Add Single {groupType === "global" ? "Global" : "Local"} Group
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Group Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={`Enter ${
                  groupType === "global" ? "global" : "local"
                } group name`}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 mb-2">
                Chapter Number
              </label>
              <input
                type="text"
                name="chapterNumber"
                value={formData.chapterNumber}
                readOnly
                disabled
                className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                placeholder="Auto-filled from selected chapter"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                HSCode
              </label>
              <input
                type="text"
                name="heading"
                value={formData.heading}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter HSCode"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Group Image (Optional)
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="cursor-pointer flex flex-col items-center"
                >
                  <MdFileUpload className="w-8 h-8 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-600">
                    Click to upload group image
                  </span>
                  <span className="text-xs text-gray-500 mt-1">
                    JPG, PNG, GIF (max 5MB)
                  </span>
                </label>
                {selectedFile && (
                  <div className="mt-4 p-2 bg-green-50 rounded-lg">
                    <p className="text-sm text-green-700">
                      Selected: {selectedFile.name}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={
                isLoading || !formData.name.trim() || !formData.heading.trim()
              }
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating...
                </>
              ) : (
                <>
                  <MdSave className="w-4 h-4 mr-2" />
                  Create {groupType === "global" ? "Global" : "Local"} Group
                </>
              )}
            </button>
          </form>
        </div>

        {/* Divider */}
        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">OR</span>
          </div>
        </div>

        {/* Bulk Import Form */}
        <div>
          <h3 className="text-md font-semibold text-gray-800 mb-4">
            Bulk Import {groupType === "global" ? "Global" : "Local"} Groups
          </h3>
          <form onSubmit={handleBulkSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload File (CSV/Excel)
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept=".csv,.xlsx,.xls"
                  className="hidden"
                  id="bulk-file-upload"
                />
                <label
                  htmlFor="bulk-file-upload"
                  className="cursor-pointer flex flex-col items-center"
                >
                  <MdFileUpload className="w-8 h-8 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-600">
                    Click to upload or drag and drop
                  </span>
                  <span className="text-xs text-gray-500 mt-1">
                    CSV, XLSX, XLS (max 10MB)
                  </span>
                </label>
                {selectedFile && (
                  <div className="mt-4 p-2 bg-green-50 rounded-lg">
                    <p className="text-sm text-green-700">
                      Selected: {selectedFile.name}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={isBulkLoading || !selectedFile}
              className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isBulkLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Importing...
                </>
              ) : (
                <>
                  <MdUpload className="w-4 h-4 mr-2" />
                  Import {groupType === "global" ? "Global" : "Local"} Groups
                </>
              )}
            </button>
          </form>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {success && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-700">{success}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SuperAddGroup;
