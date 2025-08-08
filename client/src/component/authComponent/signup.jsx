"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  MdEmail,
  MdVisibility,
  MdVisibilityOff,
  MdPhone,
  MdPerson,
} from "react-icons/md";
import getPhoneNumberLength from "@/utilities/getNumberLength";

export default function Signup() {
  const [step, setStep] = useState(1); // 1: form, 2: OTP verification
  const [countryCode, setCountryCode] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });
  const [otp, setOtp] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [phoneError, setPhoneError] = useState("");

  // Step 1: Get country code on component mount
  useEffect(() => {
    const fetchCountryCode = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BASE_URL}/get-country`
        );
        if (response.status === 200) {
          console.log(response);
          setCountryCode(response.data.location.countryCode);
        }
      } catch (error) {
        console.error("Failed to fetch country code:", error);
        setMessage("Failed to detect your country. Please try again.");
      }
    };

    fetchCountryCode();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear phone error when user starts typing
    if (name === "phone") {
      setPhoneError("");
    }
  };

  // Step 1: Submit form with email only
  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (formData.password.length < 8) {
      setMessage("Password must be at least 8 characters long");
      return;
    }

    setIsLoading(true);
    setMessage("");

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_URL}/auth/signup`,
        {
          email: formData.email,
        },
        {
          withCredentials: true,
        }
      );

      setStep(2);
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to send OTP");
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Submit complete form with OTP
  const handleOTPSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_URL}/auth/email-verification`,
        {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          OTP: otp,
          countryCode,
        },
        {
          withCredentials: true,
        }
      );

      window.location.href = "/userchat";
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to create account");
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep1 = () => (
    <form onSubmit={handleFormSubmit} className="flex flex-col gap-3 sm:gap-4">
      {/* Name Field */}
      <fieldset className="relative border border-gray-300 rounded-lg p-0 m-0 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-opacity-50">
        <legend className="absolute -top-2.5 left-3 bg-white px-2 text-gray-800 text-xs sm:text-sm font-medium focus-within:text-blue-500">
          Full Name
        </legend>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          placeholder="Enter your full name"
          className="w-full border-none outline-none px-3 py-3 sm:py-4 text-sm sm:text-base bg-transparent"
          required
        />
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <MdPerson className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
        </div>
      </fieldset>

      {/* Email Field */}
      <fieldset className="relative border border-gray-300 rounded-lg p-0 m-0 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-opacity-50">
        <legend className="absolute -top-2.5 left-3 bg-white px-2 text-gray-800 text-xs sm:text-sm font-medium focus-within:text-blue-500">
          E-mail
        </legend>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          placeholder="example@email.com"
          className="w-full border-none outline-none px-3 py-3 sm:py-4 text-sm sm:text-base bg-transparent"
          required
        />
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <MdEmail className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
        </div>
      </fieldset>

      {/* Phone Field */}
      <fieldset className="relative border border-gray-300 rounded-lg p-0 m-0 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-opacity-50">
        <legend className="absolute -top-2.5 left-3 bg-white px-2 text-gray-800 text-xs sm:text-sm font-medium focus-within:text-blue-500">
          Phone Number
        </legend>
        <div className="flex items-center">
          <span className="px-3 text-gray-500">+{countryCode}</span>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            placeholder="9876543210"
            minLength={getPhoneNumberLength(countryCode)}
            maxLength={getPhoneNumberLength(countryCode)}
            className="flex-1 outline-none border-none px-3 py-3 sm:py-4 text-sm sm:text-base bg-transparent"
            required
          />
        </div>
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <MdPhone className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
        </div>
      </fieldset>

      {/* Phone Error Message */}
      {phoneError && (
        <div className="text-red-500 text-xs sm:text-sm">{phoneError}</div>
      )}

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

      {/* Sign Up Button */}
      <button
        type="submit"
        disabled={isLoading || !countryCode}
        className="w-full bg-blue-600 text-white cursor-pointer font-semibold py-3 sm:py-4 px-4 sm:px-6 rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
      >
        {isLoading ? "Sending OTP..." : "Sign Up"}
      </button>
    </form>
  );

  const renderStep2 = () => (
    <div className="mt-4 p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200">
      <div className="text-center mb-4">
        <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-2">
          Verify Your Email
        </h3>
        <p className="text-xs sm:text-sm text-gray-600">
          Enter the 6-digit OTP sent to {formData.email}
        </p>
      </div>

      <form onSubmit={handleOTPSubmit} className="space-y-3">
        <div className="flex justify-center space-x-1 sm:space-x-2">
          {[0, 1, 2, 3, 4, 5].map((index) => (
            <input
              key={index}
              type="text"
              maxLength={1}
              value={otp[index] || ""}
              onChange={(e) => {
                const value = e.target.value;
                if (value.length <= 1) {
                  const newOtp = otp.split("");
                  newOtp[index] = value;
                  setOtp(newOtp.join(""));

                  // Auto-focus next input
                  if (value && index < 5) {
                    const nextInput = e.target.parentNode.children[index + 1];
                    if (nextInput) nextInput.focus();
                  }
                }
              }}
              onKeyDown={(e) => {
                // Handle backspace to go to previous input
                if (e.key === "Backspace" && !otp[index] && index > 0) {
                  const prevInput = e.target.parentNode.children[index - 1];
                  if (prevInput) prevInput.focus();
                }
              }}
              className="w-8 h-8 sm:w-10 sm:h-10 text-center border border-gray-300 rounded-md focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm sm:text-lg font-semibold"
              required
            />
          ))}
        </div>
        <button
          type="submit"
          disabled={isLoading || otp.length !== 6}
          className="w-full bg-blue-600 text-white cursor-pointer font-semibold py-2 sm:py-3 px-3 sm:px-4 rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm"
        >
          {isLoading ? "Creating Account..." : "Create Account"}
        </button>
      </form>
    </div>
  );

  return (
    <div className="w-full">
      {/* Header */}
      <div className="text-center mb-6 sm:mb-8">
        <p className="text-xs sm:text-sm text-gray-600 mb-2">Join Us Today!</p>
        <h1 className="text-lg sm:text-xl font-bold text-gray-900">
          Create Your Account
        </h1>
      </div>

      {/* Progress Steps */}
      <div className="flex justify-center mb-6">
        <div className="flex items-center space-x-2">
          {[1, 2].map((stepNumber) => (
            <div key={stepNumber} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= stepNumber
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                {stepNumber}
              </div>
              {stepNumber < 2 && (
                <div
                  className={`w-8 h-0.5 mx-2 ${
                    step > stepNumber ? "bg-blue-600" : "bg-gray-200"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Description */}
      <div className="text-center mb-4">
        <p className="text-xs sm:text-sm text-gray-600">
          {step === 1 && "Fill in your details to get started"}
          {step === 2 && "Verify your email to complete registration"}
        </p>
      </div>

      {/* Message Display */}
      {message && (
        <div
          className={`mb-4 p-3 rounded-lg text-sm ${
            message.includes("successfully") || message.includes("sent")
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          {message}
        </div>
      )}

      {/* Step Content */}
      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
    </div>
  );
}
