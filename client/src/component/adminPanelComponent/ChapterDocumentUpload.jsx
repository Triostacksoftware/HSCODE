"use client";

import React, { useState, useEffect } from "react";
import {
  MdClose,
  MdUploadFile,
  MdFilePresent,
  MdCheckCircle,
} from "react-icons/md";
import axios from "axios";

const ChapterDocumentUpload = ({ chapter, onClose, onSuccess }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [availableDocuments, setAvailableDocuments] = useState([]);
  const [isLoadingDocs, setIsLoadingDocs] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch available documents on component mount and when chapter changes
  useEffect(() => {
    fetchAvailableDocuments();
  }, [chapter.chapter]);

  const fetchAvailableDocuments = async () => {
    setIsLoadingDocs(true);
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_URL}/groups/chapter-documents`,
        { withCredentials: true }
      );

      // Filter documents to show only the current chapter's document
      const allDocuments = response.data.documents || [];
      const currentChapterDocuments = allDocuments.filter(
        (doc) => doc.chapterNumber === chapter.chapter.toString()
      );

      setAvailableDocuments(currentChapterDocuments);
    } catch (error) {
      console.error("Error fetching chapter documents:", error);
      setAvailableDocuments([]);
    } finally {
      setIsLoadingDocs(false);
    }
  };

  const handleDeleteDocument = async (chapterNumber) => {
    if (
      !confirm(
        `Are you sure you want to delete the document for Chapter ${chapterNumber}?`
      )
    ) {
      return;
    }

    setIsDeleting(true);
    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_BASE_URL}/groups/chapter-document/${chapterNumber}`,
        { withCredentials: true }
      );

      setSuccess(`Chapter ${chapterNumber} document deleted successfully!`);

      // Refresh the documents list
      await fetchAvailableDocuments();

      // Call success callback if provided
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error deleting chapter document:", error);
      setError(
        error.response?.data?.message || "Failed to delete chapter document"
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (file.type !== "application/pdf") {
        setError("Please select a PDF file");
        setSelectedFile(null);
        return;
      }

      // Validate file size (20MB limit)
      if (file.size > 20 * 1024 * 1024) {
        setError("File size should be less than 20MB");
        setSelectedFile(null);
        return;
      }

      setSelectedFile(file);
      setError("");
      setSuccess("");
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError("Please select a file first");
      return;
    }

    setIsUploading(true);
    setError("");
    setSuccess("");

    try {
      const formData = new FormData();
      formData.append("chapterDocument", selectedFile);
      formData.append("chapterNumber", chapter.chapter);

      // Debug logging
      console.log("Uploading chapter document for:", chapter);
      console.log("Chapter number being sent:", chapter.chapter);

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_URL}/groups/chapter-document`,
        formData,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.status === 200 || response.status === 201) {
        setSuccess("Chapter document uploaded successfully!");
        setSelectedFile(null);

        // Refresh the documents list
        await fetchAvailableDocuments();

        // Call success callback if provided
        if (onSuccess) {
          onSuccess();
        }

        // Close modal after delay
        setTimeout(() => {
          onClose();
        }, 1500);
      }
    } catch (error) {
      console.error("Error uploading chapter document:", error);
      setError(
        error.response?.data?.message || "Failed to upload chapter document"
      );
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Upload Chapter Document
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Chapter {chapter.chapter} - {chapter.heading}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <MdClose className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Error Message */}
          {error && (
            <div className="p-3 rounded-lg bg-red-50 text-red-700 border border-red-200 text-sm flex items-center space-x-2">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="p-3 rounded-lg bg-green-50 text-green-700 border border-green-200 text-sm flex items-center space-x-2">
              <MdCheckCircle className="w-5 h-5" />
              <span>{success}</span>
            </div>
          )}

          {/* File Upload Area */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select PDF Document
            </label>

            {/* Custom File Input */}
            <div className="relative">
              <input
                type="file"
                accept=".pdf,application/pdf"
                onChange={handleFileChange}
                className="hidden"
                id="chapter-doc-upload"
              />
              <label
                htmlFor="chapter-doc-upload"
                className="flex items-center justify-center w-full px-4 py-8 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all"
              >
                <div className="text-center">
                  <MdUploadFile className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">
                    {selectedFile ? (
                      <span className="text-blue-600 font-medium">
                        Click to change file
                      </span>
                    ) : (
                      <>
                        <span className="text-blue-600 font-medium">
                          Click to upload
                        </span>{" "}
                        or drag and drop
                      </>
                    )}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    PDF files only (max 20MB)
                  </p>
                </div>
              </label>
            </div>

            {/* Selected File Display */}
            {selectedFile && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <MdFilePresent className="w-10 h-10 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {selectedFile.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedFile(null)}
                    className="flex-shrink-0 p-1 hover:bg-blue-100 rounded-full transition-colors"
                  >
                    <MdClose className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Available Documents */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-blue-900 mb-3 flex items-center">
              <MdFilePresent className="w-4 h-4 mr-2" />
              Current Chapter Document
            </h4>

            {isLoadingDocs ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-xs text-blue-600 mt-2">
                  Loading documents...
                </p>
              </div>
            ) : availableDocuments.length > 0 ? (
              <div className="space-y-2">
                {availableDocuments.map((doc) => (
                  <div
                    key={doc.chapterNumber}
                    className="flex items-center justify-between p-3 bg-white border border-blue-200 rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <MdFilePresent className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium text-gray-900">
                          Chapter {doc.chapterNumber}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {(doc.size / 1024 / 1024).toFixed(2)} MB • Last
                        modified:{" "}
                        {new Date(doc.lastModified).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() =>
                          window.open(
                            `${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/Chapters/IN/${doc.filename}`,
                            "_blank"
                          )
                        }
                        className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                        disabled={isDeleting}
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleDeleteDocument(doc.chapterNumber)}
                        className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                        disabled={isDeleting}
                      >
                        {isDeleting ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-blue-600 text-center py-4">
                No document uploaded for Chapter {chapter.chapter} yet.
              </p>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-gray-200 flex space-x-3">
          <button
            onClick={onClose}
            disabled={isUploading}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={!selectedFile || isUploading}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center"
          >
            {isUploading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Uploading...
              </>
            ) : (
              <>
                <MdUploadFile className="w-5 h-5 mr-2" />
                Upload Document
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChapterDocumentUpload;
