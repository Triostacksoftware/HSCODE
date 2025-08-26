"use client";
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { MdPhone, MdVisibility, MdVisibilityOff } from "react-icons/md";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { auth } from "../../utilities/firebase";
import useCountryCode from "../../utilities/useCountryCode";
import {
  validatePhoneCountryCode,
  getCountryInfo,
} from "../../utilities/countryCodeToPhonePrefix";

export default function ForgotPassword({ onBack }) {
  const { countryInfo, loading: countryLoading } = useCountryCode();
  const [step, setStep] = useState(1); // 1: phone, 2: OTP, 3: new password
  const [formData, setFormData] = useState({
    phoneNumber: "",
    otp: "",
    newPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [confirmationResult, setConfirmationResult] = useState(null);
  const recaptchaVerifierRef = useRef(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Initialize reCAPTCHA
  useEffect(() => {
    if (!recaptchaVerifierRef.current) {
      recaptchaVerifierRef.current = new RecaptchaVerifier(auth, "recaptcha-container", {
        size: "invisible",
        callback: () => {
          // reCAPTCHA solved, allow sending OTP
        },
      });
    }
  }, []);

  // Step 1: Send OTP to phone number using Firebase
  const handleSendOTP = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    try {
      if (!recaptchaVerifierRef.current) {
        throw new Error("reCAPTCHA not initialized");
      }

      // Prepare phone number with country code for Firebase
      let fullPhoneNumber = formData.phoneNumber;
      if (countryInfo?.code && !countryLoading) {
        const countryData = getCountryInfo(countryInfo.code);
        if (countryData?.phonePrefix) {
          const cleanNumber = formData.phoneNumber.replace(/^\+/, "");
          fullPhoneNumber = countryData.phonePrefix + cleanNumber;
        }
      }

      // Ensure phone number has + prefix for Firebase
      const normalizedPhone = fullPhoneNumber.startsWith("+")
        ? fullPhoneNumber
        : `+${fullPhoneNumber}`;

      // Send OTP using Firebase
      const result = await signInWithPhoneNumber(
        auth,
        normalizedPhone,
        recaptchaVerifierRef.current
      );

      setConfirmationResult(result);
      setStep(2);
      setMessage("OTP sent successfully! Check your phone.");
    } catch (error) {
      console.error("Failed to send OTP:", error);
      setMessage(error.message || "Failed to send OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verify OTP with Firebase
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    try {
      if (!confirmationResult) {
        throw new Error("No confirmation result found");
      }

      // Verify OTP with Firebase
      const result = await confirmationResult.confirm(formData.otp);

      if (result.user) {
        // OTP verified successfully, proceed to password reset
        setStep(3);
        setMessage("OTP verified successfully! Now set your new password.");
      }
    } catch (error) {
      console.error("OTP verification failed:", error);
      setMessage("Invalid OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Step 3: Reset password using backend
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    if (formData.newPassword.length < 8) {
      setMessage("Password must be at least 8 characters long");
      setIsLoading(false);
      return;
    }

    try {
      // Get Firebase ID token for backend verification
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error("No authenticated user found");
      }

      const idToken = await currentUser.getIdToken();

      // Reset password using backend with Firebase verification
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_URL}/auth/reset-password-with-firebase`,
        {
          phoneNumber: formData.phoneNumber, // Send plain number like "9999999995"
          newPassword: formData.newPassword,
        },
        {
          withCredentials: true,
          headers: {
            'Authorization': `Bearer ${idToken}`
          }
        }
      );

      if (response.status === 200 && response.data?.success) {
        setMessage("Password reset successfully! You can now login with your new password.");
        setTimeout(() => {
          onBack(); // Go back to login form
        }, 2000);
      }
    } catch (error) {
      console.error("Password reset failed:", error);
      setMessage(
        error.response?.data?.message ||
          "Failed to reset password. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ phoneNumber: "", otp: "", newPassword: "" });
    setStep(1);
    setMessage("");
    setConfirmationResult(null);
  };

  return (
    <div className="w-full">
      {/* Hidden reCAPTCHA container */}
      <div id="recaptcha-container" className="hidden"></div>

      {step === 1 ? (
        /* Step 1: Enter Phone Number */
        <form
          onSubmit={handleSendOTP}
          className="flex flex-col gap-3 sm:gap-4"
        >
          {/* Header */}
          <div className="text-center mb-6 sm:mb-8">
            <p className="text-xs sm:text-sm text-gray-600 mb-2">
              Forgot Your Password?
            </p>
            <h1 className="text-lg sm:text-xl font-bold text-gray-900">
              Reset Your Password
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

          <p className="text-sm text-gray-600 text-center mb-4">
            Enter your phone number to receive an OTP for password reset.
          </p>

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

          {/* Send OTP Button */}
          <button
            suppressHydrationWarning={true}
            type="submit"
            disabled={isLoading || countryLoading}
            className="w-full bg-blue-600 text-white cursor-pointer font-semibold py-3 sm:py-4 px-4 sm:px-6 rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
          >
            {isLoading
              ? "Sending OTP..."
              : countryLoading
              ? "Loading..."
              : "Send OTP"}
          </button>

          {/* Back to Login */}
          <button
            type="button"
            onClick={onBack}
            className="w-full text-blue-600 hover:text-blue-700 text-sm"
          >
            ← Back to Login
          </button>
        </form>
      ) : step === 2 ? (
        /* Step 2: Enter OTP */
        <form
          onSubmit={handleVerifyOTP}
          className="flex flex-col gap-3 sm:gap-4"
        >
          {/* Header */}
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
                if (countryInfo?.code && !countryLoading) {
                  const countryData = getCountryInfo(countryInfo.code);
                  if (countryData?.phonePrefix) {
                    const cleanNumber = formData.phoneNumber.replace(/^\+/, "");
                    displayPhone = countryData.phonePrefix + cleanNumber;
                  }
                }
                return displayPhone;
              })()}
            </p>
          </div>

          {/* OTP Input */}
          <div className="flex justify-center space-x-2">
            {[0, 1, 2, 3, 4, 5].map((index) => (
              <input
                key={index}
                type="text"
                maxLength={1}
                value={formData.otp[index] || ""}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value.length <= 1) {
                    const newOtp = formData.otp.split("");
                    newOtp[index] = value;
                    setFormData(prev => ({ ...prev, otp: newOtp.join("") }));

                    // Auto-focus next input
                    if (value && index < 5) {
                      const nextInput = e.target.parentNode.children[index + 1];
                      if (nextInput) nextInput.focus();
                    }
                  }
                }}
                onKeyDown={(e) => {
                  // Handle backspace to go to previous input
                  if (e.key === "Backspace" && !formData.otp[index] && index > 0) {
                    const prevInput = e.target.parentNode.children[index - 1];
                    if (prevInput) prevInput.focus();
                  }
                }}
                className="w-10 h-10 text-center border border-gray-300 rounded-md focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none text-lg font-semibold"
                required
              />
            ))}
          </div>

          {/* Verify OTP Button */}
          <button
            suppressHydrationWarning={true}
            type="submit"
            disabled={isLoading || formData.otp.length !== 6}
            className="w-full bg-blue-600 text-white cursor-pointer font-semibold py-3 sm:py-4 px-4 sm:px-6 rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
          >
            {isLoading ? "Verifying..." : "Verify OTP"}
          </button>

          {/* Back to Phone Input */}
          <button
            type="button"
            onClick={() => setStep(1)}
            className="w-full text-blue-600 hover:text-blue-700 text-sm"
          >
            ← Back to Phone Input
          </button>
        </form>
      ) : (
        /* Step 3: New Password */
        <form
          onSubmit={handleResetPassword}
          className="flex flex-col gap-3 sm:gap-4"
        >
          {/* Header */}
          <div className="text-center mb-6 sm:mb-8">
            <p className="text-xs sm:text-sm text-gray-600 mb-2">
              Set New Password
            </p>
            <h1 className="text-lg sm:text-xl font-bold text-gray-900">
              Create New Password
            </h1>
          </div>

          {message && (
            <div
              className={`p-3 rounded-lg text-sm ${
                message.includes("successfully") || message.includes("reset")
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}
            >
              {message}
            </div>
          )}

          {/* New Password Field */}
          <fieldset className="relative border border-gray-300 rounded-lg p-0 m-0 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-opacity-50">
            <legend className="absolute -top-2.5 left-3 bg-white px-2 text-gray-800 text-xs sm:text-sm font-medium focus-within:text-blue-500">
              New Password
            </legend>
            <input
              type={showPassword ? "text" : "password"}
              id="newPassword"
              name="newPassword"
              value={formData.newPassword}
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

          <p className="text-xs text-gray-500 text-center">
            Password must be at least 8 characters long
          </p>

          {/* Reset Password Button */}
          <button
            suppressHydrationWarning={true}
            type="submit"
            disabled={isLoading || formData.newPassword.length < 8}
            className="w-full bg-blue-600 text-white cursor-pointer font-semibold py-3 sm:py-4 px-4 sm:px-6 rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
          >
            {isLoading ? "Resetting..." : "Reset Password"}
          </button>

          {/* Back to OTP */}
          <button
            type="button"
            onClick={() => setStep(2)}
            className="w-full text-blue-600 hover:text-blue-700 text-sm"
          >
            ← Back to OTP
          </button>
        </form>
      )}
    </div>
  );
}