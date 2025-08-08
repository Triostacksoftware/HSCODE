import React from "react";
import CountUp from "./animatedcount/CountUp";

const Stats = ({
  title = "Trusted by Industry Leaders",
  subtitle = "Building the future of B2B commerce through innovation and reliability",
  stats = [
    {
      id: 1,
      number: 12000,
      suffix: "+",
      label: "Active Traders",
      description: "Verified professionals",
    },
    {
      id: 2,
      number: 45,
      suffix: "+",
      label: "Global Markets",
      description: "Countries served",
    },
    {
      id: 3,
      number: 850,
      suffix: "K+",
      label: "Successful Deals",
      description: "Completed transactions",
    },
    {
      id: 4,
      number: 24,
      suffix: "/7",
      label: "Support",
      description: "Round-the-clock service",
    },
  ],
}) => {
  return (
    <div className="bg-gray-900 py-20 md:py-28 relative overflow-hidden montserrat">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-purple-700"></div>
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='10' cy='10' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        ></div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Header */}
        <div className="text-center mb-16 md:mb-20">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-light text-white mb-6 tracking-wide">
            {title}
          </h2>
          {subtitle && (
            <p className="text-gray-300 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed font-light">
              {subtitle}
            </p>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
          {stats.map((stat, index) => (
            <div
              key={stat.id}
              className="text-center group"
              style={{
                animationDelay: `${index * 200}ms`,
              }}
            >
              {/* Number */}
              <div className="mb-4">
                <div className="flex items-baseline justify-center">
                  <CountUp
                    from={0}
                    to={stat.number}
                    separator=","
                    direction="up"
                    duration={2.5}
                    className="text-4xl md:text-5xl lg:text-6xl font-extralight text-white tracking-tight"
                  />
                  <span className="text-4xl md:text-5xl lg:text-6xl font-extralight text-blue-400 ml-1 tracking-tight">
                    {stat.suffix}
                  </span>
                </div>
              </div>

              {/* Divider Line */}
              <div className="w-12 h-px bg-gradient-to-r from-transparent via-blue-400 to-transparent mx-auto mb-4 group-hover:w-16 transition-all duration-500"></div>

              {/* Label */}
              <h3 className="text-xl md:text-2xl font-light text-white mb-2 tracking-wide">
                {stat.label}
              </h3>

              {/* Description */}
              <p className="text-gray-400 text-sm md:text-base font-light leading-relaxed">
                {stat.description}
              </p>
            </div>
          ))}
        </div>

        {/* Bottom Section */}
        <div className="text-center mt-20 md:mt-24">
          <div className="max-w-4xl mx-auto">
            <div className="border border-gray-700 rounded-lg p-8 md:p-12 bg-gray-800/50 backdrop-blur-sm">
              <h3 className="text-2xl md:text-3xl font-light text-white mb-6 tracking-wide">
                Join the Elite Network
              </h3>
              <p className="text-gray-300 text-lg leading-relaxed mb-8 font-light">
                Experience premium B2B trading with our exclusive platform
                designed for serious business professionals.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="/auth"
                  className="inline-flex items-center justify-center px-8 py-4 bg-white text-gray-900 font-medium rounded-sm transition-all duration-300 hover:bg-gray-100 hover:scale-105 tracking-wide uppercase text-sm"
                >
                  Get Started
                </a>
                <a
                  href="/about"
                  className="inline-flex items-center justify-center px-8 py-4 border border-gray-600 text-white font-medium rounded-sm hover:border-gray-400 hover:bg-gray-800/50 transition-all duration-300 tracking-wide uppercase text-sm"
                >
                  Learn More
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Stats;
