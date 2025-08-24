"use client";

import { Suspense, useEffect } from "react";
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
import useCountryCode from "@/utilities/useCountryCode";
import useHomeData from "@/utilities/useHomeData";
import ErrorBoundary from "@/component/ErrorBoundary";

function HomeContent() {
  console.log("HomeContent render", Date.now());
  const { countryInfo, loading: countryLoading } = useCountryCode();
  console.log("country code", countryInfo);
  const {
    homeData,
    loading: dataLoading,
    isFallback,
  } = useHomeData(countryInfo?.code);
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
    </ErrorBoundary>
  );
}
