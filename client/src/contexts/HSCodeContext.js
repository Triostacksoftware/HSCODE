"use client";
import React, { createContext, useContext, useState, useCallback } from "react";

const HSCodeContext = createContext();

export const useHSCode = () => {
  const context = useContext(HSCodeContext);
  if (!context) {
    throw new Error("useHSCode must be used within an HSCodeProvider");
  }
  return context;
};

export const HSCodeProvider = ({ children }) => {
  const [hscodes, setHscodes] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userCountry, setUserCountry] = useState(null);

  // Parse CSV text to structured data
  const parseCSV = useCallback((csvText, country) => {
    try {
      const lines = csvText.split("\n").filter((line) => line.trim());
      if (lines.length === 0) return [];

      // Detect if first line is header
      const firstLine = lines[0].toLowerCase();
      console.log('firstLine', firstLine);
      const hasHeader = firstLine.includes('hscode_id') || firstLine.includes('product_description');
      console.log('hasHeader', hasHeader);
      
      if (!hasHeader) {
        console.warn('CSV does not have expected headers for HS codes');
        return [];
      }
      
      // Parse header to find column indices
      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
      const chapterIndex = headers.findIndex(h => h.toLowerCase() === 'product');
      const chapterDesc = headers.findIndex(h => h.toLowerCase() === 'product_description');
      const hs4Index = headers.findIndex(h => h.toLowerCase() === 'hs4');
      const hs4DescIndex = headers.findIndex(h => h.toLowerCase() === 'hs4desc');
      const hs6Index = headers.findIndex(h => h.toLowerCase() === 'hs6');
      const hs6DescIndex = headers.findIndex(h => h.toLowerCase() === 'hs6desc');
      const tlIndex = headers.findIndex(h => h.toLowerCase() === 'tl');
      const tldescIndex = headers.findIndex(h => h.toLowerCase() === 'tldesc');
      
      if (chapterIndex === -1 || chapterDesc === -1) {
        console.warn('Required columns not found in CSV');
        return [];
      }
      
      const dataLines = lines.slice(1);
      
      return dataLines.map((line, index) => {
        const parts = line.split(',').map(part => part.trim().replace(/"/g, ''));
        const chapter = parts[chapterIndex] || '';
        const chapterDescription = parts[chapterDesc] || ''; // Chapter name
        const hs4 = parts[hs4Index] || ''; // Group heading
        const hs4Description = parts[hs4DescIndex] || ''; // Group name
        const hs6 = parts[hs6Index] || ''; // Product HS code
        const hs6Description = parts[hs6DescIndex] || ''; // Product description
        const tl = parts[tlIndex] || ''; // item hscode
        const tldesc = parts[tldescIndex] || ''; // item description
        
        return {
          id: `${country}_${index}`,
          chapter,
          description: chapterDescription, // Keep for backward compatibility
          country,
          lineNumber: index + 2,
          // Additional HS code fields
          chapterDescription, // Chapter name
          hs4, // Group heading
          hs4Description, // Group name
          hs6, // Product HS code
          hs6Description, // Product description
          tl, // item hscode
          tldesc, // item description 
          // Searchable text for comprehensive search
          searchText: `${chapter} ${chapterDescription} ${hs4} ${hs4Description} ${hs6} ${hs6Description} ${tl} ${tldesc}`.toLowerCase()
        };
      }).filter(item => item.chapter && item.chapterDescription); // Remove empty entries
    } catch (error) {
      console.error("Error parsing CSV:", error);
      return [];
    }
  }, []);

  // Load HS codes for user's country and US
  const loadHSCodes = useCallback(
    async (userCountryCode) => {
      if (!userCountryCode) return;

      setLoading(true);
      setError(null);
      setUserCountry(userCountryCode.toUpperCase());

      try {
        // Load from user's country and US
        const countries = [userCountryCode.toUpperCase(), "US"];
        let allCodes = [];

        for (const country of countries) {
          try {
            const response = await fetch(
              `${process.env.NEXT_PUBLIC_BASE_URL}/hscodes?countryCode=${country}`
            );
            if (response.ok) {
              const csvText = await response.text();
              const parsedCodes = parseCSV(csvText, country);
              allCodes = [...allCodes, ...parsedCodes];
            }
          } catch (err) {
            console.log(`Could not load ${country} codes:`, err.message);
          }
        }

        setHscodes((prev) => ({
          ...prev,
          userCountry: userCountryCode.toUpperCase(),
          allCodes: allCodes,
        }));

        console.log(
          `Loaded ${allCodes.length} total HS codes from ${userCountryCode} and US`
        );
      } catch (error) {
        console.error("Error loading HS codes:", error);
        setError("Failed to load HS codes");
      } finally {
        setLoading(false);
      }
    },
    [parseCSV]
  );

  // Search HS codes across user's country and US
  const searchHSCodes = useCallback((searchTerm) => {
    if (!searchTerm || !hscodes.allCodes) return [];
    
    const term = searchTerm.toLowerCase();
    const results = hscodes.allCodes.filter(item => 
      // Search across all HS code fields using the comprehensive searchText
      item.searchText.includes(term) ||
      // Also search individual fields for exact matches
      item.chapter.toLowerCase().includes(term) ||
      item.chapterDescription.toLowerCase().includes(term) ||
      item.hs4.toLowerCase().includes(term) ||
      item.hs4Description.toLowerCase().includes(term) ||
      item.hs6.toLowerCase().includes(term) ||
      item.hs6Description.toLowerCase().includes(term) ||
      item.tl.toLowerCase().includes(term) ||
      item.tldesc.toLowerCase().includes(term)
    );

      return results.slice(0, 20); // Limit to first 20 results
    },
    [hscodes.allCodes]
  );

  // Get all loaded HS codes
  const getAllHSCodes = useCallback(() => {
    return hscodes.allCodes || [];
  }, [hscodes.allCodes]);

  // Get total count
  const getTotalCount = useCallback(() => {
    return hscodes.allCodes ? hscodes.allCodes.length : 0;
  }, [hscodes.allCodes]);

  // Get detailed HS code information by ID
  const getHSCodeById = useCallback((id) => {
    if (!hscodes.allCodes) return null;
    return hscodes.allCodes.find(item => item.id === id);
  }, [hscodes.allCodes]);

  // Get HS codes by chapter number
  const getHSCodesByChapter = useCallback((chapterNumber) => {
    if (!hscodes.allCodes) return [];
    return hscodes.allCodes.filter(item => item.chapter === chapterNumber);
  }, [hscodes.allCodes]);

  // Get HS codes by group (hs4)
  const getHSCodesByGroup = useCallback((groupCode) => {
    if (!hscodes.allCodes) return [];
    return hscodes.allCodes.filter(item => item.hs4 === groupCode);
  }, [hscodes.allCodes]);

  const value = {
    // State
    hscodes: hscodes.allCodes || [],
    loading,
    error,
    userCountry,

    // Actions
    loadHSCodes,
    searchHSCodes,
    getAllHSCodes,
    // Computed values
    totalCount: getTotalCount(),
    hasData: hscodes.allCodes && hscodes.allCodes.length > 0,
  };

  return (
    <HSCodeContext.Provider value={value}>{children}</HSCodeContext.Provider>
  );
};
