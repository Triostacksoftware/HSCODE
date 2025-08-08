"use client";
import React, { useState } from "react";
import { HiChevronRight, HiClock, HiEye } from "react-icons/hi";

const NewsSection = ({
  title = "LATEST NEWS",
  subtitle = "Stay updated with the latest trends and insights",
  news = [
    {
      id: 1,
      title: "Twenty Kitchen Trends in 2020",
      excerpt:
        "Architectural homebuilder is the title described by simply 45% of a series of structures that share welcomed visitors to dream a result from and...",
      image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400",
      category: "Interior",
      readTime: "5 min read",
      views: "2.5k",
      date: "Apr 15",
      size: "large", // large, medium, small
    },
    {
      id: 2,
      title: "Modern Office Design Concepts",
      excerpt:
        "Exploring the latest trends in workspace design and productivity enhancement through innovative office layouts...",
      image:
        "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400",
      category: "Business",
      readTime: "3 min read",
      views: "1.8k",
      date: "Apr 12",
      size: "medium",
    },
    {
      id: 3,
      title: "Sustainable Architecture Revolution",
      excerpt:
        "How green building practices are reshaping the construction industry and creating eco-friendly living spaces...",
      image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400",
      category: "Architecture",
      readTime: "7 min read",
      views: "3.2k",
      date: "Apr 10",
      size: "medium",
    },
    {
      id: 4,
      title: "Smart Home Technology Integration",
      excerpt:
        "The future of home automation and how IoT devices are transforming modern living experiences...",
      image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400",
      category: "Technology",
      readTime: "4 min read",
      views: "2.1k",
      date: "Apr 08",
      size: "medium",
    },
    {
      id: 5,
      title: "Minimalist Interior Design Philosophy",
      excerpt:
        "Understanding the principles of minimalism in home design and creating serene living spaces...",
      image:
        "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400",
      category: "Interior",
      readTime: "6 min read",
      views: "1.9k",
      date: "Apr 05",
      size: "large",
    },
    {
      id: 15,
      title: "new Interior Design Philosophy",
      excerpt:
        "Understanding the principles of minimalism in home design and creating serene living spaces...",
      image:
        "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400",
      category: "Interior",
      readTime: "6 min read",
      views: "1.9k",
      date: "Aug 05",
      size: "small",
    },
  ],
  viewAllLink = "/news",
}) => {
  const [hoveredCard, setHoveredCard] = useState(null);

  const getSizeClasses = (size) => {
    switch (size) {
      case "large":
        return "md:col-span-2 md:row-span-2 h-80 md:h-96";
      case "medium":
        return "md:col-span-1 md:row-span-2 h-64 md:h-80";
      case "small":
        return "md:col-span-1 md:row-span-1 h-48 md:h-60";
      default:
        return "md:col-span-1 md:row-span-1 h-48 md:h-60";
    }
  };

  const getTextSizeClasses = (size) => {
    switch (size) {
      case "large":
        return {
          title: "text-lg md:text-xl lg:text-2xl",
          excerpt: "text-sm md:text-base",
          meta: "text-xs md:text-sm",
        };
      case "medium":
        return {
          title: "text-base md:text-lg",
          excerpt: "text-xs md:text-sm",
          meta: "text-xs",
        };
      case "small":
        return {
          title: "text-sm md:text-base",
          excerpt: "text-xs hidden md:block",
          meta: "text-xs",
        };
      default:
        return {
          title: "text-sm md:text-base",
          excerpt: "text-xs",
          meta: "text-xs",
        };
    }
  };

  return (
    <div className="bg-white py-12 md:py-16 montserrat">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 relative inline-block">
            {title}
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-16 md:w-24 h-1 bg-gradient-to-r from-pink-500 to-blue-600 rounded-full"></div>
          </h2>
          {subtitle && (
            <p className="text-gray-600 text-sm md:text-base mt-4 max-w-2xl mx-auto">
              {subtitle}
            </p>
          )}
        </div>

        {/* News Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 auto-rows-min">
          {news.map((article) => {
            const textSizes = getTextSizeClasses(article.size);
            return (
              <article
                key={article.id}
                className={`${getSizeClasses(
                  article.size
                )} bg-white rounded-xl shadow-md transition-all duration-300 cursor-pointer group overflow-hidden border border-gray-200`}
                onMouseEnter={() => setHoveredCard(article.id)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <div className="relative h-full flex flex-col">
                  {/* Image Section */}
                  <div
                    className={`relative overflow-hidden ${
                      article.size === "large"
                        ? "h-2/3"
                        : article.size === "medium"
                        ? "h-1/2"
                        : "h-2/5"
                    }`}
                  >
                    <img
                      src={article.image}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                    {/* Category Badge */}
                    <div className="absolute top-3 left-3">
                      <span className="bg-blue-600 text-white text-xs font-semibold px-2 py-1 rounded-full">
                        {article.category}
                      </span>
                    </div>

                    {/* Date Badge */}
                    <div className="absolute top-3 right-3">
                      <span className="bg-white/90 text-gray-800 text-xs font-medium px-2 py-1 rounded-full">
                        {article.date}
                      </span>
                    </div>

                    {/* Hover Overlay with Read Button */}
                    <div
                      className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-all duration-300 ${
                        hoveredCard === article.id ? "opacity-100" : "opacity-0"
                      }`}
                    >
                      <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2 transform transition-all duration-300 hover:scale-105">
                        <span>Read</span>
                        <HiChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Content Section */}
                  <div className="flex-1 p-3 md:p-4 flex flex-col justify-between">
                    <div>
                      <h3
                        className={`font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors duration-300 ${textSizes.title}`}
                      >
                        {article.title}
                      </h3>

                      {article.excerpt && (
                        <p
                          className={`text-gray-600 mb-3 line-clamp-3 ${textSizes.excerpt}`}
                        >
                          {article.excerpt}
                        </p>
                      )}
                    </div>

                    {/* Meta Information */}
                    <div
                      className={`flex items-center justify-between text-gray-500 ${textSizes.meta}`}
                    >
                      <div className="flex items-center space-x-2">
                        <HiClock className="w-3 h-3 md:w-4 md:h-4" />
                        <span>{article.readTime}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <HiEye className="w-3 h-3 md:w-4 md:h-4" />
                        <span>{article.views}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {/* View All Button */}
        <div className="text-center mt-8 md:mt-12">
          <a
            href={viewAllLink}
            className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition-all duration-300 transform hover:scale-105 "
          >
            <span>View All News</span>
            <HiChevronRight className="w-5 h-5" />
          </a>
        </div>
      </div>

      {/* Custom CSS for line clamping */}
      <style jsx>{`
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default NewsSection;
