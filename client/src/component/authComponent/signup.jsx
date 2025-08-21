"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  MdPhone,
  MdVisibility,
  MdVisibilityOff,
  MdPerson,
  MdEmail,
} from "react-icons/md";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { auth } from "../../utilities/firebase";
import useCountryCode from "../../utilities/useCountryCode";
import {
  validatePhoneCountryCode,
  getCountryInfo,
  getCleanPhoneNumber,
  formatPhoneForDisplay,
} from "../../utilities/countryCodeToPhonePrefix";

export default function Signup() {
  const { countryCode, loading: countryLoading } = useCountryCode();
  const [step, setStep] = useState(1); // 1: form, 2: OTP verification
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    password: "",
  });
  const [otp, setOtp] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [recaptchaVerifier, setRecaptchaVerifier] = useState(null);
  const [confirmationResult, setConfirmationResult] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Initialize reCAPTCHA
  useEffect(() => {
    if (typeof window !== "undefined" && !recaptchaVerifier) {
      const verifier = new RecaptchaVerifier(
        auth,
        "recaptcha-container-signup",
        {
          size: "invisible",
          callback: () => {
            console.log("reCAPTCHA solved");
          },
        }
      );
      setRecaptchaVerifier(verifier);
    }
  }, [recaptchaVerifier]);

  // Step 1: Check if user exists and send OTP
  const handleCheckUserAndSendOTP = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    if (formData.password.length < 8) {
      setMessage("Password must be at least 8 characters long");
      setIsLoading(false);
      return;
    }

    // Prepare phone number with country code
    let fullPhoneNumber = formData.phoneNumber;
    if (countryCode && !countryLoading) {
      const countryInfo = getCountryInfo(countryCode);
      if (countryInfo?.phonePrefix) {
        // Remove any existing + if user typed it
        const cleanNumber = formData.phoneNumber.replace(/^\+/, "");
        fullPhoneNumber = countryInfo.phonePrefix + cleanNumber;
      }
    }

    // Validate country code before proceeding
    if (countryCode && !countryLoading) {
      const validation = validatePhoneCountryCode(fullPhoneNumber, countryCode);
      if (!validation.isValid) {
        setMessage(validation.message);
        setIsLoading(false);
        return;
      }
    }

    try {
      // First check if user already exists - use clean phone number
      const cleanPhoneNumber = getCleanPhoneNumber(formData.phoneNumber, countryCode);
      const checkResponse = await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_URL}/auth/check-user-before-otp`,
        {
          phoneNumber: cleanPhoneNumber,
          password: formData.password,
        }
      );

      // If user exists, show error
      if (checkResponse.status === 200 && checkResponse.data?.userExists) {
        setMessage(
          "User already exists with this phone number. Please login instead."
        );
        setIsLoading(false);
        return;
      }

      // User doesn't exist, proceed with OTP
      await handleSendOTP(fullPhoneNumber);
    } catch (error) {
      if (error.response?.status === 401) {
        // User doesn't exist, proceed with OTP
        await handleSendOTP(fullPhoneNumber);
      } else {
        console.error("User check failed:", error);
        setMessage(
          error.response?.data?.message ||
            "Verification failed. Please try again."
        );
        setIsLoading(false);
      }
    }
  };

  // Step 2: Send OTP with Firebase
  const handleSendOTP = async (phoneWithCountryCode) => {
    try {
      if (!recaptchaVerifier) {
        throw new Error("reCAPTCHA not initialized");
      }

      const phoneNumber = phoneWithCountryCode || formData.phoneNumber;
      // Ensure phone number has + prefix
      const normalizedPhone = phoneNumber.startsWith("+")
        ? phoneNumber
        : `+${phoneNumber}`;

      const result = await signInWithPhoneNumber(
        auth,
        normalizedPhone,
        recaptchaVerifier
      );

      setConfirmationResult(result);
      setStep(2);
      setMessage("OTP sent successfully! Check your phone.");
    } catch (error) {
      console.error("OTP sending failed:", error);
      setMessage(error.message || "Failed to send OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Step 3: Complete signup with OTP verification
  const handleOTPSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    try {
      // Verify OTP with Firebase
      const result = await confirmationResult.confirm(otp);

      if (result.user) {
        // Store clean phone number (without country prefix) and country code separately
        const cleanPhoneNumber = getCleanPhoneNumber(formData.phoneNumber, countryCode);

        // OTP verified, now complete signup with backend
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_BASE_URL}/auth/signup`,
          {
            name: formData.name,
            email: formData.email,
            phoneNumber: cleanPhoneNumber, // Store clean number without prefix
            password: formData.password,
            countryCode: countryCode, // Store country code like "IN", "US"
          },
          {
            withCredentials: true,
          }
        );

        if (response.status === 201) {
          setMessage("Account created successfully! Redirecting...");
          setTimeout(() => {
            window.location.href = "/userchat";
          }, 2000);
        }
      }
    } catch (error) {
      console.error("OTP verification or signup failed:", error);
      if (error.response?.status === 409) {
        setMessage("User already exists with this email or phone number.");
      } else {
        setMessage("Invalid OTP or signup failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      {step === 1 ? (
        /* Step 1: Signup Form */
        <form
          onSubmit={handleCheckUserAndSendOTP}
          className="flex flex-col gap-3 sm:gap-4"
        >
          {/* Header */}
          <div className="text-center mb-6 sm:mb-8">
            <p className="text-xs sm:text-sm text-gray-600 mb-2">
              Create Your Account
            </p>
            <h1 className="text-lg sm:text-xl font-bold text-gray-900">
              Join LeadConnect Today
            </h1>
          </div>

          {message && (
            <div
              className={`p-3 rounded-lg text-sm ${
                message.includes("successfully") || message.includes("sent")
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}
            >
              {message}
            </div>
          )}

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
              <MdPerson className="w-4 h-4 sm:w-5 text-gray-400" />
            </div>
          </fieldset>

          {/* Email Field */}
          <fieldset className="relative border border-gray-300 rounded-lg p-0 m-0 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-opacity-50">
            <legend className="absolute -top-2.5 left-3 bg-white px-2 text-gray-800 text-xs sm:text-sm font-medium focus-within:text-blue-500">
              Email Address
            </legend>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Enter your email"
              className="w-full border-none outline-none px-3 py-3 sm:py-4 text-sm sm:text-base bg-transparent"
              required
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <MdEmail className="w-4 h-4 sm:w-5 text-gray-400" />
            </div>
          </fieldset>

          {/* Phone Number Field */}
          <fieldset className="relative border border-gray-300 rounded-lg p-0 m-0 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-opacity-50">
            <legend className="absolute -top-2.5 left-3 bg-white px-2 text-gray-800 text-xs sm:text-sm font-medium focus-within:text-blue-500">
              Phone Number
            </legend>
            <div className="flex items-center">
              {/* Static Country Code Prefix */}
              {countryCode && !countryLoading && (
                <span className="px-3 py-3 sm:py-4 text-sm sm:text-base text-gray-700 font-medium bg-gray-50 border-r border-gray-300">
                  {getCountryInfo(countryCode)?.phonePrefix || "+"}
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
                  countryCode && !countryLoading ? "1234567890" : "+1234567890"
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

          {/* Sign Up Button */}
          <button
            suppressHydrationWarning={true}
            type="submit"
            disabled={isLoading || countryLoading}
            className="w-full bg-blue-600 text-white cursor-pointer font-semibold py-3 sm:py-4 px-4 sm:px-6 rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
          >
            {isLoading
              ? "Checking..."
              : countryLoading
              ? "Loading..."
              : "Create Account"}
          </button>
        </form>
      ) : (
        /* Step 2: OTP Verification */
        <div className="w-full">
          <div className="text-center mb-6 sm:mb-8">
            <p className="text-xs sm:text-sm text-gray-600 mb-2">
              Verify Your Phone
            </p>
            <h1 className="text-lg sm:text-xl font-bold text-gray-900">
              Enter OTP Code
            </h1>
          </div>

          {message && (
            <div
              className={`p-3 rounded-lg text-sm ${
                message.includes("successfully") || message.includes("sent")
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}
            >
              {message}
            </div>
          )}

          <div className="text-center mb-4">
            <p className="text-sm text-gray-600">
              We've sent a 6-digit code to
            </p>
            <p className="text-sm font-medium text-gray-900">
              {(() => {
                let displayPhone = formData.phoneNumber;
                if (countryCode && !countryLoading) {
                  const countryInfo = getCountryInfo(countryCode);
                  if (countryInfo?.phonePrefix) {
                    const cleanNumber = formData.phoneNumber.replace(/^\+/, "");
                    displayPhone = countryInfo.phonePrefix + cleanNumber;
                  }
                }
                return displayPhone;
              })()}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Country: {countryCode} • Phone: {getCleanPhoneNumber(formData.phoneNumber, countryCode)}
            </p>
          </div>

          <form onSubmit={handleOTPSubmit} className="space-y-4">
            <div className="flex justify-center space-x-2">
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
                        const nextInput =
                          e.target.parentNode.children[index + 1];
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
                  className="w-10 h-10 text-center border border-gray-300 rounded-md focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none text-lg font-semibold"
                  required
                />
              ))}
            </div>

            <button
              suppressHydrationWarning={true}
              type="submit"
              disabled={isLoading || otp.length !== 6}
              className="w-full bg-blue-600 text-white cursor-pointer font-semibold py-3 sm:py-4 px-4 sm:px-6 rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
            >
              {isLoading ? "Creating Account..." : "Verify & Create Account"}
            </button>

            <button
              type="button"
              onClick={() => setStep(1)}
              className="w-full text-blue-600 hover:text-blue-700 text-sm"
            >
              ← Back to form
            </button>
          </form>
        </div>
      )}

      {/* reCAPTCHA Container */}
      <div id="recaptcha-container-signup"></div>
    </div>
  );
}
