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
  capabilities = [
    {
      icon: HiOutlineUsers,
      title: "Enterprise Network",
      description: "Access to premium business connections worldwide",
    },
    {
      icon: HiOutlineShieldCheck,
      title: "Verified Ecosystem",
      description: "Bank-grade verification for all trading partners",
    },
    {
      icon: HiOutlineTrendingUp,
      title: "Market Intelligence",
      description: "Real-time analytics and trading insights",
    },
    {
      icon: HiOutlineGlobe,
      title: "Global Reach",
      description: "Seamless cross-border trade facilitation",
    },
  ],
  ctaText = "Explore Platform",
  ctaLink = "/auth",
}) => {
  return (
    <section className="bg-white py-20 md:py-15 md:pt-20  relative overflow-hidden montserrat">
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

        {/* Capabilities Grid */}
        <div className="grid  grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 mb-16">
          {capabilities.map((capability, index) => {
            const IconComponent = capability.icon;
            return (
              <div key={index} className="flex space-x-6">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-white border border-gray-200 rounded-sm flex items-center justify-center">
                    <IconComponent className="w-6 h-6 text-gray-600" />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-medium text-gray-900 mb-3 tracking-wide">
                    {capability.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed font-light">
                    {capability.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
