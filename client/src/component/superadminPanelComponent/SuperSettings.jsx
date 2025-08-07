"use client";
import React from "react";

const SuperSettings = () => {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          SuperAdmin Settings
        </h2>
        <p className="text-gray-600">Manage global system settings</p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
            <span className="text-gray-400 text-xl">⚙️</span>
          </div>
          <p className="text-gray-500 text-sm">Settings coming soon</p>
          <p className="text-gray-400 text-xs mt-1">
            Global system configuration options
          </p>
        </div>
      </div>
    </div>
  );
};

export default SuperSettings;
