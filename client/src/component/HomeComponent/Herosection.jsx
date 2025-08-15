"use client";
import React, { useState, useEffect } from "react";

const Herosection = ({
  bannerText = "Join the ultimate B2B marketplace where buyers and sellers connect for high-value leads",
  bannerCTA = "Join Now >",
  mainHeading = "Connect Buyers & Sellers",
  subHeading = "in the Ultimate B2B",
  thirdHeading = "Marketplace Platform",
  description = "Connect with verified buyers and sellers in our exclusive groups. Post leads, find opportunities, and grow your business in the most trusted B2B marketplace platform.",
  youtubeVideoId = "YHadvEgNruU", // Desktop video ID
  mobileVideoId = "39HqTUNw8MU", // Mobile/Shorts video ID
  ctaButtonText = "Start Trading",
  ctaButtonLink = "/auth",
}) => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="relative min-h-screen">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-blue-800"></div>
        {/* Placeholder content while loading */}
        <div className="relative z-10 flex items-center min-h-screen">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="text-white text-center">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                <span className="block">{mainHeading}</span>
                <span className="block">{subHeading}</span>
                <span className="block">{thirdHeading}</span>
              </h1>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      {/* Desktop Video (md and larger) */}
      <div className="absolute hidden md:block">
        <iframe
          src={`https://www.youtube.com/embed/${youtubeVideoId}?autoplay=1&mute=1&loop=1&playlist=${youtubeVideoId}&t=36s&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1&enablejsapi=1`}
          title="Desktop Background Video"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          style={{
            position: "fixed",
            top: "-5vh",
            left: 0,
            width: "100vw",
            height: "120vh",
            border: "none",
            margin: 0,
            padding: 0,
            zIndex: -1,
            pointerEvents: "none",
          }}
        ></iframe>
      </div>

      {/* Mobile Video (smaller than md) */}
      <div className="absolute inset-0  overflow-hidden md:hidden">
        <iframe
          className="absolute inset-0 w-full h-full"
          src={`https://www.youtube.com/embed/${mobileVideoId}?autoplay=1&mute=1&loop=1&playlist=${mobileVideoId}&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1&enablejsapi=1`}
          title="Mobile Background Video"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "120%",
            height: "110%",
            border: "none",
            margin: 0,
            padding: 0,
            zIndex: -1,
            pointerEvents: "none",
          }}
        ></iframe>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex items-center min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Side - Text Content */}
            <div className="text-white">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                <span className="block">{mainHeading}</span>
                <span className="block">{subHeading}</span>
                <span className="block">{thirdHeading}</span>
              </h1>

              <p className="text-lg md:text-xl text-gray-200 mb-8 max-w-2xl">
                {description}
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href={ctaButtonLink}
                  className="inline-flex items-center justify-center px-8 py-4 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg transition-colors duration-200 text-lg"
                >
                  {ctaButtonText}
                </a>
                <button className="inline-flex items-center justify-center px-8 py-4 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-gray-900 transition-colors duration-200 text-lg">
                  Learn More
                </button>
              </div>
            </div>

            {/* Right Side - Visual Elements */}
            <div className="hidden lg:block">
              <div className="relative">
                {/* Central Icon */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <div className="w-32 h-32 border-2 border-amber-600 rounded-lg relative">
                    <div className="absolute inset-4 border border-dashed border-amber-600 rounded flex items-center justify-center">
                      <span className="text-amber-600 text-2xl font-bold">
                        +
                      </span>
                    </div>
                    <div className="absolute top-2 left-2 w-2 h-2 bg-amber-600 rounded-full"></div>
                    <div className="absolute top-2 right-2 w-2 h-2 bg-amber-600 rounded-full"></div>
                    <div className="absolute bottom-2 left-2 w-2 h-2 bg-amber-600 rounded-full"></div>
                    <div className="absolute bottom-2 right-2 w-2 h-2 bg-amber-600 rounded-full"></div>
                  </div>
                </div>

                {/* Surrounding Icons */}
                <div className="relative w-96 h-96 mx-auto">
                  {/* Top Icon */}
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2">
                    <div className="w-16 h-16 border-2 border-dashed border-amber-600 rounded-full flex items-center justify-center">
                      <div className="w-8 h-6 border border-amber-600 rounded flex items-center justify-center">
                        <div className="w-4 h-2 bg-amber-600 rounded"></div>
                      </div>
                    </div>
                  </div>

                  {/* Right Icon */}
                  <div className="absolute top-1/2 right-0 transform translate-y-1/2">
                    <div className="w-16 h-16 border-2 border-dashed border-amber-600 rounded-full flex items-center justify-center">
                      <div className="w-6 h-8 border border-amber-600 rounded-full"></div>
                    </div>
                  </div>

                  {/* Bottom Icon */}
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2">
                    <div className="w-16 h-16 border-2 border-dashed border-amber-600 rounded-full flex items-center justify-center">
                      <div className="w-8 h-6 border border-amber-600 rounded flex items-center justify-center">
                        <div className="w-2 h-2 bg-amber-600 rounded"></div>
                      </div>
                    </div>
                  </div>

                  {/* Left Icon */}
                  <div className="absolute top-1/2 left-0 transform -translate-y-1/2">
                    <div className="w-16 h-16 border-2 border-dashed border-amber-600 rounded-full flex items-center justify-center">
                      <div className="w-8 h-6 border border-amber-600 rounded flex items-center justify-center">
                        <div className="w-2 h-2 bg-amber-600 rounded"></div>
                      </div>
                    </div>
                  </div>

                  {/* Connecting Lines */}
                  <svg className="absolute inset-0 w-full h-full">
                    <line
                      x1="50%"
                      y1="0"
                      x2="50%"
                      y2="50%"
                      stroke="#d97706"
                      strokeWidth="2"
                      strokeDasharray="5,5"
                    />
                    <line
                      x1="100%"
                      y1="50%"
                      x2="50%"
                      y2="50%"
                      stroke="#d97706"
                      strokeWidth="2"
                      strokeDasharray="5,5"
                    />
                    <line
                      x1="50%"
                      y1="50%"
                      x2="50%"
                      y2="100%"
                      stroke="#d97706"
                      strokeWidth="2"
                      strokeDasharray="5,5"
                    />
                    <line
                      x1="0"
                      y1="50%"
                      x2="50%"
                      y2="50%"
                      stroke="#d97706"
                      strokeWidth="2"
                      strokeDasharray="5,5"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Herosection;
