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
            <span className="text-sm font-medium tracking-wider uppercase" style={{ color: 'var(--cobalt-blue)' }}>
              {subtitle}
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-light mb-8 tracking-wide leading-tight" style={{ color: 'var(--cobalt-blue)' }}>
            {title}
          </h2>
          <p className="text-lg md:text-xl max-w-4xl mx-auto leading-relaxed font-light" style={{ color: 'var(--brand-black)' }}>
            {description}
          </p>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="mb-3">
                <span className="text-3xl md:text-4xl lg:text-5xl font-extralight tracking-tight" style={{ color: 'var(--leaf-green)' }}>
                  {stat.number}
                </span>
              </div>
              <h3 className="text-base md:text-lg font-medium mb-1 tracking-wide" style={{ color: 'var(--cobalt-blue)' }}>
                {stat.label}
              </h3>
              <p className="text-sm font-light" style={{ color: 'var(--brand-black)' }}>
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
                  <div className="w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300"
                       style={{ backgroundColor: 'var(--cobalt-blue)' }}
                       onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--leaf-green)'}
                       onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--cobalt-blue)'}>
                    <IconComponent className="w-8 h-8" style={{ color: 'var(--brand-white)' }} />
                  </div>
                </div>
                <h3 className="text-lg font-semibold mb-3 tracking-wide" style={{ color: 'var(--cobalt-blue)' }}>
                  {feature.title}
                </h3>
                <p className="font-light leading-relaxed" style={{ color: 'var(--brand-black)' }}>
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
            className="inline-flex items-center px-8 py-4 text-white font-medium rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            style={{ backgroundColor: 'var(--trade-orange)' }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#d45a1a'}
            onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--trade-orange)'}
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
