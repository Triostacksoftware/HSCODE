"use client";

import { useEffect, useState } from "react";

const GoogleTranslate = ({ className = "" }) => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (window.google && window.google.translate) {
      setIsLoaded(true);
      return;
    }

    const existingScript = document.querySelector(
      'script[src*="translate.google.com"]'
    );
    if (existingScript) {
      setIsLoaded(true);
      return;
    }

    const script = document.createElement("script");
    script.src =
      "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    script.async = true;
    script.defer = true;

    window.googleTranslateElementInit = function () {
      try {
        new window.google.translate.TranslateElement(
          {
            pageLanguage: "en",
            includedLanguages:
              "en,hi,fr,es,de,it,pt,ru,ja,ko,zh-CN,ar,tr,nl,pl,sv,da,no,fi,cs,hu,ro,sk,sl,bg,hr,el,et,lv,lt,mt,th,vi,id,ms,tl,bn,ta,te,kn,ml,gu,pa,mr,or,as,ne,si,my,km,lo,ka,hy,az,kk,ky,uz,tg,fa,ur,he,am,sw,zu,af,sq,be,bs,ca,cy,eu,fo,gl,is,ga,mk,mn,sr,uk",
            layout: window.google.translate.TranslateElement.InlineLayout,
            autoDisplay: false,
            multilanguagePage: true,
          },
          "google_translate_element"
        );
        setIsLoaded(true);

        // ✅ Inject custom styling
        setTimeout(() => {
          const style = document.createElement("style");
          style.textContent = `
            #google_translate_element .goog-te-gadget {
              font-family: inherit !important;
              font-size: 14px !important;
              color: var(--cobalt-blue) !important;
            }
            #google_translate_element .goog-te-gadget .goog-te-combo {
              background: transparent !important;
              border: 1px solid var(--cobalt-blue) !important;
              border-radius: 6px !important;
              padding: 4px 6px !important;
              color: var(--cobalt-blue) !important;
              font-family: inherit !important;
              font-size: 14px !important;
              font-weight: 500 !important;
              cursor: pointer !important;
              outline: none !important;
            }
            #google_translate_element .goog-te-gadget .goog-te-combo:hover {
              border-color: var(--leaf-green) !important;
              color: var(--leaf-green) !important;
            }
          `;
          document.head.appendChild(style);
        }, 200);
      } catch (error) {
        console.log("Google Translate failed", error);
        setIsLoaded(true);
      }
    };

    document.head.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  return (
    <div className={`google-translate-container ${className}`}>
      {!isLoaded ? (
        <div className="text-sm text-gray-500">Loading translator...</div>
      ) : (
        <div
          style={{
            height: "35px", // only show dropdown
            overflow: "hidden",
          }}
        >
          <div id="google_translate_element"></div>
        </div>
      )}
    </div>
  );
};

export default GoogleTranslate;
