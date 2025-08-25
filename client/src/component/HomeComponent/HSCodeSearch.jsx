"use client";
import React, { useState, useEffect } from "react";
import { useHSCode } from "../../contexts/HSCodeContext";
import useCountryCode from "../../utilities/useCountryCode";

const HSCodeSearch = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  const {
    hscodes,
    loading,
    error,
    userCountry,
    loadHSCodes,
    searchHSCodes,
    totalCount,
    hasData,
  } = useHSCode();

  const { countryInfo } = useCountryCode();

  // Load HS codes when component mounts and country is detected
  useEffect(() => {
    if (countryInfo?.code && !hasData) {
      loadHSCodes(countryInfo.code);
    }
  }, [countryInfo?.code, hasData, loadHSCodes]);

  // Search HS codes
  const handleSearch = (term) => {
    setSearchTerm(term);

    if (!term.trim()) {
      setSearchResults([]);
      return;
    }

    const results = searchHSCodes(term);
    setSearchResults(results);
  };

  // Handle search input change
  const handleInputChange = (e) => {
    const value = e.target.value;
    handleSearch(value);
  };

  // Clear search
  const clearSearch = () => {
    setSearchTerm("");
    setSearchResults([]);
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 bg-white">
      {/* Search Input */}
      <div className="relative mb-6 flex flex-col items-center">
        <div className="relative min-w-3xl">
          <input
            type="text"
            placeholder="Search by HS code or description..."
            value={searchTerm}
            onChange={handleInputChange}
            className="w-full px-6 py-4 text-lg border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none shadow-sm"
          />
          {searchTerm && (
            <button
              onClick={clearSearch}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          )}
        </div>

        {/* Loading indicator */}
        {loading && (
          <div className="text-center mt-4">
            <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Loading HS codes...</span>
          </div>
        )}
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6 text-center">
          {error}
        </div>
      )}

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b">
            <h3 className="text-lg font-semibold text-gray-900">
              Search Results ({searchResults.length} found)
            </h3>
            {searchResults.length === 20 && (
              <p className="text-sm text-gray-600 mt-1">
                Showing first 20 results. Refine your search for more specific
                results.
              </p>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {searchResults.map((item) => (
              <div
                key={item.id}
                className="px-6 py-4 border-5 border-gray-900 hover:bg-gray-50"
              >
                {console.log(item)}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-mono text-lg font-bold text-blue-600">
                        {item.tl}
                      </span>
                      <span className="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded">
                        {item.country}
                      </span>
                    </div>
                    
                    {/* Chapter Information */}
                    <div className="mb-2">
                      <span className="text-sm font-medium text-gray-600">Chapter {item.product}: </span>
                      <span className="text-gray-700">{item.productDescription}</span>
                    </div>

                    {/* Product Information */}
                    {item.hs4 && (
                      <div className="mb-2">
                        <span className="text-sm font-medium text-gray-600">Group {item.hs4}: </span>
                        <span className="text-gray-700">{item.hs4Description}</span>
                      </div>
                    )}
                    
                    {/* Product Information */}
                    {item.hs6 && (
                      <div className="mb-2">
                        <span className="text-sm font-medium text-gray-600">Product {item.hs6}: </span>
                        <span className="text-gray-700">{item.hs6Description}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No results */}
      {searchTerm && searchResults.length === 0 && !loading && (
        <div className="text-center py-8">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-medium text-gray-900 mb-2">
            No results found
          </h3>
          <p className="text-gray-600">
            Try searching with different keywords or check your spelling
          </p>
        </div>
      )}

      {/* Initial state */}
      {!searchTerm && !loading && (
        <div className="text-center py-8">
          <div className="text-6xl mb-4">📋</div>
          <h3 className="text-xl font-medium text-gray-900 mb-2">
            Ready to search
          </h3>
          <p className="text-gray-600">
            Enter an HS code or description to find matching items
          </p>
        </div>
      )}

      {/* Stats */}
      {!loading && hasData && (
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            Loaded {totalCount.toLocaleString()} HS codes from {userCountry} and
            US
          </p>
        </div>
      )}
    </div>
  );
};

export default HSCodeSearch;
