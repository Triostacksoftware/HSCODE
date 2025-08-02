"use client";
import React, { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function TOTPSetup() {
  const router = useRouter();
  const [step, setStep] = useState("login"); // login, setup, verify
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [totpToken, setTotpToken] = useState("");
  const [qrCode, setQrCode] = useState("");
  const [secret, setSecret] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSetupTOTP = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_URL}/auth/admin-setup-totp`,
        formData,
        {
          withCredentials: true,
        }
      );

      setQrCode(response.data.qrCode);
      setSecret(response.data.secret);
      setStep("setup");
    } catch (error) {
      console.error(
        "TOTP setup failed:",
        error.response?.data?.message || error.message
      );
      setMessage(
        error.response?.data?.message || "Setup failed. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyTOTP = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_URL}/auth/admin-verify-totp`,
        { token: totpToken },
        {
          withCredentials: true,
        }
      );

      setMessage(
        "TOTP enabled successfully! You can now login with Google Authenticator."
      );
      setTimeout(() => {
        router.push("/ap-admin-auth");
      }, 2000);
    } catch (error) {
      console.error(
        "TOTP verification failed:",
        error.response?.data?.message || error.message
      );
      setMessage(
        error.response?.data?.message ||
          "Verification failed. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-gray-100 p-4"
      style={{
        backgroundImage: "url('admin-bg1.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="relative z-10 bg-white rounded-lg shadow-2xl p-4 sm:p-6 lg:p-8 w-full max-w-sm sm:max-w-md mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6 sm:mb-8">
          <h1 className="text-lg sm:text-xl font-bold text-gray-800">HSCODE</h1>
          <button
            onClick={() => router.push("/ap-admin-auth-totp")}
            className="text-blue-600 hover:text-blue-800 text-sm underline"
          >
            Back to Login
          </button>
        </div>

        {/* Error/Success Message Display */}
        {message && (
          <div
            className={`p-3 rounded-lg text-sm mb-4 border ${
              message.includes("successfully")
                ? "bg-green-50 text-green-700 border-green-200"
                : "bg-red-50 text-red-700 border-red-200"
            }`}
          >
            {message}
          </div>
        )}

        {step === "login" && (
          <form onSubmit={handleSetupTOTP} className="space-y-4 sm:space-y-6">
            <div className="text-center mb-6 sm:mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
                Setup Google Authenticator
              </h2>
              <p className="text-gray-600 text-sm sm:text-base">
                Enter your admin credentials to setup 2FA
              </p>
            </div>

            <div>
              <input
                type="text"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Email"
                className="w-full px-3 sm:px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 text-gray-800 placeholder-gray-500 text-sm sm:text-base"
                required
              />
            </div>

            <div>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Password"
                className="w-full px-3 sm:px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 text-gray-800 placeholder-gray-500 text-sm sm:text-base"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 cursor-pointer text-white font-semibold py-3 px-4 sm:px-6 rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              {isLoading ? "Setting up..." : "Setup 2FA"}
            </button>
          </form>
        )}

        {step === "setup" && (
          <div className="space-y-4 sm:space-y-6">
            <div className="text-center">
              <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">
                Scan QR Code
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 mb-4">
                Open Google Authenticator app and scan this QR code
              </p>
            </div>

            {/* QR Code Display */}
            <div className="flex justify-center">
              {qrCode && (
                <div className="bg-white p-4 rounded-lg border">
                  <img
                    src={qrCode}
                    alt="QR Code for Google Authenticator"
                    className="w-48 h-48"
                  />
                </div>
              )}
            </div>

            {/* Manual Secret Entry */}
            <div className="text-center">
              <p className="text-xs text-gray-600 mb-2">
                Or manually enter this secret in Google Authenticator:
              </p>
              <div className="bg-gray-100 p-2 rounded text-xs font-mono break-all">
                {secret}
              </div>
            </div>

            {/* Verification Form */}
            <form onSubmit={handleVerifyTOTP} className="space-y-4">
              <div className="text-center">
                <p className="text-xs sm:text-sm text-gray-600 mb-2">
                  Enter the 6-digit code from Google Authenticator
                </p>
              </div>

              <div className="flex justify-center space-x-2">
                {[0, 1, 2, 3, 4, 5].map((index) => (
                  <input
                    key={index}
                    type="text"
                    maxLength={1}
                    value={totpToken[index] || ""}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value.length <= 1) {
                        const newToken = totpToken.split("");
                        newToken[index] = value;
                        setTotpToken(newToken.join(""));

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
                      if (
                        e.key === "Backspace" &&
                        !totpToken[index] &&
                        index > 0
                      ) {
                        const prevInput =
                          e.target.parentNode.children[index - 1];
                        if (prevInput) prevInput.focus();
                      }
                    }}
                    className="w-10 h-10 text-center border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none text-base font-semibold"
                    required
                  />
                ))}
              </div>

              <button
                type="submit"
                disabled={isLoading || totpToken.length !== 6}
                className="w-full bg-blue-600 cursor-pointer text-white font-semibold py-3 px-4 sm:px-6 rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
              >
                {isLoading ? "Verifying..." : "Verify & Enable 2FA"}
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-center text-gray-500 text-xs sm:text-sm">
        OneUI Vue Edition 2.6.0 © 2023
      </div>
    </div>
  );
}
