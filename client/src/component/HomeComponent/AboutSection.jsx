"use client";
import React from "react";
import {
  HiOutlineUsers,
  HiOutlineShieldCheck,
  HiOutlineTrendingUp,
  HiOutlineGlobe,
  HiOutlineCheckCircle,
  HiOutlineSupport,
  HiOutlineBadgeCheck,
} from "react-icons/hi";

const AboutSection = ({
  title = "Building Tomorrow's Trade Network",
  subtitle = "Where global commerce meets innovation",
  description = "We've engineered the most sophisticated B2B marketplace ecosystem, connecting verified enterprises across continents. Our platform transcends traditional trading boundaries, facilitating seamless international commerce through advanced technology, rigorous verification processes, and unparalleled market intelligence.",
  features = [
    {
      icon: "👥",
      title: "Enterprise Network",
      description: "Access to premium business connections worldwide",
    },
    {
      icon: "🛡️",
      title: "Verified Ecosystem",
      description: "Bank-grade verification for all trading partners",
    },
    {
      icon: "📈",
      title: "Market Intelligence",
      description: "Real-time analytics and trading insights",
    },
    {
      icon: "🌍",
      title: "Global Reach",
      description: "Seamless cross-border trade facilitation",
    },
  ],
  stats = [
    {
      number: "50K+",
      label: "Global Partners",
      description: "Verified trading entities",
    },
    { number: "190", label: "Countries", description: "Worldwide presence" },
    {
      number: "99.8%",
      label: "Success Rate",
      description: "Transaction completion",
    },
    {
      number: "24/7",
      label: "Expert Support",
      description: "Always available",
    },
  ],
  ctaText = "Explore Platform",
  ctaLink = "/auth",
}) => {
  // Icon mapping for dynamic icons
  const iconMap = {
    "👥": HiOutlineUsers,
    "🛡️": HiOutlineShieldCheck,
    "📈": HiOutlineTrendingUp,
    "🌍": HiOutlineGlobe,
    "✅": HiOutlineCheckCircle,
    "🔄": HiOutlineSupport,
    "🏆": HiOutlineBadgeCheck,
  };

  return (
    <section
      id="about"
      className="bg-white py-20 md:py-15 md:pt-20  relative overflow-hidden montserrat"
    >
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300"></div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Header Section */}
        <div className="text-center mb-16 md:mb-20">
          <div className="mb-6">
            <span className="text-sm font-medium text-blue-600 tracking-wider uppercase">
              {subtitle}
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-light text-gray-900 mb-8 tracking-wide leading-tight">
            {title}
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed font-light">
            {description}
          </p>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="mb-3">
                <span className="text-3xl md:text-4xl lg:text-5xl font-extralight text-gray-900 tracking-tight">
                  {stat.number}
                </span>
              </div>
              <h3 className="text-base md:text-lg font-medium text-gray-900 mb-1 tracking-wide">
                {stat.label}
              </h3>
              <p className="text-sm text-gray-500 font-light">
                {stat.description}
              </p>
            </div>
          ))}
        </div>

        {/* Capabilities Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {features.map((feature, index) => {
            const IconComponent = iconMap[feature.icon] || HiOutlineUsers;
            return (
              <div key={index} className="text-center group">
                <div className="mb-4 flex justify-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-50 to-blue-100 rounded-full flex items-center justify-center group-hover:from-blue-100 group-hover:to-blue-200 transition-all duration-300">
                    <IconComponent className="w-8 h-8 text-blue-600" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 tracking-wide">
                  {feature.title}
                </h3>
                <p className="text-gray-600 font-light leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <a
            href={ctaLink}
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            {ctaText}
            <svg
              className="ml-2 w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
