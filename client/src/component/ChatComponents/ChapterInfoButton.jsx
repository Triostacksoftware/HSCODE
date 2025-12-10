"use client";
import React, { useState, useRef, useEffect } from "react";
import { MdInfo, MdFilePresent } from "react-icons/md";
import axios from "axios";

const ChapterInfoButton = ({ chapter, user }) => {
  const [showFileList, setShowFileList] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [availableFiles, setAvailableFiles] = useState([]);
  const buttonRef = useRef(null);
  const fileListRef = useRef(null);



  // Close file list when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        fileListRef.current &&
        !fileListRef.current.contains(event.target) &&
        !buttonRef.current?.contains(event.target)
      ) {
        setShowFileList(false);
      }
    };

    if (showFileList) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showFileList]);


  const handleClick = async (e) => {
    e.stopPropagation(); // Prevent chapter selection

    // If files already loaded for this chapter, just toggle the list
    if (availableFiles.length > 0 || showFileList) {
      setShowFileList(!showFileList);
      return;
    }

    // Fetch files only for this specific chapter (saves bandwidth)
    if (!isLoadingFiles && user?.countryCode) {
      setIsLoadingFiles(true);
      try {
        const countryCode = user.countryCode;
        const chapterNumber = chapter.chapter;
        
        console.log("Fetching files for chapter:", { countryCode, chapterNumber });
        
        // Use chapter-specific endpoint - only fetches files for this chapter
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BASE_URL}/groups/chapter-document/${countryCode}/${chapterNumber}`,
          { withCredentials: true }
        );
        
        let files = [];
        if (response.data && response.data.files && Array.isArray(response.data.files)) {
          files = response.data.files;
          setAvailableFiles(files);
        } else {
          setAvailableFiles([]);
        }

        // Always show the file list (even if empty or single file)
        setShowFileList(true);
        setIsLoadingFiles(false);
      } catch (error) {
        console.error("Error fetching chapter files:", error);
        console.error("Error response:", error.response?.data);
        setIsLoadingFiles(false);
        setAvailableFiles([]);
        // Show the dropdown with error message instead of alert
        setShowFileList(true);
      }
    }
  };

  const openFile = (file) => {
    if (!file || !user?.countryCode) {
      console.error("Cannot open file - missing file or countryCode:", { file, user });
      return;
    }
    
    setIsLoading(true);
    try {
      // Use the same path format as admin side: file.url contains "Chapters/{countryCode}/{filename}"
      // The server returns file.url in the format "Chapters/{countryCode}/{filename}"
      let pdfPath = file.url;
      
      // If url doesn't exist, try to construct from path or filename
      if (!pdfPath) {
        if (file.path) {
          // Remove 'public/' prefix if present and convert to URL path
          pdfPath = file.path.replace(/^.*public[\/\\]/, '').replace(/\\/g, '/');
        } else if (file.filename) {
          // Construct from filename
          const countryCode = file.filename.split("_Chapter_")[0];
          pdfPath = `Chapters/${countryCode}/${file.filename}`;
        } else {
          throw new Error("No file path or filename available");
        }
      }
      
      // Ensure path doesn't start with /api/v1/ (it will be added by BASE_URL)
      pdfPath = pdfPath.replace(/^\/api\/v1\//, '');
      
      // Use the same static file serving route as admin side
      // app.js has: app.use("/api/v1/Chapters", express.static("public/Chapters"));
      const pdfUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/${pdfPath}`;
      
      console.log("Opening file:", { pdfPath, pdfUrl, file });
      
      // Open PDF in new tab (same as admin side)
      window.open(pdfUrl, "_blank");
      setShowFileList(false);
    } catch (error) {
      console.error("Error opening chapter PDF:", error);
      alert(`Unable to open chapter document: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const getFileDisplayName = (customName) => {
    // Format the custom name for display (e.g., "Export", "Import", "file_1234567890" -> "File")
    if (!customName || customName.trim() === '') return "Document";
    // If it's a timestamp-based name (legacy), return "Document"
    if (/^file_\d+$/.test(customName) || /^\d{10,}$/.test(customName)) return "Document";
    // Otherwise, capitalize first letter and replace underscores with spaces
    return customName
      .replace(/_/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <>
      <div className="relative inline-block">
        <button
          ref={buttonRef}
          onClick={handleClick}
          disabled={isLoading || isLoadingFiles}
          className={`ml-2 p-1 rounded-full transition-all duration-200 ${
            isLoading || isLoadingFiles
              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
              : "bg-gray-100 hover:bg-gray-200 hover:text-blue-700"
          }`}
          title="View chapter information"
        >
          <MdInfo className="w-3 h-3" />
        </button>

        {/* File List Dropdown */}
        {showFileList && (
          <div
            ref={fileListRef}
            className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto"
            style={{ top: "100%" }}
          >
            <div className="p-2 border-b border-gray-200">
              <div className="text-xs font-semibold text-gray-700">
                Chapter {chapter.chapter} Documents
              </div>
              <div className="text-xs text-gray-500">{chapter.heading}</div>
            </div>
            
            {isLoadingFiles ? (
              <div className="p-4 text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-xs text-gray-500 mt-2">Loading documents...</p>
              </div>
            ) : availableFiles.length > 0 ? (
              <div className="py-1">
                {availableFiles.map((file, index) => (
                  <button
                    key={file.filename || index}
                    onClick={() => openFile(file)}
                    className="w-full text-left px-3 py-2 hover:bg-blue-50 flex items-center space-x-2 transition-colors"
                  >
                    <MdFilePresent className="w-4 h-4 text-blue-600 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900">
                        {getFileDisplayName(file.customName)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {file.size ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : ''}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center">
                <MdFilePresent className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No documents available</p>
                <p className="text-xs text-gray-400 mt-1">for this chapter</p>
              </div>
            )}
          </div>
        )}

      </div>
    </>
  );
};

export default ChapterInfoButton;
