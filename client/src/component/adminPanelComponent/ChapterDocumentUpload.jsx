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
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [fileNames, setFileNames] = useState({}); // Store custom names for each file
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
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

      console.log("Fetched all documents:", response.data);
      
      // Filter documents to show only the current chapter's documents
      const allDocuments = response.data.documents || [];
      const currentChapter = chapter.chapter.toString();
      
      console.log("Current chapter:", currentChapter);
      console.log("All documents:", allDocuments);
      
      const currentChapterDocuments = allDocuments.filter(
        (doc) => {
          const matches = doc.chapterNumber === currentChapter || 
                        doc.chapterNumber === parseInt(currentChapter) ||
                        parseInt(doc.chapterNumber) === parseInt(currentChapter);
          console.log(`Document ${doc.filename}: chapterNumber=${doc.chapterNumber}, matches=${matches}`);
          return matches;
        }
      );

      console.log("Filtered documents for chapter:", currentChapterDocuments);
      setAvailableDocuments(currentChapterDocuments);
    } catch (error) {
      console.error("Error fetching chapter documents:", error);
      setAvailableDocuments([]);
    } finally {
      setIsLoadingDocs(false);
    }
  };

  const handleDeleteDocument = async (filename, chapterNumber) => {
    if (
      !confirm(
        `Are you sure you want to delete this document for Chapter ${chapterNumber}?`
      )
    ) {
      return;
    }

    setIsDeleting(true);
    try {
      // Encode filename for URL
      const encodedFilename = encodeURIComponent(filename);
      await axios.delete(
        `${process.env.NEXT_PUBLIC_BASE_URL}/groups/chapter-document/${encodedFilename}`,
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
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const validFiles = [];
    const errors = [];

    files.forEach((file) => {
      // Validate file type
      if (file.type !== "application/pdf") {
        errors.push(`${file.name}: Only PDF files are allowed`);
        return;
      }

      // Validate file size (20MB limit)
      if (file.size > 20 * 1024 * 1024) {
        errors.push(`${file.name}: File size should be less than 20MB`);
        return;
      }

      validFiles.push(file);
    });

    if (errors.length > 0) {
      setError(errors.join("\n"));
    } else {
      setError("");
    }

    if (validFiles.length > 0) {
      setSelectedFiles((prev) => [...prev, ...validFiles]);
      // Initialize default names for new files (based on original filename or index)
      setFileNames((prev) => {
        const newNames = { ...prev };
        validFiles.forEach((file, idx) => {
          const fileIndex = prev ? Object.keys(prev).length + idx : idx;
          // Extract name from filename (remove extension) or use default
          const defaultName = file.name.replace(/\.pdf$/i, '').replace(/[^a-zA-Z0-9_-]/g, '_') || `file_${fileIndex}`;
          newNames[fileIndex] = defaultName;
        });
        return newNames;
      });
      setSuccess("");
    }

    // Reset input to allow selecting the same file again
    e.target.value = "";
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const files = Array.from(e.dataTransfer.files || []);
    if (files.length === 0) return;

    const validFiles = [];
    const errors = [];

    files.forEach((file) => {
      // Validate file type
      if (file.type !== "application/pdf") {
        errors.push(`${file.name}: Only PDF files are allowed`);
        return;
      }

      // Validate file size (20MB limit)
      if (file.size > 20 * 1024 * 1024) {
        errors.push(`${file.name}: File size should be less than 20MB`);
        return;
      }

      validFiles.push(file);
    });

    if (errors.length > 0) {
      setError(errors.join("\n"));
    } else {
      setError("");
    }

    if (validFiles.length > 0) {
      setSelectedFiles((prev) => [...prev, ...validFiles]);
      // Initialize default names for new files
      setFileNames((prev) => {
        const newNames = { ...prev };
        validFiles.forEach((file, idx) => {
          const fileIndex = prev ? Object.keys(prev).length + idx : idx;
          const defaultName = file.name.replace(/\.pdf$/i, '').replace(/[^a-zA-Z0-9_-]/g, '_') || `file_${fileIndex}`;
          newNames[fileIndex] = defaultName;
        });
        return newNames;
      });
      setSuccess("");
    }
  };

  const removeFile = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setFileNames((prev) => {
      const newNames = { ...prev };
      delete newNames[index];
      // Reindex remaining files
      const reindexed = {};
      Object.keys(newNames).forEach((key) => {
        const keyNum = parseInt(key);
        if (keyNum < index) {
          reindexed[key] = newNames[key];
        } else if (keyNum > index) {
          reindexed[keyNum - 1] = newNames[key];
        }
      });
      return reindexed;
    });
    setError("");
  };

  const clearAllFiles = () => {
    setSelectedFiles([]);
    setError("");
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      setError("Please select at least one file first");
      return;
    }

    setIsUploading(true);
    setError("");
    setSuccess("");
    setUploadProgress({});

    let successCount = 0;
    let failCount = 0;
    const errors = [];

    try {
      // Upload files sequentially
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];

        setUploadProgress((prev) => ({
          ...prev,
          [i]: { status: "uploading", fileName: file.name },
        }));

        try {
          const formData = new FormData();
          formData.append("chapterDocument", file);
          formData.append("chapterNumber", chapter.chapter);
          
          // Get custom file name for this file, or use default
          const customFileName = fileNames[i] || file.name.replace(/\.pdf$/i, '').replace(/[^a-zA-Z0-9_-]/g, '_') || `file_${i}`;
          formData.append("fileName", customFileName);

          // Debug logging
          console.log(
            `Uploading file ${i + 1}/${selectedFiles.length}:`,
            file.name,
            "with custom name:",
            customFileName
          );
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
            successCount++;
            setUploadProgress((prev) => ({
              ...prev,
              [i]: { status: "success", fileName: file.name },
            }));
          }
        } catch (error) {
          failCount++;
          const errorMsg = error.response?.data?.message || "Failed to upload";
          errors.push(`${file.name}: ${errorMsg}`);
          setUploadProgress((prev) => ({
            ...prev,
            [i]: { status: "error", fileName: file.name, error: errorMsg },
          }));
          console.error(`Error uploading ${file.name}:`, error);
        }
      }

      // Show results
      if (successCount > 0) {
        const successMsg =
          successCount === selectedFiles.length
            ? `All ${successCount} document(s) uploaded successfully!`
            : `${successCount} of ${selectedFiles.length} document(s) uploaded successfully.`;
        setSuccess(successMsg);
      }

      if (errors.length > 0) {
        setError(errors.join("\n"));
      }

      // Refresh the documents list
      await fetchAvailableDocuments();

      // Call success callback if provided
      if (onSuccess && successCount > 0) {
        onSuccess();
      }

      // Clear selected files if all uploads succeeded
      if (failCount === 0) {
        setSelectedFiles([]);
        // Close modal after delay
        setTimeout(() => {
          onClose();
        }, 2000);
      }
    } catch (error) {
      console.error("Error during upload process:", error);
      setError("An unexpected error occurred during upload");
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
              Select PDF Documents{" "}
              {selectedFiles.length > 0 && `(${selectedFiles.length} selected)`}
            </label>

            {/* Custom File Input */}
            <div className="relative">
              <input
                type="file"
                accept=".pdf,application/pdf"
                onChange={handleFileChange}
                multiple
                className="hidden"
                id="chapter-doc-upload"
              />
              <label
                htmlFor="chapter-doc-upload"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className="flex items-center justify-center w-full px-4 py-8 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all"
              >
                <div className="text-center">
                  <MdUploadFile className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">
                    {selectedFiles.length > 0 ? (
                      <span className="text-blue-600 font-medium">
                        Click to add more files
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
                    PDF files only (max 20MB per file)
                  </p>
                </div>
              </label>
            </div>

            {/* Selected Files Display */}
            {selectedFiles.length > 0 && (
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-gray-700">
                    Selected Files ({selectedFiles.length})
                  </p>
                  <button
                    onClick={clearAllFiles}
                    className="text-xs text-red-600 hover:text-red-700 font-medium"
                    disabled={isUploading}
                  >
                    Clear All
                  </button>
                </div>
                <div className="max-h-48 overflow-y-auto space-y-2">
                  {selectedFiles.map((file, index) => {
                    const progress = uploadProgress[index];
                    const customName = fileNames[index] || file.name.replace(/\.pdf$/i, '');
                    return (
                      <div
                        key={`${file.name}-${index}`}
                        className={`p-3 border rounded-lg ${
                          progress?.status === "success"
                            ? "bg-green-50 border-green-200"
                            : progress?.status === "error"
                            ? "bg-red-50 border-red-200"
                            : progress?.status === "uploading"
                            ? "bg-yellow-50 border-yellow-200"
                            : "bg-blue-50 border-blue-200"
                        }`}
                      >
                        <div className="space-y-2">
                          <div className="flex items-center space-x-3">
                            <div className="flex-shrink-0">
                              <MdFilePresent
                                className={`w-8 h-8 ${
                                  progress?.status === "success"
                                    ? "text-green-600"
                                    : progress?.status === "error"
                                    ? "text-red-600"
                                    : progress?.status === "uploading"
                                    ? "text-yellow-600"
                                    : "text-blue-600"
                                }`}
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {file.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {(file.size / 1024 / 1024).toFixed(2)} MB
                                {progress?.status === "uploading" && (
                                  <span className="ml-2 text-yellow-600">
                                    • Uploading...
                                  </span>
                                )}
                                {progress?.status === "success" && (
                                  <span className="ml-2 text-green-600">
                                    • Uploaded successfully
                                  </span>
                                )}
                                {progress?.status === "error" && (
                                  <span className="ml-2 text-red-600">
                                    • {progress.error}
                                  </span>
                                )}
                              </p>
                            </div>
                            {!isUploading && (
                              <button
                                onClick={() => removeFile(index)}
                                className="flex-shrink-0 p-1 hover:bg-blue-100 rounded-full transition-colors"
                              >
                                <MdClose className="w-5 h-5 text-gray-600" />
                              </button>
                            )}
                          </div>
                          {/* File name input */}
                          {!isUploading && (
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                File Name (e.g., Export, Import, or custom name):
                              </label>
                              <input
                                type="text"
                                value={customName}
                                onChange={(e) => {
                                  const sanitized = e.target.value.replace(/[^a-zA-Z0-9_-]/g, '_');
                                  setFileNames((prev) => ({
                                    ...prev,
                                    [index]: sanitized,
                                  }));
                                }}
                                placeholder="Export, Import, etc."
                                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                              <p className="text-xs text-gray-500 mt-1">
                                Will be saved as: Chapter_{chapter.chapter}_{customName || 'unnamed'}.pdf
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Available Documents */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-blue-900 mb-3 flex items-center">
              <MdFilePresent className="w-4 h-4 mr-2" />
              Current Chapter Document
              {availableDocuments.length !== 1 ? "s" : ""}
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
                {availableDocuments.map((doc) => {
                  // Format the custom name for display
                  const getDisplayName = (customName, filename) => {
                    if (!customName) {
                      // If no custom name, check if it's a legacy file without suffix
                      if (filename && filename.match(/^[A-Z]{2}_Chapter_\d+\.pdf$/)) {
                        return "Document";
                      }
                      return "Document";
                    }
                    // If it's a timestamp-based name (legacy), show "Document"
                    if (/^file_\d+$/.test(customName) || /^\d{10,}$/.test(customName)) {
                      return "Document";
                    }
                    // Otherwise, capitalize first letter and replace underscores with spaces
                    return customName
                      .replace(/_/g, ' ')
                      .split(' ')
                      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                      .join(' ');
                  };

                  return (
                    <div
                      key={doc.filename}
                      className="flex items-center justify-between p-3 bg-white border border-blue-200 rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <MdFilePresent className="w-4 h-4 text-blue-600" />
                          <span className="text-sm font-medium text-gray-900">
                            {getDisplayName(doc.customName, doc.filename)}
                          </span>
                          <span className="text-xs text-gray-500">
                            (Chapter {doc.chapterNumber})
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          File: {doc.filename} • {(doc.size / 1024 / 1024).toFixed(2)} MB • Last
                          modified:{" "}
                          {new Date(doc.lastModified).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            // Use doc.path which contains "Chapters/{countryCode}/{filename}"
                            // If path doesn't exist, construct from filename
                            const pdfPath =
                              doc.path ||
                              `Chapters/${doc.filename.split("_Chapter_")[0]}/${
                                doc.filename
                              }`;
                            window.open(
                              `${process.env.NEXT_PUBLIC_BASE_URL}/${pdfPath}`,
                              "_blank"
                            );
                          }}
                          className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                          disabled={isDeleting}
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleDeleteDocument(doc.filename, doc.chapterNumber)}
                          className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                          disabled={isDeleting}
                        >
                          {isDeleting ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    </div>
                  );
                })}
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
            disabled={selectedFiles.length === 0 || isUploading}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center"
          >
            {isUploading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Uploading{" "}
                {Object.keys(uploadProgress).filter(
                  (i) => uploadProgress[i]?.status === "uploading"
                ).length > 0 &&
                  `(${
                    Object.keys(uploadProgress).filter(
                      (i) => uploadProgress[i]?.status === "uploading"
                    ).length
                  }/${selectedFiles.length})`}
                ...
              </>
            ) : (
              <>
                <MdUploadFile className="w-5 h-5 mr-2" />
                Upload{" "}
                {selectedFiles.length > 0
                  ? `${selectedFiles.length} Document${
                      selectedFiles.length > 1 ? "s" : ""
                    }`
                  : "Document"}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChapterDocumentUpload;
