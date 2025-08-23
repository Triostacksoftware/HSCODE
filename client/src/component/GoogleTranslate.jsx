"use client";

import { useEffect, useState, useRef } from "react";

const GoogleTranslate = ({
  position = "fixed",
  top = "20px",
  right = "20px",
  bottom,
  left,
  className = "hidden", // Hide the Google Translate widget
  style = {},
  onLanguageChange,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const scriptRef = useRef(null);
  const initRef = useRef(false);

  useEffect(() => {
    // Prevent multiple initializations
    if (initRef.current) {
      return;
    }
    initRef.current = true;

    // Check if already loaded
    if (window.google && window.google.translate) {
      setIsLoaded(true);
      setIsLoading(false);
      return;
    }

    // Check if script is already in the DOM
    const existingScript = document.querySelector(
      'script[src*="translate.google.com"]'
    );
    if (existingScript) {
      scriptRef.current = existingScript;
    } else {
      // Create new script element
      scriptRef.current = document.createElement("script");
      scriptRef.current.src =
        "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      scriptRef.current.async = true;
      scriptRef.current.defer = true;
      document.head.appendChild(scriptRef.current);
    }

    // Define the callback function only once
    if (!window.googleTranslateElementInit) {
      window.googleTranslateElementInit = function () {
        try {
          // Prevent multiple initializations
          if (window.googleTranslateElement) {
            return;
          }

          // Suppress Google Translate logging errors (common with ad blockers)
          const originalFetch = window.fetch;
          const originalXHROpen = window.XMLHttpRequest.prototype.open;

          // Intercept fetch requests
          window.fetch = function (...args) {
            if (
              args[0] &&
              typeof args[0] === "string" &&
              args[0].includes("translate.googleapis.com/element/log")
            ) {
              // Silently ignore logging requests that get blocked
              return Promise.resolve(new Response("{}", { status: 200 }));
            }
            return originalFetch.apply(this, args);
          };

          // Intercept XMLHttpRequest (fallback for older browsers)
          window.XMLHttpRequest.prototype.open = function (
            method,
            url,
            ...args
          ) {
            if (
              url &&
              typeof url === "string" &&
              url.includes("translate.googleapis.com/element/log")
            ) {
              // Silently ignore logging requests that get blocked
              this.abort = () => {};
              this.send = () => {};
              this.setRequestHeader = () => {};
              return;
            }
            return originalXHROpen.apply(this, [method, url, ...args]);
          };

          const translateElement = new window.google.translate.TranslateElement(
            {
              pageLanguage: "en",
              includedLanguages:
                "en,hi,fr,es,de,it,pt,ru,ja,ko,zh-CN,zh-TW,ar,tr,nl,pl,sv,da,no,fi,cs,hu,ro,sk,sl,bg,hr,el,et,lv,lt,mt,th,vi,id,ms,tl,bn,ta,te,kn,ml,gu,pa,mr,or,as,ne,si,my,km,lo,ka,hy,az,kk,ky,uz,tg,fa,ur,he,yi,am,sw,zu,af,sq,be,bs,ca,cy,eu,fo,gl,is,ga,mk,mn,sr,uk,iw,jw,co,fy,gd,ht,lb,mi,ny,sm,sn,so,st,su,xh,yo",
              layout: window.google.translate.TranslateElement.InlineLayout,
              autoDisplay: false,
              multilanguagePage: true,
              gaTrack: false, // Disable Google Analytics tracking
            },
            "google_translate_element"
          );

          // Store reference for external control
          window.googleTranslateElement = translateElement;

          setIsLoaded(true);
          setIsLoading(false);
          setError(null);
        } catch (err) {
          console.error("Error initializing Google Translate:", err);
          setError(err.message);
          setIsLoading(false);
        }
      };
    }

    // Function to change language programmatically
    if (!window.changeGoogleTranslateLanguage) {
      window.changeGoogleTranslateLanguage = function (languageCode) {
        try {
          if (window.google && window.google.translate) {
            const selectElement = document.querySelector(
              "#google_translate_element select"
            );
            if (selectElement) {
              // Find the option with the matching language code
              const options = selectElement.options;
              for (let i = 0; i < options.length; i++) {
                if (options[i].value.includes(languageCode.toLowerCase())) {
                  selectElement.selectedIndex = i;
                  selectElement.dispatchEvent(new Event("change"));
                  break;
                }
              }
            }
          }
        } catch (err) {
          console.error("Error changing language:", err);
        }
      };
    }

    // Set loading timeout
    const timeoutId = setTimeout(() => {
      if (!isLoaded && !error) {
        setError("Translation service timeout");
        setIsLoading(false);
      }
    }, 15000); // 15 second timeout

    // Cleanup function
    return () => {
      clearTimeout(timeoutId);
      // Don't remove the script on unmount as it might be used by other components
      // Just clean up our state
      initRef.current = false;
    };
  }, []); // Empty dependency array

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

  // Show loading state
  if (isLoading) {
    return (
      <div
        className={`google-translate-container ${className}`}
        style={defaultStyle}
      >
        <div className="text-sm text-gray-600">Loading translator...</div>
      </div>
    );
  }

  // Show error state if failed to load
  if (error || !isLoaded) {
    return (
      <div
        className={`google-translate-container ${className}`}
        style={defaultStyle}
      >
        <div className="text-sm text-red-600">
          {error || "Translator unavailable"}
        </div>
      </div>
    );
  }

  return (
    <div
      id="google_translate_element"
      className={`google-translate-container ${className}`}
      style={defaultStyle}
    ></div>
  );
};

export default GoogleTranslate;
