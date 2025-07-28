"use client";
import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { MdEmail, MdArrowBack } from "react-icons/md";

export default function ForgotPassword({ onBack }) {
  const [step, setStep] = useState(3); // 1: email, 2: OTP, 3: new password
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const confirmPasswordRef = useRef();

  // Step 1: Send email for password reset
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    try {
      const response = await axios.post("/api/v1/auth/forgot-password", 
        {
          email,
        },
        {
          withCredentials: true,
        }
      );

      if (response.status === 200) {
        setMessage(response.data.message || "OTP sent to your email");
        setStep(2);
      }
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to send OTP");
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleOTPSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    try {
      const response = await axios.post("/api/v1/auth/otp-verification", 
        {
          OTP: otp,
        },
        {
          withCredentials: true,
        }
      );

      if (response.status === 200) {
        setMessage(response.data.message || "OTP verified successfully");
        setStep(3);
      }
    } catch (error) {
      setMessage(error.response?.data?.message || "Invalid OTP");
    } finally {
      setIsLoading(false);
    }
  };

  // Step 3: Reset password
  const handlePasswordReset = async (e) => {
    e.preventDefault();

    if (newPassword.length < 8){
      setMessage('Password must be at least 8 characters long')
      return
    }

    setIsLoading(true);
    setMessage("");

    try {
      const response = await axios.post("/api/v1/auth/reset-password", 
        {
          newPassword,
        },
        {
          withCredentials: true,
        }
      );

      if (response.status === 200) {
        setMessage(response.data.message || "Password reset successfully");
        // Redirect to login after successful password reset
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
    <form onSubmit={handleEmailSubmit} className="flex flex-col gap-4">
      <fieldset className="relative border border-gray-300 rounded-lg p-0 m-0 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-opacity-50">
        <legend className="absolute -top-2.5 left-3 bg-white px-2 text-gray-500 text-sm font-medium focus-within:text-blue-500">
          Email Address
        </legend>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          className="w-full border-none outline-none px-3 py-4 text-base bg-transparent"
          required
        />
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <MdEmail className="w-5 h-5 text-gray-400" />
        </div>
      </fieldset>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-blue-600 text-white cursor-pointer font-semibold py-4 px-6 rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? "Sending..." : "Send OTP"}
      </button>
    </form>
  );

  const renderStep2 = () => (
    <form onSubmit={handleOTPSubmit} className="flex flex-col gap-4">
      <div className="text-center mb-4">
        <p className="text-sm text-gray-600">Enter the 6-digit OTP sent to</p>
        <p className="text-sm font-medium text-gray-900">{email}</p>
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
        <input
          ref={confirmPasswordRef}
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="Enter new password"
          className="w-full border-none outline-none px-3 py-4 text-base bg-transparent"
          required
        />
      </fieldset>

      <fieldset className={`relative border border-gray-300 rounded-lg p-0 m-0 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-opacity-50 ${!newPassword.includes(confirmPassword) && "focus-within:ring-red-500 focus-within:border-red-500 border-red-500"}`}>
        <legend className="absolute -top-2.5 left-3 bg-white px-2 text-gray-500 text-sm font-medium focus-within:text-blue-500">
          Confirm Password
        </legend>
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => {
            if (!newPassword && !confirmPassword) return confirmPasswordRef.current.focus();
            setConfirmPassword(e.target.value);
          }}
          placeholder="Enter confirm password"
          className="w-full border-none outline-none px-3 py-4 text-base bg-transparent"
          required
        />
      </fieldset>

      <button
        type="submit"
        disabled={isLoading || !newPassword || (newPassword !== confirmPassword)}
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
          {step === 1 && "Enter your email to receive a password reset OTP"}
          {step === 2 && "Enter the OTP sent to your email"}
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
      {step === 3 && renderStep3()}
    </div>
  );
}
