"use client";
import Link from "next/link";
import React, { useState, useEffect, useRef } from "react";
import { HiMenu, HiX, HiChevronDown, HiSearch } from "react-icons/hi";
import { useRouter, usePathname } from "next/navigation";
import GoogleTranslate from "../GoogleTranslate";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isTrendingOpen, setIsTrendingOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const dropdownRef = useRef(null);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleNavigation = (href, sectionId = null) => {
    if (sectionId && pathname === "/") {
      // If on homepage, scroll to section
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    } else if (sectionId) {
      // If not on homepage, navigate to homepage with hash
      router.push(`/#${sectionId}`);
    } else {
      // Regular navigation
      router.push(href);
    }
    setIsMenuOpen(false);
    setIsTrendingOpen(false);
  };

  const handleTrendingToggle = () => {
    setIsTrendingOpen(!isTrendingOpen);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsTrendingOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <nav className="bg-white border-b border-gray-200 fixed w-full top-0 z-50" style={{ borderColor: 'var(--cobalt-blue)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-18">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <img
              className="h-12 w-auto"
              src="hscode.png"
              alt="HSCODE"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-6">
              <button
                onClick={() => handleNavigation("/")}
                className="px-3 py-2 text-sm font-medium flex items-center transition-colors duration-200"
                style={{ color: 'var(--cobalt-blue)' }}
                onMouseEnter={(e) => e.target.style.color = 'var(--leaf-green)'}
                onMouseLeave={(e) => e.target.style.color = 'var(--cobalt-blue)'}
              >
                Home
              </button>
              <button
                onClick={() => handleNavigation("/", "about")}
                className="px-3 py-2 text-sm font-medium flex items-center transition-colors duration-200"
                style={{ color: 'var(--cobalt-blue)' }}
                onMouseEnter={(e) => e.target.style.color = 'var(--leaf-green)'}
                onMouseLeave={(e) => e.target.style.color = 'var(--cobalt-blue)'}
              >
                About
              </button>
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={handleTrendingToggle}
                  className="px-3 py-2 text-sm font-medium flex items-center transition-colors duration-200"
                  style={{ color: 'var(--cobalt-blue)' }}
                  onMouseEnter={(e) => e.target.style.color = 'var(--leaf-green)'}
                  onMouseLeave={(e) => e.target.style.color = 'var(--cobalt-blue)'}
                >
                  Trending
                  <HiChevronDown className="ml-1 h-4 w-4" />
                </button>
                {isTrendingOpen && (
                  <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                    <button
                      onClick={() =>
                        handleNavigation("/", "featured-categories")
                      }
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Featured Categories
                    </button>
                    <button
                      onClick={() => handleNavigation("/", "news")}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Latest News
                    </button>
                  </div>
                )}
              </div>
              <button
                onClick={() => handleNavigation("/", "footer")}
                className="px-3 py-2 text-sm font-medium flex items-center transition-colors duration-200"
                style={{ color: 'var(--cobalt-blue)' }}
                onMouseEnter={(e) => e.target.style.color = 'var(--leaf-green)'}
                onMouseLeave={(e) => e.target.style.color = 'var(--cobalt-blue)'}
              >
                Contact Us
              </button>
              <Link
                href="/subscription"
                className="px-3 py-2 text-sm font-medium flex items-center transition-colors duration-200"
                style={{ color: 'var(--cobalt-blue)' }}
                onMouseEnter={(e) => e.target.style.color = 'var(--leaf-green)'}
                onMouseLeave={(e) => e.target.style.color = 'var(--cobalt-blue)'}
              >
                Subscription
              </Link>
            </div>
          </div>

          {/* Desktop Right Side */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Google Translate */}
            <GoogleTranslate />

            {/* Language Selector */}
            <div className="flex items-center cursor-pointer transition-colors duration-200"
                 style={{ color: 'var(--cobalt-blue)' }}
                 onMouseEnter={(e) => e.target.style.color = 'var(--leaf-green)'}
                 onMouseLeave={(e) => e.target.style.color = 'var(--cobalt-blue)'}>
              <span className="text-sm font-medium">EN</span>
              <HiChevronDown className="ml-1 h-4 w-4" />
            </div>

            {/* Search Icon */}
            <button className="p-2 transition-colors duration-200"
                    style={{ color: 'var(--cobalt-blue)' }}
                    onMouseEnter={(e) => e.target.style.color = 'var(--leaf-green)'}
                    onMouseLeave={(e) => e.target.style.color = 'var(--cobalt-blue)'}>
              <HiSearch className="h-5 w-5" />
            </button>

            {/* Live Demo Button */}
            <button className="border bg-white hover:bg-gray-50 px-4 py-2 rounded-md text-sm font-medium flex items-center transition-all duration-200"
                    style={{ 
                      borderColor: 'var(--cobalt-blue)',
                      color: 'var(--cobalt-blue)'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = 'var(--cobalt-blue)';
                      e.target.style.color = 'var(--brand-white)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = 'var(--brand-white)';
                      e.target.style.color = 'var(--cobalt-blue)';
                    }}>
              <svg
                className="w-4 h-4 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
              </svg>
              <Link href="/auth">Login / Signup</Link>
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? (
                <HiX className="block h-6 w-6" />
              ) : (
                <HiMenu className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={`md:hidden transition-all duration-300 ease-in-out ${
          isMenuOpen
            ? "max-h-96 opacity-100"
            : "max-h-0 opacity-0 overflow-hidden"
        }`}
      >
        <div
          className={`px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-gray-50 transform transition-transform duration-300 ease-in-out ${
            isMenuOpen ? "translate-y-0" : "-translate-y-4"
          }`}
        >
          <button
            onClick={() => handleNavigation("/")}
            className="w-full text-left text-gray-700 hover:bg-gray-200 hover:text-gray-900 px-3 py-2 rounded-md text-base font-medium transition-colors duration-200"
          >
            Home
          </button>
          <button
            onClick={() => handleNavigation("/", "about")}
            className="w-full text-left text-gray-700 hover:bg-gray-200 hover:text-gray-900 px-3 py-2 rounded-md text-base font-medium transition-colors duration-200"
          >
            About
          </button>
          <div>
            <button
              onClick={handleTrendingToggle}
              className="w-full text-left text-gray-700 hover:bg-gray-200 hover:text-gray-900 px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 flex items-center justify-between"
            >
              Trending
              <HiChevronDown className="h-4 w-4" />
            </button>
            {isTrendingOpen && (
              <div className="ml-4 mt-1 space-y-1">
                <button
                  onClick={() => handleNavigation("/", "featured-categories")}
                  className="w-full text-left text-gray-600 hover:bg-gray-200 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                >
                  Featured Categories
                </button>
                <button
                  onClick={() => handleNavigation("/", "news")}
                  className="w-full text-left text-gray-600 hover:bg-gray-200 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                >
                  Latest News
                </button>
              </div>
            )}
          </div>
          <button
            onClick={() => handleNavigation("/", "footer")}
            className="w-full text-left text-gray-700 hover:bg-gray-200 hover:text-gray-900 px-3 py-2 rounded-md text-base font-medium transition-colors duration-200"
          >
            Contact Us
          </button>
          <Link
            href="/subscription"
            className="block text-gray-700 hover:bg-gray-200 hover:text-gray-900 px-3 py-2 rounded-md text-base font-medium transition-colors duration-200"
          >
            Subscription
          </Link>
          <div className="pt-4 pb-3 border-t border-gray-200">
            <div className="flex items-center justify-between px-3">
              <div className="flex items-center text-gray-700">
                <span className="text-sm font-medium">EN</span>
                <HiChevronDown className="ml-1 h-4 w-4" />
              </div>
              <button className="text-gray-700 hover:text-gray-900 p-2">
                <HiSearch className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-3 px-3">
              <button className="w-full border border-gray-800 text-gray-800 bg-white hover:bg-gray-50 px-4 py-2 rounded-md text-sm font-medium flex items-center justify-center">
                <svg
                  className="w-4 h-4 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                </svg>
                <Link href="/auth">Login / Signup</Link>
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
