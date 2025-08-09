"use client";
import React, { useState } from "react";
import { HiChevronLeft, HiChevronRight } from "react-icons/hi";

const FeaturedCategories = ({
  title = "FEATURED CATEGORIES",
  categories = [
    {
      id: 1,
      name: "Agriculture",
      image: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854",
      description:
        "Agricultural products, crops, and farming equipment for sustainable food production.",
    },
    {
      id: 2,
      name: "Apparel And Fashion Accessories",
      image: "https://images.unsplash.com/photo-1521334884684-d80222895322",
      description:
        "Clothing, fashion items, footwear, and accessories for all seasons and styles.",
    },
    {
      id: 3,
      name: "Construction & Real Estate",
      image: "https://images.unsplash.com/photo-1581091012184-5c7c1e2d7b5c",
      description:
        "Building materials, construction tools, and real estate properties.",
    },
    {
      id: 4,
      name: "Electronic & Electrical",
      image: "https://images.unsplash.com/photo-1518779578993-ec3579fee39f",
      description:
        "Electronics, electrical equipment, and gadgets for modern living.",
    },
    {
      id: 5,
      name: "Food & Beverages",
      image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c",
      description:
        "Fresh food products, packaged items, and beverages for all tastes.",
    },
    {
      id: 6,
      name: "Automotive & Transportation",
      image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70",
      description:
        "Cars, bikes, trucks, and transportation-related accessories.",
    },
    {
      id: 7,
      name: "Home & Garden",
      image: "https://images.unsplash.com/photo-1505691723518-36a5ac3be353",
      description: "Home improvement tools, furniture, and gardening supplies.",
    },
    {
      id: 8,
      name: "Industrial Machinery",
      image: "https://images.unsplash.com/photo-1581090464777-f3220bbe1b8b",
      description:
        "Heavy machinery, industrial tools, and manufacturing equipment.",
    },
    {
      id: 9,
      name: "Health & Medical",
      image: "https://images.unsplash.com/photo-1580281657521-94b49e4a650e",
      description:
        "Medical devices, healthcare products, and wellness equipment.",
    },
    {
      id: 10,
      name: "Sports & Entertainment",
      image: "https://images.unsplash.com/photo-1517649763962-0c623066013b",
      description: "Sports equipment, fitness gear, and entertainment items.",
    },
    {
      id: 11,
      name: "Beauty & Personal Care",
      image: "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519",
      description: "Cosmetics, skincare, haircare, and grooming essentials.",
    },
    {
      id: 12,
      name: "Toys & Hobbies",
      image: "https://images.unsplash.com/photo-1601758064137-f3b2b9c1d2a3",
      description: "Children's toys, games, and hobby-related products.",
    },
    {
      id: 13,
      name: "Books & Stationery",
      image: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f",
      description:
        "Books, office supplies, stationery, and learning materials.",
    },
    {
      id: 14,
      name: "Travel & Tourism",
      image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e",
      description: "Travel services, tourism packages, and adventure gear.",
    },
    {
      id: 15,
      name: "Jewelry & Watches",
      image: "https://images.unsplash.com/photo-1516637090014-cb1ab0d08fc7",
      description: "Fine jewelry, fashion jewelry, and luxury watches.",
    },
    {
      id: 16,
      name: "Furniture",
      image: "https://images.unsplash.com/photo-1505691938895-1758d7feb511",
      description: "Indoor and outdoor furniture for homes and offices.",
    },
    {
      id: 17,
      name: "Pet Supplies",
      image: "https://images.unsplash.com/photo-1543852786-1cf6624b9987",
      description: "Pet food, accessories, and grooming products.",
    },
    {
      id: 18,
      name: "Art & Crafts",
      image: "https://images.unsplash.com/photo-1503602642458-232111445657",
      description: "Art supplies, handmade crafts, and creative materials.",
    },
    {
      id: 19,
      name: "Music Instruments & Audio",
      image: "https://images.unsplash.com/photo-1511376777868-611b54f68947",
      description: "Musical instruments, audio gear, and sound equipment.",
    },
    {
      id: 20,
      name: "Office & Business Supplies",
      image: "https://images.unsplash.com/photo-1558655146-d09347e92766",
      description: "Office furniture, technology, and productivity tools.",
    },
  ],
}) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [direction, setDirection] = useState("next");

  const itemsPerPage = 5; // 5 items per page as shown in the image
  const totalPages = Math.ceil(categories.length / itemsPerPage);

  const getCurrentCategories = () => {
    const startIndex = currentPage * itemsPerPage;
    return categories.slice(startIndex, startIndex + itemsPerPage);
  };

  const handleSlideChange = (newPage, slideDirection = "next") => {
    if (isTransitioning || newPage === currentPage) return;

    setDirection(slideDirection);
    setIsTransitioning(true);

    setTimeout(() => {
      setCurrentPage(newPage);
      setTimeout(() => {
        setIsTransitioning(false);
      }, 50);
    }, 300);
  };

  const nextSlide = () => {
    const nextPage = currentPage === totalPages - 1 ? 0 : currentPage + 1;
    handleSlideChange(nextPage, "next");
  };

  const prevSlide = () => {
    const prevPage = currentPage === 0 ? totalPages - 1 : currentPage - 1;
    handleSlideChange(prevPage, "prev");
  };

  const currentCategories = getCurrentCategories();

  return (
    <div className="bg-gray-50 py-12 md:py-16 montserrat">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Title */}
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 relative inline-block">
            {title}
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-16 md:w-24 h-1 bg-gradient-to-r from-pink-500 to-blue-600 rounded-full"></div>
          </h2>
        </div>

        {/* Categories Slider Container */}
        <div className="relative">
          {/* Navigation Buttons */}
          <button
            onClick={prevSlide}
            disabled={isTransitioning}
            className={`absolute -left-2 md:-left-4 top-1/2 transform -translate-y-1/2 z-20 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-2 md:p-3 shadow-lg transition-all duration-300 ${
              isTransitioning
                ? "opacity-50 cursor-not-allowed"
                : "hover:scale-110 active:scale-95"
            }`}
          >
            <HiChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
          </button>

          <button
            onClick={nextSlide}
            disabled={isTransitioning}
            className={`absolute -right-2 md:-right-4 top-1/2 transform -translate-y-1/2 z-20 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-2 md:p-3 shadow-lg transition-all duration-300 ${
              isTransitioning
                ? "opacity-50 cursor-not-allowed"
                : "hover:scale-110 active:scale-95"
            }`}
          >
            <HiChevronRight className="w-5 h-5 md:w-6 md:h-6" />
          </button>

          {/* Categories Grid - Single Row */}
          <div className="mx-8 md:mx-12 overflow-hidden">
            <div
              className={`transition-all duration-500 ease-in-out transform ${
                isTransitioning
                  ? direction === "next"
                    ? "translate-x-full opacity-0"
                    : "-translate-x-full opacity-0"
                  : "translate-x-0 opacity-100"
              }`}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
                {currentCategories.map((category, index) => (
                  <div
                    key={`${currentPage}-${category.id}`}
                    className="bg-white border border-gray-200 rounded-xl p-4 md:p-6 hover:shadow-xl transition-all duration-300 cursor-pointer group transform hover:scale-105 hover:-translate-y-2"
                    style={{
                      animationDelay: `${index * 100}ms`,
                    }}
                  >
                    {/* Category Image */}
                    <div className="w-full h-32 md:h-40 mb-4 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg overflow-hidden relative">
                      {category.image ? (
                        <img
                          src={category.image}
                          alt={category.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                          <span className="text-blue-600 text-xl md:text-2xl font-bold">
                            {category.name.charAt(0)}
                          </span>
                        </div>
                      )}
                      {/* <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300"></div> */}
                    </div>

                    {/* Category Name */}
                    <h3 className="text-sm md:text-base font-semibold text-gray-900 text-center leading-tight mb-2 group-hover:text-blue-600 transition-colors duration-300">
                      {category.name}
                    </h3>

                    {/* Category Description (hidden on mobile) */}
                    {category.description && (
                      <p className="text-xs text-gray-600 text-center transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 hidden md:block">
                        {category.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Page Indicators */}
          <div className="flex justify-center mt-8 space-x-2">
            {Array.from({ length: totalPages }, (_, index) => (
              <button
                key={index}
                onClick={() => {
                  const slideDirection = index > currentPage ? "next" : "prev";
                  handleSlideChange(index, slideDirection);
                }}
                disabled={isTransitioning}
                className={`w-2 h-2 md:w-3 md:h-3 rounded-full transition-all duration-300 transform ${
                  currentPage === index
                    ? "bg-blue-600 scale-125 shadow-lg"
                    : "bg-gray-300 hover:bg-gray-400 hover:scale-110"
                } ${isTransitioning ? "pointer-events-none opacity-50" : ""}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeaturedCategories;
