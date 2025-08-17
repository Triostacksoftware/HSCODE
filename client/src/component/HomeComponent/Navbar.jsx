"use client";
import Link from "next/link";
import React, { useState, useEffect, useRef } from "react";
import { HiMenu, HiX, HiChevronDown, HiSearch } from "react-icons/hi";
import { useRouter, usePathname } from "next/navigation";
import GoogleTranslate from "../GoogleTranslate";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isTrendingOpen, setIsTrendingOpen] = useState(false);
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const router = useRouter();
  const pathname = usePathname();
  const dropdownRef = useRef(null);
  const languageDropdownRef = useRef(null);

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

  const handleLanguageToggle = () => {
    setIsLanguageOpen(!isLanguageOpen);
  };

  const handleLanguageSelect = (language) => {
    setSelectedLanguage(language);
    setIsLanguageOpen(false);
    
    // Change Google Translate language
    if (window.changeGoogleTranslateLanguage) {
      window.changeGoogleTranslateLanguage(language);
    }
    
    // You can also add additional language change logic here
    // For example, update app locale, store in localStorage, etc.
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsTrendingOpen(false);
      }
      if (languageDropdownRef.current && !languageDropdownRef.current.contains(event.target)) {
        setIsLanguageOpen(false);
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
            <GoogleTranslate onLanguageChange={handleLanguageSelect} />

            {/* Language Selector */}
            <div className="relative" ref={languageDropdownRef}>
              <button
                onClick={handleLanguageToggle}
                className="flex items-center cursor-pointer transition-colors duration-200"
                style={{ color: 'var(--cobalt-blue)' }}
                onMouseEnter={(e) => e.target.style.color = 'var(--leaf-green)'}
                onMouseLeave={(e) => e.target.style.color = 'var(--cobalt-blue)'}
              >
                <span className="text-sm font-medium">
                  {selectedLanguage === "en" ? "EN" : 
                   selectedLanguage === "hi" ? "HI" :
                   selectedLanguage === "fr" ? "FR" :
                   selectedLanguage === "es" ? "ES" :
                   selectedLanguage === "de" ? "DE" :
                   selectedLanguage === "it" ? "IT" :
                   selectedLanguage === "pt" ? "PT" :
                   selectedLanguage === "ru" ? "RU" :
                   selectedLanguage === "ja" ? "JA" :
                   selectedLanguage === "ko" ? "KO" :
                   selectedLanguage === "zh-CN" || selectedLanguage === "zh-TW" ? "ZH" :
                   selectedLanguage === "ar" ? "AR" :
                   selectedLanguage === "tr" ? "TR" :
                   selectedLanguage === "nl" ? "NL" :
                   selectedLanguage === "pl" ? "PL" :
                   selectedLanguage === "sv" ? "SV" :
                   selectedLanguage === "da" ? "DA" :
                   selectedLanguage === "no" ? "NO" :
                   selectedLanguage === "fi" ? "FI" :
                   selectedLanguage === "cs" ? "CS" :
                   selectedLanguage === "hu" ? "HU" :
                   selectedLanguage === "ro" ? "RO" :
                   selectedLanguage === "sk" ? "SK" :
                   selectedLanguage === "sl" ? "SL" :
                   selectedLanguage === "bg" ? "BG" :
                   selectedLanguage === "hr" ? "HR" :
                   selectedLanguage === "el" ? "EL" :
                   selectedLanguage === "et" ? "ET" :
                   selectedLanguage === "lv" ? "LV" :
                   selectedLanguage === "lt" ? "LT" :
                   selectedLanguage === "mt" ? "MT" :
                   selectedLanguage === "th" ? "TH" :
                   selectedLanguage === "vi" ? "VI" :
                   selectedLanguage === "id" ? "ID" :
                   selectedLanguage === "ms" ? "MS" :
                   selectedLanguage === "tl" ? "TL" :
                   selectedLanguage === "bn" ? "BN" :
                   selectedLanguage === "ta" ? "TA" :
                   selectedLanguage === "te" ? "TE" :
                   selectedLanguage === "kn" ? "KN" :
                   selectedLanguage === "ml" ? "ML" :
                   selectedLanguage === "gu" ? "GU" :
                   selectedLanguage === "pa" ? "PA" :
                   selectedLanguage === "mr" ? "MR" :
                   selectedLanguage === "or" ? "OR" :
                   selectedLanguage === "as" ? "AS" :
                   selectedLanguage === "ne" ? "NE" :
                   selectedLanguage === "si" ? "SI" :
                   selectedLanguage === "my" ? "MY" :
                   selectedLanguage === "km" ? "KM" :
                   selectedLanguage === "lo" ? "LO" :
                   selectedLanguage === "ka" ? "KA" :
                   selectedLanguage === "hy" ? "HY" :
                   selectedLanguage === "az" ? "AZ" :
                   selectedLanguage === "kk" ? "KK" :
                   selectedLanguage === "ky" ? "KY" :
                   selectedLanguage === "uz" ? "UZ" :
                   selectedLanguage === "tg" ? "TG" :
                   selectedLanguage === "fa" ? "FA" :
                   selectedLanguage === "ur" ? "UR" :
                   selectedLanguage === "he" || selectedLanguage === "iw" ? "HE" :
                   selectedLanguage === "yi" ? "YI" :
                   selectedLanguage === "am" ? "AM" :
                   selectedLanguage === "sw" ? "SW" :
                   selectedLanguage === "zu" ? "ZU" :
                   selectedLanguage === "af" ? "AF" :
                   selectedLanguage === "sq" ? "SQ" :
                   selectedLanguage === "be" ? "BE" :
                   selectedLanguage === "bs" ? "BS" :
                   selectedLanguage === "ca" ? "CA" :
                   selectedLanguage === "cy" ? "CY" :
                   selectedLanguage === "eu" ? "EU" :
                   selectedLanguage === "fo" ? "FO" :
                   selectedLanguage === "gl" ? "GL" :
                   selectedLanguage === "is" ? "IS" :
                   selectedLanguage === "ga" ? "GA" :
                   selectedLanguage === "mk" ? "MK" :
                   selectedLanguage === "mn" ? "MN" :
                   selectedLanguage === "sr" ? "SR" :
                   selectedLanguage === "uk" ? "UK" :
                   selectedLanguage === "jw" ? "JW" :
                   selectedLanguage === "co" ? "CO" :
                   selectedLanguage === "fy" ? "FY" :
                   selectedLanguage === "gd" ? "GD" :
                   selectedLanguage === "ht" ? "HT" :
                   selectedLanguage === "lb" ? "LB" :
                   selectedLanguage === "mi" ? "MI" :
                   selectedLanguage === "ny" ? "NY" :
                   selectedLanguage === "sm" ? "SM" :
                   selectedLanguage === "sn" ? "SN" :
                   selectedLanguage === "so" ? "SO" :
                   selectedLanguage === "st" ? "ST" :
                   selectedLanguage === "su" ? "SU" :
                   selectedLanguage === "xh" ? "XH" :
                   selectedLanguage === "yo" ? "YO" :
                   selectedLanguage.toUpperCase()}
                </span>
                <HiChevronDown className={`ml-1 h-4 w-4 transition-transform duration-200 ${isLanguageOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {/* Language Dropdown */}
              {isLanguageOpen && (
                <div className="absolute top-full right-0 mt-2 w-64 bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-96 overflow-y-auto">
                  {[
                    { code: "en", name: "English" },
                    { code: "hi", name: "हिंदी (Hindi)" },
                    { code: "fr", name: "Français (French)" },
                    { code: "es", name: "Español (Spanish)" },
                    { code: "de", name: "Deutsch (German)" },
                    { code: "it", name: "Italiano (Italian)" },
                    { code: "pt", name: "Português (Portuguese)" },
                    { code: "ru", name: "Русский (Russian)" },
                    { code: "ja", name: "日本語 (Japanese)" },
                    { code: "ko", name: "한국어 (Korean)" },
                    { code: "zh-CN", name: "中文 (Chinese Simplified)" },
                    { code: "zh-TW", name: "繁體中文 (Chinese Traditional)" },
                    { code: "ar", name: "العربية (Arabic)" },
                    { code: "tr", name: "Türkçe (Turkish)" },
                    { code: "nl", name: "Nederlands (Dutch)" },
                    { code: "pl", name: "Polski (Polish)" },
                    { code: "sv", name: "Svenska (Swedish)" },
                    { code: "da", name: "Dansk (Danish)" },
                    { code: "no", name: "Norsk (Norwegian)" },
                    { code: "fi", name: "Suomi (Finnish)" },
                    { code: "cs", name: "Čeština (Czech)" },
                    { code: "hu", name: "Magyar (Hungarian)" },
                    { code: "ro", name: "Română (Romanian)" },
                    { code: "sk", name: "Slovenčina (Slovak)" },
                    { code: "sl", name: "Slovenščina (Slovenian)" },
                    { code: "bg", name: "Български (Bulgarian)" },
                    { code: "hr", name: "Hrvatski (Croatian)" },
                    { code: "el", name: "Ελληνικά (Greek)" },
                    { code: "et", name: "Eesti (Estonian)" },
                    { code: "lv", name: "Latviešu (Latvian)" },
                    { code: "lt", name: "Lietuvių (Lithuanian)" },
                    { code: "mt", name: "Malti (Maltese)" },
                    { code: "th", name: "ไทย (Thai)" },
                    { code: "vi", name: "Tiếng Việt (Vietnamese)" },
                    { code: "id", name: "Bahasa Indonesia (Indonesian)" },
                    { code: "ms", name: "Bahasa Melayu (Malay)" },
                    { code: "tl", name: "Tagalog (Filipino)" },
                    { code: "bn", name: "বাংলা (Bengali)" },
                    { code: "ta", name: "தமிழ் (Tamil)" },
                    { code: "te", name: "తెలుగు (Telugu)" },
                    { code: "kn", name: "ಕನ್ನಡ (Kannada)" },
                    { code: "ml", name: "മലയാളം (Malayalam)" },
                    { code: "gu", name: "ગુજરાતી (Gujarati)" },
                    { code: "pa", name: "ਪੰਜਾਬੀ (Punjabi)" },
                    { code: "mr", name: "मराठी (Marathi)" },
                    { code: "or", name: "ଓଡ଼ିଆ (Odia)" },
                    { code: "as", name: "অসমীয়া (Assamese)" },
                    { code: "ne", name: "नेपाली (Nepali)" },
                    { code: "si", name: "සිංහල (Sinhala)" },
                    { code: "my", name: "မြန်မာ (Myanmar)" },
                    { code: "km", name: "ខ្មែរ (Khmer)" },
                    { code: "lo", name: "ລາວ (Lao)" },
                    { code: "ka", name: "ქართული (Georgian)" },
                    { code: "hy", name: "Հայերեն (Armenian)" },
                    { code: "az", name: "Azərbaycan (Azerbaijani)" },
                    { code: "kk", name: "Қазақ (Kazakh)" },
                    { code: "ky", name: "Кыргызча (Kyrgyz)" },
                    { code: "uz", name: "O'zbek (Uzbek)" },
                    { code: "tg", name: "Тоҷикӣ (Tajik)" },
                    { code: "fa", name: "فارسی (Persian)" },
                    { code: "ur", name: "اردو (Urdu)" },
                    { code: "he", name: "עברית (Hebrew)" },
                    { code: "yi", name: "יידיש (Yiddish)" },
                    { code: "am", name: "አማርኛ (Amharic)" },
                    { code: "sw", name: "Kiswahili (Swahili)" },
                    { code: "zu", name: "isiZulu (Zulu)" },
                    { code: "af", name: "Afrikaans" },
                    { code: "sq", name: "Shqip (Albanian)" },
                    { code: "be", name: "Беларуская (Belarusian)" },
                    { code: "bs", name: "Bosanski (Bosnian)" },
                    { code: "ca", name: "Català (Catalan)" },
                    { code: "cy", name: "Cymraeg (Welsh)" },
                    { code: "eu", name: "Euskara (Basque)" },
                    { code: "fo", name: "Føroyskt (Faroese)" },
                    { code: "gl", name: "Galego (Galician)" },
                    { code: "is", name: "Íslenska (Icelandic)" },
                    { code: "ga", name: "Gaeilge (Irish)" },
                    { code: "mk", name: "Македонски (Macedonian)" },
                    { code: "mn", name: "Монгол (Mongolian)" },
                    { code: "sr", name: "Српски (Serbian)" },
                    { code: "uk", name: "Українська (Ukrainian)" },
                    { code: "iw", name: "עברית (Hebrew)" },
                    { code: "jw", name: "Jawa (Javanese)" },
                    { code: "co", name: "Corsu (Corsican)" },
                    { code: "fy", name: "Frysk (Frisian)" },
                    { code: "gd", name: "Gàidhlig (Scottish Gaelic)" },
                    { code: "ht", name: "Kreyòl Ayisyen (Haitian Creole)" },
                    { code: "lb", name: "Lëtzebuergesch (Luxembourgish)" },
                    { code: "mi", name: "Te Reo Māori (Maori)" },
                    { code: "ny", name: "Chichewa (Chichewa)" },
                    { code: "sm", name: "Gagana Samoa (Samoan)" },
                    { code: "sn", name: "chiShona (Shona)" },
                    { code: "so", name: "Soomaaliga (Somali)" },
                    { code: "st", name: "Sesotho (Southern Sotho)" },
                    { code: "su", name: "Basa Sunda (Sundanese)" },
                    { code: "xh", name: "isiXhosa (Xhosa)" },
                    { code: "yo", name: "Yorùbá (Yoruba)" }
                  ].map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => handleLanguageSelect(lang.code)}
                      className={`w-full text-left px-4 py-2 text-sm transition-colors duration-200 ${
                        selectedLanguage === lang.code
                          ? 'bg-blue-50 text-blue-600'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {lang.name}
                    </button>
                  ))}
                </div>
              )}
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
                  <button
                    onClick={handleLanguageToggle}
                    className="flex items-center"
                  >
                    <span className="text-sm font-medium">
                      {selectedLanguage === "en" ? "EN" : 
                       selectedLanguage === "hi" ? "HI" :
                       selectedLanguage === "fr" ? "FR" :
                       selectedLanguage === "es" ? "ES" :
                       selectedLanguage === "de" ? "DE" :
                       selectedLanguage === "it" ? "IT" :
                       selectedLanguage === "pt" ? "PT" :
                       selectedLanguage === "ru" ? "RU" :
                       selectedLanguage === "ja" ? "JA" :
                       selectedLanguage === "ko" ? "KO" :
                       selectedLanguage === "zh-CN" || selectedLanguage === "zh-TW" ? "ZH" :
                       selectedLanguage === "ar" ? "AR" :
                       selectedLanguage === "tr" ? "TR" :
                       selectedLanguage === "nl" ? "NL" :
                       selectedLanguage === "pl" ? "PL" :
                       selectedLanguage === "sv" ? "SV" :
                       selectedLanguage === "da" ? "DA" :
                       selectedLanguage === "no" ? "NO" :
                       selectedLanguage === "fi" ? "FI" :
                       selectedLanguage === "cs" ? "CS" :
                       selectedLanguage === "hu" ? "HU" :
                       selectedLanguage === "ro" ? "RO" :
                       selectedLanguage === "sk" ? "SK" :
                       selectedLanguage === "sl" ? "SL" :
                       selectedLanguage === "bg" ? "BG" :
                       selectedLanguage === "hr" ? "HR" :
                       selectedLanguage === "el" ? "EL" :
                       selectedLanguage === "et" ? "ET" :
                       selectedLanguage === "lv" ? "LV" :
                       selectedLanguage === "lt" ? "LT" :
                       selectedLanguage === "mt" ? "MT" :
                       selectedLanguage === "th" ? "TH" :
                       selectedLanguage === "vi" ? "VI" :
                       selectedLanguage === "id" ? "ID" :
                       selectedLanguage === "ms" ? "MS" :
                       selectedLanguage === "tl" ? "TL" :
                       selectedLanguage === "bn" ? "BN" :
                       selectedLanguage === "ta" ? "TA" :
                       selectedLanguage === "te" ? "TE" :
                       selectedLanguage === "kn" ? "KN" :
                       selectedLanguage === "ml" ? "ML" :
                       selectedLanguage === "gu" ? "GU" :
                       selectedLanguage === "pa" ? "PA" :
                       selectedLanguage === "mr" ? "MR" :
                       selectedLanguage === "or" ? "OR" :
                       selectedLanguage === "as" ? "AS" :
                       selectedLanguage === "ne" ? "NE" :
                       selectedLanguage === "si" ? "SI" :
                       selectedLanguage === "my" ? "MY" :
                       selectedLanguage === "km" ? "KM" :
                       selectedLanguage === "lo" ? "LO" :
                       selectedLanguage === "ka" ? "KA" :
                       selectedLanguage === "hy" ? "HY" :
                       selectedLanguage === "az" ? "AZ" :
                       selectedLanguage === "kk" ? "KK" :
                       selectedLanguage === "ky" ? "KY" :
                       selectedLanguage === "uz" ? "UZ" :
                       selectedLanguage === "tg" ? "TG" :
                       selectedLanguage === "fa" ? "FA" :
                       selectedLanguage === "ur" ? "UR" :
                       selectedLanguage === "he" || selectedLanguage === "iw" ? "HE" :
                       selectedLanguage === "yi" ? "YI" :
                       selectedLanguage === "am" ? "AM" :
                       selectedLanguage === "sw" ? "SW" :
                       selectedLanguage === "zu" ? "ZU" :
                       selectedLanguage === "af" ? "AF" :
                       selectedLanguage === "sq" ? "SQ" :
                       selectedLanguage === "be" ? "BE" :
                       selectedLanguage === "bs" ? "BS" :
                       selectedLanguage === "ca" ? "CA" :
                       selectedLanguage === "cy" ? "CY" :
                       selectedLanguage === "eu" ? "EU" :
                       selectedLanguage === "fo" ? "FO" :
                       selectedLanguage === "gl" ? "GL" :
                       selectedLanguage === "is" ? "IS" :
                       selectedLanguage === "ga" ? "GA" :
                       selectedLanguage === "mk" ? "MK" :
                       selectedLanguage === "mn" ? "MN" :
                       selectedLanguage === "sr" ? "SR" :
                       selectedLanguage === "uk" ? "UK" :
                       selectedLanguage === "jw" ? "JW" :
                       selectedLanguage === "co" ? "CO" :
                       selectedLanguage === "fy" ? "FY" :
                       selectedLanguage === "gd" ? "GD" :
                       selectedLanguage === "ht" ? "HT" :
                       selectedLanguage === "lb" ? "LB" :
                       selectedLanguage === "mi" ? "MI" :
                       selectedLanguage === "ny" ? "NY" :
                       selectedLanguage === "sm" ? "SM" :
                       selectedLanguage === "sn" ? "SN" :
                       selectedLanguage === "so" ? "SO" :
                       selectedLanguage === "st" ? "ST" :
                       selectedLanguage === "su" ? "SU" :
                       selectedLanguage === "xh" ? "XH" :
                       selectedLanguage === "yo" ? "YO" :
                       selectedLanguage.toUpperCase()}
                    </span>
                    <HiChevronDown className={`ml-1 h-4 w-4 transition-transform duration-200 ${isLanguageOpen ? 'rotate-180' : ''}`} />
                  </button>
                </div>
                              <button className="text-gray-700 hover:text-gray-900 p-2">
                  <HiSearch className="h-5 w-5" />
                </button>
              </div>
              
              {/* Mobile Language Dropdown */}
              {isLanguageOpen && (
                <div className="mt-2 mx-3 bg-white border border-gray-200 rounded-md shadow-lg max-h-96 overflow-y-auto">
                  {[
                    { code: "en", name: "English" },
                    { code: "hi", name: "हिंदी (Hindi)" },
                    { code: "fr", name: "Français (French)" },
                    { code: "es", name: "Español (Spanish)" },
                    { code: "de", name: "Deutsch (German)" },
                    { code: "it", name: "Italiano (Italian)" },
                    { code: "pt", name: "Português (Portuguese)" },
                    { code: "ru", name: "Русский (Russian)" },
                    { code: "ja", name: "日本語 (Japanese)" },
                    { code: "ko", name: "한국어 (Korean)" },
                    { code: "zh-CN", name: "中文 (Chinese Simplified)" },
                    { code: "zh-TW", name: "繁體中文 (Chinese Traditional)" },
                    { code: "ar", name: "العربية (Arabic)" },
                    { code: "tr", name: "Türkçe (Turkish)" },
                    { code: "nl", name: "Nederlands (Dutch)" },
                    { code: "pl", name: "Polski (Polish)" },
                    { code: "sv", name: "Svenska (Swedish)" },
                    { code: "da", name: "Dansk (Danish)" },
                    { code: "no", name: "Norsk (Norwegian)" },
                    { code: "fi", name: "Suomi (Finnish)" },
                    { code: "cs", name: "Čeština (Czech)" },
                    { code: "hu", name: "Magyar (Hungarian)" },
                    { code: "ro", name: "Română (Romanian)" },
                    { code: "sk", name: "Slovenčina (Slovak)" },
                    { code: "sl", name: "Slovenščina (Slovenian)" },
                    { code: "bg", name: "Български (Bulgarian)" },
                    { code: "hr", name: "Hrvatski (Croatian)" },
                    { code: "el", name: "Ελληνικά (Greek)" },
                    { code: "et", name: "Eesti (Estonian)" },
                    { code: "lv", name: "Latviešu (Latvian)" },
                    { code: "lt", name: "Lietuvių (Lithuanian)" },
                    { code: "mt", name: "Malti (Maltese)" },
                    { code: "th", name: "ไทย (Thai)" },
                    { code: "vi", name: "Tiếng Việt (Vietnamese)" },
                    { code: "id", name: "Bahasa Indonesia (Indonesian)" },
                    { code: "ms", name: "Bahasa Melayu (Malay)" },
                    { code: "tl", name: "Tagalog (Filipino)" },
                    { code: "bn", name: "বাংলা (Bengali)" },
                    { code: "ta", name: "தமிழ் (Tamil)" },
                    { code: "te", name: "తెలుగు (Telugu)" },
                    { code: "kn", name: "ಕನ್ನಡ (Kannada)" },
                    { code: "ml", name: "മലയാളം (Malayalam)" },
                    { code: "gu", name: "ગુજરાતી (Gujarati)" },
                    { code: "pa", name: "ਪੰਜਾਬੀ (Punjabi)" },
                    { code: "mr", name: "मराठी (Marathi)" },
                    { code: "or", name: "ଓଡ଼ିଆ (Odia)" },
                    { code: "as", name: "অসমীয়া (Assamese)" },
                    { code: "ne", name: "नेपालী (Nepali)" },
                    { code: "si", name: "සිංහල (Sinhala)" },
                    { code: "my", name: "မြန်မာ (Myanmar)" },
                    { code: "km", name: "ខ្មែរ (Khmer)" },
                    { code: "lo", name: "ລາວ (Lao)" },
                    { code: "ka", name: "ქართული (Georgian)" },
                    { code: "hy", name: "Հայերեն (Armenian)" },
                    { code: "az", name: "Azərbaycan (Azerbaijani)" },
                    { code: "kk", name: "Қазақ (Kazakh)" },
                    { code: "ky", name: "Кыргызча (Kyrgyz)" },
                    { code: "uz", name: "O'zbek (Uzbek)" },
                    { code: "tg", name: "Тоҷикӣ (Tajik)" },
                    { code: "fa", name: "فارسی (Persian)" },
                    { code: "ur", name: "اردو (Urdu)" },
                    { code: "he", name: "עברית (Hebrew)" },
                    { code: "yi", name: "יידיש (Yiddish)" },
                    { code: "am", name: "አማርኛ (Amharic)" },
                    { code: "sw", name: "Kiswahili (Swahili)" },
                    { code: "zu", name: "isiZulu (Zulu)" },
                    { code: "af", name: "Afrikaans" },
                    { code: "sq", name: "Shqip (Albanian)" },
                    { code: "be", name: "Беларуская (Belarusian)" },
                    { code: "bs", name: "Bosanski (Bosnian)" },
                    { code: "ca", name: "Català (Catalan)" },
                    { code: "cy", name: "Cymraeg (Welsh)" },
                    { code: "eu", name: "Euskara (Basque)" },
                    { code: "fo", name: "Føroyskt (Faroese)" },
                    { code: "gl", name: "Galego (Galician)" },
                    { code: "is", name: "Íslenska (Icelandic)" },
                    { code: "ga", name: "Gaeilge (Irish)" },
                    { code: "mk", name: "Македонски (Macedonian)" },
                    { code: "mn", name: "Монгол (Mongolian)" },
                    { code: "sr", name: "Српски (Serbian)" },
                    { code: "uk", name: "Українська (Ukrainian)" }
                  ].map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => handleLanguageSelect(lang.code)}
                      className={`w-full text-left px-4 py-2 text-sm transition-colors duration-200 ${
                        selectedLanguage === lang.code
                          ? 'bg-blue-50 text-blue-600'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {lang.name}
                    </button>
                  ))}
                </div>
              )}
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
