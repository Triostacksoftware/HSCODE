"use client";
import React, { useState, useEffect } from "react";

const Herosection = ({
  description,
  ctaButtonText,
  ctaButtonLink,
  mainHeading,
  subHeading,
  thirdHeading,
}) => {
  // Set default values with null coalescing
  const finalDescription =
    description ??
    "Connect with verified buyers and sellers in our exclusive groups. Post leads, find opportunities, and grow your business in the most trusted B2B marketplace platform.";
  const finalCtaButtonText = ctaButtonText ?? "Start Trading";
  const finalCtaButtonLink = ctaButtonLink ?? "/auth";
  const finalMainHeading =
    mainHeading ??
    "Connect Buyers & Sellers in the Ultimate B2B Marketplace Platform";
  const finalSubHeading = subHeading ?? "";
  const finalThirdHeading = thirdHeading ?? "";
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
                <span className="block">{finalMainHeading}</span>
                <span className="block">{finalSubHeading}</span>
                <span className="block">{finalThirdHeading}</span>
              </h1>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      {/* Desktop Background Image (md and larger) */}
      <div className="absolute hidden md:block inset-0">
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/1c/MAERSK_MC_KINNEY_M%C3%96LLER_%26_MARSEILLE_MAERSK_%2848694054418%29.jpg/1200px-MAERSK_MC_KINNEY_M%C3%96LLER_%26_MARSEILLE_MAERSK_%2848694054418%29.jpg"
          alt="Shipping Background"
          style={{
            position: "fixed",
            width: "100vw",
            height: "100vh",
            objectFit: "cover",
            zIndex: -1,
            pointerEvents: "none",
          }}
        />
      </div>

      {/* Mobile Background Image (smaller than md) */}
      <div className="absolute inset-0 overflow-hidden md:hidden">
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/1c/MAERSK_MC_KINNEY_M%C3%96LLER_%26_MARSEILLE_MAERSK_%2848694054418%29.jpg/1200px-MAERSK_MC_KINNEY_M%C3%96LLER_%26_MARSEILLE_MAERSK_%2848694054418%29.jpg"
          alt="Shipping Background"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            objectFit: "cover",
            zIndex: -1,
            pointerEvents: "none",
          }}
        />
        {/* Dark overlay for better text readability */}
        <div
          className="absolute inset-0 bg-black bg-opacity-50"
          style={{ zIndex: -1 }}
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex items-center min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Side - Text Content */}
            <div className="text-white">
              <h1 className="text-xl md:text-3xl lg:text-5xl font-bold leading-tight mb-6">
                <span className="block">{finalMainHeading}</span>
                <span className="block">{finalSubHeading}</span>
                <span className="block">{finalThirdHeading}</span>
              </h1>

              <p className="text-lg md:text-xl text-gray-200 mb-8 max-w-2xl">
                {finalDescription}
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href={finalCtaButtonLink}
                  className="inline-flex items-center justify-center px-8 py-4 text-white font-semibold rounded-lg transition-colors duration-200 text-lg"
                  style={{ backgroundColor: "var(--trade-orange)" }}
                  onMouseEnter={(e) =>
                    (e.target.style.backgroundColor = "#d45a1a")
                  }
                  onMouseLeave={(e) =>
                    (e.target.style.backgroundColor = "var(--trade-orange)")
                  }
                >
                  {finalCtaButtonText}
                </a>
                <button
                  className="inline-flex items-center justify-center px-8 py-4 border-2 font-semibold rounded-lg transition-colors duration-200 text-lg"
                  style={{
                    borderColor: "white",
                    color: "black",
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = "var(--cobalt-blue)";
                    e.target.style.color = "var(--brand-white)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = "white";
                    e.target.style.color = "black";
                  }}
                >
                  Learn More
                </button>
              </div>
            </div>

            {/* Right Side - Visual Elements */}
            <div className="hidden lg:block">
              <div className="relative">
                {/* Central Icon */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <div
                    className="w-32 h-32 border-2 rounded-lg relative"
                    style={{ borderColor: "var(--leaf-green)" }}
                  >
                    <div
                      className="absolute inset-4 border border-dashed rounded flex items-center justify-center"
                      style={{ borderColor: "var(--leaf-green)" }}
                    >
                      <span
                        className="text-2xl font-bold"
                        style={{ color: "var(--leaf-green)" }}
                      >
                        +
                      </span>
                    </div>
                    <div
                      className="absolute top-2 left-2 w-2 h-2 rounded-full"
                      style={{ backgroundColor: "var(--leaf-green)" }}
                    ></div>
                    <div
                      className="absolute top-2 right-2 w-2 h-2 rounded-full"
                      style={{ backgroundColor: "var(--leaf-green)" }}
                    ></div>
                    <div
                      className="absolute bottom-2 left-2 w-2 h-2 rounded-full"
                      style={{ backgroundColor: "var(--leaf-green)" }}
                    ></div>
                    <div
                      className="absolute bottom-2 right-2 w-2 h-2 rounded-full"
                      style={{ backgroundColor: "var(--leaf-green)" }}
                    ></div>
                  </div>
                </div>

                {/* Surrounding Icons */}
                <div className="relative w-96 h-96 mx-auto">
                  {/* Top Icon */}
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2">
                    <div
                      className="w-16 h-16 border-2 border-dashed rounded-full flex items-center justify-center"
                      style={{ borderColor: "var(--cobalt-blue)" }}
                    >
                      <div
                        className="w-8 h-6 border rounded flex items-center justify-center"
                        style={{ borderColor: "var(--cobalt-blue)" }}
                      >
                        <div
                          className="w-4 h-2 rounded"
                          style={{ backgroundColor: "var(--cobalt-blue)" }}
                        ></div>
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
                      stroke="var(--leaf-green)"
                      strokeWidth="2"
                      strokeDasharray="5,5"
                    />
                    <line
                      x1="100%"
                      y1="50%"
                      x2="50%"
                      y2="50%"
                      stroke="var(--leaf-green)"
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
