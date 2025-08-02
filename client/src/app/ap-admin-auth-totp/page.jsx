"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { MdVisibility, MdVisibilityOff, MdSecurity } from "react-icons/md";
import { useRouter } from "next/navigation";

export default function AdminLoginTOTP() {
  const router = useRouter();
  const [authMethod, setAuthMethod] = useState("email"); // "email" or "totp"
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showOTP, setShowOTP] = useState(false);
  const [otp, setOtp] = useState("");
  const [totpToken, setTotpToken] = useState("");
  const [countryCode, setCountryCode] = useState("");
  const [requiresTOTP, setRequiresTOTP] = useState(false);

  // Fetch country code based on IP
  useEffect(() => {
    const fetchCountryCode = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BASE_URL}/get-countrycode`,
          {
            timeout: 5000, // 5 second timeout
            withCredentials: true,
          }
        );

        if (response.data && response.data.countryCode) {
          setCountryCode(response.data.countryCode);
        }
      } catch (error) {
        console.error("Error fetching country code:", error);
        console.error("Error details:", {
          message: error.message,
          status: error.response?.status,
          data: error.response?.data,
          config: error.config,
        });
        setCountryCode("US");
      }
    };

    // Add a small delay to ensure server is ready
    const timer = setTimeout(fetchCountryCode, 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    try {
      if (authMethod === "email") {
        // Email OTP flow
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_BASE_URL}/auth/admin-login`,
          {
            ...formData,
            countryCode: countryCode,
          },
          {
            withCredentials: true,
          }
        );
        setShowOTP(true);
      } else {
        // TOTP flow
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_BASE_URL}/auth/admin-login-totp`,
          {
            ...formData,
            totpToken: totpToken,
            countryCode: countryCode,
          },
          {
            withCredentials: true,
          }
        );

        if (response.data.requiresTOTP) {
          setRequiresTOTP(true);
        } else {
          router.push("/ap-admin-panel");
        }
      }
    } catch (error) {
      console.error(
        "Admin login failed:",
        error.response?.data?.message || error.message
      );
      setMessage(
        error.response?.data?.message || "Login failed. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTPSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_URL}/auth/admin-verification`,
        {
          OTP: otp,
        },
        {
          withCredentials: true,
        }
      );

      router.push("/ap-admin-panel");
    } catch (error) {
      console.error(
        "OTP verification failed:",
        error.response?.data?.message || error.message
      );
      setMessage(
        error.response?.data?.message ||
          "OTP verification failed. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleTOTPSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_URL}/auth/admin-login-totp`,
        {
          ...formData,
          totpToken: totpToken,
        },
        {
          withCredentials: true,
        }
      );

      router.push("/ap-admin-panel");
    } catch (error) {
      console.error(
        "TOTP verification failed:",
        error.response?.data?.message || error.message
      );
      setMessage(
        error.response?.data?.message ||
          "TOTP verification failed. Please try again."
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
        </div>

        {/* Error Message Display */}
        {message && (
          <div className="p-3 rounded-lg text-sm mb-4 bg-red-50 text-red-700 border border-red-200">
            {message}
          </div>
        )}

        {/* Auth Method Toggle */}
        {!showOTP && !requiresTOTP && (
          <div className="mb-6">
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                type="button"
                onClick={() => setAuthMethod("email")}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  authMethod === "email"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                Email OTP
              </button>
              <button
                type="button"
                onClick={() => setAuthMethod("totp")}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  authMethod === "totp"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                <MdSecurity className="inline mr-1" />
                Google Auth
              </button>
            </div>
          </div>
        )}

        {/* Conditional Rendering */}
        {!showOTP && !requiresTOTP ? (
          /* Login Form */
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            <div className="text-center mb-6 sm:mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
                ADMIN LOGIN
              </h2>
              <p className="text-gray-600 text-sm sm:text-base">
                {authMethod === "email"
                  ? "Login with email OTP verification"
                  : "Login with Google Authenticator"}
              </p>
            </div>

            {/* Email Field */}
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

            {/* Password Field */}
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Password"
                className="w-full px-3 sm:px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 text-gray-800 placeholder-gray-500 pr-12 text-sm sm:text-base"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? (
                  <MdVisibility className="w-5 h-5" />
                ) : (
                  <MdVisibilityOff className="w-5 h-5" />
                )}
              </button>
            </div>

            {/* TOTP Token Field (only for TOTP method) */}
            {authMethod === "totp" && (
              <div>
                <input
                  type="text"
                  name="totpToken"
                  value={totpToken}
                  onChange={(e) => setTotpToken(e.target.value)}
                  placeholder="6-digit Google Auth code"
                  maxLength={6}
                  className="w-full px-3 sm:px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 text-gray-800 placeholder-gray-500 text-sm sm:text-base"
                />
              </div>
            )}

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 cursor-pointer text-white font-semibold py-3 px-4 sm:px-6 rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              {isLoading ? "Logging in..." : "Log In"}
            </button>

            {/* Setup TOTP Link */}
            {authMethod === "totp" && (
              <div className="text-center">
                <a
                  href="/ap-admin-totp-setup"
                  className="text-blue-600 hover:text-blue-800 text-sm underline"
                >
                  Need to setup Google Authenticator?
                </a>
              </div>
            )}
          </form>
        ) : showOTP ? (
          /* Email OTP Verification Form */
          <div className="space-y-4 sm:space-y-6">
            <div className="text-center">
              <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">
                Enter Email OTP
              </h3>
              <p className="text-xs sm:text-sm text-gray-600">
                Please enter the 6-digit code sent to your email
              </p>
            </div>

            <form onSubmit={handleOTPSubmit} className="space-y-4 sm:space-y-6">
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

                        if (value && index < 5) {
                          const nextInput =
                            e.target.parentNode.children[index + 1];
                          if (nextInput) nextInput.focus();
                        }
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Backspace" && !otp[index] && index > 0) {
                        const prevInput =
                          e.target.parentNode.children[index - 1];
                        if (prevInput) prevInput.focus();
                      }
                    }}
                    className="w-10 h-10 sm:w-12 sm:h-12 text-center border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none text-base sm:text-lg font-semibold"
                    required
                  />
                ))}
              </div>

              <button
                type="submit"
                disabled={isLoading || otp.length !== 6}
                className="w-full bg-blue-600 cursor-pointer text-white font-semibold py-3 px-4 sm:px-6 rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
              >
                {isLoading ? "Verifying..." : "Verify OTP"}
              </button>
            </form>
          </div>
        ) : (
          /* TOTP Verification Form */
          <div className="space-y-4 sm:space-y-6">
            <div className="text-center">
              <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">
                Enter Google Auth Code
              </h3>
              <p className="text-xs sm:text-sm text-gray-600">
                Please enter the 6-digit code from Google Authenticator
              </p>
            </div>

            <form
              onSubmit={handleTOTPSubmit}
              className="space-y-4 sm:space-y-6"
            >
              <div className="flex justify-center space-x-1 sm:space-x-2">
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

                        if (value && index < 5) {
                          const nextInput =
                            e.target.parentNode.children[index + 1];
                          if (nextInput) nextInput.focus();
                        }
                      }
                    }}
                    onKeyDown={(e) => {
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
                    className="w-10 h-10 sm:w-12 sm:h-12 text-center border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none text-base sm:text-lg font-semibold"
                    required
                  />
                ))}
              </div>

              <button
                type="submit"
                disabled={isLoading || totpToken.length !== 6}
                className="w-full bg-blue-600 cursor-pointer text-white font-semibold py-3 px-4 sm:px-6 rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
              >
                {isLoading ? "Verifying..." : "Verify TOTP"}
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
