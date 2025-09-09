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
    <div className={`${className}`}>
      {showLabel && (
        <span className="text-sm font-medium text-gray-600 mr-2">
          {label}:
        </span>
      )}
      {coords ? (
        <button
          onClick={handleAddressClick}
          className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer transition-colors text-sm"
          title="Click to open in Google Maps"
        >
          {addressText}
          <span className="ml-1 text-xs text-gray-500">
            📍 {coords.latitude.toFixed(4)}, {coords.longitude.toFixed(4)}
          </span>
        </button>
      ) : (
        <span className="text-sm text-gray-700">
          {addressText}
        </span>
      )}
    </div>
  );
};

export default ClickableAddress;
