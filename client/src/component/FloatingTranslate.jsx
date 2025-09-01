"use client";

import { useState, useEffect, useRef } from "react";

const FloatingTranslate = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isGoogleReady, setIsGoogleReady] = useState(false);
  const [position, setPosition] = useState({ x: 24, y: 24 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const widgetRef = useRef(null);

  // Initialize Google Translate independently
  useEffect(() => {
    // Only run on client side
    if (typeof window === "undefined") return;

    const initGoogleTranslate = () => {
      // Check if Google Translate script is already loaded
      if (window.google && window.google.translate) {
        createTranslateWidget();
        return;
      }

      // Load Google Translate script if not present
      const script = document.createElement("script");
      script.src =
        "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      script.async = true;

      // Create global callback function
      window.googleTranslateElementInit = () => {
        createTranslateWidget();
      };

      document.head.appendChild(script);
    };

    const createTranslateWidget = () => {
      try {
        // Remove any existing widget
        const existingWidget = document.querySelector(
          "#floating_translate_widget"
        );
        if (existingWidget) {
          existingWidget.remove();
        }

        // Create new widget container
        const widgetContainer = document.createElement("div");
        widgetContainer.id = "floating_translate_widget";
        widgetContainer.style.display = "none"; // Hidden by default
        document.body.appendChild(widgetContainer);

        // Initialize Google Translate widget
        new window.google.translate.TranslateElement(
          {
            pageLanguage: "en",
            layout:
              window.google.translate.TranslateElement.InlineLayout.SIMPLE,
            autoDisplay: false,
          },
          "floating_translate_widget"
        );

        // Wait for widget to be ready
        setTimeout(() => {
          setIsGoogleReady(true);
          console.log("Google Translate widget ready");
        }, 1000);
      } catch (error) {
        console.log("Failed to create Google Translate widget:", error);
        setIsGoogleReady(true); // Force ready anyway
      }
    };

    // Initialize on component mount
    initGoogleTranslate();

    // Cleanup function
    return () => {
      const widget = document.querySelector("#floating_translate_widget");
      if (widget) {
        widget.remove();
      }
    };
  }, []);

  // Handle mouse down for dragging
  const handleMouseDown = (e) => {
    // Don't drag when clicking interactive elements
    if (
      e.target.closest("button") ||
      e.target.closest("select") ||
      e.target.closest("input")
    ) {
      return;
    }

    // Only allow dragging on header or non-interactive areas
    const isHeader = e.target.closest(".cursor-move");
    const isNonInteractive = !e.target.closest("button, select, input, a");

    if (!isHeader && !isNonInteractive) {
      return;
    }

    e.preventDefault();
    setIsDragging(true);

    const rect = widgetRef.current?.getBoundingClientRect() || {
      left: 0,
      top: 0,
    };
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  // Handle mouse move for dragging
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleMouseMove = (e) => {
      if (!isDragging) return;

      e.preventDefault();
      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;

      // Keep widget within viewport bounds
      const maxX = window.innerWidth - (widgetRef.current?.offsetWidth || 384);
      const maxY =
        window.innerHeight - (widgetRef.current?.offsetHeight || 400);

      setPosition({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY)),
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove, {
        passive: false,
      });
      document.addEventListener("mouseup", handleMouseUp);
      document.addEventListener("mouseleave", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mouseleave", handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  // Clean and simple translation function
  const triggerTranslation = (languageCode) => {
    if (typeof window === "undefined") return;
    if (!isGoogleReady) {
      console.log("Google Translate not ready yet");
      return;
    }

    try {
      // Find the dropdown in our independent widget
      const dropdown = document.querySelector(
        "#floating_translate_widget .goog-te-combo"
      );

      if (dropdown) {
        // Set language and trigger change
        dropdown.value = languageCode;
        dropdown.dispatchEvent(new Event("change"));
        console.log(`Translating to: ${languageCode}`);
      } else {
        console.log("Translation dropdown not found");
      }
    } catch (error) {
      console.log("Translation failed:", error);
    }
  };

  // Popular languages
  const popularLanguages = [
    { code: "hi", name: "Hindi", flag: "🇮🇳" },
    { code: "en", name: "English", flag: "🇺🇸" },
    { code: "es", name: "Spanish", flag: "🇪🇸" },
    { code: "fr", name: "French", flag: "🇫🇷" },
    { code: "de", name: "German", flag: "🇩🇪" },
    { code: "it", name: "Italian", flag: "🇮🇹" },
    { code: "pt", name: "Portuguese", flag: "🇵🇹" },
    { code: "ru", name: "Russian", flag: "🇷🇺" },
    { code: "ja", name: "Japanese", flag: "🇯🇵" },
    { code: "ko", name: "Korean", flag: "🇰🇷" },
    { code: "zh-CN", name: "Chinese", flag: "🇨🇳" },
    { code: "ar", name: "Arabic", flag: "🇸🇦" },
    { code: "tr", name: "Turkish", flag: "🇹🇷" },
    { code: "nl", name: "Dutch", flag: "🇳🇱" },
    { code: "pl", name: "Polish", flag: "🇵🇱" },
    { code: "sv", name: "Swedish", flag: "🇸🇪" },
    { code: "da", name: "Danish", flag: "🇩🇰" },
    { code: "no", name: "Norwegian", flag: "🇳🇴" },
    { code: "fi", name: "Finnish", flag: "🇫🇮" },
    { code: "cs", name: "Czech", flag: "🇨🇿" },
    { code: "hu", name: "Hungarian", flag: "🇭🇺" },
    { code: "ro", name: "Romanian", flag: "🇷🇴" },
    { code: "sk", name: "Slovak", flag: "🇸🇰" },
    { code: "sl", name: "Slovenian", flag: "🇸🇮" },
    { code: "bg", name: "Bulgarian", flag: "🇧🇬" },
    { code: "hr", name: "Croatian", flag: "🇭🇷" },
    { code: "el", name: "Greek", flag: "🇬🇷" },
    { code: "et", name: "Estonian", flag: "🇪🇪" },
    { code: "lv", name: "Latvian", flag: "🇱🇻" },
    { code: "lt", name: "Lithuanian", flag: "🇱🇹" },
    { code: "mt", name: "Maltese", flag: "🇲🇹" },
    { code: "th", name: "Thai", flag: "🇹🇭" },
    { code: "vi", name: "Vietnamese", flag: "🇻🇳" },
    { code: "id", name: "Indonesian", flag: "🇮🇩" },
    { code: "ms", name: "Malay", flag: "🇲🇾" },
    { code: "tl", name: "Filipino", flag: "🇵🇭" },
    { code: "bn", name: "Bengali", flag: "🇧🇩" },
    { code: "ta", name: "Tamil", flag: "🇮🇳" },
    { code: "te", name: "Telugu", flag: "🇮🇳" },
    { code: "kn", name: "Kannada", flag: "🇮🇳" },
    { code: "ml", name: "Malayalam", flag: "🇮🇳" },
    { code: "gu", name: "Gujarati", flag: "🇮🇳" },
    { code: "pa", name: "Punjabi", flag: "🇮🇳" },
    { code: "mr", name: "Marathi", flag: "🇮🇳" },
    { code: "or", name: "Odia", flag: "🇮🇳" },
    { code: "as", name: "Assamese", flag: "🇮🇳" },
    { code: "ne", name: "Nepali", flag: "🇳🇵" },
    { code: "si", name: "Sinhala", flag: "🇱🇰" },
    { code: "my", name: "Myanmar", flag: "🇲🇲" },
    { code: "km", name: "Khmer", flag: "🇰🇭" },
    { code: "lo", name: "Lao", flag: "🇱🇦" },
    { code: "ka", name: "Georgian", flag: "🇬🇪" },
    { code: "hy", name: "Armenian", flag: "🇦🇲" },
    { code: "az", name: "Azerbaijani", flag: "🇦🇿" },
    { code: "kk", name: "Kazakh", flag: "🇰🇿" },
    { code: "ky", name: "Kyrgyz", flag: "🇰🇬" },
    { code: "uz", name: "Uzbek", flag: "🇺🇿" },
    { code: "tg", name: "Tajik", flag: "🇹🇯" },
    { code: "fa", name: "Persian", flag: "🇮🇷" },
    { code: "ur", name: "Urdu", flag: "🇵🇰" },
    { code: "he", name: "Hebrew", flag: "🇮🇱" },
    { code: "am", name: "Amharic", flag: "🇪🇹" },
    { code: "sw", name: "Swahili", flag: "🇹🇿" },
    { code: "zu", name: "Zulu", flag: "🇿🇦" },
    { code: "af", name: "Afrikaans", flag: "🇿🇦" },
    { code: "sq", name: "Albanian", flag: "🇦🇱" },
    { code: "be", name: "Belarusian", flag: "🇧🇾" },
    { code: "bs", name: "Bosnian", flag: "🇧🇦" },
    { code: "ca", name: "Catalan", flag: "🇪🇸" },
    { code: "ceb", name: "Cebuano", flag: "🇵🇭" },
    { code: "co", name: "Corsican", flag: "🇫🇷" },
    { code: "cy", name: "Welsh", flag: "🏴󠁧󠁢󠁷󠁬󠁳󠁿" },
    { code: "eu", name: "Basque", flag: "🇪🇸" },
    { code: "fo", name: "Faroese", flag: "🇫🇴" },
    { code: "gl", name: "Galician", flag: "🇪🇸" },
    { code: "ga", name: "Irish", flag: "🇮🇪" },
    { code: "is", name: "Icelandic", flag: "🇮🇸" },
    { code: "jv", name: "Javanese", flag: "🇮🇩" },
    { code: "lb", name: "Luxembourgish", flag: "🇱🇺" },
    { code: "mk", name: "Macedonian", flag: "🇲🇰" },
    { code: "mg", name: "Malagasy", flag: "🇲🇬" },
    { code: "mi", name: "Maori", flag: "🇳🇿" },
    { code: "mn", name: "Mongolian", flag: "🇲🇳" },
    { code: "sm", name: "Samoan", flag: "🇼🇸" },
    { code: "sa", name: "Sanskrit", flag: "🇮🇳" },
    { code: "gd", name: "Scots Gaelic", flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿" },
    { code: "nso", name: "Sepedi", flag: "🇿🇦" },
    { code: "st", name: "Sesotho", flag: "🇱🇸" },
    { code: "sn", name: "Shona", flag: "🇿🇼" },
    { code: "sd", name: "Sindhi", flag: "🇵🇰" },
    { code: "so", name: "Somali", flag: "🇸🇴" },
    { code: "su", name: "Sundanese", flag: "🇮🇩" },
    { code: "tt", name: "Tatar", flag: "🇹🇯" },
    { code: "tk", name: "Turkmen", flag: "🇹🇲" },
    { code: "uk", name: "Ukrainian", flag: "🇺🇦" },
    { code: "ug", name: "Uyghur", flag: "🇨🇳" },
    { code: "ve", name: "Venda", flag: "🇿🇦" },
    { code: "xh", name: "Xhosa", flag: "🇿🇦" },
    { code: "yi", name: "Yiddish", flag: "🇮🇱" },
    { code: "yo", name: "Yoruba", flag: "🇳🇬" },
  ];

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
        }}
        className="fixed z-50 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-3 shadow-lg transition-all duration-300 hover:scale-110 cursor-move"
        title="Translate Website (Drag to move)"
        onMouseDown={handleMouseDown}
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
          />
        </svg>
      </button>

      {/* Translation Widget */}
      {isVisible && (
        <div
          ref={widgetRef}
          style={{
            left: `${position.x}px`,
            top: `${position.y}px`,
          }}
          className="fixed z-50 w-96 bg-white rounded-lg shadow-2xl border border-gray-200 transition-all duration-300 max-h-96 overflow-y-auto"
        >
          {/* Header - Draggable area */}
          <div
            className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg sticky top-0 cursor-move select-none"
            onMouseDown={handleMouseDown}
          >
            <div className="flex items-center space-x-2">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
                />
              </svg>
              <span className="font-semibold">Quick Translate</span>
            </div>
            <button
              onClick={() => setIsVisible(false)}
              className="text-white hover:text-gray-200 transition-colors cursor-pointer"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="p-4">
            {/* Status indicator */}
            {!isGoogleReady && (
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600"></div>
                  <span className="text-sm text-yellow-700">
                    Loading Google Translate...
                  </span>
                </div>
              </div>
            )}

            <p className="text-sm text-gray-600 mb-4 text-center">
              Click any language to translate the entire website
            </p>

            {/* Language Grid */}
            <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
              {popularLanguages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    triggerTranslation(lang.code);
                    setIsVisible(false);
                  }}
                  disabled={!isGoogleReady}
                  className={`flex items-center space-x-2 p-2 text-left rounded-md transition-colors border ${
                    isGoogleReady
                      ? "hover:bg-blue-50 border-gray-200 hover:border-blue-300 cursor-pointer"
                      : "bg-gray-100 border-gray-200 cursor-not-allowed opacity-50"
                  }`}
                >
                  <span className="text-lg">{lang.flag}</span>
                  <span className="text-sm text-gray-700">{lang.name}</span>
                </button>
              ))}
            </div>

            {/* Instructions */}
            <div className="text-xs text-gray-500 text-center mt-4">
              Independent Google Translate widget • Drag header to move
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FloatingTranslate;
