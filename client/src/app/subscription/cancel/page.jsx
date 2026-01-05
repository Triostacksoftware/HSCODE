"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { FaTimesCircle, FaArrowLeft } from "react-icons/fa";

const CancelPage = () => {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
        <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <FaTimesCircle className="w-10 h-10 text-orange-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Payment Cancelled
        </h1>
        <p className="text-gray-600 mb-6">
          Your payment was cancelled. No charges were made to your account.
        </p>
        <p className="text-sm text-gray-500 mb-6">
          If you encountered any issues during checkout, please try again or
          contact our support team for assistance.
        </p>
        <div className="space-y-3">
          <button
            onClick={() => router.push("/subscription")}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
          >
            Try Again
          </button>
          <button
            onClick={() => router.push("/")}
            className="w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium flex items-center justify-center gap-2"
          >
            <FaArrowLeft className="w-4 h-4" />
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default CancelPage;

