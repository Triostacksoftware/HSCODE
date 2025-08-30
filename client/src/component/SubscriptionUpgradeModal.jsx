"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { FaCrown, FaTimes, FaArrowRight, FaCheck } from "react-icons/fa";

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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl max-w-lg w-full p-8 animate-slide-up-modal border border-gray-100">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center text-white text-2xl shadow-lg">
              {getIcon()}
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">
                Group Limit Reached
              </h3>
              <p className="text-gray-500 text-sm">
                {getGroupTypeText().charAt(0).toUpperCase() +
                  getGroupTypeText().slice(1)}{" "}
                groups
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl font-bold p-2 hover:bg-gray-100 rounded-full transition-all duration-200 hover:scale-110"
          >
            <FaTimes />
          </button>
        </div>

        {/* Message */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-2xl p-6 mb-6">
            <div className="flex items-start space-x-4">
              <div className="text-amber-600 text-2xl">⚠️</div>
              <div>
                <p className="text-amber-800 font-semibold mb-2 text-lg">
                  You've reached the maximum limit for {getGroupTypeText()}{" "}
                  groups
                </p>
                <p className="text-amber-700 text-sm leading-relaxed">
                  {message}
                </p>
              </div>
            </div>
          </div>

          <div className="text-center">
            <p className="text-gray-600 mb-4 text-lg">
              Upgrade to{" "}
              <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
                Premium
              </span>{" "}
              to unlock unlimited access to all groups!
            </p>
          </div>
        </div>

        {/* Premium Benefits */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-2xl p-6 mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mr-3 shadow-lg">
              <FaCrown className="text-white text-lg" />
            </div>
            <h4 className="text-purple-800 font-bold text-lg">
              Premium Benefits
            </h4>
          </div>
          <ul className="space-y-3 text-sm">
            <li className="flex items-center text-purple-700">
              <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                <FaCheck className="w-3 h-3 text-green-600" />
              </div>
              Unlimited {getGroupTypeText()} groups
            </li>
            <li className="flex items-center text-purple-700">
              <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                <FaCheck className="w-3 h-3 text-green-600" />
              </div>
              Unlimited leads posting
            </li>
            <li className="flex items-center text-purple-700">
              <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                <FaCheck className="w-3 h-3 text-green-600" />
              </div>
              Priority support
            </li>
            <li className="flex items-center text-purple-700">
              <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                <FaCheck className="w-3 h-3 text-green-600" />
              </div>
              Advanced features
            </li>
          </ul>
        </div>

        {/* Actions */}
        <div className="flex space-x-4">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-4 border-2 border-gray-200 cursor-pointer rounded-2xl text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 font-semibold hover:scale-105"
          >
            Maybe Later
          </button>
          <button
            onClick={handleUpgradeClick}
            className="flex-1 px-6 py-4 bg-gradient-to-r cursor-pointer from-purple-600 to-pink-600 text-white rounded-2xl hover:from-purple-700 hover:to-pink-700 transition-all duration-200 font-semibold flex items-center justify-center space-x-3 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <span>Upgrade Now</span>
            <FaArrowRight className="text-sm" />
          </button>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            You can upgrade anytime from your profile or subscription page
          </p>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionUpgradeModal;
