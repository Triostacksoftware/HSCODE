"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUserAuth } from "../../utilities/userAuthMiddleware.js";
import axios from "axios";
import { toast } from "react-hot-toast";
import {
  FaCheck,
  FaGift,
  FaCrown,
  FaTag,
  FaArrowRight,
  FaStar,
} from "react-icons/fa";
import { MdArrowBack } from "react-icons/md";

const SubscriptionPage = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subscriptionData, setSubscriptionData] = useState(null);
  const [billingCycle, setBillingCycle] = useState("monthly");
  const [showCouponInput, setShowCouponInput] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [validCoupon, setValidCoupon] = useState(null);
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [userMembership, setUserMembership] = useState(null);
  const { user } = useUserAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      fetchSubscriptionData();
      fetchUserMembership();
    }
  }, [user]);

  const fetchSubscriptionData = async () => {
    try {
      setLoading(true);

      const response = await axios.get(
        `${
          process.env.NEXT_PUBLIC_BASE_URL
        }/coupons/subscription/plans?countryCode=${user?.countryCode || "US"}`
      );

      setSubscriptionData(response.data);
      setPlans(response.data.plans || []);
    } catch (error) {
      console.error("Error fetching subscription data:", error);
      toast.error("Failed to load subscription information");
    } finally {
      setLoading(false);
    }
  };

  const fetchUserMembership = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_URL}/auth/verify-user`,
        { withCredentials: true }
      );
      setUserMembership(response.data.user);
    } catch (error) {
      console.error("Error fetching user membership:", error);
    }
  };

  const validateCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error("Please enter a coupon code");
      return;
    }

    try {
      setValidatingCoupon(true);

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_URL}/coupons/validate/${couponCode}`,
        { withCredentials: true }
      );

      setValidCoupon(response.data.coupon);
      toast.success("Valid coupon code!");
    } catch (error) {
      console.error("Error validating coupon:", error);
      toast.error(error.response?.data?.message || "Invalid coupon code");
      setValidCoupon(null);
    } finally {
      setValidatingCoupon(false);
    }
  };

  const applyCoupon = async () => {
    if (!validCoupon) {
      toast.error("Please validate a coupon first");
      return;
    }

    try {
      setApplyingCoupon(true);

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_URL}/coupons/apply`,
        { code: couponCode },
        { withCredentials: true }
      );

      toast.success(response.data.message);
      fetchUserMembership(); // Refresh user data
      setShowCouponInput(false);
      setCouponCode("");
      setValidCoupon(null);
    } catch (error) {
      console.error("Error applying coupon:", error);
      toast.error(error.response?.data?.message || "Failed to apply coupon");
    } finally {
      setApplyingCoupon(false);
    }
  };

  const calculatePrice = (plan) => {
    if (plan.monthlyPrice === 0) return "Free";

    const monthlyPrice = plan.monthlyPrice;
    const yearlyDiscount = subscriptionData?.yearlyDiscount || 0;

    if (billingCycle === "yearly") {
      const yearlyPrice = monthlyPrice * 12 * (1 - yearlyDiscount / 100);
      const monthlyEquivalent = yearlyPrice / 12;
      return `$${monthlyEquivalent.toFixed(0)}/mo`;
    }

    return `$${monthlyPrice}/mo`;
  };

  const calculateYearlySavings = (plan) => {
    if (plan.monthlyPrice === 0) return null;

    const yearlyDiscount = subscriptionData?.yearlyDiscount || 0;
    const monthlyTotal = plan.monthlyPrice * 12;
    const yearlyPrice = monthlyTotal * (1 - yearlyDiscount / 100);
    const savings = monthlyTotal - yearlyPrice;
    const savingsPercent = yearlyDiscount;

    return { amount: savings, percent: savingsPercent };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors group"
            >
              <MdArrowBack className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              <span>Back</span>
            </button>
            <h1 className="text-xl font-semibold text-gray-900">
              {subscriptionData?.title || "Choose Your Plan"}
            </h1>
            <div className="w-16"></div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Current Plan Status */}
        {userMembership && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 p-6 mb-12">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Current Plan
                </h2>
                <p className="text-gray-600 mt-1">
                  You are currently on the{" "}
                  <span className="font-medium capitalize text-blue-600">
                    {userMembership.membership}
                  </span>{" "}
                  plan
                  {userMembership.role === "admin" && (
                    <span className="ml-2 inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      <FaCrown className="w-3 h-3 mr-1" />
                      Admin
                    </span>
                  )}
                </p>
              </div>

              {/* Enhanced Coupon Button */}
              {userMembership.membership === "free" &&
                userMembership.role !== "admin" && (
                  <button
                    onClick={() => setShowCouponInput(!showCouponInput)}
                    className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    <FaGift className="w-4 h-4 mr-2" />
                    Have a Coupon?
                  </button>
                )}
            </div>
          </div>
        )}

        {/* Enhanced Coupon Input Section */}
        {showCouponInput && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 p-8 mb-12">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaGift className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Apply Coupon Code
              </h3>
              <p className="text-gray-600">
                Enter your coupon code to unlock special offers
              </p>
            </div>

            <div className="max-w-md mx-auto space-y-4">
              <div className="relative">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  placeholder="Enter coupon code"
                  className="w-full px-6 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-green-100 focus:border-green-500 text-center text-lg font-medium tracking-wider placeholder-gray-400 transition-all duration-200"
                  disabled={validatingCoupon || applyingCoupon}
                />
                {validCoupon && (
                  <div className="absolute -bottom-16 left-0 right-0 p-4 bg-green-50 border-2 border-green-200 rounded-xl">
                    <div className="flex items-center justify-center gap-3">
                      <FaCheck className="w-5 h-5 text-green-600" />
                      <div className="text-center">
                        <span className="text-green-800 font-semibold">
                          {validCoupon.description}
                        </span>
                        <p className="text-sm text-green-600 mt-1">
                          {validCoupon.discountType === "free"
                            ? "Free Premium Access!"
                            : `${validCoupon.discountValue}% off ${validCoupon.planId} plan`}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={validateCoupon}
                  disabled={
                    !couponCode.trim() || validatingCoupon || applyingCoupon
                  }
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {validatingCoupon ? "Validating..." : "Validate Coupon"}
                </button>

                {validCoupon && (
                  <button
                    onClick={applyCoupon}
                    disabled={applyingCoupon}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  >
                    {applyingCoupon ? "Applying..." : "Apply Coupon"}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Hero Section */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Choose the Perfect Plan
          </h2>
          {subscriptionData?.subtitle && (
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {subscriptionData.subtitle}
            </p>
          )}
        </div>

        {/* Billing Toggle */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center gap-4 bg-white/80 backdrop-blur-sm rounded-2xl p-2 shadow-lg border border-gray-100">
            <button
              onClick={() => setBillingCycle("monthly")}
              className={`px-8 py-3 cursor-pointer rounded-xl text-sm font-semibold transition-all duration-200 ${
                billingCycle === "monthly"
                  ? "bg-blue-600 text-white shadow-lg transform scale-105"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle("yearly")}
              className={`px-8 py-3 cursor-pointer rounded-xl text-sm font-semibold transition-all duration-200 relative ${
                billingCycle === "yearly"
                  ? "bg-blue-600 text-white shadow-lg transform scale-105"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              Yearly
              <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-green-500 text-white">
                Save {subscriptionData?.yearlyDiscount || 20}%
              </span>
            </button>
          </div>
          {billingCycle === "yearly" && (
            <p className="text-green-600 font-medium mt-3">
              Save {subscriptionData?.yearlyDiscount || 20}% annually
            </p>
          )}
        </div>

        {/* Plans Grid */}
        <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto mb-20">
          {plans.map((plan) => {
            const isCurrentPlan = userMembership?.membership === plan.id;
            const isFreePlan = plan.id === "free";
            const isPremiumPlan = plan.id === "premium";
            const savings = calculateYearlySavings(plan);
            const hasPremiumAccess =
              userMembership?.membership === "premium" ||
              userMembership?.role === "admin";

            return (
              <div
                key={plan.id}
                className={`relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border-2 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 ${
                  plan.popular
                    ? "border-blue-500 transform scale-105 shadow-blue-100"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg">
                      Most Popular
                    </span>
                  </div>
                )}

                {isCurrentPlan && (
                  <div className="absolute -top-4 right-4">
                    <span className="bg-green-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                      Current Plan
                    </span>
                  </div>
                )}

                <div className="p-8">
                  {/* Plan Header */}
                  <div className="text-center mb-8">
                    <div className="text-5xl mb-4">{plan.icon}</div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">
                      {plan.name}
                    </h3>
                    <p className="text-gray-600 text-lg">{plan.description}</p>
                  </div>

                  {/* Price */}
                  <div className="text-center mb-8">
                    <div className="text-4xl font-bold text-gray-900 mb-2">
                      {calculatePrice(plan)}
                    </div>
                    <div className="text-gray-500">
                      {billingCycle === "yearly"
                        ? "per user per month"
                        : "per user per month"}
                    </div>
                    {savings && billingCycle === "yearly" && (
                      <div className="text-sm text-green-600 mt-2 font-medium">
                        Save ${savings.amount.toFixed(0)}/year (
                        {savings.percent}% off)
                      </div>
                    )}
                  </div>

                  {/* Features */}
                  <div className="space-y-4 mb-8">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <FaCheck className="w-3 h-3 text-green-600" />
                        </div>
                        <span className="text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* Action Button */}
                  <div className="mt-auto">
                    {isCurrentPlan ? (
                      <button
                        disabled
                        className="w-full py-4 px-6 rounded-xl bg-gray-100 text-gray-500 font-semibold cursor-not-allowed"
                      >
                        Current Plan
                      </button>
                    ) : userMembership?.role === "admin" ? (
                      <button
                        disabled
                        className="w-full py-4 px-6 rounded-xl bg-purple-100 text-purple-700 font-semibold cursor-not-allowed"
                      >
                        <FaCrown className="w-4 h-4 mr-2 inline" />
                        Admin Access
                      </button>
                    ) : isPremiumPlan && !hasPremiumAccess ? (
                      <button
                        onClick={() => setShowCouponInput(true)}
                        className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                      >
                        <FaGift className="w-4 h-4 mr-2 inline" />
                        Use Coupon Code
                      </button>
                    ) : (
                      <button
                        disabled
                        className="w-full py-4 px-6 rounded-xl bg-gray-100 text-gray-500 font-semibold cursor-not-allowed"
                      >
                        {isFreePlan ? "Free Plan" : "Contact Sales"}
                      </button>
                    )}
                  </div>

                  {/* Trial Info */}
                  {!isCurrentPlan && !isFreePlan && (
                    <div className="text-center mt-4">
                      <p className="text-sm text-gray-500">
                        Comes with a 14-day trial
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* FAQ Section */}
        {subscriptionData?.faqSection &&
          subscriptionData.faqSection.faqs.length > 0 && (
            <div className="max-w-4xl mx-auto mb-20">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
                {subscriptionData.faqSection.title}
              </h2>
              <div className="space-y-6">
                {subscriptionData.faqSection.faqs.map((faq) => (
                  <div
                    key={faq.id}
                    className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 p-8"
                  >
                    <h3 className="font-bold text-xl text-gray-900 mb-4">
                      {faq.question}
                    </h3>
                    <p className="text-gray-600 text-lg leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

        {/* CTA Section */}
        {subscriptionData?.ctaSection && (
          <div className="text-center bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-12 text-white">
            <h2 className="text-3xl font-bold mb-4">
              {subscriptionData.ctaSection.title}
            </h2>
            <p className="text-blue-100 text-xl mb-8 max-w-2xl mx-auto">
              {subscriptionData.ctaSection.subtitle}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() =>
                  router.push(subscriptionData.ctaSection.primaryButtonLink)
                }
                className="px-8 py-4 bg-white text-blue-600 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                {subscriptionData.ctaSection.primaryButtonText}
              </button>
              <button
                onClick={() =>
                  router.push(subscriptionData.ctaSection.secondaryButtonLink)
                }
                className="px-8 py-4 border-2 border-blue-300 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all duration-200"
              >
                {subscriptionData.ctaSection.secondaryButtonText}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubscriptionPage;
