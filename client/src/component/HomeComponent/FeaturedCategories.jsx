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
  const categoriesPerPage = 6;
  const totalPages = Math.ceil(categories.length / categoriesPerPage);

  const getCurrentCategories = () => {
    const startIndex = currentPage * categoriesPerPage;
    const endIndex = startIndex + categoriesPerPage;
    return categories.slice(startIndex, endIndex);
  };

  const handleSlideChange = (newPage, slideDirection = "next") => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage);
    }
  };

  const nextSlide = () => {
    handleSlideChange(currentPage + 1, "next");
  };

  const prevSlide = () => {
    handleSlideChange(currentPage - 1, "prev");
  };

  return (
    <section className="bg-white py-20 md:py-28 relative overflow-hidden montserrat">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200"></div>
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='10' cy='10' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        ></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Header */}
        <div className="text-center mb-16 md:mb-20">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-light text-gray-900 mb-6 tracking-wide">
            {title}
          </h2>
        </div>

        {/* Categories Grid */}
        <div className="relative">
          {/* Navigation Arrows */}
          {totalPages > 1 && (
            <>
              <button
                onClick={prevSlide}
                disabled={currentPage === 0}
                className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <HiChevronLeft className="w-6 h-6 text-gray-600" />
              </button>

              <button
                onClick={nextSlide}
                disabled={currentPage === totalPages - 1}
                className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <HiChevronRight className="w-6 h-6 text-gray-600" />
              </button>
            </>
          )}

          {/* Categories */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mx-16">
            {getCurrentCategories().map((category) => (
              <div
                key={category.id}
                className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 group cursor-pointer"
              >
                {/* Image */}
                <div className="relative overflow-hidden rounded-t-xl">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors duration-200">
                    {category.name}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {category.description}
                  </p>

                  {/* Explore Button */}
                  <div className="mt-4">
                    <button className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors duration-200 group">
                      Explore Category
                      <HiChevronRight className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform duration-200" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pagination Dots */}
        {totalPages > 1 && (
          <div className="flex justify-center space-x-2 mt-12">
            {Array.from({ length: totalPages }, (_, index) => (
              <button
                key={index}
                onClick={() => setCurrentPage(index)}
                className={`w-3 h-3 rounded-full transition-all duration-200 ${
                  index === currentPage
                    ? "bg-blue-600 w-8"
                    : "bg-gray-300 hover:bg-gray-400"
                }`}
              />
            ))}
          </div>
        )}

        {/* View All Categories Button */}
        <div className="text-center mt-16">
          <a
            href="/categories"
            className="inline-flex items-center px-8 py-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            View All Categories
            <HiChevronRight className="ml-2 w-5 h-5" />
          </a>
        </div>
      </div>
    </section>
  );
};

export default FeaturedCategories;
