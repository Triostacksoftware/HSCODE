import React, { useState } from "react";
import {
  MdClose,
  MdSave,
  MdArrowBack,
  MdUpload,
  MdImage,
  MdFileUpload,
} from "react-icons/md";
import axios from "axios";

const AddGroup = ({ categoryId, categoryName, onClose }) => {
  const [formData, setFormData] = useState({
    name: "",
    hscode: "",
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedBulkFile, setSelectedBulkFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isBulkLoading, setIsBulkLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        setError("Please select an image file");
        return;
      }
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setError("File size should be less than 5MB");
        return;
      }
      setSelectedFile(file);
      setError("");
      setSuccess("");
    }
  };

  const handleBulkFileChange = (e) => {
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

      setSelectedBulkFile(file);
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
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      formDataToSend.append("hscode", formData.hscode);

      if (selectedFile) {
        formDataToSend.append("file", selectedFile);
      }

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_URL}/categories/${categoryId}/group`,
        formDataToSend,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.status === 201 || response.status === 200) {
        console.log("Group created successfully:", response.data);
        setSuccess("Group created successfully!");
        // Close modal after a short delay to show success message
        setTimeout(() => {
          onClose();
        }, 1000);
      }
    } catch (error) {
      console.error("Error creating group:", error);
      setError(error.response?.data?.message || "Failed to create group");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBulkSubmit = async (e) => {
    e.preventDefault();
    if (!selectedBulkFile) {
      setError("Please select a file to upload");
      return;
    }

    setIsBulkLoading(true);
    setError("");
    setSuccess("");

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("file", selectedBulkFile);
      formDataToSend.append("categoryId", categoryId);

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_URL}/categories/${categoryId}/group/many`,
        formDataToSend,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.status === 201 || response.status === 200) {
        console.log("Bulk groups created successfully:", response.data);
        setSuccess("Bulk groups created successfully!");

        // Reset file selection
        setSelectedBulkFile(null);

        // Close modal after a short delay to show success message
        setTimeout(() => {
          onClose();
        }, 1000);
      }
    } catch (error) {
      console.error("Error creating bulk groups:", error);
      setError(error.response?.data?.message || "Failed to create bulk groups");
    } finally {
      setIsBulkLoading(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col">
      {/* Header */}
      <div className="p-3 sm:p-4 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-200 rounded-full transition-colors flex-shrink-0"
          >
            <MdArrowBack className="w-5 h-5 text-gray-500" />
          </button>
          <div className="min-w-0 flex-1">
            <h2 className="text-base sm:text-lg text-gray-700 truncate">
              Add New Group
            </h2>
            <p className="text-[.7em] sm:text-[.8em] text-gray-500 truncate">
              Category: {categoryName}
            </p>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="flex-1 p-3 sm:p-4 overflow-y-auto">
        <form
          onSubmit={handleSubmit}
          className="max-w-md mx-auto space-y-4"
        >
          {/* Error Message */}
          {error && (
            <div className="p-3 rounded-lg text-sm bg-red-50 text-red-700 border border-red-200">
              {error}
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="p-3 rounded-lg text-sm bg-green-50 text-green-700 border border-green-200">
              {success}
            </div>
          )}

          <div>
            <label
              htmlFor="name"
              className="block text-[.9em] font-medium text-gray-700 mb-2"
            >
              Group Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent text-sm"
              placeholder="Enter group name"
            />
          </div>

          <div>
            <label
              htmlFor="hscode"
              className="block text-[.9em] font-medium text-gray-700 mb-2"
            >
              HS Code
            </label>
            <input
              type="text"
              id="hscode"
              name="hscode"
              value={formData.hscode}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent text-sm"
              placeholder="Enter HS code"
            />
          </div>

          <div>
            <label
              htmlFor="image"
              className="block text-[.9em] font-medium text-gray-700 mb-2"
            >
              Group Image
            </label>
            <div className="space-y-3">
              {/* File Input */}
              <div className="relative">
                <input
                  type="file"
                  id="image"
                  name="image"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label
                  htmlFor="image"
                  className="flex items-center justify-center w-full px-3 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <MdUpload className="w-5 h-5 mr-2 text-gray-500" />
                  <span className="text-sm text-gray-700">
                    {selectedFile ? selectedFile.name : "Choose an image file"}
                  </span>
                </label>
              </div>

              {/* Selected File Preview */}
              {selectedFile && (
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <MdImage className="w-8 h-8 text-gray-500" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-700 truncate">
                      {selectedFile.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedFile(null)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <MdClose className="w-4 h-4" />
                  </button>
                </div>
              )}

              <p className="text-xs text-gray-500">
                Upload an image for the group (optional, max 5MB)
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4 sm:pt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-3 sm:px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 text-sm sm:text-base"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center text-sm sm:text-base"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating...
                </>
              ) : (
                <>
                  <MdSave className="w-4 h-4 mr-2" />
                  Create Group
                </>
              )}
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center pt-6">
            <div className="flex-1 border-t border-gray-300"></div>
            <span className="px-4 text-sm text-gray-500">OR</span>
            <div className="flex-1 border-t border-gray-300"></div>
          </div>

          {/* Bulk Upload Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-700">
              Bulk Upload Groups
            </h3>

            <div>
              <label
                htmlFor="bulkFile"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Upload CSV/Excel File
              </label>
              <div className="space-y-3">
                {/* File Input */}
                <div className="relative">
                  <input
                    type="file"
                    id="bulkFile"
                    name="bulkFile"
                    accept=".csv,.xlsx,.xls"
                    onChange={handleBulkFileChange}
                    className="hidden"
                  />
                  <label
                    htmlFor="bulkFile"
                    className="flex items-center justify-center w-full px-3 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    <MdUpload className="w-5 h-5 mr-2 text-gray-500" />
                    <span className="text-sm text-gray-700">
                      {selectedBulkFile
                        ? selectedBulkFile.name
                        : "Choose a CSV or Excel file"}
                    </span>
                  </label>
                </div>

                {/* Selected File Preview */}
                {selectedBulkFile && (
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <MdFileUpload className="w-8 h-8 text-gray-500" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-700 truncate">
                        {selectedBulkFile.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {(selectedBulkFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedBulkFile(null)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <MdClose className="w-4 h-4" />
                    </button>
                  </div>
                )}

                <p className="text-xs text-gray-500">
                  Upload a CSV or Excel file with group names and HS codes (max
                  10MB)
                </p>
              </div>
            </div>

            {/* Bulk Upload Button */}
            <button
              type="button"
              onClick={handleBulkSubmit}
              disabled={isBulkLoading || !selectedBulkFile}
              className="w-full px-3 sm:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center text-sm sm:text-base"
            >
              {isBulkLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Uploading...
                </>
              ) : (
                <>
                  <MdFileUpload className="w-4 h-4 mr-2" />
                  Upload Groups
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddGroup;
