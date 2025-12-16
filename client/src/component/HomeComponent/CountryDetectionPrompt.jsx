"use client";
import React from 'react';
import { MdLocationOn, MdPublic, MdClose } from 'react-icons/md';

const CountryDetectionPrompt = ({ 
  isOpen, 
  onClose, 
  selectedCountry, 
  detectedCountry,
  onKeepSelected,
  onSwitchToDetected
}) => {
  if (!isOpen) return null;

  const getFlagUrl = (countryCode) => {
    if (!countryCode) return '';
    return `/flag_images/${countryCode.toLowerCase()}.svg`;
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-4 transform transition-all animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <MdLocationOn className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">
                Location Detected
              </h3>
              <p className="text-sm text-gray-500">
                We detected a different location
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
          >
            <MdClose className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-6">
            <p className="text-gray-700 mb-4 text-center">
              We detected that you're currently accessing from{' '}
              <span className="font-semibold text-blue-600">{detectedCountry?.name}</span>, 
              but you have <span className="font-semibold text-amber-600">{selectedCountry?.name}</span> set as your home country.
            </p>
          </div>

          {/* Country Comparison */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            {/* Selected Country */}
            <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-4 text-center">
              <div className="w-16 h-12 mx-auto mb-3 rounded-lg overflow-hidden border border-amber-300">
                <img
                  src={getFlagUrl(selectedCountry?.code)}
                  alt={`${selectedCountry?.name} flag`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    if (!e.target.nextElementSibling) {
                      const fallback = document.createElement('div');
                      fallback.className = 'w-full h-full bg-gradient-to-br from-amber-300 to-amber-400 rounded flex items-center justify-center text-white font-bold text-xs';
                      fallback.textContent = selectedCountry?.code || '??';
                      e.target.parentElement.appendChild(fallback);
                    }
                  }}
                />
              </div>
              <div className="flex items-center justify-center space-x-1 mb-2">
                <MdPublic className="w-4 h-4 text-amber-600" />
                <span className="text-xs font-medium text-amber-700">Your Selection</span>
              </div>
              <h4 className="font-semibold text-gray-900 text-sm">{selectedCountry?.name}</h4>
              <p className="text-xs text-gray-600 mt-1">{selectedCountry?.code}</p>
            </div>

            {/* Detected Country */}
            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 text-center">
              <div className="w-16 h-12 mx-auto mb-3 rounded-lg overflow-hidden border border-blue-300">
                <img
                  src={getFlagUrl(detectedCountry?.code)}
                  alt={`${detectedCountry?.name} flag`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    if (!e.target.nextElementSibling) {
                      const fallback = document.createElement('div');
                      fallback.className = 'w-full h-full bg-gradient-to-br from-blue-300 to-blue-400 rounded flex items-center justify-center text-white font-bold text-xs';
                      fallback.textContent = detectedCountry?.code || '??';
                      e.target.parentElement.appendChild(fallback);
                    }
                  }}
                />
              </div>
              <div className="flex items-center justify-center space-x-1 mb-2">
                <MdLocationOn className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-medium text-blue-700">Detected</span>
              </div>
              <h4 className="font-semibold text-gray-900 text-sm">{detectedCountry?.name}</h4>
              <p className="text-xs text-gray-600 mt-1">{detectedCountry?.code}</p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-600 text-center">
              Which country would you like to use for your experience?
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 pt-0 flex flex-col sm:flex-row gap-3 border-t border-gray-200">
          <button
            onClick={onKeepSelected}
            className="flex-1 px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-all duration-200 font-medium shadow-md hover:shadow-lg transform hover:scale-[1.02]"
          >
            Continue with {selectedCountry?.name}
          </button>
          <button
            onClick={onSwitchToDetected}
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 font-medium shadow-md hover:shadow-lg transform hover:scale-[1.02]"
          >
            Switch to {detectedCountry?.name}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CountryDetectionPrompt;

