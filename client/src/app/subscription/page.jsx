"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUserAuth } from "../../utilities/userAuthMiddleware.js";
import axios from "axios";
import { toast } from "react-hot-toast";
import { FaCheck, FaGift, FaCrown, FaTag } from "react-icons/fa";
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
    if (plan.price.monthly === 0) return "Free";

    const price =
      billingCycle === "yearly" ? plan.price.yearly : plan.price.monthly;
    const currency = subscriptionData?.currency || "USD";

    if (billingCycle === "yearly") {
      const monthlyEquivalent = (price / 12).toFixed(0);
      return `$${monthlyEquivalent}/mo (billed yearly)`;
    }

    return `$${price}/mo`;
  };

  const calculateYearlySavings = (plan) => {
    if (plan.price.monthly === 0) return null;

    const monthlyTotal = plan.price.monthly * 12;
    const savings = monthlyTotal - plan.price.yearly;
    const savingsPercent = Math.round((savings / monthlyTotal) * 100);

    return { amount: savings, percent: savingsPercent };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <MdArrowBack className="w-5 h-5" />
              <span>Back</span>
            </button>
            <h1 className="text-xl font-semibold text-gray-900">
              {subscriptionData?.title || "Subscription Plans"}
            </h1>
            <div className="w-16"></div> {/* Spacer for centering */}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Current Plan Status */}
        {userMembership && (
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Current Plan
                </h2>
                <p className="text-gray-600 mt-1">
                  You are currently on the{" "}
                  <span className="font-medium capitalize">
                    {userMembership.membership}
                  </span>{" "}
                  plan
                  {userMembership.role === "admin" && (
                    <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      <FaCrown className="w-3 h-3 mr-1" />
                      Admin
                    </span>
                  )}
                </p>
              </div>

              {/* Coupon Button */}
              {userMembership.membership === "free" &&
                userMembership.role !== "admin" && (
                  <button
                    onClick={() => setShowCouponInput(!showCouponInput)}
                    className="inline-flex items-center px-4 py-2 border border-green-300 text-green-700 rounded-lg hover:bg-green-50 transition-colors"
                  >
                    <FaGift className="w-4 h-4 mr-2" />
                    Have a Coupon?
                  </button>
                )}
            </div>
          </div>
        )}

        {/* Coupon Input Section */}
        {showCouponInput && (
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
            <div className="flex items-center gap-2 mb-4">
              <FaTag className="w-5 h-5 text-green-600" />
              <h3 className="text-lg font-semibold text-gray-900">
                Apply Coupon Code
              </h3>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  placeholder="Enter coupon code"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={validatingCoupon || applyingCoupon}
                />
                {validCoupon && (
                  <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <FaCheck className="w-4 h-4 text-green-600" />
                      <span className="text-green-800 font-medium">
                        {validCoupon.description}
                      </span>
                    </div>
                    <p className="text-sm text-green-600 mt-1">
                      {validCoupon.discountType === "free"
                        ? "Free Premium Access!"
                        : `${validCoupon.discountValue}% off ${validCoupon.planId} plan`}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={validateCoupon}
                  disabled={
                    !couponCode.trim() || validatingCoupon || applyingCoupon
                  }
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {validatingCoupon ? "Validating..." : "Validate"}
                </button>

                {validCoupon && (
                  <button
                    onClick={applyCoupon}
                    disabled={applyingCoupon}
                    className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {applyingCoupon ? "Applying..." : "Apply Coupon"}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Subtitle */}
        {subscriptionData?.subtitle && (
          <div className="text-center mb-8">
            <p className="text-lg text-gray-600">{subscriptionData.subtitle}</p>
          </div>
        )}

        {/* Billing Toggle */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setBillingCycle("monthly")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                billingCycle === "monthly"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle("yearly")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                billingCycle === "yearly"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Yearly
              <span className="ml-1 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Save {subscriptionData?.yearlyDiscount || 17}%
              </span>
            </button>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
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
                className={`relative bg-white rounded-xl shadow-lg border-2 transition-all duration-200 ${
                  plan.popular
                    ? "border-blue-500 transform scale-105"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}

                {isCurrentPlan && (
                  <div className="absolute -top-4 right-4">
                    <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                      Current Plan
                    </span>
                  </div>
                )}

                <div className="p-6">
                  {/* Plan Header */}
                  <div className="text-center mb-6">
                    <div className="text-4xl mb-2">{plan.icon}</div>
                    <h3 className="text-xl font-bold text-gray-900">
                      {plan.name}
                    </h3>
                    <p className="text-gray-600 mt-1">{plan.description}</p>
                  </div>

                  {/* Price */}
                  <div className="text-center mb-6">
                    <div className="text-3xl font-bold text-gray-900">
                      {calculatePrice(plan)}
                    </div>
                    {savings && billingCycle === "yearly" && (
                      <div className="text-sm text-green-600 mt-1">
                        Save ${savings.amount}/year ({savings.percent}% off)
                      </div>
                    )}
                  </div>

                  {/* Features */}
                  <div className="space-y-3 mb-8">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <FaCheck className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700 text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* Action Button */}
                  <div className="mt-auto">
                    {isCurrentPlan ? (
                      <button
                        disabled
                        className="w-full py-3 px-4 rounded-lg bg-gray-100 text-gray-500 font-medium cursor-not-allowed"
                      >
                        Current Plan
                      </button>
                    ) : userMembership?.role === "admin" ? (
                      <button
                        disabled
                        className="w-full py-3 px-4 rounded-lg bg-purple-100 text-purple-700 font-medium cursor-not-allowed"
                      >
                        <FaCrown className="w-4 h-4 mr-2 inline" />
                        Admin Access
                      </button>
                    ) : isPremiumPlan && !hasPremiumAccess ? (
                      <button
                        onClick={() => setShowCouponInput(true)}
                        className="w-full py-3 px-4 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
                      >
                        <FaGift className="w-4 h-4 mr-2 inline" />
                        Use Coupon Code
                      </button>
                    ) : (
                      <button
                        disabled
                        className="w-full py-3 px-4 rounded-lg bg-gray-100 text-gray-500 font-medium cursor-not-allowed"
                      >
                        {isFreePlan ? "Free Plan" : "Contact Sales"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* FAQ Section */}
        {subscriptionData?.faqSection &&
          subscriptionData.faqSection.faqs.length > 0 && (
            <div className="max-w-3xl mx-auto mb-16">
              <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
                {subscriptionData.faqSection.title}
              </h2>
              <div className="space-y-6">
                {subscriptionData.faqSection.faqs.map((faq) => (
                  <div
                    key={faq.id}
                    className="bg-white rounded-lg shadow-sm border p-6"
                  >
                    <h3 className="font-semibold text-gray-900 mb-2">
                      {faq.question}
                    </h3>
                    <p className="text-gray-600">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

        {/* CTA Section */}
        {subscriptionData?.ctaSection && (
          <div className="text-center bg-blue-600 rounded-xl p-8 text-white">
            <h2 className="text-2xl font-bold mb-2">
              {subscriptionData.ctaSection.title}
            </h2>
            <p className="text-blue-100 mb-6">
              {subscriptionData.ctaSection.subtitle}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() =>
                  router.push(subscriptionData.ctaSection.primaryButtonLink)
                }
                className="px-6 py-3 bg-white text-blue-600 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                {subscriptionData.ctaSection.primaryButtonText}
              </button>
              <button
                onClick={() =>
                  router.push(subscriptionData.ctaSection.secondaryButtonLink)
                }
                className="px-6 py-3 border border-blue-300 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
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
