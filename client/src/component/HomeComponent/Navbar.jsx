"use client";
import Link from "next/link";
import React, { useState } from "react";
import { HiMenu, HiX, HiChevronDown, HiSearch } from "react-icons/hi";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="bg-white border-b border-gray-200 fixed w-full top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-18">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <img
              className="h-16 w-auto"
              src="http://www.hscodes.com/assets/images/logo_splash_txt.png"
              alt="HSCODE"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-6">
              <a
                href="#"
                className="text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium flex items-center"
              >
                Home
                <HiChevronDown className="ml-1 h-4 w-4" />
              </a>
              <a
                href="#"
                className="text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium flex items-center"
              >
                About
                <HiChevronDown className="ml-1 h-4 w-4" />
              </a>
              <a
                href="#"
                className="text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium flex items-center"
              >
                Trending
                <HiChevronDown className="ml-1 h-4 w-4" />
              </a>
              <a
                href="#"
                className="text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium flex items-center"
              >
                Contact Us
                <HiChevronDown className="ml-1 h-4 w-4" />
              </a>
              <a
                href="#"
                className="text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium flex items-center"
              >
                Subscription
                <HiChevronDown className="ml-1 h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Desktop Right Side */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Language Selector */}
            <div className="flex items-center text-gray-700 hover:text-gray-900 cursor-pointer">
              <span className="text-sm font-medium">EN</span>
              <HiChevronDown className="ml-1 h-4 w-4" />
            </div>

            {/* Search Icon */}
            <button className="text-gray-700 hover:text-gray-900 p-2">
              <HiSearch className="h-5 w-5" />
            </button>

            {/* Live Demo Button */}
            <button className="border border-gray-800 text-gray-800 bg-white hover:bg-gray-50 px-4 py-2 rounded-md text-sm font-medium flex items-center">
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
          <a
            href="#"
            className="text-gray-700 hover:bg-gray-200 hover:text-gray-900  px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 flex items-center justify-between"
          >
            Home
            <HiChevronDown className="h-4 w-4" />
          </a>
          <a
            href="#"
            className="text-gray-700 hover:bg-gray-200 hover:text-gray-900  px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 flex items-center justify-between"
          >
            About
            <HiChevronDown className="h-4 w-4" />
          </a>
          <a
            href="#"
            className="text-gray-700 hover:bg-gray-200 hover:text-gray-900  px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 flex items-center justify-between"
          >
            Trending
            <HiChevronDown className="h-4 w-4" />
          </a>
          <a
            href="#"
            className="text-gray-700 hover:bg-gray-200 hover:text-gray-900  px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 flex items-center justify-between"
          >
            Contact Us
            <HiChevronDown className="h-4 w-4" />
          </a>
          <a
            href="#"
            className="text-gray-700 hover:bg-gray-200 hover:text-gray-900  px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 flex items-center justify-between"
          >
            Subscription
            <HiChevronDown className="h-4 w-4" />
          </a>
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
