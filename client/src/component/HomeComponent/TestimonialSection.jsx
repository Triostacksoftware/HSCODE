"use client";
import React, { useState } from "react";
import { HiChevronLeft, HiChevronRight } from "react-icons/hi";

const TestimonialSection = ({
  title = "What our Customer says about us",
  testimonials = [
    {
      id: 1,
      quote:
        "Partnering with creators through PassionFroot has been a game-changer for our B2B marketplace platform. By collaborating with top businesses, we've reached thousands of verified buyers and sellers.",
      author: "John Roche",
      position: "Startup and VC Partnerships",
      company: "TechCorp",
      avatar:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
      companyLogo:
        "https://via.placeholder.com/120x40/4F46E5/FFFFFF?text=INTERCOM",
    },
    {
      id: 2,
      quote:
        "The platform has revolutionized how we connect with international suppliers. The lead generation system and group functionality have increased our conversion rates by 300%.",
      author: "Sarah Chen",
      position: "Head of Procurement",
      company: "GlobalTrade Inc",
      avatar:
        "https://images.unsplash.com/photo-1494790108755-2616b332b633?w=100&h=100&fit=crop&crop=face",
      companyLogo:
        "https://via.placeholder.com/120x40/059669/FFFFFF?text=GLOBALTRADE",
    },
    {
      id: 3,
      quote:
        "Outstanding B2B marketplace experience! The verification process ensures we only deal with legitimate businesses, and the analytics dashboard provides incredible insights into our trading patterns.",
      author: "Michael Rodriguez",
      position: "Business Development Director",
      company: "InnovateCorp",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
      companyLogo:
        "https://via.placeholder.com/120x40/DC2626/FFFFFF?text=INNOVATE",
    },
    {
      id: 4,
      quote:
        "We've found our most valuable business partners through this platform. The category-based grouping and real-time messaging have streamlined our entire procurement process.",
      author: "Emily Watson",
      position: "Supply Chain Manager",
      company: "FutureTech Solutions",
      avatar:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
      companyLogo:
        "https://via.placeholder.com/120x40/7C3AED/FFFFFF?text=FUTURETECH",
    },
    {
      id: 5,
      quote:
        "The lead document management and secure transaction features give us complete confidence when dealing with international partners. Highly recommended for serious B2B trading.",
      author: "David Park",
      position: "International Trade Specialist",
      company: "TradeLink Global",
      avatar:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face",
      companyLogo:
        "https://via.placeholder.com/120x40/0891B2/FFFFFF?text=TRADELINK",
    },
  ],
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const nextTestimonial = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
      setIsTransitioning(false);
    }, 300);
  };

  const prevTestimonial = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex(
        (prev) => (prev - 1 + testimonials.length) % testimonials.length
      );
      setIsTransitioning(false);
    }, 300);
  };

  const goToTestimonial = (index) => {
    if (isTransitioning || index === currentIndex) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex(index);
      setIsTransitioning(false);
    }, 300);
  };

  const currentTestimonial = testimonials[currentIndex];

  return (
    <div className="bg-gray-50 py-16 md:py-20 montserrat">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Title */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            {title}
          </h2>
        </div>

        {/* Main Testimonial */}
        <div className="relative">
          {/* Navigation Buttons */}
          <button
            onClick={prevTestimonial}
            disabled={isTransitioning}
            className={`absolute left-0 md:-left-12 top-1/2 transform -translate-y-1/2 z-10 bg-white hover:bg-gray-50 border-2 border-gray-300 hover:border-gray-400 text-gray-600 hover:text-gray-800 rounded-full p-3 shadow-lg transition-all duration-300 ${
              isTransitioning
                ? "opacity-50 cursor-not-allowed"
                : "hover:scale-110"
            }`}
          >
            <HiChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
          </button>

          <button
            onClick={nextTestimonial}
            disabled={isTransitioning}
            className={`absolute right-0 md:-right-12 top-1/2 transform -translate-y-1/2 z-10 bg-white hover:bg-gray-50 border-2 border-gray-300 hover:border-gray-400 text-gray-600 hover:text-gray-800 rounded-full p-3 shadow-lg transition-all duration-300 ${
              isTransitioning
                ? "opacity-50 cursor-not-allowed"
                : "hover:scale-110"
            }`}
          >
            <HiChevronRight className="w-5 h-5 md:w-6 md:h-6" />
          </button>

          {/* Testimonial Content */}
          <div className="mx-8 md:mx-16">
            <div
              className={`transition-all duration-300 ease-in-out ${
                isTransitioning
                  ? "opacity-0 transform scale-95"
                  : "opacity-100 transform scale-100"
              }`}
            >
              {/* Company Logo */}
              <div className="text-center mb-8">
                <div className="inline-block bg-white rounded-lg px-6 py-3 shadow-md">
                  <img
                    src={currentTestimonial.companyLogo}
                    alt={`${currentTestimonial.company} logo`}
                    className="h-8 md:h-10 mx-auto"
                  />
                </div>
              </div>

              {/* Quote */}
              <div className="text-center mb-8">
                <blockquote className="text-lg md:text-xl lg:text-2xl text-gray-700 leading-relaxed italic max-w-4xl mx-auto">
                  "{currentTestimonial.quote}"
                </blockquote>
              </div>

              {/* Author Info */}
              <div className="text-center">
                <div className="flex items-center justify-center space-x-4">
                  <img
                    src={currentTestimonial.avatar}
                    alt={currentTestimonial.author}
                    className="w-12 h-12 md:w-16 md:h-16 rounded-full object-cover border-2 border-white shadow-md"
                  />
                  <div className="text-left">
                    <h4 className="text-base md:text-lg font-semibold text-gray-900">
                      {currentTestimonial.author}
                    </h4>
                    <p className="text-sm md:text-base text-gray-600">
                      {currentTestimonial.position}
                    </p>
                    <p className="text-sm text-blue-600 font-medium">
                      {currentTestimonial.company}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Dots Indicator */}
        <div className="flex justify-center mt-12 space-x-3">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => goToTestimonial(index)}
              disabled={isTransitioning}
              className={`w-3 h-3 rounded-full transition-all duration-300 transform ${
                currentIndex === index
                  ? "bg-blue-600 scale-125 shadow-lg"
                  : "bg-gray-300 hover:bg-gray-400 hover:scale-110"
              } ${isTransitioning ? "pointer-events-none opacity-50" : ""}`}
            />
          ))}
        </div>

        {/* Side Testimonials Preview */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials
            .filter((_, index) => index !== currentIndex)
            .slice(0, 3)
            .map((testimonial, index) => (
              <div
                key={testimonial.id}
                className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer border border-gray-200"
                onClick={() =>
                  goToTestimonial(
                    testimonials.findIndex((t) => t.id === testimonial.id)
                  )
                }
              >
                {/* Mini Company Logo */}
                <div className="mb-4">
                  <img
                    src={testimonial.companyLogo}
                    alt={`${testimonial.company} logo`}
                    className="h-6 opacity-60"
                  />
                </div>

                {/* Mini Quote */}
                <blockquote className="text-sm text-gray-600 mb-4 line-clamp-3 italic">
                  "{testimonial.quote.substring(0, 120)}..."
                </blockquote>

                {/* Mini Author */}
                <div className="flex items-center space-x-3">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.author}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <div>
                    <h5 className="text-sm font-semibold text-gray-900">
                      {testimonial.author}
                    </h5>
                    <p className="text-xs text-gray-500">
                      {testimonial.position}
                    </p>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Custom CSS for line clamping */}
      <style jsx>{`
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default TestimonialSection;
