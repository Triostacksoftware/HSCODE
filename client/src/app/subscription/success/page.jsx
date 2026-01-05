"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useUserAuth } from "../../../utilities/userAuthMiddleware.js";
import axios from "axios";
import { toast } from "react-hot-toast";
import { FaCheckCircle, FaSpinner, FaArrowLeft } from "react-icons/fa";

const SuccessPage = () => {
  const [loading, setLoading] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [subscriptionData, setSubscriptionData] = useState(null);
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useUserAuth();

  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    if (sessionId && user) {
      verifyPayment();
    } else if (!sessionId) {
      setLoading(false);
      setPaymentStatus("error");
    }
  }, [sessionId, user]);

  const verifyPayment = async () => {
    try {
      setLoading(true);

      // Get subscription status from backend
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_URL}/payments/subscription-status`,
        { withCredentials: true }
      );

      setSubscriptionData(response.data);
      setPaymentStatus("success");
    } catch (error) {
      console.error("Error verifying payment:", error);
      setPaymentStatus("error");
      toast.error("Failed to verify payment status");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Verifying your payment...</p>
        </div>
      </div>
    );
  }

  if (paymentStatus === "error") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">❌</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Payment Verification Failed
          </h1>
          <p className="text-gray-600 mb-6">
            We couldn't verify your payment. Please contact support if you were
            charged.
          </p>
          <button
            onClick={() => router.push("/subscription")}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
          >
            Back to Subscription
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <FaCheckCircle className="w-10 h-10 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Payment Successful!
        </h1>
        <p className="text-gray-600 mb-6">
          Your subscription has been activated successfully.
        </p>

        {subscriptionData && (
          <div className="bg-gray-50 rounded-xl p-6 mb-6 text-left">
            <h3 className="font-semibold text-gray-900 mb-4">
              Subscription Details
            </h3>
            {subscriptionData.plan && (
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Plan:</span>
                  <span className="font-medium">{subscriptionData.plan.name}</span>
                </div>
                {subscriptionData.user.billingCycle && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Billing Cycle:</span>
                    <span className="font-medium capitalize">
                      {subscriptionData.user.billingCycle}
                    </span>
                  </div>
                )}
                {subscriptionData.stripeSubscription?.current_period_end && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Next Billing Date:</span>
                    <span className="font-medium">
                      {new Date(
                        subscriptionData.stripeSubscription.current_period_end
                      ).toLocaleDateString()}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className="font-medium text-green-600 capitalize">
                    {subscriptionData.user.subscriptionStatus || "Active"}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={() => router.push("/")}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
          >
            Go to Dashboard
          </button>
          <button
            onClick={() => router.push("/subscription")}
            className="w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium flex items-center justify-center gap-2"
          >
            <FaArrowLeft className="w-4 h-4" />
            Back to Subscription
          </button>
        </div>
      </div>
    </div>
  );
};

export default SuccessPage;

