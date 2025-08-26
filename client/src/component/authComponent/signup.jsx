"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  MdPhone,
  MdVisibility,
  MdVisibilityOff,
  MdPerson,
  MdEmail,
  MdBusiness,
  MdLocationOn,
  MdLanguage,
} from "react-icons/md";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { auth } from "../../utilities/firebase";
import useCountryCode from "../../utilities/useCountryCode";
import {
  validatePhoneCountryCode,
  getCountryInfo,
  getCleanPhoneNumber,
} from "../../utilities/countryCodeToPhonePrefix";

export default function Signup() {
  const { countryInfo, loading: countryLoading } = useCountryCode();
  const [step, setStep] = useState(1); // 1: form, 2: email OTP, 3: phone OTP
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    password: "",
    companyName: "",
    address: "",
    companyWebsite: "",
  });
  const [emailOtp, setEmailOtp] = useState("");
  const [phoneOtp, setPhoneOtp] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [emailError, setEmailError] = useState(""); // Separate error for email step
  const [phoneError, setPhoneError] = useState(""); // Separate error for phone step
  const [recaptchaVerifier, setRecaptchaVerifier] = useState(null);
  const [confirmationResult, setConfirmationResult] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Clear all errors when moving between steps
  const clearAllErrors = () => {
    setMessage("");
    setEmailError("");
    setPhoneError("");
  };

  // Initialize reCAPTCHA
  useEffect(() => {
    if (typeof window !== "undefined" && !recaptchaVerifier) {
      // Wait for the DOM to be ready
      const timer = setTimeout(() => {
        try {
          const container = document.getElementById("recaptcha-container-signup");
          if (!container) {
            console.error("reCAPTCHA container not found");
            return;
          }

          const verifier = new RecaptchaVerifier(
            auth,
            "recaptcha-container-signup",
            {
              size: "invisible",
              callback: () => {
                console.log("reCAPTCHA solved");
              },
              "expired-callback": () => {
                console.log("reCAPTCHA expired");
                setRecaptchaVerifier(null);
              },
            }
          );
          setRecaptchaVerifier(verifier);
          console.log("reCAPTCHA initialized successfully");
        } catch (error) {
          console.error("Failed to initialize reCAPTCHA:", error);
          setMessage("Failed to initialize verification. Please refresh the page.");
        }
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [recaptchaVerifier]);

  // Step 1: Check if user exists and send email OTP
  const handleCheckUserAndSendEmailOTP = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    if (formData.password.length < 8) {
      setMessage("Password must be at least 8 characters long");
      setIsLoading(false);
      return;
    }

    // Validate phone number format
    if (!formData.phoneNumber || formData.phoneNumber.length < 10) {
      setMessage("Please enter a valid phone number (at least 10 digits)");
      setIsLoading(false);
      return;
    }

    // Validate country code
    if (!countryInfo?.code || countryLoading) {
      setMessage("Please wait for country code detection or select your country");
      setIsLoading(false);
      return;
    }

    try {
      // First check if user already exists and send email OTP
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_URL}/auth/check-user-before-otp`,
        {
          phoneNumber: formData.phoneNumber, // Send plain number like "9999999995"
          email: formData.email,
          password: formData.password,
        },
        {
          withCredentials: true
        }
      );

      // If user exists, show error
      if (response.status === 200 && response.data?.message === "User exists") {
        setMessage("User already exists with this email or phone number. Please login instead.");
        setIsLoading(false);
        return;
      }

      // User doesn't exist, email OTP sent successfully
      setStep(2);
      clearAllErrors(); // Clear any previous errors
      setMessage("Email OTP sent successfully! Check your email.");
      setIsLoading(false);
    } catch (error) {
      console.error("User check failed:", error);
      setMessage(
        error.response?.data?.message ||
          "Verification failed. Please try again."
      );
      setIsLoading(false);
    }
  };

  // Step 2: Verify email OTP and send phone OTP
  const handleEmailOTPSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setEmailError(""); // Clear previous email errors
    setMessage("");

    try {
      // Verify email OTP
      const verifyResponse = await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_URL}/auth/verify-otp`,
        {
          email: formData.email,
          otp: emailOtp,
        },
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (verifyResponse.status === 200) {
        // Email OTP verified successfully
        setMessage("Email verified successfully! Now sending phone OTP...");
        
        // Wait a moment before sending phone OTP
        setTimeout(() => {
          handleSendPhoneOTP();
        }, 1000);
      }
    } catch (error) {
      console.error("Email OTP verification failed:", error);
      if (error.response?.status === 400) {
        setEmailError("Invalid OTP code. Please check your email and try again.");
      } else if (error.response?.status === 401) {
        setEmailError("OTP expired. Please request a new OTP.");
      } else {
        setEmailError("Email verification failed. Please try again.");
      }
      setIsLoading(false);
    }
  };

  // Send phone OTP with Firebase
  const handleSendPhoneOTP = async () => {
    try {
      if (!recaptchaVerifier) {
        throw new Error("reCAPTCHA not initialized");
      }

      // Prepare phone number with country code for Firebase only
      let fullPhoneNumber = formData.phoneNumber;
      if (countryInfo?.code && !countryLoading) {
        const countryData = getCountryInfo(countryInfo.code);
        if (countryData?.phonePrefix) {
          // Clean the phone number - remove any existing + or spaces
          const cleanNumber = formData.phoneNumber.replace(/^\+|\s/g, "");
          fullPhoneNumber = countryData.phonePrefix + cleanNumber;
          console.log("Country data:", countryData);
          console.log("Original phone:", formData.phoneNumber);
          console.log("Clean number:", cleanNumber);
          console.log("Full phone with prefix:", fullPhoneNumber);
        }
      }

      // Ensure phone number has + prefix and is properly formatted for Firebase
      const normalizedPhone = fullPhoneNumber.startsWith("+")
        ? fullPhoneNumber
        : `+${fullPhoneNumber}`;

      // Validate phone number length (should be between 10-15 digits including country code)
      const phoneDigits = normalizedPhone.replace(/\D/g, "");
      if (phoneDigits.length < 10 || phoneDigits.length > 15) {
        throw new Error("Invalid phone number length. Please check your phone number.");
      }

      console.log("Final normalized phone for Firebase:", normalizedPhone);
      console.log("Phone digits count:", phoneDigits.length);

      const result = await signInWithPhoneNumber(
        auth,
        normalizedPhone,
        recaptchaVerifier
      );

      setConfirmationResult(result);
      setStep(3);
      clearAllErrors(); // Clear any previous errors
      setMessage("Phone OTP sent successfully! Check your phone.");
      setIsLoading(false);
    } catch (error) {
      console.error("Phone OTP sending failed:", error);
      if (error.code === "auth/invalid-phone-number") {
        setPhoneError("Invalid phone number format. Please check your phone number and country code.");
      } else if (error.code === "auth/too-many-requests") {
        setPhoneError("Too many OTP requests. Please wait a moment before trying again.");
      } else {
        setPhoneError(error.message || "Failed to send phone OTP. Please try again.");
      }
      setIsLoading(false);
    }
  };

  // Step 3: Complete signup with phone OTP verification
  const handlePhoneOTPSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");
    setPhoneError(""); // Clear previous phone errors

    try {
      // Verify phone OTP with Firebase
      const result = await confirmationResult.confirm(phoneOtp);

      if (result.user) {
        // Get Firebase ID token for backend verification
        const idToken = await result.user.getIdToken();

        // Both email and phone verified, now complete signup with backend
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_BASE_URL}/auth/signup`,
          {
            name: formData.name,
            email: formData.email,
            phoneNumber: formData.phoneNumber, // Send plain number like "9999999995"
            password: formData.password,
            countryCode: countryInfo.code, // Store country code like "IN", "US"
            companyName: formData.companyName,
            address: formData.address,
            companyWebsite: formData.companyWebsite,
          },
          {
            withCredentials: true,
            headers: {
              'Authorization': `Bearer ${idToken}`
            }
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
      console.error("Phone OTP verification or signup failed:", error);
      if (error.code === "auth/invalid-verification-code") {
        setPhoneError("Invalid OTP code. Please check your phone and try again.");
      } else if (error.response?.status === 409) {
        setPhoneError("User already exists with this email or phone number.");
      } else {
        setPhoneError("Invalid phone OTP or signup failed. Please try again.");
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
          onSubmit={handleCheckUserAndSendEmailOTP}
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

          {/* Company Name Field */}
          <fieldset className="relative border border-gray-300 rounded-lg p-0 m-0 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-opacity-50">
            <legend className="absolute -top-2.5 left-3 bg-white px-2 text-gray-800 text-xs sm:text-sm font-medium focus-within:text-blue-500">
              Company Name
            </legend>
            <input
              type="text"
              id="companyName"
              name="companyName"
              value={formData.companyName}
              onChange={handleInputChange}
              placeholder="Enter your company name"
              className="w-full border-none outline-none px-3 py-3 sm:py-4 text-sm sm:text-base bg-transparent"
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <MdBusiness className="w-4 h-4 sm:w-5 text-gray-400" />
            </div>
          </fieldset>

          {/* Address Field */}
          <fieldset className="relative border border-gray-300 rounded-lg p-0 m-0 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-opacity-50">
            <legend className="absolute -top-2.5 left-3 bg-white px-2 text-gray-800 text-xs sm:text-sm font-medium focus-within:text-blue-500">
              Address
            </legend>
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              placeholder="Enter your address"
              className="w-full border-none outline-none px-3 py-3 sm:py-4 text-sm sm:text-base bg-transparent"
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <MdLocationOn className="w-4 h-4 sm:w-5 text-gray-400" />
            </div>
          </fieldset>

          {/* Company Website Field */}
          <fieldset className="relative border border-gray-300 rounded-lg p-0 m-0 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-opacity-50">
            <legend className="absolute -top-2.5 left-3 bg-white px-2 text-gray-800 text-xs sm:text-sm font-medium focus-within:text-blue-500">
              Company Website
            </legend>
            <input
              type="url"
              id="companyWebsite"
              name="companyWebsite"
              value={formData.companyWebsite}
              onChange={handleInputChange}
              placeholder="https://example.com"
              className="w-full border-none outline-none px-3 py-3 sm:py-4 text-sm sm:text-base bg-transparent"
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <MdLanguage className="w-4 h-4 sm:w-5 text-gray-400" />
            </div>
          </fieldset>

          {/* Phone Number Field */}
          <fieldset className="relative border border-gray-300 rounded-lg p-0 m-0 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-opacity-50">
            <legend className="absolute -top-2.5 left-3 bg-white px-2 text-gray-800 text-xs sm:text-sm font-medium focus-within:text-blue-500">
              Phone Number
            </legend>
            <div className="flex items-center">
              {/* Static Country Code Prefix */}
              {countryInfo && !countryLoading && (
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
      ) : step === 2 ? (
        /* Step 2: Email OTP Verification */
        <div className="w-full">
          <div className="text-center mb-6 sm:mb-8">
            <p className="text-xs sm:text-sm text-gray-600 mb-2">
              Verify Your Email
            </p>
            <h1 className="text-lg sm:text-xl font-bold text-gray-900">
              Enter Email OTP Code
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

          {emailError && (
            <div className="p-3 rounded-lg text-sm bg-red-50 text-red-700 border border-red-200">
              {emailError}
            </div>
          )}

          <div className="text-center mb-4">
            <p className="text-sm text-gray-600">
              We've sent a 6-digit code to
            </p>
            <p className="text-sm font-medium text-gray-900">
              {formData.email}
            </p>
          </div>

          <form onSubmit={handleEmailOTPSubmit} className="space-y-4">
            <div className="flex justify-center space-x-2">
              {[0, 1, 2, 3, 4, 5].map((index) => (
                <input
                  key={index}
                  type="text"
                  maxLength={1}
                  value={emailOtp[index] || ""}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value.length <= 1) {
                      const newOtp = emailOtp.split("");
                      newOtp[index] = value;
                      setEmailOtp(newOtp.join(""));

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
                    if (e.key === "Backspace" && !emailOtp[index] && index > 0) {
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
              disabled={isLoading || emailOtp.length !== 6}
              className="w-full bg-blue-600 text-white cursor-pointer font-semibold py-3 sm:py-4 px-4 sm:px-6 rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
            >
              {isLoading ? "Verifying..." : "Verify Email & Continue"}
            </button>

            <button
              type="button"
              onClick={() => {
                clearAllErrors();
                setStep(1);
              }}
              className="w-full text-blue-600 hover:text-blue-700 text-sm"
            >
              ← Back to form
            </button>
          </form>
        </div>
      ) : (
        /* Step 3: Phone OTP Verification */
        <div className="w-full">
          <div className="text-center mb-6 sm:mb-8">
            <p className="text-xs sm:text-sm text-gray-600 mb-2">
              Verify Your Phone
            </p>
            <h1 className="text-lg sm:text-xl font-bold text-gray-900">
              Enter Phone OTP Code
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

          {phoneError && (
            <div className="p-3 rounded-lg text-sm bg-red-50 text-red-700 border border-red-200">
              {phoneError}
            </div>
          )}

          <div className="text-center mb-4">
            <p className="text-sm text-gray-600">
              We've sent a 6-digit code to
            </p>
            <p className="text-sm font-medium text-gray-900">
              {(() => {
                let displayPhone = formData.phoneNumber;
                if (countryInfo.code && !countryLoading) {
                  const all = getCountryInfo(countryInfo.code);
                  if (all?.phonePrefix) {
                    const cleanNumber = formData.phoneNumber.replace(/^\+/, "");
                    displayPhone = all.phonePrefix + cleanNumber;
                  }
                }
                return displayPhone;
              })()}
            </p>
          </div>

          <form onSubmit={handlePhoneOTPSubmit} className="space-y-4">
            <div className="flex justify-center space-x-2">
              {[0, 1, 2, 3, 4, 5].map((index) => (
                <input
                  key={index}
                  type="text"
                  maxLength={1}
                  value={phoneOtp[index] || ""}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value.length <= 1) {
                      const newOtp = phoneOtp.split("");
                      newOtp[index] = value;
                      setPhoneOtp(newOtp.join(""));

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
                    if (e.key === "Backspace" && !phoneOtp[index] && index > 0) {
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
              disabled={isLoading || phoneOtp.length !== 6}
              className="w-full bg-blue-600 text-white cursor-pointer font-semibold py-3 sm:py-4 px-4 sm:px-6 rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
            >
              {isLoading ? "Creating Account..." : "Verify & Create Account"}
            </button>

            <button
              type="button"
              onClick={() => {
                clearAllErrors();
                setStep(2);
              }}
              className="w-full text-blue-600 hover:text-blue-700 text-sm"
            >
              ← Back to email verification
            </button>
          </form>
        </div>
      )}

      {/* reCAPTCHA Container */}
      <div id="recaptcha-container-signup"></div>
    </div>
  );
}
