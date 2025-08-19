"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "../../component/HomeComponent/Navbar";
import useHomeData from "../../utilities/useHomeData";
import useCountryCode from "../../utilities/useCountryCode";
import {
  HiCheck,
  HiStar,
  HiShieldCheck,
  HiGlobe,
  HiUsers,
  HiChartBar,
} from "react-icons/hi";

const SubscriptionPage = () => {
  const [selectedPlan, setSelectedPlan] = useState("basic");
  const [billingCycle, setBillingCycle] = useState("monthly");

  const { countryCode } = useCountryCode();
  const { homeData, loading, error } = useHomeData(countryCode);

  // Default plans fallback
  const defaultPlans = [
    {
      id: "basic",
      name: "Basic Plan",
      price: { monthly: 29, yearly: 290 },
      description: "Perfect for small businesses getting started",
      features: [
        "Access to basic categories",
        "Limited lead generation",
        "Basic chat support",
        "Standard analytics",
        "Email notifications",
      ],
      icon: "👥",
      popular: false,
      color: "gray",
    },
    {
      id: "professional",
      name: "Professional Plan",
      price: { monthly: 79, yearly: 790 },
      description: "Ideal for growing businesses",
      features: [
        "All categories access",
        "Advanced lead generation",
        "Priority chat support",
        "Advanced analytics",
        "Push notifications",
        "Custom branding",
        "API access",
      ],
      icon: "📊",
      popular: true,
      color: "blue",
    },
    {
      id: "enterprise",
      name: "Enterprise Plan",
      price: { monthly: 199, yearly: 1990 },
      description: "For large enterprises and corporations",
      features: [
        "Unlimited access",
        "Premium lead generation",
        "24/7 dedicated support",
        "Custom analytics dashboard",
        "White-label solution",
        "Advanced API access",
        "Custom integrations",
        "Dedicated account manager",
      ],
      icon: "🌍",
      popular: false,
      color: "purple",
    },
  ];

  // Use home data if available, otherwise fallback to defaults
  const subscriptionData = homeData?.subscriptionPlans;
  const plans = subscriptionData?.plans || defaultPlans;
  const currency = subscriptionData?.currency || "USD";
  const yearlyDiscount = subscriptionData?.yearlyDiscount || 17;
  const sectionTitle = subscriptionData?.title || "Choose Your Plan";
  const sectionSubtitle =
    subscriptionData?.subtitle ||
    "Select the perfect plan for your business needs. All plans include our core B2B marketplace features with different levels of access and support.";
  const faqData = subscriptionData?.faqSection || {
    title: "Frequently Asked Questions",
    faqs: [
      {
        id: 1,
        question: "Can I change my plan at any time?",
        answer:
          "Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle.",
      },
      {
        id: 2,
        question: "Is there a free trial available?",
        answer:
          "We offer a 7-day free trial for all plans. No credit card required to start your trial.",
      },
      {
        id: 3,
        question: "What payment methods do you accept?",
        answer:
          "We accept all major credit cards, PayPal, and bank transfers for annual plans.",
      },
      {
        id: 4,
        question: "Do you offer refunds?",
        answer:
          "We offer a 30-day money-back guarantee. If you're not satisfied, contact our support team for a full refund.",
      },
    ],
  };
  const ctaData = subscriptionData?.ctaSection || {
    title: "Ready to Get Started?",
    subtitle:
      "Join thousands of businesses already using HSCODE to grow their B2B network.",
    primaryButtonText: "Start Free Trial",
    primaryButtonLink: "/auth",
    secondaryButtonText: "Contact Sales",
    secondaryButtonLink: "/contact",
  };

  const currentPlan = plans.find((plan) => plan.id === selectedPlan);
  const discount = billingCycle === "yearly" ? yearlyDiscount / 100 : 0;

  // Get icon component based on plan icon
  const getIconComponent = (icon) => {
    const iconMap = {
      "👥": HiUsers,
      "📊": HiChartBar,
      "🌍": HiGlobe,
      "🌟": HiStar,
    };
    return iconMap[icon] || HiUsers;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Error Loading Plans
          </h2>
          <p className="text-gray-600 mb-4">
            Unable to load subscription plans. Please try again later.
          </p>
          <Link href="/" className="text-blue-600 hover:text-blue-700">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <div className="pt-20">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            {/* Back Button */}
            <div className="mb-6">
              <Link
                href="/"
                className="inline-flex items-center text-blue-600 hover:text-blue-700 transition-colors"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                Back to Home
              </Link>
            </div>

            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                {sectionTitle}
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                {sectionSubtitle}
              </p>
            </div>
          </div>
        </div>

        {/* Billing Toggle */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex justify-center items-center space-x-4">
              <span
                className={`text-sm font-medium ${
                  billingCycle === "monthly" ? "text-gray-900" : "text-gray-500"
                }`}
              >
                Monthly
              </span>
              <button
                onClick={() =>
                  setBillingCycle(
                    billingCycle === "monthly" ? "yearly" : "monthly"
                  )
                }
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  billingCycle === "yearly" ? "bg-blue-600" : "bg-gray-200"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    billingCycle === "yearly"
                      ? "translate-x-6"
                      : "translate-x-1"
                  }`}
                />
              </button>
              <span
                className={`text-sm font-medium ${
                  billingCycle === "yearly" ? "text-gray-900" : "text-gray-500"
                }`}
              >
                Yearly
                {billingCycle === "yearly" && (
                  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Save {yearlyDiscount}%
                  </span>
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Plans */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan) => {
              const IconComponent = getIconComponent(plan.icon);
              const price = plan.price[billingCycle];
              const discountedPrice = price * (1 - discount);

              return (
                <div
                  key={plan.id}
                  className={`relative bg-white rounded-2xl shadow-lg border-2 transition-all duration-200 hover:shadow-xl ${
                    plan.popular
                      ? "border-blue-500 scale-105"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-blue-500 text-white">
                        <HiStar className="w-4 h-4 mr-1" />
                        Most Popular
                      </span>
                    </div>
                  )}

                  <div className="p-8">
                    <div className="flex items-center mb-4">
                      <IconComponent className="w-8 h-8 text-blue-600 mr-3" />
                      <h3 className="text-2xl font-bold text-gray-900">
                        {plan.name}
                      </h3>
                    </div>

                    <p className="text-gray-600 mb-6">{plan.description}</p>

                    <div className="mb-6">
                      <div className="flex items-baseline">
                        <span className="text-4xl font-bold text-gray-900">
                          {currency === "USD" ? "$" : currency}{" "}
                          {discountedPrice.toFixed(0)}
                        </span>
                        <span className="text-gray-500 ml-2">
                          /{billingCycle === "monthly" ? "month" : "year"}
                        </span>
                      </div>
                      {billingCycle === "yearly" && (
                        <p className="text-sm text-gray-500 mt-1">
                          <span className="line-through">
                            {currency === "USD" ? "$" : currency} {price}
                          </span>{" "}
                          per year
                        </p>
                      )}
                    </div>

                    <ul className="space-y-3 mb-8">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start">
                          <HiCheck className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <button
                      onClick={() => setSelectedPlan(plan.id)}
                      className={`w-full py-3 px-6 rounded-lg font-medium transition-colors ${
                        plan.popular
                          ? "bg-blue-600 text-white hover:bg-blue-700"
                          : "bg-gray-100 text-gray-900 hover:bg-gray-200"
                      }`}
                    >
                      {selectedPlan === plan.id
                        ? "Current Plan"
                        : "Choose Plan"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-white border-t border-gray-200">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
              {faqData.title}
            </h2>

            <div className="space-y-6">
              {faqData.faqs.map((faq) => (
                <div key={faq.id} className="border-b border-gray-200 pb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {faq.question}
                  </h3>
                  <p className="text-gray-600">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-blue-600">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              {ctaData.title}
            </h2>
            <p className="text-xl text-blue-100 mb-8">{ctaData.subtitle}</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={ctaData.primaryButtonLink}
                className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-white hover:bg-gray-50 transition-colors"
              >
                {ctaData.primaryButtonText}
              </Link>
              <Link
                href={ctaData.secondaryButtonLink}
                className="inline-flex items-center px-8 py-3 border border-white text-base font-medium rounded-md text-white hover:bg-blue-700 transition-colors"
              >
                <HiShieldCheck className="w-5 h-5 mr-2" />
                {ctaData.secondaryButtonText}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPage;
