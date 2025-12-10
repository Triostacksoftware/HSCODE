"use client";
import React, { useState } from "react";

const ChapterImage = ({ chapterNumber, className = "w-full h-full object-cover" }) => {
  const [imgSrc, setImgSrc] = useState(`/chapter_imgs/${chapterNumber}.png`);
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    if (imgSrc.endsWith('.png')) {
      // Try .jpg if .png fails
      setImgSrc(`/chapter_imgs/${chapterNumber}.jpg`);
    } else {
      // Both failed, show fallback
      setHasError(true);
    }
  };

  if (hasError) {
    return (
      <span className="text-sm text-gray-600 font-medium">
        {chapterNumber}
      </span>
    );
  }

  return (
    <img
      src={imgSrc}
      alt={`Chapter ${chapterNumber}`}
      className={className}
      onError={handleError}
    />
  );
};

export default ChapterImage;

