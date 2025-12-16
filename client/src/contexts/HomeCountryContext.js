"use client";
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

const HomeCountryContext = createContext();

export const useHomeCountry = () => {
  const context = useContext(HomeCountryContext);
  if (!context) {
    throw new Error('useHomeCountry must be used within a HomeCountryProvider');
  }
  return context;
};

export const HomeCountryProvider = ({ children }) => {
  const [homeCountry, setHomeCountry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDetectionPrompt, setShowDetectionPrompt] = useState(false);
  const [detectedCountry, setDetectedCountry] = useState(null);
  const promptShownRef = useRef(false); // Track if prompt has been shown in this session

  // Load selected country from localStorage on mount
  useEffect(() => {
    // Check for new selectedCountry first
    let savedSelectedCountry = localStorage.getItem('selectedCountry');
    
    // Migration: If old homeCountry exists but selectedCountry doesn't, migrate it
    if (!savedSelectedCountry) {
      const oldHomeCountry = localStorage.getItem('homeCountry');
      if (oldHomeCountry) {
        try {
          const parsedCountry = JSON.parse(oldHomeCountry);
          localStorage.setItem('selectedCountry', oldHomeCountry);
          localStorage.removeItem('homeCountry'); // Remove old key
          savedSelectedCountry = oldHomeCountry;
          console.log('Migrated homeCountry to selectedCountry');
        } catch (error) {
          console.error('Error migrating homeCountry:', error);
          localStorage.removeItem('homeCountry');
        }
      }
    }
    
    if (savedSelectedCountry) {
      try {
        setHomeCountry(JSON.parse(savedSelectedCountry));
      } catch (error) {
        console.error('Error parsing saved selected country:', error);
        localStorage.removeItem('selectedCountry');
      }
    }
    setLoading(false);
  }, []);

  // Update home country and save to localStorage as selectedCountry
  const updateHomeCountry = (newCountry) => {
    setHomeCountry(newCountry);
    // Store as selectedCountry (user's manual choice)
    localStorage.setItem('selectedCountry', JSON.stringify(newCountry));
    
    // Don't reload the page - just update the state
    // The components will re-render automatically with the new country
  };

  // Clear home country (remove selectedCountry, will fall back to IP detected)
  const clearHomeCountry = () => {
    setHomeCountry(null);
    localStorage.removeItem('selectedCountry');
  };

  // Show detection prompt when IP country differs from selected
  const promptCountryDetection = (detected) => {
    // Only show prompt once per session
    if (promptShownRef.current) {
      console.log('📍 Prompt already shown in this session, skipping');
      return;
    }
    
    promptShownRef.current = true;
    setDetectedCountry(detected);
    setShowDetectionPrompt(true);
  };

  // Handle user choice to keep selected country
  const handleKeepSelected = () => {
    setShowDetectionPrompt(false);
    // Update ipDetectedCountry to the new detection but keep selectedCountry
    if (detectedCountry) {
      localStorage.setItem('ipDetectedCountry', JSON.stringify(detectedCountry));
    }
    setDetectedCountry(null);
    // Don't reset promptShownRef - keep it true so prompt doesn't show again this session
  };

  // Handle user choice to switch to detected country
  const handleSwitchToDetected = () => {
    if (detectedCountry) {
      updateHomeCountry(detectedCountry);
      localStorage.setItem('ipDetectedCountry', JSON.stringify(detectedCountry));
    }
    setShowDetectionPrompt(false);
    setDetectedCountry(null);
    // Don't reset promptShownRef - keep it true so prompt doesn't show again this session
  };

  const value = {
    homeCountry,
    updateHomeCountry,
    clearHomeCountry,
    loading,
    showDetectionPrompt,
    detectedCountry,
    promptCountryDetection,
    handleKeepSelected,
    handleSwitchToDetected
  };

  return (
    <HomeCountryContext.Provider value={value}>
      {children}
    </HomeCountryContext.Provider>
  );
};
