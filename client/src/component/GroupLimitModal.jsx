"use client";

import React from "react";
import { MdClose, MdUpgrade, MdGroup } from "react-icons/md";

const GroupLimitModal = ({
  isOpen,
  onClose,
  userData,
  onRedirectToSubscription,
}) => {
  if (!isOpen) return null;

  const handleUpgrade = () => {
    onRedirectToSubscription();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/30 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full mx-4 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
              <MdGroup className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Group Limit Reached
              </h3>
              <p className="text-sm text-gray-500">
                You've reached your maximum groups
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
          >
            <MdClose className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MdGroup className="w-8 h-8 text-blue-600" />
            </div>
            <h4 className="text-xl font-semibold text-gray-900 mb-2">
              Upgrade Your Plan
            </h4>
            <p className="text-gray-600 mb-4">
              You've reached your limit of{" "}
              <span className="font-semibold text-blue-600">
                {userData?.maxGroups || 3}
              </span>{" "}
              groups. Upgrade to premium to join unlimited groups and unlock
              more features.
            </p>
          </div>

          {/* Current Usage */}
          {/* <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">
                Current Usage
              </span>
              <span className="text-sm font-semibold text-gray-900">
                {userData?.currentGroups || 0} / {userData?.maxGroups || 3}{" "}
                groups
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${
                    Math.min(
                      (userData?.currentGroups || 0) /
                        (userData?.maxGroups || 3)
                    ) * 100
                  }%`,
                }}
              ></div>
            </div>
          </div> */}

          {/* Benefits */}
          <div className="mb-6">
            <h5 className="text-sm font-semibold text-gray-900 mb-3">
              Premium Benefits:
            </h5>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">
                  Unlimited group access
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Priority support</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Advanced features</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">No restrictions</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex space-x-3 p-6 bg-gray-50 rounded-b-xl">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Maybe Later
          </button>
          <button
            onClick={handleUpgrade}
            className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
          >
            <MdUpgrade className="w-4 h-4" />
            <span>Upgrade Now</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default GroupLimitModal;
