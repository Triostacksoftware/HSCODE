"use client";

import { useEffect, useState } from "react";

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
        const translateElement = new window.google.translate.TranslateElement(
          {
            pageLanguage: "en",
            includedLanguages:
              "en,hi,fr,es,de,it,pt,ru,ja,ko,zh-CN,zh-TW,ar,tr,nl,pl,sv,da,no,fi,cs,hu,ro,sk,sl,bg,hr,el,et,lv,lt,mt,th,vi,id,ms,tl,bn,ta,te,kn,ml,gu,pa,mr,or,as,ne,si,my,km,lo,ka,hy,az,kk,ky,uz,tg,fa,ur,he,yi,am,sw,zu,af,sq,be,bs,ca,cy,eu,fo,gl,is,ga,mk,mn,sr,uk,iw,jw,co,fy,gd,ht,lb,mi,ny,sm,sn,so,st,su,xh,yo",
            layout: window.google.translate.TranslateElement.InlineLayout,
            autoDisplay: false,
            multilanguagePage: true,
          },
          "google_translate_element"
        );
        
        // Store reference for external control
        window.googleTranslateElement = translateElement;
        
        setIsLoaded(true);
        setIsLoading(false);
      };

      // Function to change language programmatically
      window.changeGoogleTranslateLanguage = function(languageCode) {
        if (window.google && window.google.translate) {
          const selectElement = document.querySelector('#google_translate_element select');
          if (selectElement) {
            // Find the option with the matching language code
            const options = selectElement.options;
            for (let i = 0; i < options.length; i++) {
              if (options[i].value.includes(languageCode.toLowerCase())) {
                selectElement.selectedIndex = i;
                selectElement.dispatchEvent(new Event('change'));
                break;
              }
            }
          }
        }
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
    ></div>
  );
};

export default GoogleTranslate;
