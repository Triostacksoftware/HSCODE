"use client";
import React, { useState, useEffect } from "react";
import CountrySelectionModal from "./CountrySelectionModal";
import { useHomeCountry } from "../../contexts/HomeCountryContext";

const CountriesSection = ({
  title = "Global Community"
}) => {
  const [countries, setCountries] = useState([]);
  const [selectedLetter, setSelectedLetter] = useState("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(null);
  
  const { homeCountry, updateHomeCountry } = useHomeCountry();
  
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  useEffect(() => {
    fetch('/countries.json')
      .then(res => res.json())
      .then(data => setCountries(data))
      .catch(err => console.error('Error loading countries:', err));
  }, []);

  const filteredCountries =
    selectedLetter === "ALL"
      ? countries
      : countries.filter((country) => country.letter === selectedLetter);

  // Handle country click
  const handleCountryClick = (country) => {
    setSelectedCountry(country);
    setIsModalOpen(true);
  };

  // Handle modal confirmation
  const handleConfirmCountryChange = () => {
    if (selectedCountry) {
      updateHomeCountry(selectedCountry);
      setIsModalOpen(false);
      setSelectedCountry(null);
    }
  };

  // Close modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCountry(null);
  };

  return (
    <div className="bg-gray-50 py-16 montserrat relative z-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Title */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {title}
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            We work with businesses from countries around the world, connecting
            global buyers and sellers
          </p>
          {homeCountry && (
            <div className="mt-4 inline-block bg-amber-100 border border-amber-200 rounded-lg px-4 py-2">
              <p className="text-sm text-amber-800">
                🏠 Your Home Country: <span className="font-semibold">{homeCountry.name}</span>
              </p>
            </div>
          )}
        </div>

        {/* Alphabetical Filter */}
        <div className="mb-12">
          <div className="flex flex-wrap justify-center gap-2 md:gap-3">
            <button
              onClick={() => setSelectedLetter("ALL")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${
                selectedLetter === "ALL"
                  ? "bg-amber-600 text-white"
                  : "bg-white text-gray-700 hover:bg-amber-100 border border-gray-200"
              }`}
            >
              ALL
            </button>
            {alphabet.map((letter) => (
              <button
                key={letter}
                onClick={() => setSelectedLetter(letter)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${
                  selectedLetter === letter
                    ? "bg-amber-600 text-white"
                    : "bg-white text-gray-700 hover:bg-amber-100 border border-gray-200"
                }`}
              >
                {letter}
              </button>
            ))}
          </div>
        </div>

        {/* Countries Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
          {filteredCountries.map((country, index) => (
            <div
              key={index}
              onClick={() => handleCountryClick(country)}
              className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-lg transition-all duration-200 cursor-pointer transform hover:scale-105 hover:border-amber-300"
            >
              {/* Country Image */}
              <div className="w-full h-20 mb-3 bg-gradient-to-br from-amber-100 to-amber-200 rounded-lg flex items-center justify-center">
                {country.image ? (
                  <img
                    src={country.image}
                    alt={`${country.name} flag`}
                    className="w-full h-full object-cover rounded"
                  />
                ) : (
                  <div className="w-12 h-8 bg-gradient-to-br from-amber-300 to-amber-400 rounded flex items-center justify-center text-white font-bold text-xs">
                    {country.name.substring(0, 2).toUpperCase()}
                  </div>
                )}
              </div>

              {/* Country Name */}
              <div className="text-center">
                <h3 className="text-sm font-medium text-gray-900 truncate">
                  {country.name}
                </h3>
                {homeCountry?.code === country.code && (
                  <div className="mt-1">
                    <span className="inline-block px-2 py-1 text-xs font-medium bg-amber-600 text-white rounded">
                      Current Home
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* No Results Message */}
        {filteredCountries.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              No countries found for the selected letter.
            </p>
          </div>
        )}
      </div>

      {/* Country Selection Modal */}
      <CountrySelectionModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        selectedCountry={selectedCountry}
        onConfirm={handleConfirmCountryChange}
        currentHomeCountry={homeCountry}
      />
    </div>
  );
};

export default CountriesSection;
