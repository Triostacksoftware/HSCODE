"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { FaCrown, FaTimes, FaArrowRight } from "react-icons/fa";

const SubscriptionUpgradeModal = ({
  isOpen,
  onClose,
  message = "Free users can only join up to 3 local groups. Upgrade to premium for unlimited access.",
  groupType = "local", // 'local' or 'global'
}) => {
  const router = useRouter();

  if (!isOpen) return null;

  const handleUpgradeClick = () => {
    onClose();
    router.push("/subscription");
  };

  const getGroupTypeText = () => {
    return groupType === "global" ? "global" : "local";
  };

  const getIcon = () => {
    return groupType === "global" ? "🌍" : "🏠";
  };

  return (
    <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-slide-up-modal">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-xl">
              {getIcon()}
            </div>
            <h3 className="text-xl font-bold text-gray-900">
              Group Limit Reached
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl font-bold p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <FaTimes />
          </button>
        </div>

        {/* Message */}
        <div className="mb-6">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
            <div className="flex items-start space-x-3">
              <div className="text-amber-600 text-lg">⚠️</div>
              <div>
                <p className="text-amber-800 font-medium mb-2">
                  You've reached the maximum limit for {getGroupTypeText()}{" "}
                  groups
                </p>
                <p className="text-amber-700 text-sm">{message}</p>
              </div>
            </div>
          </div>

          <div className="text-center">
            <p className="text-gray-600 mb-3">
              Upgrade to{" "}
              <span className="font-semibold text-purple-600">Premium</span> to
              unlock unlimited access to all groups!
            </p>
          </div>
        </div>

        {/* Premium Benefits */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-center mb-3">
            <FaCrown className="text-purple-600 text-xl mr-2" />
            <h4 className="text-purple-800 font-semibold">Premium Benefits</h4>
          </div>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center text-purple-700">
              <span className="text-green-500 mr-2">✓</span>
              Unlimited {getGroupTypeText()} groups
            </li>
            <li className="flex items-center text-purple-700">
              <span className="text-green-500 mr-2">✓</span>
              Unlimited leads posting
            </li>
            <li className="flex items-center text-purple-700">
              <span className="text-green-500 mr-2">✓</span>
              Priority support
            </li>
            <li className="flex items-center text-purple-700">
              <span className="text-green-500 mr-2">✓</span>
              Advanced features
            </li>
          </ul>
        </div>

        {/* Actions */}
        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 border cursor-pointer border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200 font-medium"
          >
            Maybe Later
          </button>
          <button
            onClick={handleUpgradeClick}
            className="flex-1 px-4 py-3 bg-gradient-to-r cursor-pointer from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 font-medium flex items-center justify-center space-x-2"
          >
            <span>Upgrade Now</span>
            <FaArrowRight className="text-sm" />
          </button>
        </div>

        {/* Footer */}
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            You can upgrade anytime from your profile or subscription page
          </p>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionUpgradeModal;
