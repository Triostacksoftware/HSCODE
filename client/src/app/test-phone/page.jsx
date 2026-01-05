"use client";
import React, { useState, useEffect } from "react";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { auth } from "../../utilities/firebase";
import useCountryCode from "../../utilities/useCountryCode";
import { getCountryInfo } from "../../utilities/countryCodeToPhonePrefix";
import { MdPhone } from "react-icons/md";

export default function TestPhoneVerification() {
  const { countryInfo, loading: countryLoading } = useCountryCode();
  const [step, setStep] = useState(1); // 1: phone input, 2: OTP verification
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [confirmationResult, setConfirmationResult] = useState(null);

  // 🔹 Create reCAPTCHA ONCE per page load
  useEffect(() => {
    if (typeof window !== "undefined" && !window.recaptchaVerifier) {
      try {
        window.recaptchaVerifier = new RecaptchaVerifier(
          auth,
          "recaptcha-container-test",
          {
            size: "invisible",
          }
        );
        console.log("reCAPTCHA initialized successfully");
      } catch (error) {
        console.error("Failed to initialize reCAPTCHA:", error);
        setMessage("Failed to initialize verification. Please refresh the page.");
      }
    }
  }, []);

  // 🔹 Send OTP (ZERO retries)
  const handleSendOTP = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    try {
      if (!window.recaptchaVerifier) {
        throw new Error("reCAPTCHA not initialized. Please refresh the page.");
      }

      // Prepare phone number with country code
      let fullPhoneNumber = phoneNumber;
      if (countryInfo?.code && !countryLoading) {
        const countryData = getCountryInfo(countryInfo.code);
        if (countryData?.phonePrefix) {
          const cleanNumber = phoneNumber.replace(/^\+|\s/g, "");
          fullPhoneNumber = countryData.phonePrefix + cleanNumber;
        }
      }

      // Ensure phone number has + prefix
      const normalizedPhone = fullPhoneNumber.startsWith("+")
        ? fullPhoneNumber
        : `+${fullPhoneNumber}`;

      // Validate phone number length
      const phoneDigits = normalizedPhone.replace(/\D/g, "");
      if (phoneDigits.length < 10 || phoneDigits.length > 15) {
        throw new Error("Invalid phone number length. Please check your phone number.");
      }

      console.log("Sending OTP to:", normalizedPhone);

      const confirmation = await signInWithPhoneNumber(
        auth,
        normalizedPhone,
        window.recaptchaVerifier
      );

      setConfirmationResult(confirmation);
      setStep(2);
      setMessage("OTP sent successfully! Check your phone.");
    } catch (err) {
      console.error("Failed to send OTP:", err);
      let errorMessage = err.message || "Failed to send OTP. Please try again.";
      
      if (err.code === "auth/invalid-phone-number") {
        errorMessage = "Invalid phone number format. Please check your phone number and country code.";
      } else if (err.code === "auth/too-many-requests") {
        errorMessage = "⚠️ Too many OTP requests. Please wait 5-10 minutes before trying again, or use a different phone number.";
      } else if (err.code === "auth/invalid-app-credential") {
        errorMessage = "❌ Firebase configuration error. Please check Firebase Console settings.";
      }
      
      setMessage(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Verify OTP
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    try {
      if (!confirmationResult) {
        throw new Error("No confirmation result found");
      }

      const result = await confirmationResult.confirm(otp);

      if (result.user) {
        setMessage("✅ Phone verified successfully! Phone number: " + result.user.phoneNumber);
        console.log("Verified user:", result.user);
      }
    } catch (error) {
      console.error("OTP verification failed:", error);
      if (error.code === "auth/invalid-verification-code") {
        setMessage("Invalid OTP code. Please check your phone and try again.");
      } else {
        setMessage(error.message || "Invalid OTP. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setPhoneNumber("");
    setOtp("");
    setStep(1);
    setMessage("");
    setConfirmationResult(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-6 sm:p-8">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Phone Verification Test
          </h1>
          <p className="text-sm text-gray-600">
            Simple, production-safe phone verification
          </p>
        </div>

        {message && (
          <div
            className={`p-3 rounded-lg text-sm mb-4 whitespace-pre-line ${
              message.includes("successfully") || message.includes("✅")
                ? "bg-green-50 text-green-700 border border-green-200"
                : message.includes("⚠️")
                ? "bg-yellow-50 text-yellow-700 border border-yellow-200"
                : "bg-red-50 text-red-700 border border-red-200"
            }`}
          >
            {message}
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleSendOTP} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <div className="flex items-center border border-gray-300 rounded-lg focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500">
                {countryInfo?.code && !countryLoading && (
                  <span className="px-3 py-3 text-sm text-gray-700 font-medium bg-gray-50 border-r border-gray-300">
                    {getCountryInfo(countryInfo.code)?.phonePrefix || "+"}
                  </span>
                )}
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder={
                    countryInfo?.code && !countryLoading ? "1234567890" : "+1234567890"
                  }
                  className="flex-1 border-none outline-none px-3 py-3 text-sm bg-transparent"
                  required
                />
                <div className="px-3">
                  <MdPhone className="w-5 h-5 text-gray-400" />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || countryLoading || !phoneNumber}
              className="w-full bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading
                ? "Sending OTP..."
                : countryLoading
                ? "Loading..."
                : "Send OTP"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOTP} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter OTP Code
              </label>
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
                    className="w-12 h-12 text-center border border-gray-300 rounded-md focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none text-lg font-semibold"
                    required
                  />
                ))}
              </div>
            </div>

            <div className="text-center text-sm text-gray-600">
              <p>OTP sent to:</p>
              <p className="font-medium text-gray-900">
                {(() => {
                  let displayPhone = phoneNumber;
                  if (countryInfo?.code && !countryLoading) {
                    const countryData = getCountryInfo(countryInfo.code);
                    if (countryData?.phonePrefix) {
                      const cleanNumber = phoneNumber.replace(/^\+/, "");
                      displayPhone = countryData.phonePrefix + cleanNumber;
                    }
                  }
                  return displayPhone;
                })()}
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading || otp.length !== 6}
              className="w-full bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Verifying..." : "Verify OTP"}
            </button>

            <button
              type="button"
              onClick={resetForm}
              className="w-full text-blue-600 hover:text-blue-700 text-sm"
            >
              ← Back to Phone Input
            </button>
          </form>
        )}

        {/* 🔹 Container (DO NOT hide, DO NOT remove) */}
        <div id="recaptcha-container-test"></div>

        {/* Testing Notes */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <details className="text-xs text-gray-500">
            <summary className="cursor-pointer hover:text-gray-700 font-semibold">
              ⚠️ Important Testing Notes
            </summary>
            <div className="mt-2 space-y-2 text-left">
              <p className="font-semibold">Rules:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>ONE reCAPTCHA per page load</li>
                <li>NO cleanup, NO retry logic</li>
                <li>Refresh page ONCE before testing</li>
                <li>Click Send OTP ONCE</li>
                <li>Wait 30-60 seconds between attempts</li>
                <li>Use new phone number if rate-limited</li>
                <li>Open incognito for fresh testing</li>
              </ul>
            </div>
          </details>
        </div>
      </div>
    </div>
  );
}
