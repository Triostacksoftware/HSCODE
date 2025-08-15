"use client";

import { useEffect, useState } from "react";

const GoogleTranslate = ({
  position = "fixed",
  top = "20px",
  right = "20px",
  bottom,
  left,
  className = "",
  style = {},
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load Google Translate script
    const loadGoogleTranslate = () => {
      // Check if script is already loaded
      if (window.google && window.google.translate) {
        setIsLoaded(true);
        setIsLoading(false);
        return;
      }

      // Create script element
      const script = document.createElement("script");
      script.src =
        "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      script.async = true;
      script.defer = true;

      // Define the callback function
      window.googleTranslateElementInit = function () {
        new window.google.translate.TranslateElement(
          {
            pageLanguage: "en",
            includedLanguages:
              "en,hi,fr,es,de,it,pt,ru,ja,ko,zh-CN,ar,tr,nl,pl,sv,da,no,fi,cs,hu,ro,sk,sl,bg,hr,el,et,lv,lt,mt",
            layout:
              window.google.translate.TranslateElement.InlineLayout.SIMPLE,
            autoDisplay: false,
            multilanguagePage: true,
          },
          "google_translate_element"
        );
        setIsLoaded(true);
        setIsLoading(false);
      };

      // Append script to head
      document.head.appendChild(script);

      // Set loading timeout
      setTimeout(() => {
        if (!isLoaded) {
          setIsLoading(false);
        }
      }, 5000);
    };

    // Load the script
    loadGoogleTranslate();

    // Cleanup function
    return () => {
      // Remove the script if component unmounts
      const existingScript = document.querySelector(
        'script[src*="translate.google.com"]'
      );
      if (existingScript) {
        existingScript.remove();
      }
      // Clean up global callback
      if (window.googleTranslateElementInit) {
        delete window.googleTranslateElementInit;
      }
    };
  }, [isLoaded]);

  const defaultStyle = {
    position,
    top: position === "fixed" || position === "absolute" ? top : undefined,
    right: position === "fixed" || position === "absolute" ? right : undefined,
    bottom:
      position === "fixed" || position === "absolute" ? bottom : undefined,
    left: position === "fixed" || position === "absolute" ? left : undefined,
    zIndex: 1000,
    ...style,
  };

  return (
    <div
      id="google_translate_element"
      className={`google-translate-container ${className}`}
      style={defaultStyle}
    >
      {!isLoaded && (
        <div className="loading-placeholder">
          {isLoading ? (
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
              <span className="text-sm font-medium text-gray-600">
                Loading translator...
              </span>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <svg
                className="w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="text-sm font-medium text-gray-500">
                Translator ready
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GoogleTranslate;
