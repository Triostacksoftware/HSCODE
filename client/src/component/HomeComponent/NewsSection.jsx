"use client";
import React, { useState } from "react";
import { HiChevronRight, HiClock, HiEye } from "react-icons/hi";

const NewsSection = ({
  title = "LATEST NEWS",
  subtitle = "Stay updated with the latest trends and insights",
  news = [
    {
      id: 1,
      title: "Twenty Kitchen Trends in 2020",
      excerpt:
        "Architectural homebuilder is the title described by simply 45% of a series of structures that share welcomed visitors to dream a result from and...",
      image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400",
      category: "Interior",
      date: "Apr 15",
      newsUrl: "https://example.com/kitchen-trends-2020",
    },
    {
      id: 2,
      title: "Modern Office Design Concepts",
      excerpt:
        "Exploring the latest trends in workspace design and productivity enhancement through innovative office layouts...",
      image:
        "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400",
      category: "Business",
      date: "Apr 12",
      newsUrl: "https://example.com/modern-office-design",
    },
    {
      id: 3,
      title: "Sustainable Architecture Revolution",
      excerpt:
        "How green building practices are reshaping the construction industry and creating eco-friendly living spaces...",
      image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400",
      category: "Architecture",
      date: "Apr 10",
      newsUrl: "https://example.com/sustainable-architecture",
    },
    {
      id: 4,
      title: "Smart Home Technology Integration",
      excerpt:
        "The future of home automation and how IoT devices are transforming modern living experiences...",
      image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400",
      category: "Technology",
      date: "Apr 08",
      newsUrl: "https://example.com/smart-home-technology",
    },
    {
      id: 5,
      title: "Minimalist Interior Design Philosophy",
      excerpt:
        "Understanding the principles of minimalism in home design and creating serene living spaces...",
      image:
        "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400",
      category: "Interior",
      date: "Apr 05",
      newsUrl: "https://example.com/minimalist-interior-design",
    },
  ],
  viewAllLink = "/news",
}) => {
  const [hoveredCard, setHoveredCard] = useState(null);

  return (
    <section
      id="news"
      className="bg-gray-50 py-20 md:py-28 relative overflow-hidden montserrat"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300"></div>
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='10' cy='10' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        ></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Header */}
        <div className="text-center mb-16 md:mb-20">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-light mb-6 tracking-wide" style={{ color: 'var(--cobalt-blue)' }}>
            {title}
          </h2>
          {subtitle && (
            <p className="text-lg md:text-xl max-w-3xl mx-auto leading-relaxed font-light" style={{ color: 'var(--brand-black)' }}>
              {subtitle}
            </p>
          )}
        </div>

        {/* News Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {news.map((item, index) => (
            <div
              key={item.id}
              className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 overflow-hidden"
              onMouseEnter={() => setHoveredCard(item.id)}
              onMouseLeave={() => setHoveredCard(null)}
            >
                              {/* Image */}
                <div className="relative overflow-hidden rounded-t-lg h-48">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                  />
                <div className="absolute top-4 left-4">
                  <span className="inline-block px-3 py-1 text-white text-xs font-medium rounded-full"
                        style={{ backgroundColor: 'var(--leaf-green)' }}>
                    {item.category}
                  </span>
                </div>
                <div className="absolute top-4 right-4">
                  <span className="inline-block px-3 py-1 bg-white/90 text-gray-700 text-xs font-medium rounded-full">
                    {item.date}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-3 line-clamp-2 transition-colors duration-200"
                    style={{ color: 'var(--cobalt-blue)' }}
                    onMouseEnter={(e) => e.target.style.color = 'var(--leaf-green)'}
                    onMouseLeave={(e) => e.target.style.color = 'var(--cobalt-blue)'}>
                  {item.title}
                </h3>
                <p className="text-sm leading-relaxed mb-4 line-clamp-3" style={{ color: 'var(--brand-black)' }}>
                  {item.excerpt}
                </p>

                {/* Read More Button */}
                <div className="flex items-center justify-between">
                  {item.newsUrl ? (
                    <a
                      href={item.newsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center font-medium text-sm transition-colors duration-200 group"
                      style={{ color: 'var(--trade-orange)' }}
                      onMouseEnter={(e) => e.target.style.color = '#d45a1a'}
                      onMouseLeave={(e) => e.target.style.color = 'var(--trade-orange)'}
                    >
                      Read More
                      <HiChevronRight className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform duration-200" />
                    </a>
                  ) : (
                    <span className="inline-flex items-center text-gray-400 font-medium text-sm">
                      Read More
                      <HiChevronRight className="w-4 h-4 ml-1" />
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-12">
          <a
            href={viewAllLink}
            className="inline-flex items-center px-8 py-4 text-white font-medium rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            style={{ backgroundColor: 'var(--trade-orange)' }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#d45a1a'}
            onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--trade-orange)'}
          >
            View All News
            <HiChevronRight className="ml-2 w-5 h-5" />
          </a>
        </div>
      </div>
    </section>
  );
};

export default NewsSection;
