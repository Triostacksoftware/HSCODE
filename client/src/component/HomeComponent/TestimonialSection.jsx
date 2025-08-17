"use client";
import React, { useState, useEffect } from "react";
import { HiChevronLeft, HiChevronRight, HiStar } from "react-icons/hi";

const TestimonialSection = ({ title, subtitle, testimonials = [] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Auto-advance slider every 5 seconds
  useEffect(() => {
    if (testimonials.length <= 1) return;

    const interval = setInterval(() => {
      nextSlide();
    }, 5000);

    return () => clearInterval(interval);
  }, [currentIndex, testimonials.length]);

  const nextSlide = () => {
    if (testimonials.length <= 1) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
      setIsTransitioning(false);
    }, 300);
  };

  const prevSlide = () => {
    if (testimonials.length <= 1) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex(
        (prev) => (prev - 1 + testimonials.length) % testimonials.length
      );
      setIsTransitioning(false);
    }, 300);
  };

  const goToSlide = (index) => {
    if (index === currentIndex) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex(index);
      setIsTransitioning(false);
    }, 300);
  };

  if (!testimonials || testimonials.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4" style={{ color: 'var(--cobalt-blue)' }}>
            {title || "What our customers say"}
          </h2>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--brand-black)' }}>
            {subtitle || "Success stories from our community"}
          </p>
        </div>

        {/* Testimonials Slider */}
        <div className="relative max-w-4xl mx-auto">
          {/* Main Testimonial */}
          <div className="bg-[#F9FAFB] rounded-2xl shadow-lg p-8 md:p-12 text-center relative">
            {/* Quote Icon */}
            <div className="absolute top-6 left-8 text-4xl text-blue-100">
              "
            </div>

            {/* Testimonial Content */}
            <div className="mb-8">
              <p className="text-lg md:text-xl leading-relaxed mb-6" style={{ color: 'var(--brand-black)' }}>
                {testimonials[currentIndex]?.content ||
                  "No testimonial content available"}
              </p>

              {/* Rating Stars */}
              <div className="flex justify-center items-center mb-6">
                {[...Array(5)].map((_, i) => (
                  <HiStar
                    key={i}
                    className={`w-6 h-6 ${
                      i < (testimonials[currentIndex]?.rating || 5)
                        ? "text-yellow-400 fill-current"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Author Info */}
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full overflow-hidden mb-4">
                <img
                  src={
                    testimonials[currentIndex]?.image || "/default-avatar.png"
                  }
                  alt={testimonials[currentIndex]?.author || "Author"}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = "/default-avatar.png";
                  }}
                />
              </div>
              <div>
                <h4 className="font-semibold text-lg" style={{ color: 'var(--cobalt-blue)' }}>
                  {testimonials[currentIndex]?.name || "Unknown Author"}
                </h4>
                <p className="text-sm" style={{ color: 'var(--brand-black)' }}>
                  {testimonials[currentIndex]?.role || "Position"}
                </p>
                <p className="font-medium" style={{ color: 'var(--trade-orange)' }}>
                  {testimonials[currentIndex]?.company || "Company"}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation Arrows */}
          {testimonials.length > 1 && (
            <>
              <button
                onClick={prevSlide}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition-shadow duration-200 z-10"
                aria-label="Previous testimonial"
              >
                <HiChevronLeft className="w-6 h-6" style={{ color: 'var(--cobalt-blue)' }} />
              </button>

              <button
                onClick={nextSlide}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition-shadow duration-200 z-10"
                aria-label="Next testimonial"
              >
                <HiChevronRight className="w-6 h-6" style={{ color: 'var(--cobalt-blue)' }} />
              </button>
            </>
          )}
        </div>

        {/* Dots Indicator */}
        {testimonials.length > 1 && (
          <div className="flex justify-center mt-8 space-x-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 rounded-full transition-all duration-200 ${
                  index === currentIndex
                    ? "scale-125"
                    : ""
                }`}
                style={{ 
                  backgroundColor: index === currentIndex ? 'var(--leaf-green)' : 'var(--cobalt-blue)',
                  opacity: index === currentIndex ? '1' : '0.3'
                }}
                onMouseEnter={(e) => {
                  if (index !== currentIndex) {
                    e.target.style.opacity = '0.6';
                  }
                }}
                onMouseLeave={(e) => {
                  if (index !== currentIndex) {
                    e.target.style.opacity = '0.3';
                  }
                }}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
        )}

        {/* Testimonial Counter */}
        {testimonials.length > 1 && (
          <div className="text-center mt-4 text-sm" style={{ color: 'var(--cobalt-blue)' }}>
            {currentIndex + 1} of {testimonials.length}
          </div>
        )}
      </div>
    </section>
  );
};

export default TestimonialSection;
