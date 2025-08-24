"use client";
import React, { useState } from 'react';
import { useHSCode } from './HSCodeContext';
import { useHSCodeExtended } from './useHSCodeHook';

const HSCodeExample = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedChapter, setSelectedChapter] = useState('');
  
  // Basic context usage
  const {
    hscodes,
    loading,
    error,
    availableCountries,
    selectedCountry,
    fetchHSCodes,
    downloadHSCodes,
    searchHSCodes,
    clearHSCodes,
    setSelectedCountry,
    currentCountryCodes,
    hasData
  } = useHSCode();

  // Extended hook usage
  const {
    getHSCodeInfo,
    getHSCodesBySection,
    getHSCodesByRange,
    exportToJSON,
    getStatistics
  } = useHSCodeExtended();

  // Search functionality
  const filteredCodes = searchHSCodes(selectedCountry, searchTerm);
  
  // Get statistics for current country
  const stats = selectedCountry ? getStatistics(selectedCountry) : null;

  const handleCountrySelect = async (countryCode) => {
    if (countryCode === selectedCountry) return;
    
    if (hscodes[countryCode]) {
      // Data already loaded, just select
      setSelectedCountry(countryCode);
    } else {
      // Fetch new data
      await fetchHSCodes(countryCode);
    }
  };

  const handleDownload = async () => {
    if (selectedCountry) {
      await downloadHSCodes(selectedCountry);
    }
  };

  const handleExportJSON = () => {
    if (selectedCountry) {
      exportToJSON(selectedCountry);
    }
  };

  const handleClear = () => {
    clearHSCodes(selectedCountry);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">HS Code Manager</h1>
      
      {/* Country Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Select Country:</label>
        <select
          value={selectedCountry || ''}
          onChange={(e) => handleCountrySelect(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md"
        >
          <option value="">Choose a country...</option>
          {availableCountries.map(country => (
            <option key={country} value={country}>
              {country} {hscodes[country] ? `(${hscodes[country].length} codes)` : ''}
            </option>
          ))}
        </select>
      </div>

      {/* Actions */}
      {selectedCountry && (
        <div className="flex gap-2 mb-6">
          <button
            onClick={handleDownload}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            Download CSV
          </button>
          <button
            onClick={handleExportJSON}
            disabled={loading}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
          >
            Export JSON
          </button>
          <button
            onClick={handleClear}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Clear Data
          </button>
        </div>
      )}

      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-100 p-4 rounded-md text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.totalCodes}</div>
            <div className="text-sm text-gray-600">Total Codes</div>
          </div>
          <div className="bg-gray-100 p-4 rounded-md text-center">
            <div className="text-2xl font-bold text-green-600">{stats.sections}</div>
            <div className="text-sm text-gray-600">Sections</div>
          </div>
          <div className="bg-gray-100 p-4 rounded-md text-center">
            <div className="text-2xl font-bold text-purple-600">{stats.chapters}</div>
            <div className="text-sm text-gray-600">Chapters</div>
          </div>
          <div className="bg-gray-100 p-4 rounded-md text-center">
            <div className="text-2xl font-bold text-orange-600">{stats.averageDescriptionLength}</div>
            <div className="text-sm text-gray-600">Avg Description Length</div>
          </div>
        </div>
      )}

      {/* Search */}
      {selectedCountry && (
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search HS codes or descriptions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        </div>
      )}

      {/* Chapter Filter */}
      {selectedCountry && (
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Filter by Chapter:</label>
          <select
            value={selectedChapter}
            onChange={(e) => setSelectedChapter(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
          >
            <option value="">All Chapters</option>
            {Array.from(new Set(currentCountryCodes.map(item => 
              item.hscode.substring(0, 2)
            ))).sort().map(chapter => (
              <option key={chapter} value={chapter}>
                Chapter {chapter}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading HS codes...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Results */}
      {selectedCountry && !loading && (
        <div>
          <h2 className="text-xl font-semibold mb-4">
            {selectedCountry} HS Codes 
            {searchTerm && ` - Search: "${searchTerm}"`}
            {selectedChapter && ` - Chapter ${selectedChapter}`}
            <span className="text-gray-500 ml-2">
              ({filteredCodes.length} results)
            </span>
          </h2>

          {/* Results Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-300">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-2 border-b text-left">HS Code</th>
                  <th className="px-4 py-2 border-b text-left">Description</th>
                  <th className="px-4 py-2 border-b text-left">Line</th>
                </tr>
              </thead>
              <tbody>
                {filteredCodes
                  .filter(item => !selectedChapter || item.hscode.startsWith(selectedChapter))
                  .slice(0, 100) // Limit to first 100 for performance
                  .map((item, index) => (
                    <tr key={item.id} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                      <td className="px-4 py-2 border-b font-mono">{item.hscode}</td>
                      <td className="px-4 py-2 border-b">{item.description}</td>
                      <td className="px-4 py-2 border-b text-gray-500">{item.lineNumber}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
            
            {filteredCodes.length > 100 && (
              <p className="text-sm text-gray-500 mt-2 text-center">
                Showing first 100 results. Use search to find specific codes.
              </p>
            )}
          </div>
        </div>
      )}

      {/* No Data State */}
      {!selectedCountry && !loading && (
        <div className="text-center py-12 text-gray-500">
          <div className="text-6xl mb-4">📋</div>
          <h3 className="text-xl font-medium mb-2">No Country Selected</h3>
          <p>Choose a country from the dropdown above to view HS codes</p>
        </div>
      )}
    </div>
  );
};

export default HSCodeExample;
