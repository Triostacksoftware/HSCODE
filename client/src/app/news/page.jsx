"use client";

import React, { useState, useEffect } from "react";
import { HiChevronRight, HiClock, HiEye, HiArrowLeft } from "react-icons/hi";
import Navbar from "@/component/HomeComponent/Navbar";
import Footer from "@/component/HomeComponent/Footer";
import Link from "next/link";
import axios from "axios";

const NewsPage = () => {
  const [hoveredCard, setHoveredCard] = useState(null);
  const [allNews, setAllNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      setLoading(true);
      console.log(
        "Fetching news from:",
        `${process.env.NEXT_PUBLIC_BASE_URL}/home-data/IN`
      );

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_URL}/home-data/IN`
      );

      console.log("News API response:", response.data);

      if (response.data.success && response.data.data.newsSection) {
        // Filter to only show published news and sort by newest first
        const allNews = response.data.data.newsSection.news || [];
        console.log("All news found:", allNews);

        const publishedNews = allNews
          .filter((item) => item.isPublished !== false)
          .sort((a, b) => {
            // Sort by date (newest first), then by ID (newest first)
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);
            if (dateA.getTime() !== dateB.getTime()) {
              return dateB.getTime() - dateA.getTime();
            }
            return b.id - a.id;
          });

        console.log(
          "Published news after filtering and sorting:",
          publishedNews
        );
        setAllNews(publishedNews);
      } else {
        console.log("No news section found in response");
        setAllNews([]);
      }
    } catch (error) {
      console.error("Error fetching news:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to load news articles";
      console.error("Error details:", errorMessage);
      setError(errorMessage);
      setAllNews([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={fetchNews}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Try Again
              </button>
              <Link
                href="/"
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-20 md:py-28 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='10' cy='10' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          ></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-wide text-white">
              Latest News
            </h1>
            <p className="text-lg md:text-xl max-w-3xl mx-auto leading-relaxed font-light text-gray-300">
              Stay updated with the latest trends, insights, and developments in
              architecture, design, and construction
            </p>
          </div>
        </div>
      </section>

      {/* News Grid Section */}
      <section className="py-20 md:py-28 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300"></div>
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='10' cy='10' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          ></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          {/* News Grid */}
          {allNews.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-6">📰</div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                No News Articles Yet
              </h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                We're working on bringing you the latest news and updates. Check
                back soon!
              </p>
              <div className="flex gap-3 justify-center">
                <Link
                  href="/"
                  className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <HiArrowLeft className="w-4 h-4 mr-2" />
                  Back to Home
                </Link>
                <button
                  onClick={fetchNews}
                  className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  🔄 Refresh News
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {allNews.map((item, index) => (
                <div
                  key={item.id}
                  className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 overflow-hidden"
                  onMouseEnter={() => setHoveredCard(item.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  {/* Image */}
                  <div className="relative overflow-hidden rounded-t-lg h-48">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                    />
                    <div className="absolute top-4 left-4">
                      <span
                        className="inline-block px-3 py-1 text-white text-xs font-medium rounded-full"
                        style={{ backgroundColor: "var(--leaf-green)" }}
                      >
                        {item.category}
                      </span>
                    </div>
                    <div className="absolute top-4 right-4">
                      <span className="inline-block px-3 py-1 bg-white/90 text-gray-700 text-xs font-medium rounded-full">
                        {item.date}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h3
                      className="text-xl font-semibold mb-3 line-clamp-2 transition-colors duration-200"
                      style={{ color: "var(--cobalt-blue)" }}
                      onMouseEnter={(e) =>
                        (e.target.style.color = "var(--leaf-green)")
                      }
                      onMouseLeave={(e) =>
                        (e.target.style.color = "var(--cobalt-blue)")
                      }
                    >
                      {item.title}
                    </h3>
                    <p
                      className="text-sm leading-relaxed mb-4 line-clamp-3"
                      style={{ color: "var(--brand-black)" }}
                    >
                      {item.excerpt}
                    </p>

                    {/* Read More Button */}
                    <div className="flex items-center justify-between">
                      {item.newsUrl ? (
                        <a
                          href={item.newsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center font-medium text-sm transition-colors duration-200 group"
                          style={{ color: "var(--trade-orange)" }}
                          onMouseEnter={(e) =>
                            (e.target.style.color = "#d45a1a")
                          }
                          onMouseLeave={(e) =>
                            (e.target.style.color = "var(--trade-orange)")
                          }
                        >
                          Read More
                          <HiChevronRight className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform duration-200" />
                        </a>
                      ) : (
                        <span className="inline-flex items-center text-gray-400 font-medium text-sm">
                          Read More
                          <HiChevronRight className="w-4 h-4 ml-1" />
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Load More Button (if needed for pagination) */}
          <div className="text-center mt-12">
            <button
              className="inline-flex items-center px-8 py-4 text-white font-medium rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              style={{ backgroundColor: "var(--trade-orange)" }}
              onMouseEnter={(e) => (e.target.style.backgroundColor = "#d45a1a")}
              onMouseLeave={(e) =>
                (e.target.style.backgroundColor = "var(--trade-orange)")
              }
            >
              Load More News
              <HiChevronRight className="ml-2 w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default NewsPage;
