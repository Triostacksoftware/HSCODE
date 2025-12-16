"use client";

import { Suspense, useEffect, useMemo, useCallback, useRef } from "react";
import Navbar from "@/component/HomeComponent/Navbar";
import Herosection from "@/component/HomeComponent/Herosection";
import AboutSection from "@/component/HomeComponent/AboutSection";
import CountriesSection from "@/component/HomeComponent/CountriesSection";
import HSCodeSearch from "@/component/HomeComponent/HSCodeSearch";
import FeaturedCategories from "@/component/HomeComponent/FeaturedCategories";
import NewsSection from "@/component/HomeComponent/NewsSection";
import TestimonialSection from "@/component/HomeComponent/TestimonialSection";
import Stats from "@/component/HomeComponent/Stats";
import FAQSection from "@/component/HomeComponent/FAQSection";
import Footer from "@/component/HomeComponent/Footer";
import CountryDetectionPrompt from "@/component/HomeComponent/CountryDetectionPrompt";
import useCountryCode from "@/utilities/useCountryCode";
import useHomeData from "@/utilities/useHomeData";
import ErrorBoundary from "@/component/ErrorBoundary";
import { HomeCountryProvider, useHomeCountry } from "@/contexts/HomeCountryContext";

function HomeContent() {
  console.log("HomeContent render", Date.now());
  const { 
    homeCountry, 
    showDetectionPrompt, 
    detectedCountry,
    promptCountryDetection,
    handleKeepSelected,
    handleSwitchToDetected
  } = useHomeCountry();
  
  // Use ref to store callback to prevent re-renders
  const promptRef = useRef(promptCountryDetection);
  
  // Update ref when function changes
  useEffect(() => {
    promptRef.current = promptCountryDetection;
  }, [promptCountryDetection]);
  
  // Callback to trigger country detection prompt - use ref to avoid dependency issues
  const onCountryDetected = useCallback((detected, selected) => {
    // Only show prompt if user has a selected country and it differs from detected
    if (selected && detected && selected.code !== detected.code) {
      promptRef.current(detected);
    }
  }, []); // Empty deps - use ref instead
  
  const { countryInfo, loading: countryLoading } = useCountryCode(onCountryDetected);
  
  // Use home country if available, otherwise fall back to detected country
  // Memoize to prevent unnecessary recalculations
  const effectiveCountry = useMemo(() => {
    return homeCountry || countryInfo;
  }, [homeCountry, countryInfo]);
  
  console.log("country code", countryInfo);
  console.log("home country", homeCountry);
  console.log("effective country", effectiveCountry);
  
  const {
    homeData,
    loading: dataLoading,
    isFallback,
  } = useHomeData(effectiveCountry?.code);
  console.log("home data", homeData);
  console.log("heroSection data", homeData?.heroSection);

  // Handle hash-based navigation when coming from other pages
  useEffect(() => {
    const handleHashScroll = () => {
      const hash = window.location.hash.replace("#", "");
      if (hash && !countryLoading && !dataLoading) {
        setTimeout(() => {
          const element = document.getElementById(hash);
          if (element) {
            element.scrollIntoView({ behavior: "smooth" });
          }
        }, 100);
      }
    };

    handleHashScroll();
    window.addEventListener("hashchange", handleHashScroll);
    return () => window.removeEventListener("hashchange", handleHashScroll);
  }, [countryLoading, dataLoading]); // Removed homeData dependency to prevent infinite re-renders

  if (countryLoading || dataLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">
            Loading your personalized experience...
          </p>
        </div>
      </div>
    );
  }

  if (!homeData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Failed to load home page content</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Fallback Indicator */}
      {isFallback && (
        <div className="bg-blue-50 border-b border-blue-200 py-2 px-4 text-center">
          <p className="text-sm text-blue-700">
            🌍 Showing content for India (IN) as content for your location is
            not yet available
          </p>
        </div>
      )}

      {/* Country Detection Prompt Modal */}
      <CountryDetectionPrompt
        isOpen={showDetectionPrompt}
        onClose={handleKeepSelected}
        selectedCountry={homeCountry}
        detectedCountry={detectedCountry}
        onKeepSelected={handleKeepSelected}
        onSwitchToDetected={handleSwitchToDetected}
      />

      <Navbar />
      <Herosection {...(homeData.heroSection || {})} />
      <HSCodeSearch />
      <AboutSection {...(homeData.aboutSection || {})} />
      <CountriesSection />
      <FeaturedCategories {...(homeData.featuredCategories || {})} />
      <NewsSection {...(homeData.newsSection || {})} />
      <TestimonialSection {...(homeData.testimonialSection || {})} />
      <Stats {...(homeData.stats || {})} />
      <FAQSection {...(homeData.faqSection || {})} />
      <Footer {...(homeData.footer || {})} />
    </div>
  );
}

export default function Home() {
  return (
    <ErrorBoundary>
      <HomeCountryProvider>
        <Suspense
          fallback={
            <div className="min-h-screen flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading...</p>
              </div>
            </div>
          }
        >
          <HomeContent />
        </Suspense>
      </HomeCountryProvider>
    </ErrorBoundary>
  );
}
