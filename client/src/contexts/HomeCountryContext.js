"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';

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

  // Load home country from localStorage on mount
  useEffect(() => {
    const savedCountry = localStorage.getItem('homeCountry');
    if (savedCountry) {
      try {
        setHomeCountry(JSON.parse(savedCountry));
      } catch (error) {
        console.error('Error parsing saved home country:', error);
        localStorage.removeItem('homeCountry');
      }
    }
    setLoading(false);
  }, []);

  // Update home country and save to localStorage
  const updateHomeCountry = (newCountry) => {
    setHomeCountry(newCountry);
    localStorage.setItem('homeCountry', JSON.stringify(newCountry));
    
    // Trigger a page reload to update all content
    window.location.reload();
  };

  // Clear home country
  const clearHomeCountry = () => {
    setHomeCountry(null);
    localStorage.removeItem('homeCountry');
  };

  const value = {
    homeCountry,
    updateHomeCountry,
    clearHomeCountry,
    loading
  };

  return (
    <HomeCountryContext.Provider value={value}>
      {children}
    </HomeCountryContext.Provider>
  );
};
