"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { MdPhone, MdVisibility, MdVisibilityOff } from "react-icons/md";
import ForgotPassword from "./forgotPassword";
import { useRouter } from "next/navigation";
import useCountryCode from "../../utilities/useCountryCode";
import {
  validatePhoneCountryCode,
  getCountryInfo,
} from "../../utilities/countryCodeToPhonePrefix";

export default function Login() {
  const router = useRouter();
  const { countryInfo, loading: countryLoading } = useCountryCode();
  const [formData, setFormData] = useState({
    phoneNumber: "",
    password: "",
  });
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle login form submission
  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    try {
      // Login with phone and password - send only plain phone number
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_URL}/auth/login`,
        {
          phoneNumber: formData.phoneNumber, // Send plain number like "9999999995"
          password: formData.password,
        },
        {
          withCredentials: true,
        }
      );

      if (response.status === 200 && response.data?.success) {
        setMessage("Login successful! Redirecting...");
        setTimeout(() => {
          router.push("/userchat");
        }, 1000);
      }
    } catch (error) {
      console.error("Login failed:", error);
      setMessage(
        error.response?.data?.message ||
          "Login failed. Please check your phone number and password."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    setShowForgotPassword(true);
  };

  return (
    <div className="w-full">
      {/* Conditional Rendering */}
      {!showForgotPassword ? (
        /* Login Form */
        <form
          onSubmit={handleLogin}
          className="flex flex-col gap-3 sm:gap-4"
        >
          {/* Header */}
          <div className="text-center mb-6 sm:mb-8">
            <p className="text-xs sm:text-sm text-gray-600 mb-2">
              Welcome Back!
            </p>
            <h1 className="text-lg sm:text-xl font-bold text-gray-900">
              Sign In to LeadConnect
            </h1>
          </div>

          {message && (
            <div
              className={`p-3 rounded-lg text-sm ${
                message.includes("successful") || message.includes("Redirecting")
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}
            >
              {message}
            </div>
          )}

          {/* Phone Number Field */}
          <fieldset className="relative border border-gray-300 rounded-lg p-0 m-0 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-opacity-50">
            <legend className="absolute -top-2.5 left-3 bg-white px-2 text-gray-800 text-xs sm:text-sm font-medium focus-within:text-blue-500">
              Phone Number
            </legend>
            <div className="flex items-center">
              {/* Static Country Code Prefix */}
              {countryInfo?.code && !countryLoading && (
                <span className="px-3 py-3 sm:py-4 text-sm sm:text-base text-gray-700 font-medium bg-gray-50 border-r border-gray-300">
                  {getCountryInfo(countryInfo.code)?.phonePrefix || "+"}
                </span>
              )}
              {/* Phone Number Input */}
              <input
                type="tel"
                id="phoneNumber"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                placeholder={
                  countryInfo?.code && !countryLoading ? "1234567890" : "+1234567890"
                }
                className="flex-1 border-none outline-none px-3 py-3 sm:py-4 text-sm sm:text-base bg-transparent"
                required
              />
            </div>
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <MdPhone className="w-4 h-4 sm:w-5 text-gray-400" />
            </div>
          </fieldset>

          {/* Password Field */}
          <fieldset className="relative border border-gray-300 rounded-lg p-0 m-0 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-opacity-50">
            <legend className="absolute -top-2.5 left-3 bg-white px-2 text-gray-800 text-xs sm:text-sm font-medium focus-within:text-blue-500">
              Password
            </legend>
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="••••••••"
              className="w-full border-none outline-none px-3 py-3 sm:py-4 text-sm sm:text-base bg-transparent"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2"
            >
              {showPassword ? (
                <MdVisibility className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
              ) : (
                <MdVisibilityOff className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
              )}
            </button>
          </fieldset>

          {/* Forgot Password Link */}
          <div className="text-right">
            <button
              type="button"
              onClick={handleForgotPassword}
              className="text-xs sm:text-sm text-blue-600 hover:text-blue-700 underline"
            >
              Forgot Password?
            </button>
          </div>

          {/* Sign In Button */}
          <button
            suppressHydrationWarning={true}
            type="submit"
            disabled={isLoading || countryLoading}
            className="w-full bg-blue-600 text-white cursor-pointer font-semibold py-3 sm:py-4 px-4 sm:px-6 rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
          >
            {isLoading
              ? "Signing In..."
              : countryLoading
              ? "Loading..."
              : "Sign In"}
          </button>
        </form>
      ) : (
        /* Forgot Password Component */
        <ForgotPassword onBack={() => setShowForgotPassword(false)} />
      )}
    </div>
  );
}