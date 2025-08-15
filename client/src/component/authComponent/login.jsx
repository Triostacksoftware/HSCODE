"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { MdPhone, MdVisibility, MdVisibilityOff } from "react-icons/md";
import ForgotPassword from "./forgotPassword";
import { useRouter } from "next/navigation";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { auth } from "../../utilities/firebase";

export default function Login() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    phoneNumber: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showOTP, setShowOTP] = useState(false);
  const [otp, setOtp] = useState("");
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
    if (typeof window !== 'undefined' && !recaptchaVerifier) {
      const verifier = new RecaptchaVerifier(auth, 'recaptcha-container-login', {
        'size': 'invisible',
        'callback': () => {
          console.log('reCAPTCHA solved');
        }
      });
      setRecaptchaVerifier(verifier);
    }
  }, [recaptchaVerifier]);

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    try {
      if (!recaptchaVerifier) {
        throw new Error("reCAPTCHA not initialized");
      }

      const phoneNumber = formData.phoneNumber.startsWith('+') 
        ? formData.phoneNumber 
        : `+${formData.phoneNumber}`;

      const result = await signInWithPhoneNumber(
        auth, 
        phoneNumber, 
        recaptchaVerifier
      );
      
      setConfirmationResult(result);
      setShowOTP(true);
      setMessage("OTP sent successfully! Check your phone.");
    } catch (error) {
      console.error("OTP sending failed:", error);
      setMessage(error.message || "Failed to send OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    try {
      // First verify phone number with Firebase OTP
      await handleSendOTP(e);
    } catch (error) {
      console.error("Login failed:", error);
      setMessage(error.message || "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTPSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");
    try {
      // Verify OTP with Firebase
      const result = await confirmationResult.confirm(otp);
      
      if (result.user) {
        // OTP verified, now proceed with backend login
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_BASE_URL}/auth/login`,
          {
            phoneNumber: formData.phoneNumber,
            password: formData.password,
          },
          {
            withCredentials: true,
          }
        );

        if (response.status === 200 && response.data?.message === "LoggedIn") {
          router.push("/userchat");
        }
      }
    } catch (error) {
      console.error("OTP verification failed:", error);
      setMessage("Invalid OTP. Please try again.");
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
        <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:gap-4">
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
                message.includes("successfully") || message.includes("sent")
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
            <input
              type="tel"
              id="phoneNumber"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleInputChange}
              placeholder="+1234567890"
              className="w-full border-none outline-none px-3 py-3 sm:py-4 text-sm sm:text-base bg-transparent"
              required
            />
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

          {/* Sign Up Button */}
          <button
            suppressHydrationWarning={true}
            type="submit"
            disabled={isLoading || showOTP}
            className="w-full bg-blue-600 text-white cursor-pointer font-semibold py-3 sm:py-4 px-4 sm:px-6 rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      ) : (
        /* Forgot Password Component */
        <ForgotPassword onBack={() => setShowForgotPassword(false)} />
      )}

      {/* reCAPTCHA Container */}
      <div id="recaptcha-container-login"></div>

      {/* OTP Verification Form */}
      {showOTP && (
        <div className="mt-4 p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-3">
            Enter Phone OTP
          </h3>
          <p className="text-xs text-gray-600 mb-3">
            Enter the 6-digit code sent to {formData.phoneNumber}
          </p>
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
                  className="w-8 h-8 sm:w-10 sm:h-10 text-center border border-gray-300 rounded-md focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm sm:text-lg font-semibold"
                  required
                />
              ))}
            </div>
            <button
              suppressHydrationWarning={true}
              type="submit"
              disabled={isLoading || otp.length !== 6}
              className="w-full bg-blue-600 text-white cursor-pointer font-semibold py-2 sm:py-3 px-3 sm:px-4 rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm"
            >
              {isLoading ? "Verifying..." : "Verify OTP"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
