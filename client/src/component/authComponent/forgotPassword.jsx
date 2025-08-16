"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  MdPhone,
  MdArrowBack,
  MdVisibility,
  MdVisibilityOff,
} from "react-icons/md";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { auth } from "../../utilities/firebase";
import useCountryCode from "../../utilities/useCountryCode";
import {
  validatePhoneCountryCode,
  getCountryInfo,
} from "../../utilities/countryCodeToPhonePrefix";

export default function ForgotPassword({ onBack }) {
  const { countryCode, loading: countryLoading } = useCountryCode();
  const [step, setStep] = useState(1); // 1: phone, 2: OTP, 3: new password
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [recaptchaVerifier, setRecaptchaVerifier] = useState(null);
  const [confirmationResult, setConfirmationResult] = useState(null);

  // Initialize reCAPTCHA
  useEffect(() => {
    if (typeof window !== "undefined" && !recaptchaVerifier) {
      const verifier = new RecaptchaVerifier(
        auth,
        "recaptcha-container-forgot-password",
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

  // Step 1: Send OTP to phone for password reset
  const handlePhoneSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    // Prepare phone number with country code
    let fullPhoneNumber = phoneNumber;
    if (countryCode && !countryLoading) {
      const countryInfo = getCountryInfo(countryCode);
      if (countryInfo?.phonePrefix) {
        // Remove any existing + if user typed it
        const cleanNumber = phoneNumber.replace(/^\+/, "");
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
      // Check if user exists with this phone number
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_URL}/auth/forgot-password`,
        {
          phoneNumber: fullPhoneNumber,
        },
        {
          withCredentials: true,
        }
      );

      if (response.status === 200 && response.data?.userExists) {
        // User exists, send OTP
        await handleSendOTP(fullPhoneNumber);
      } else {
        setMessage("No user found with this phone number");
      }
    } catch (error) {
      if (error.response?.status === 404) {
        setMessage("No user found with this phone number");
      } else {
        setMessage(
          error.response?.data?.message || "Failed to verify phone number"
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Send OTP with Firebase
  const handleSendOTP = async (phoneWithCountryCode) => {
    try {
      if (!recaptchaVerifier) {
        throw new Error("reCAPTCHA not initialized");
      }

      const phoneNumber = phoneWithCountryCode || phoneNumber;
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
    }
  };

  // Step 2: Verify OTP
  const handleOTPSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    try {
      // Verify OTP with Firebase
      const result = await confirmationResult.confirm(otp);

      if (result.user) {
        // OTP verified, proceed to password reset
        setStep(3);
        setMessage(
          "OTP verified successfully! Please enter your new password."
        );
      }
    } catch (error) {
      console.error("OTP verification failed:", error);
      setMessage("Invalid OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Step 3: Reset password
  const handlePasswordReset = async (e) => {
    e.preventDefault();

    if (newPassword.length < 8) {
      setMessage("Password must be at least 8 characters long");
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }

    setIsLoading(true);
    setMessage("");

    try {
      // Prepare phone number with country code for backend
      let fullPhoneNumber = phoneNumber;
      if (countryCode && !countryLoading) {
        const countryInfo = getCountryInfo(countryCode);
        if (countryInfo?.phonePrefix) {
          const cleanNumber = phoneNumber.replace(/^\+/, "");
          fullPhoneNumber = countryInfo.phonePrefix + cleanNumber;
        }
      }

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_URL}/auth/reset-password`,
        {
          phoneNumber: fullPhoneNumber,
          newPassword,
        },
        {
          withCredentials: true,
        }
      );

      if (response.status === 200) {
        setMessage("Password reset successfully! Redirecting to login...");
        setTimeout(() => {
          onBack();
        }, 2000);
      }
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to reset password");
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep1 = () => (
    <form onSubmit={handlePhoneSubmit} className="flex flex-col gap-4">
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
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
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

      <button
        type="submit"
        disabled={isLoading || countryLoading}
        className="w-full bg-blue-600 text-white cursor-pointer font-semibold py-4 px-6 rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? "Sending..." : countryLoading ? "Loading..." : "Send OTP"}
      </button>
    </form>
  );

  const renderStep2 = () => (
    <form onSubmit={handleOTPSubmit} className="flex flex-col gap-4">
      <div className="text-center mb-4">
        <p className="text-sm text-gray-600">Enter the 6-digit OTP sent to</p>
        <p className="text-sm font-medium text-gray-900">
          {(() => {
            let displayPhone = phoneNumber;
            if (countryCode && !countryLoading) {
              const countryInfo = getCountryInfo(countryCode);
              if (countryInfo?.phonePrefix) {
                const cleanNumber = phoneNumber.replace(/^\+/, "");
                displayPhone = countryInfo.phonePrefix + cleanNumber;
              }
            }
            return displayPhone;
          })()}
        </p>
      </div>

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
            className="w-10 h-10 text-center border border-gray-300 rounded-md focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none text-lg font-semibold"
            required
          />
        ))}
      </div>

      <button
        type="submit"
        disabled={isLoading || otp.length !== 6}
        className="w-full bg-blue-600 text-white font-semibold py-4 px-6 rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? "Verifying..." : "Verify OTP"}
      </button>
    </form>
  );

  const renderStep3 = () => (
    <form onSubmit={handlePasswordReset} className="flex flex-col gap-4">
      <fieldset className="relative border border-gray-300 rounded-lg p-0 m-0 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-opacity-50">
        <legend className="absolute -top-2.5 left-3 bg-white px-2 text-gray-500 text-sm font-medium focus-within:text-blue-500">
          New Password
        </legend>
        <div className="flex items-center">
          <input
            type={showPassword ? "text" : "password"}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Enter new password"
            className="flex-1 border-none outline-none px-3 py-4 text-base bg-transparent"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="px-3"
          >
            {showPassword ? (
              <MdVisibility className="w-5 h-5 text-gray-400" />
            ) : (
              <MdVisibilityOff className="w-5 h-5 text-gray-400" />
            )}
          </button>
        </div>
      </fieldset>

      <fieldset className="relative border border-gray-300 rounded-lg p-0 m-0 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-opacity-50">
        <legend className="absolute -top-2.5 left-3 bg-white px-2 text-gray-500 text-sm font-medium focus-within:text-blue-500">
          Confirm Password
        </legend>
        <div className="flex items-center">
          <input
            type={showConfirmPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm new password"
            className="flex-1 border-none outline-none px-3 py-4 text-base bg-transparent"
            required
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="px-3"
          >
            {showConfirmPassword ? (
              <MdVisibility className="w-5 h-5 text-gray-400" />
            ) : (
              <MdVisibilityOff className="w-5 h-5 text-gray-400" />
            )}
          </button>
        </div>
      </fieldset>

      <button
        type="submit"
        disabled={isLoading || !newPassword || newPassword !== confirmPassword}
        className="w-full bg-blue-600 text-white font-semibold py-4 px-6 rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? "Resetting..." : "Reset Password"}
      </button>
    </form>
  );

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center mb-6">
        <button
          onClick={onBack}
          className="flex items-center text-blue-600 cursor-pointer hover:text-blue-700 mr-3"
        >
          <MdArrowBack className="w-5 h-5 mr-1" />
          <span className="text-sm">Back to Login</span>
        </button>
      </div>

      <div className="text-center mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          Forgot Password
        </h2>
        <p className="text-sm text-gray-600">
          {step === 1 &&
            "Enter your phone number to receive a password reset OTP"}
          {step === 2 && "Enter the OTP sent to your phone"}
          {step === 3 && "Create a new password for your account"}
        </p>
      </div>

      {/* Progress Steps */}
      <div className="flex justify-center mb-6">
        <div className="flex items-center space-x-2">
          {[1, 2, 3].map((stepNumber) => (
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
              {stepNumber < 3 && (
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

      {/* Message Display */}
      {message && (
        <div
          className={`mb-4 p-3 rounded-lg text-sm ${
            message.includes("successfully") ||
            message.includes("sent") ||
            message.includes("verified")
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
      {step === 3 && renderStep3()}

      {/* reCAPTCHA Container */}
      <div id="recaptcha-container-forgot-password"></div>
    </div>
  );
}
