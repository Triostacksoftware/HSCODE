"use client";
import React from 'react';

const CountrySelectionModal = ({ 
  isOpen, 
  onClose, 
  selectedCountry, 
  onConfirm, 
  currentHomeCountry 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Change Home Country
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl font-bold"
          >
            ×
          </button>
        </div>

        {/* Country Info */}
        <div className="mb-6">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-12 h-8 bg-gradient-to-br from-amber-300 to-amber-400 rounded flex items-center justify-center text-white font-bold text-xs">
              {selectedCountry?.name?.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <h4 className="font-medium text-gray-900">{selectedCountry?.name}</h4>
              <p className="text-sm text-gray-500">Country Code: {selectedCountry?.code}</p>
            </div>
          </div>
          
          {currentHomeCountry && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-700">
                <span className="font-medium">Current Home Country:</span> {currentHomeCountry.name} ({currentHomeCountry.code})
              </p>
            </div>
          )}
        </div>

        {/* Message */}
        <div className="mb-6">
          <p className="text-gray-700 mb-3">
            Would you like to make <span className="font-semibold text-amber-600">{selectedCountry?.name}</span> your home country?
          </p>
          <p className="text-sm text-gray-500">
            This will update your experience with localized content, HS codes, and country-specific information.
          </p>
        </div>

        {/* Actions */}
        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors duration-200 font-medium"
          >
            Yes, Set as Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default CountrySelectionModal;
