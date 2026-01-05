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
  FaArrowRight,
  FaSpinner,
} from "react-icons/fa";
import { MdArrowBack } from "react-icons/md";

const SubscriptionPage = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subscriptionData, setSubscriptionData] = useState(null);
  const [billingCycle, setBillingCycle] = useState("monthly");
  const [userMembership, setUserMembership] = useState(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [planCoupons, setPlanCoupons] = useState({});
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const { user } = useUserAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      fetchSubscriptionData();
      fetchUserMembership();
      fetchSubscriptionStatus();
    }
  }, [user]);

  const fetchSubscriptionData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_URL}/coupons/subscription/plans?countryCode=${user?.countryCode || "US"}`
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

  const fetchSubscriptionStatus = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_URL}/payments/subscription-status`,
        { withCredentials: true }
      );
      setSubscriptionStatus(response.data);
    } catch (error) {
      console.error("Error fetching subscription status:", error);
      setSubscriptionStatus(null);
    }
  };

  const validateCouponForPlan = async (planId) => {
    const couponCodeForPlan = planCoupons[planId]?.code;
    
    if (!couponCodeForPlan || !couponCodeForPlan.trim()) {
      toast.error("Please enter a coupon code");
      return;
    }

    try {
      setValidatingCoupon(true);
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_URL}/coupons/validate/${couponCodeForPlan}?planId=${planId}&billingCycle=${billingCycle}`,
        { withCredentials: true }
      );

      if (response.data.coupon.planId && response.data.coupon.planId !== planId && response.data.coupon.planId !== "premium") {
        toast.error("This coupon is not valid for the selected plan");
        setPlanCoupons(prev => ({ ...prev, [planId]: { code: couponCodeForPlan, validCoupon: null } }));
        return;
      }

      setPlanCoupons(prev => ({ 
        ...prev, 
        [planId]: { 
          code: couponCodeForPlan, 
          validCoupon: response.data.coupon,
          discountInfo: response.data.discountInfo
        } 
      }));
      toast.success("Valid coupon code for this plan!");
    } catch (error) {
      console.error("Error validating coupon:", error);
      toast.error(error.response?.data?.message || "Invalid coupon code");
      setPlanCoupons(prev => ({ ...prev, [planId]: { code: couponCodeForPlan, validCoupon: null } }));
    } finally {
      setValidatingCoupon(false);
    }
  };

  const canPurchasePlan = (plan) => {
    if (!userMembership) return false;
    if (userMembership.role === "admin") return false;
    if (plan.id === "free") return false;
    
    const currentPlanId = userMembership.membership || "free";
    const currentPlan = plans.find(p => p.id === currentPlanId);
    const currentPlanPrice = currentPlan?.monthlyPrice || 0;
    const newPlanPrice = plan.monthlyPrice || 0;
    
    const subscriptionStatusValue = subscriptionStatus?.user?.subscriptionStatus;
    if (subscriptionStatusValue === "canceled" || 
        subscriptionStatusValue === "past_due" ||
        subscriptionStatusValue === "unpaid" ||
        !subscriptionStatusValue) {
      if (subscriptionStatus?.user?.subscriptionEndDate) {
        const endDate = new Date(subscriptionStatus.user.subscriptionEndDate);
        const now = new Date();
        if (endDate < now) {
          return plan.id !== "free";
        }
      } else {
        return plan.id !== "free";
      }
    }
    
    if (subscriptionStatusValue === "active" || subscriptionStatusValue === "trialing") {
      if (plan.id === currentPlanId) {
        return false;
      }
      return newPlanPrice > currentPlanPrice;
    }
    
    return plan.id !== "free" && plan.id !== currentPlanId;
  };

  const handleSubscribe = async (plan) => {
    if (!user) {
      toast.error("Please login to subscribe");
      router.push("/auth");
      return;
    }

    if (!canPurchasePlan(plan)) {
      if (plan.id === "free") {
        toast.error("Free plan cannot be purchased");
      } else {
        toast.error("You cannot downgrade to this plan. Please upgrade to a higher tier.");
      }
      return;
    }

    try {
      setProcessingPayment(true);
      setSelectedPlan(plan);
      const planCoupon = planCoupons[plan.id];
      const finalCouponCode = planCoupon?.validCoupon ? planCoupon.code : null;

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_URL}/payments/create-checkout-session`,
        {
          planId: plan.id,
          billingCycle: billingCycle,
          couponCode: finalCouponCode,
        },
        { withCredentials: true }
      );

      if (response.data.url) {
        window.location.href = response.data.url;
      } else {
        toast.error("Failed to create checkout session");
      }
    } catch (error) {
      console.error("Error creating checkout session:", error);
      toast.error(
        error.response?.data?.message ||
          "Failed to start payment process. Please try again."
      );
      setProcessingPayment(false);
      setSelectedPlan(null);
    }
  };

  const calculatePrice = (plan) => {
    if (plan.monthlyPrice === 0) return "Free";
    const monthlyPrice = plan.monthlyPrice;
    // Use plan's own yearlyDiscount, not global
    const yearlyDiscount = plan.yearlyDiscount || 0;

    if (billingCycle === "yearly") {
      const yearlyPrice = monthlyPrice * 12 * (1 - yearlyDiscount / 100);
      const monthlyEquivalent = yearlyPrice / 12;
      return `$${monthlyEquivalent.toFixed(0)}/mo`;
    }
    return `$${monthlyPrice}/mo`;
  };

  const calculateYearlySavings = (plan) => {
    if (plan.monthlyPrice === 0) return null;
    // Use plan's own yearlyDiscount, not global
    const yearlyDiscount = plan.yearlyDiscount || 0;
    const monthlyTotal = plan.monthlyPrice * 12;
    const yearlyPrice = monthlyTotal * (1 - yearlyDiscount / 100);
    const savings = monthlyTotal - yearlyPrice;
    return { amount: savings, percent: yearlyDiscount };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="w-12 h-12 text-[#004b87] animate-spin mx-auto mb-4" />
          <p className="text-gray-600 montserrat">Loading subscription plans...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 montserrat">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 md:h-16">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-1.5 text-gray-700 hover:text-[#004b87] transition-colors group"
            >
              <MdArrowBack className="w-4 h-4 md:w-5 md:h-5 group-hover:-translate-x-1 transition-transform" />
              <span className="text-xs md:text-sm font-medium">Back</span>
            </button>
            <h1 className="text-base md:text-lg lg:text-xl font-bold text-gray-900">
              {subscriptionData?.title || "Choose Your Plan"}
            </h1>
            <div className="w-12 md:w-16"></div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
        {/* Current Plan Status */}
        {userMembership && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 md:p-4 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="flex-1">
                <h2 className="text-sm md:text-base font-semibold text-gray-900 mb-0.5">
                  Current Plan
                </h2>
                <p className="text-xs md:text-sm text-gray-600">
                  You are currently on the{" "}
                  <span className="font-semibold capitalize text-[#004b87]">
                    {userMembership.membership}
                  </span>{" "}
                  plan
                  {userMembership.role === "admin" && (
                    <span className="ml-1.5 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      <FaCrown className="w-2.5 h-2.5 mr-1" />
                      Admin
                    </span>
                  )}
                </p>
              </div>

              {subscriptionStatus?.user?.subscriptionStatus && (
                <div className="flex flex-col sm:items-end gap-1">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                    subscriptionStatus.user.subscriptionStatus === "active" 
                      ? "bg-green-100 text-green-800"
                      : subscriptionStatus.user.subscriptionStatus === "past_due"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-red-100 text-red-800"
                  }`}>
                    {subscriptionStatus.user.subscriptionStatus}
                  </span>
                  {subscriptionStatus.user.subscriptionEndDate && (
                    <p className="text-xs text-gray-500">
                      Expires: {new Date(subscriptionStatus.user.subscriptionEndDate).toLocaleDateString()}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Hero Section */}
        <div className="text-center mb-6 md:mb-8">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
            Choose the Perfect Plan
          </h2>
          {subscriptionData?.subtitle && (
            <p className="text-sm md:text-base text-gray-600 max-w-2xl mx-auto">
              {subscriptionData.subtitle}
            </p>
          )}
        </div>

        {/* Billing Toggle */}
        <div className="text-center mb-6 md:mb-8">
          <div className="inline-flex items-center justify-center gap-2 bg-white rounded-lg p-1 shadow-sm border border-gray-200">
            <button
              onClick={() => setBillingCycle("monthly")}
              className={`px-4 md:px-6 py-1.5 md:py-2 rounded-md text-xs md:text-sm font-semibold transition-all duration-200 ${
                billingCycle === "monthly"
                  ? "bg-[#004b87] text-white"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle("yearly")}
              className={`px-4 md:px-6 py-1.5 md:py-2 rounded-md text-xs md:text-sm font-semibold transition-all duration-200 relative ${
                billingCycle === "yearly"
                  ? "bg-[#004b87] text-white"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              Yearly
              {(() => {
                // Get the maximum discount from all plans (each plan has its own yearlyDiscount)
                const maxDiscount = plans.length > 0 ? plans.reduce((max, p) => {
                  return Math.max(max, p.yearlyDiscount || 0);
                }, 0) : 0;
                return maxDiscount > 0 ? (
                  <span className="ml-1.5 inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-bold bg-[#3e9c35] text-white">
                    {maxDiscount}% OFF
                  </span>
                ) : null;
              })()}
            </button>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 max-w-6xl mx-auto mb-8 md:mb-12">
          {plans.map((plan) => {
            const isCurrentPlan = userMembership?.membership === plan.id;
            const isFreePlan = plan.id === "free";
            const savings = calculateYearlySavings(plan);
            const canPurchase = canPurchasePlan(plan);

            return (
              <div
                key={plan.id}
                className={`relative bg-white rounded-lg shadow-sm border-2 transition-all duration-300 hover:shadow-md ${
                  plan.popular
                    ? "border-[#004b87] scale-[1.02]"
                    : "border-gray-200 hover:border-gray-300"
                } ${isCurrentPlan ? "ring-1 ring-[#3e9c35]" : ""}`}
              >
                {plan.popular && (
                  <div className="absolute -top-2.5 left-1/2 transform -translate-x-1/2 z-10">
                    <span className="bg-gradient-to-r from-[#004b87] to-[#3e9c35] text-white px-3 py-0.5 rounded-full text-xs font-bold shadow-md">
                      Most Popular
                    </span>
                  </div>
                )}

                {isCurrentPlan && (
                  <div className="absolute -top-2.5 right-2 z-10">
                    <span className="bg-[#3e9c35] text-white px-2 py-0.5 rounded-full text-xs font-bold shadow-sm">
                      Current
                    </span>
                  </div>
                )}

                <div className="p-4 md:p-5 flex flex-col h-full">
                  {/* Plan Header */}
                  <div className="text-center mb-4">
                    <div className="text-3xl md:text-4xl mb-2">{plan.icon}</div>
                    <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-1">
                      {plan.name}
                    </h3>
                    <p className="text-xs md:text-sm text-gray-600">{plan.description}</p>
                  </div>

                  {/* Price */}
                  <div className="text-center mb-4">
                    <div className="text-2xl md:text-3xl font-bold text-gray-900 mb-0.5">
                      {calculatePrice(plan)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {billingCycle === "yearly" ? "billed annually" : "per month"}
                    </div>
                    {billingCycle === "yearly" && plan.monthlyPrice > 0 && plan.yearlyDiscount > 0 && (
                      <div className="text-xs text-[#3e9c35] mt-1 font-semibold">
                        {plan.yearlyDiscount}% OFF
                      </div>
                    )}
                  </div>

                  {/* Features */}
                  <div className="space-y-2 mb-4 flex-1">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <div className="w-4 h-4 bg-[#3e9c35]/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <FaCheck className="w-2.5 h-2.5 text-[#3e9c35]" />
                        </div>
                        <span className="text-xs md:text-sm text-gray-700 flex-1 leading-snug">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* Coupon Input for this Plan */}
                  {!isCurrentPlan && !isFreePlan && canPurchase && (
                    <div className="mb-3 p-2.5 bg-gray-50 rounded-md border border-gray-200">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <FaGift className="w-3 h-3 text-[#3e9c35]" />
                        <span className="text-xs font-medium text-gray-700">Coupon?</span>
                      </div>
                      <div className="flex gap-1.5">
                        <input
                          type="text"
                          value={planCoupons[plan.id]?.code || ""}
                          onChange={(e) => {
                            const code = e.target.value.toUpperCase();
                            setPlanCoupons(prev => ({ 
                              ...prev, 
                              [plan.id]: { ...prev[plan.id], code, validCoupon: null } 
                            }));
                          }}
                          placeholder="Enter code"
                          className="flex-1 px-2 py-1.5 border border-gray-300 rounded-md text-xs focus:ring-1 focus:ring-[#3e9c35] focus:border-[#3e9c35] outline-none"
                        />
                        <button
                          onClick={() => validateCouponForPlan(plan.id)}
                          disabled={!planCoupons[plan.id]?.code?.trim() || validatingCoupon}
                          className="px-2.5 py-1.5 bg-[#3e9c35] text-white rounded-md hover:bg-[#3e9c35]/90 transition-colors text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                        >
                          {validatingCoupon ? "..." : "Apply"}
                        </button>
                      </div>
                      {planCoupons[plan.id]?.validCoupon && (
                        <div className="mt-1.5 p-1.5 bg-[#3e9c35]/10 border border-[#3e9c35]/20 rounded-md">
                          <div className="flex items-center gap-1.5">
                            <FaCheck className="w-2.5 h-2.5 text-[#3e9c35]" />
                            <span className="text-xs text-[#3e9c35] font-medium">
                              {planCoupons[plan.id].validCoupon.description}
                            </span>
                          </div>
                          {planCoupons[plan.id].discountInfo && (
                            <p className="text-xs text-[#3e9c35] mt-0.5 ml-4">
                              {planCoupons[plan.id].discountInfo.discountType === "percentage"
                                ? `${planCoupons[plan.id].discountInfo.discountValue}% off`
                                : planCoupons[plan.id].discountInfo.discountType === "free"
                                ? "Free!"
                                : `$${planCoupons[plan.id].discountInfo.discountAmount} off`}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Action Button */}
                  <div className="mt-auto">
                    {isCurrentPlan ? (
                      <button
                        disabled
                        className="w-full py-2 px-4 rounded-md bg-gray-100 text-gray-500 font-semibold cursor-not-allowed text-sm"
                      >
                        Current Plan
                      </button>
                    ) : userMembership?.role === "admin" ? (
                      <button
                        disabled
                        className="w-full py-2 px-4 rounded-md bg-purple-100 text-purple-700 font-semibold cursor-not-allowed text-sm"
                      >
                        <FaCrown className="w-3 h-3 mr-1.5 inline" />
                        Admin Access
                      </button>
                    ) : !canPurchase ? (
                      <button
                        disabled
                        className="w-full py-2 px-4 rounded-md bg-gray-100 text-gray-500 font-semibold cursor-not-allowed text-sm"
                      >
                        {isFreePlan 
                          ? "Free Plan" 
                          : subscriptionStatus?.user?.subscriptionStatus === "active"
                          ? "Cannot Downgrade"
                          : "Not Available"}
                      </button>
                    ) : (
                      <button
                        onClick={() => handleSubscribe(plan)}
                        disabled={processingPayment && selectedPlan?.id === plan.id}
                        className="w-full py-2 px-4 rounded-md bg-gradient-to-r from-[#004b87] to-[#3e9c35] text-white font-semibold hover:from-[#004b87]/90 hover:to-[#3e9c35]/90 transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed text-sm flex items-center justify-center gap-1.5"
                      >
                        {processingPayment && selectedPlan?.id === plan.id ? (
                          <>
                            <FaSpinner className="w-3.5 h-3.5 animate-spin" />
                            <span>Processing...</span>
                          </>
                        ) : (
                          <>
                            <span>Subscribe Now</span>
                            <FaArrowRight className="w-3.5 h-3.5" />
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  {/* Trial Info */}
                  {!isCurrentPlan && !isFreePlan && (
                    <div className="text-center mt-2">
                      <p className="text-xs text-gray-500">
                        14-day trial included
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
            <div className="max-w-4xl mx-auto mb-8 md:mb-12">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 text-center mb-4 md:mb-6">
                {subscriptionData.faqSection.title}
              </h2>
              <div className="space-y-3 md:space-y-4">
                {subscriptionData.faqSection.faqs.map((faq) => (
                  <div
                    key={faq.id}
                    className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-5"
                  >
                    <h3 className="font-bold text-base md:text-lg text-gray-900 mb-2">
                      {faq.question}
                    </h3>
                    <p className="text-xs md:text-sm text-gray-600 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

        {/* CTA Section */}
        {subscriptionData?.ctaSection && (
          <div className="text-center bg-gradient-to-r from-[#004b87] to-[#3e9c35] rounded-xl p-6 md:p-8 text-white mb-6 md:mb-8">
            <h2 className="text-xl md:text-2xl font-bold mb-2">
              {subscriptionData.ctaSection.title}
            </h2>
            <p className="text-xs md:text-sm text-white/90 mb-4 md:mb-6 max-w-2xl mx-auto">
              {subscriptionData.ctaSection.subtitle}
            </p>
            <div className="flex flex-col sm:flex-row gap-2 md:gap-3 justify-center">
              <button
                onClick={() =>
                  router.push(subscriptionData.ctaSection.primaryButtonLink)
                }
                className="px-5 md:px-6 py-2 md:py-2.5 bg-white text-[#004b87] rounded-md font-semibold hover:bg-gray-50 transition-all duration-200 shadow-md hover:shadow-lg text-xs md:text-sm"
              >
                {subscriptionData.ctaSection.primaryButtonText}
              </button>
              <button
                onClick={() =>
                  router.push(subscriptionData.ctaSection.secondaryButtonLink)
                }
                className="px-5 md:px-6 py-2 md:py-2.5 border-2 border-white/50 text-white rounded-md font-semibold hover:bg-white/10 transition-all duration-200 text-xs md:text-sm"
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
