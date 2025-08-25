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

      const hasHeader =
        firstLine.includes("hscode") ||
        firstLine.includes("code") ||
        firstLine.includes("hs");

      const dataLines = hasHeader ? lines.slice(1) : lines;

      return dataLines
        .map((line, index) => {
          const parts = line.split(",").map((part) => part.trim());
          const hscode = parts[0] || "";
          const description = parts.slice(1).join(",").trim() || "";

          return {
            id: `${country}_${index}`,
            hscode,
            description,
            country,
            lineNumber: hasHeader ? index + 2 : index + 1,
          };
        })
        .filter((item) => item.hscode); // Remove empty entries
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
  const searchHSCodes = useCallback(
    (searchTerm) => {
      if (!searchTerm || !hscodes.allCodes) return [];

      const term = searchTerm.toLowerCase();
      const results = hscodes.allCodes.filter(
        (item) =>
          item.hscode.toLowerCase().includes(term) ||
          item.description.toLowerCase().includes(term)
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
    return hscodes.allCodes.filter(item => item.product === chapterNumber);
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
