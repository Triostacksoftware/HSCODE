"use client";
import { useEffect, useState, useRef } from 'react';
import { IoLanguageSharp } from 'react-icons/io5';

const DraggableTranslator = () => {
  const [position, setPosition] = useState({ x: 20, y: window?.innerHeight / 2 || 300 });
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const lastPositionRef = useRef({ x: 0, y: 0 });
  const translatorRef = useRef(null);
  const clickTimeoutRef = useRef(null);

  useEffect(() => {
    // Add custom styles to control Google Translate widget
    const style = document.createElement('style');
    style.textContent = `
      .goog-te-gadget {
        font-family: inherit !important;
        color: transparent !important;
      }
      .goog-te-gadget .goog-te-combo {
        margin: 0 !important;
        padding: 8px !important;
        border-radius: 4px !important;
        border: 1px solid #e2e8f0 !important;
        outline: none !important;
        background-color: white !important;
        color: #1a202c !important;
        font-size: 14px !important;
        width: 100% !important;
      }
      .goog-te-gadget > span {
        display: none !important;
      }
      .goog-te-gadget img {
        display: none !important;
      }
      .VIpgJd-ZVi9od-l4eHX-hSRGPd {
        display: none !important;
      }
      .goog-te-banner-frame {
        display: none !important;
      }
      body {
        top: 0 !important;
      }
    `;
    document.head.appendChild(style);

    const script = document.createElement("script");
    script.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    script.async = true;

    window.googleTranslateElementInit = function() {
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
    };

    document.head.appendChild(script);

    const savedPosition = localStorage.getItem('translatorPosition');
    if (savedPosition) {
      const pos = JSON.parse(savedPosition);
      setPosition(pos);
      lastPositionRef.current = pos;
    }

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
      if (style.parentNode) {
        style.parentNode.removeChild(style);
      }
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('translatorPosition', JSON.stringify(position));
    lastPositionRef.current = position;
  }, [position]);

  const handleStart = (clientX, clientY) => {
    const target = document.elementFromPoint(clientX, clientY);
    if (target?.tagName === 'SELECT' || target?.tagName === 'OPTION' || target?.closest('.goog-te-combo')) {
      return false;
    }

    dragStartRef.current = {
      x: clientX - lastPositionRef.current.x,
      y: clientY - lastPositionRef.current.y
    };

    clickTimeoutRef.current = setTimeout(() => {
      setIsDragging(true);
    }, 100);

    return true;
  };

  const handleMove = (clientX, clientY) => {
    if (!isDragging) return;

    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
      clickTimeoutRef.current = null;
    }

    requestAnimationFrame(() => {
      const newX = Math.max(0, Math.min(window.innerWidth - 60, clientX - dragStartRef.current.x));
      const newY = Math.max(0, Math.min(window.innerHeight - 60, clientY - dragStartRef.current.y));

      setPosition({ x: newX, y: newY });
    });
  };

  const handleEnd = (clientX, clientY) => {
    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
      clickTimeoutRef.current = null;

      // If it was a quick tap/click and barely moved, treat as click
      const moveX = Math.abs(clientX - (dragStartRef.current.x + lastPositionRef.current.x));
      const moveY = Math.abs(clientY - (dragStartRef.current.y + lastPositionRef.current.y));
      
      if (moveX < 5 && moveY < 5) {
        setIsOpen(!isOpen);
      }
    }

    setIsDragging(false);
  };

  // Mouse event handlers
  const handleMouseDown = (e) => {
    if (handleStart(e.clientX, e.clientY)) {
      e.preventDefault(); // Prevent text selection while dragging
    }
  };

  const handleMouseMove = (e) => {
    handleMove(e.clientX, e.clientY);
  };

  const handleMouseUp = (e) => {
    handleEnd(e.clientX, e.clientY);
  };

  // Touch event handlers
  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    if (handleStart(touch.clientX, touch.clientY)) {
      e.preventDefault(); // Prevent scrolling while dragging
    }
  };

  const handleTouchMove = (e) => {
    const touch = e.touches[0];
    handleMove(touch.clientX, touch.clientY);
  };

  const handleTouchEnd = (e) => {
    const touch = e.changedTouches[0];
    handleEnd(touch.clientX, touch.clientY);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove, { passive: false });
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove, { passive: false });
      window.addEventListener('touchend', handleTouchEnd);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging]);

  return (
    <div
      ref={translatorRef}
      style={{
        position: 'fixed',
        left: `${position.x}px`,
        top: `${position.y}px`,
        zIndex: 9999,
        cursor: isDragging ? 'grabbing' : 'grab',
        touchAction: 'none',
        transform: `scale(${isDragging ? 0.95 : 1})`,
        transition: isDragging ? 'none' : 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        willChange: 'transform, left, top'
      }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div 
        className={`
          relative
          w-[60px] h-[60px] 
          rounded-full 
          bg-gradient-to-br from-blue-50 via-white to-blue-50
          flex items-center justify-center 
          ${isDragging ? '' : 'transition-all duration-300 ease-in-out'}
          ${isOpen ? 'ring-4 ring-blue-200' : ''}
        `}
        style={{
          boxShadow: isHovered 
            ? '0 0 20px rgba(0,0,0,0.2), inset 0 0 10px rgba(0,0,0,0.1), 0 4px 10px rgba(0,0,0,0.2), 0 0 0 2px rgba(255,255,255,0.8)'
            : '0 4px 15px rgba(0,0,0,0.15), inset 0 0 5px rgba(0,0,0,0.05), 0 2px 5px rgba(0,0,0,0.1)',
          transform: `
            rotate(${isDragging ? '5deg' : '0deg'}) 
            scale(${isHovered ? '1.05' : '1'})
          `,
          border: '2px solid rgba(255,255,255,0.9)',
          transition: isDragging ? 'none' : 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      >
        {/* Language Icon */}
        <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${isOpen ? 'opacity-0' : 'opacity-100'}`}>
          <IoLanguageSharp 
            className="text-blue-500/90" 
            style={{
              fontSize: '28px',
              transform: `
                scale(${isHovered ? 1.1 : 1}) 
                rotate(${isDragging ? '5deg' : '0deg'})
              `,
              filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.1))',
              transition: isDragging ? 'none' : 'all 0.3s ease'
            }}
          />
        </div>
      </div>

      {/* Google Translate Element - Positioned absolutely */}
      <div 
        className={`
          absolute 
          top-0 
          left-[70px] 
          bg-white 
          rounded-lg 
          shadow-lg 
          p-2 
          transition-all 
          duration-300 
          ease-in-out
          ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}
        `}
        style={{
          transform: isOpen ? 'translateX(0)' : 'translateX(-20px)',
          minWidth: '200px',
          pointerEvents: isOpen ? 'auto' : 'none'
        }}
      >
        <div id="google_translate_element"></div>
      </div>
    </div>
  );
};

export default DraggableTranslator;