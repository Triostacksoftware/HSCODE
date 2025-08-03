"use client";
import Login from "@/component/authComponent/login";
import Signup from "@/component/authComponent/signup";
import React, { useState } from "react";
import socket from '@/utilities/socket.js';

export default function page() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Background Image Section */}
      <div className="w-full lg:w-2/5 relative overflow-hidden h-48 lg:h-screen">
        {/* Header with Logo */}
        <div className="absolute top-4 left-4 lg:top-10 lg:left-10 flex items-center z-10">
          <div className="w-6 h-6 lg:w-8 lg:h-8 bg-blue-600 rounded-lg mr-2 lg:mr-3"></div>
          <span className="text-lg lg:text-xl font-semibold text-white lg:text-gray-900 drop-shadow-lg lg:drop-shadow-none">
            InsideBox
          </span>
        </div>
        <img
          src="https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?q=80&w=3087&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          alt="Abstract background"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Form Section */}
      <div className="w-full lg:w-3/5 bg-white flex flex-col justify-center px-4 sm:px-6 lg:px-12 py-6 lg:py-8">
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
          {isLogin ? <Login /> : <Signup />}
        </div>

        {/* Toggle between Sign in and Sign up */}
        <div className="mt-6 lg:mt-8 text-center lg:text-left">
          <p className="text-gray-600 text-sm lg:text-base">
            {isLogin ? "New to LeadConnect?" : "Already have an account?"}{" "}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-blue-600 underline hover:text-blue-700"
            >
              {isLogin ? "Sign up" : "Sign in"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
