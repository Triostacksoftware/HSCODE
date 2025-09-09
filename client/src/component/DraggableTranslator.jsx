"use client";
import { useEffect, useState, useRef } from 'react';
import { IoLanguageSharp } from 'react-icons/io5';

const DraggableTranslator = () => {
  const [position, setPosition] = useState({ x: 20, y: 20 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const widgetRef = useRef(null);

  useEffect(() => {
    // Load saved position
    const savedPosition = localStorage.getItem('translatorPosition');
    if (savedPosition) {
      setPosition(JSON.parse(savedPosition));
    }

    // Check if Google Translate is already loaded
    if (window.google && window.google.translate) {
      initializeTranslateWidget();
      return;
    }

    // Check if script is already loaded
    if (document.querySelector('script[src*="translate_a/element.js"]')) {
      return;
    }

    // Initialize Google Translate
    const script = document.createElement("script");
    script.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    script.async = true;

    window.googleTranslateElementInit = function() {
      initializeTranslateWidget();
    };

    document.head.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  const initializeTranslateWidget = () => {
    // Remove any existing widget first
    const existingWidget = document.querySelector('#google_translate_element');
    if (existingWidget) {
      existingWidget.innerHTML = '';
    }

    // Create new widget
    if (window.google && window.google.translate) {
      new window.google.translate.TranslateElement(
        {
          pageLanguage: "en",
          includedLanguages: "en,hi,fr,es,de,it,pt,ru,ja,ko,zh-CN,ar,tr,nl,pl,sv,da,no,fi,cs,hu,ro,sk,sl,bg,hr,el,et,lv,lt,mt,th,vi,id,ms,tl,bn,ta,te,kn,ml,gu,pa,mr,or,as,ne,si,my,km,lo,ka,hy,az,kk,ky,uz,tg,fa,ur,he,am,sw,zu,af,sq,be,bs,ca,cy,eu,fo,gl,is,ga,mk,mn,sr,uk",
          layout: google.translate.TranslateElement.InlineLayout.SIMPLE,
          autoDisplay: false,
          multilanguagePage: true,
        },
        "google_translate_element"
      );
    }
  };

  // Save position to localStorage
  useEffect(() => {
    localStorage.setItem('translatorPosition', JSON.stringify(position));
  }, [position]);

  // Handle mouse down for dragging
  const handleMouseDown = (e) => {
    // Don't drag when clicking on select elements
    if (e.target.closest('select') || e.target.closest('.goog-te-combo')) {
      return;
    }

    e.preventDefault();
    setIsDragging(true);

    const rect = widgetRef.current?.getBoundingClientRect() || { left: 0, top: 0 };
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };


  // Handle mouse move for dragging
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging) return;

      e.preventDefault();
      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;

      // Keep widget within viewport bounds
      const maxX = window.innerWidth - (widgetRef.current?.offsetWidth || 200);
      const maxY = window.innerHeight - (widgetRef.current?.offsetHeight || 50);

      setPosition({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY)),
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove, { passive: false });
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('mouseleave', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseleave', handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  return (
    <div
      ref={widgetRef}
      style={{
        position: 'fixed',
        left: `${position.x}px`,
        top: `${position.y}px`,
        zIndex: 9999,
        cursor: isDragging ? 'grabbing' : 'grab',
        userSelect: 'none'
      }}
      onMouseDown={handleMouseDown}
    >
      {/* Main Circular Container */}
      <div className="relative w-12 h-12 rounded-full bg-white shadow-lg border-2 border-blue-200 hover:shadow-xl transition-all duration-300 hover:scale-110 overflow-hidden">
        
        {/* Google Translate Widget - Invisible but clickable */}
        <div 
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            opacity: 0.01,
            zIndex: 2
          }}
        >
          <div id="google_translate_element"></div>
        </div>

        {/* Language Icon - Visible */}
        <div 
          className="absolute inset-0 flex items-center justify-center"
          style={{
            visibility: 'visible',
            zIndex: 1,
            pointerEvents: 'none'
          }}
        >
          <IoLanguageSharp 
            className="text-blue-500" 
            style={{
              fontSize: '24px'
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default DraggableTranslator;