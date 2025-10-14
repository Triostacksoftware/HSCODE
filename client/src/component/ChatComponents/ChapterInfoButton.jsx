"use client";
import React, { useState, useRef, useEffect } from "react";
import { MdInfo } from "react-icons/md";
import axios from "axios";

const ChapterInfoButton = ({ chapter, user }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const buttonRef = useRef(null);
  const tooltipRef = useRef(null);

  // Calculate tooltip position
  useEffect(() => {
    if (showTooltip && buttonRef.current && tooltipRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect();
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;

      // Position tooltip above the button by default
      let top = buttonRect.top - tooltipRect.height - 8;
      let left = buttonRect.left + buttonRect.width / 2 - tooltipRect.width / 2;

      // Adjust if tooltip goes off screen
      if (left < 10) {
        left = 10;
      } else if (left + tooltipRect.width > viewportWidth - 10) {
        left = viewportWidth - tooltipRect.width - 10;
      }

      // If tooltip goes above viewport, position it below
      if (top < 10) {
        top = buttonRect.bottom + 8;
      }

      setTooltipPosition({ top, left });
    }
  }, [showTooltip]);

  const handleMouseEnter = () => {
    setShowTooltip(true);
  };

  const handleMouseLeave = () => {
    setShowTooltip(false);
  };

  const handleClick = async (e) => {
    e.stopPropagation(); // Prevent chapter selection

    if (isLoading) return;

    setIsLoading(true);

    try {
      // Get user's country code for the PDF path
      const countryCode = user?.countryCode || "IN"; // Default to IN if not available

      // Construct the PDF URL - using static file serving
      const pdfUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/Chapters/${countryCode}/${countryCode}_Chapter_${chapter.chapter}.pdf`;

      // Open PDF in new tab
      window.open(pdfUrl, "_blank");
    } catch (error) {
      console.error("Error opening chapter PDF:", error);
      // Show error message or fallback
      alert("Unable to open chapter document. Please try again later.");
    } finally {
      setIsLoading(false);
      setShowTooltip(false);
    }
  };

  return (
    <>
      <button
        ref={buttonRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        disabled={isLoading}
        className={`ml-2 p-1 rounded-full transition-all duration-200 ${
          isLoading
            ? "bg-gray-200 text-gray-400 cursor-not-allowed"
            : "bg-gray-100  hover:bg-gray-200 hover:text-blue-700"
        }`}
        title="View chapter information"
      >
        <MdInfo className="w-3 h-3" />
      </button>

      {/* Tooltip */}
      {showTooltip && (
        <div
          ref={tooltipRef}
          className="fixed z-50 bg-gray-900 text-white text-xs rounded-lg px-3 py-2 shadow-lg max-w-xs"
          style={{
            top: `${tooltipPosition.top}px`,
            left: `${tooltipPosition.left}px`,
            pointerEvents: "none",
          }}
        >
          <div className="font-medium mb-1">Chapter {chapter.chapter}</div>
          <div className="text-gray-300 mb-2">{chapter.heading}</div>
          <div className="text-blue-300 text-xs">
            {isLoading ? "Opening PDF..." : "Click to view chapter PDF"}
          </div>

          {/* Tooltip arrow */}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
        </div>
      )}
    </>
  );
};

export default ChapterInfoButton;
