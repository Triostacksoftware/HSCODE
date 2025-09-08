"use client";

import React from "react";
import Link from "next/link";
import Navbar from "@/component/HomeComponent/Navbar";
import Footer from "@/component/HomeComponent/Footer";

const LearnMorePage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        >
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
              Learn More About HS Code
            </h1>
            <p className="text-xl md:text-2xl text-gray-200 max-w-3xl mx-auto">
              Discover how our platform revolutionizes B2B trade with comprehensive HS Code solutions
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        
        {/* What is HS Code Section */}
        <section className="mb-16">
          <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              What is HS Code?
            </h2>
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-700 mb-6 text-lg leading-relaxed">
                The Harmonized System (HS) Code is an internationally standardized system of names and numbers 
                to classify traded products. It was developed and maintained by the World Customs Organization (WCO) 
                and is used by customs authorities around the world to identify products when assessing duties and taxes.
              </p>
              <p className="text-gray-700 mb-6 text-lg leading-relaxed">
                HS Codes are essential for international trade as they help determine:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
                <li>Customs duties and taxes</li>
                <li>Trade statistics and reporting</li>
                <li>Import/export regulations and restrictions</li>
                <li>Trade agreement benefits</li>
                <li>Product safety and compliance requirements</li>
              </ul>
            </div>
          </div>
        </section>

        {/* How Our Platform Works */}
        <section className="mb-16">
          <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 text-center">
              How Our Platform Works
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🔍</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Search & Discover</h3>
                <p className="text-gray-600">
                  Use our advanced search to find the exact HS Code for your products with detailed descriptions and classifications.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🤝</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Connect & Trade</h3>
                <p className="text-gray-600">
                  Join exclusive B2B groups, post leads, and connect with verified buyers and sellers worldwide.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📈</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Grow Your Business</h3>
                <p className="text-gray-600">
                  Access market insights, trade opportunities, and expand your global reach with our comprehensive platform.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Key Features */}
        <section className="mb-16">
          <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 text-center">
              Key Features
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white text-sm">✓</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Comprehensive HS Code Database</h3>
                    <p className="text-gray-600">Access to millions of HS codes with detailed descriptions and classifications</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white text-sm">✓</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Advanced Search & Filtering</h3>
                    <p className="text-gray-600">Find the right HS code quickly with our intelligent search and filtering system</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white text-sm">✓</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">B2B Marketplace</h3>
                    <p className="text-gray-600">Connect with verified buyers and sellers in exclusive trade groups</p>
                  </div>
                </div>
              </div>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white text-sm">✓</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Real-time Updates</h3>
                    <p className="text-gray-600">Stay updated with the latest HS code changes and trade regulations</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white text-sm">✓</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Multi-language Support</h3>
                    <p className="text-gray-600">Access HS codes and descriptions in multiple languages for global reach</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white text-sm">✓</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Expert Support</h3>
                    <p className="text-gray-600">Get help from trade experts and customs professionals</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="mb-16">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 md:p-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 text-center">
              Why Choose Our Platform?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl text-white">⚡</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Fast & Accurate</h3>
                <p className="text-gray-600">Get instant, accurate HS code results with our advanced search technology</p>
              </div>
              <div className="text-center">
                <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl text-white">🌍</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Global Reach</h3>
                <p className="text-gray-600">Connect with traders from around the world in our exclusive B2B marketplace</p>
              </div>
              <div className="text-center">
                <div className="w-20 h-20 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl text-white">🔒</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Secure & Verified</h3>
                <p className="text-gray-600">All users are verified, ensuring safe and trustworthy trade connections</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="mb-16">
          <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Ready to Start Trading?
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Join thousands of traders who trust our platform for their HS code needs and B2B connections.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/auth"
                className="inline-flex items-center justify-center px-8 py-4 text-white font-semibold rounded-lg transition-colors duration-200 text-lg"
                style={{ backgroundColor: "var(--trade-orange)" }}
                onMouseEnter={(e) => (e.target.style.backgroundColor = "#d45a1a")}
                onMouseLeave={(e) => (e.target.style.backgroundColor = "var(--trade-orange)")}
              >
                Get Started Now
              </Link>
              <Link
                href="/"
                className="inline-flex items-center justify-center px-8 py-4 border-2 font-semibold rounded-lg transition-colors duration-200 text-lg"
                style={{
                  borderColor: "var(--cobalt-blue)",
                  color: "var(--cobalt-blue)",
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = "var(--cobalt-blue)";
                  e.target.style.color = "white";
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = "transparent";
                  e.target.style.color = "var(--cobalt-blue)";
                }}
              >
                Back to Home
              </Link>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="mb-16">
          <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 text-center">
              Frequently Asked Questions
            </h2>
            <div className="space-y-6">
              <div className="border-b border-gray-200 pb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  How accurate are the HS codes on your platform?
                </h3>
                <p className="text-gray-600">
                  Our HS codes are sourced from official customs databases and are regularly updated to ensure accuracy. 
                  We also provide detailed descriptions and classifications to help you verify the correct code for your products.
                </p>
              </div>
              <div className="border-b border-gray-200 pb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Can I trade directly through your platform?
                </h3>
                <p className="text-gray-600">
                  Yes! Our platform includes a comprehensive B2B marketplace where you can post leads, find opportunities, 
                  and connect with verified buyers and sellers from around the world.
                </p>
              </div>
              <div className="border-b border-gray-200 pb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Is there a cost to use the HS code search?
                </h3>
                <p className="text-gray-600">
                  Basic HS code search is free for all users. We also offer premium features and advanced marketplace 
                  access through our subscription plans.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  How do I get started?
                </h3>
                <p className="text-gray-600">
                  Simply sign up for a free account, and you'll have immediate access to our HS code database and 
                  basic marketplace features. You can upgrade anytime to unlock premium features.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
};

export default LearnMorePage;
