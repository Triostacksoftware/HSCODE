"use client";
import React from 'react';

const ClickableAddress = ({ 
  address, 
  coordinates, 
  label = "Address",
  className = "",
  showLabel = true 
}) => {
  // Extract coordinates from address if they exist in the format "address (lat, lng)"
  const extractCoordinates = (addr) => {
    if (!addr) return null;
    
    // Look for pattern like "address (28.123456, 77.123456)"
    const coordMatch = addr.match(/\(([+-]?\d+\.?\d*),\s*([+-]?\d+\.?\d*)\)$/);
    if (coordMatch) {
      return {
        latitude: parseFloat(coordMatch[1]),
        longitude: parseFloat(coordMatch[2])
      };
    }
    
    return null;
  };

  // Get coordinates from props or extract from address
  const coords = coordinates || extractCoordinates(address);

  // Create Google Maps URL
  const createGoogleMapsUrl = (lat, lng) => {
    return `https://www.google.com/maps?q=${lat},${lng}`;
  };

  // Handle click to open Google Maps
  const handleAddressClick = (e) => {
    if (coords) {
      e.preventDefault();
      const mapsUrl = createGoogleMapsUrl(coords.latitude, coords.longitude);
      window.open(mapsUrl, '_blank', 'noopener,noreferrer');
    }
  };

  // Clean address text (remove coordinates part)
  const cleanAddress = (addr) => {
    if (!addr) return "";
    // Remove coordinates part from address text
    return addr.replace(/\s*\([+-]?\d+\.?\d*,\s*[+-]?\d+\.?\d*\)$/, '');
  };

  const addressText = cleanAddress(address);

  if (!addressText) return null;

  return (
    <div className={`w-full ${className}`}>
      <div className="flex items-center gap-1 w-full">
        {showLabel && (
          <span className="text-sm font-medium text-gray-600">
            {label}
          </span>
        )}
        <span className="text-sm text-gray-700 flex-1">
          {addressText}
        </span>
      </div>
      {coords && (
        <button
          onClick={handleAddressClick}
          className="text-blue-600 hover:text-blue-800 cursor-pointer transition-colors text-xs mt-1 flex items-center gap-1 w-full justify-start"
          title="View on map"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          View on map
        </button>
      )}
    </div>
  );
};

export default ClickableAddress;
