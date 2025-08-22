"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { MdVisibility, MdVisibilityOff, MdSecurity } from "react-icons/md";
import { useRouter } from "next/navigation";

export default function AdminLoginTOTP() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [totpToken, setTotpToken] = useState("");
  const [countryCode, setCountryCode] = useState("");
  const [requiresTOTP, setRequiresTOTP] = useState(false);
  const [showTOTPSetup, setShowTOTPSetup] = useState(false);
  const [qrCode, setQrCode] = useState("");
  const [totpSecret, setTotpSecret] = useState("");
  const [totpCode, setTotpCode] = useState("");

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

  // Debug state changes
  useEffect(() => {
    console.log("State changed:", {
      requiresTOTP,
      showTOTPSetup,
      qrCode: qrCode ? "QR code exists" : "No QR code",
      totpSecret: totpSecret ? "Secret exists" : "No secret"
    });
  }, [requiresTOTP, showTOTPSetup, qrCode, totpSecret]);

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
      // Step 1: Check admin credentials
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

      console.log("Admin login response:", response.data); // Debug log

      if (response.data.requiresTOTP) {
        // Admin has TOTP configured - show TOTP input
        console.log("Admin has TOTP - showing TOTP input"); // Debug log
        setRequiresTOTP(true);
        setShowTOTPSetup(false); // Ensure this is false
        setMessage("Please enter your Google Authenticator code");
      } else {
        // Admin doesn't have TOTP - show TOTP setup
        console.log("Admin doesn't have TOTP - showing TOTP setup"); // Debug log
        setShowTOTPSetup(true);
        setRequiresTOTP(false); // Ensure this is false
        setQrCode(response.data.qrCode);
        setTotpSecret(response.data.totpSecret.secret); // Extract just the secret string
        setMessage("Please scan the QR code and enter the TOTP code to complete setup");
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

  const handleTOTPSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    try {
      // Step 2A: If admin has TOTP - verify and login
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

      if (response.status === 200) {
        setMessage("Login successful! Redirecting...");
        setTimeout(() => {
          router.push("/ap-admin-panel");
        }, 1000);
      }
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

  const handleTOTPSetupSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    try {
      // Step 2B: If admin doesn't have TOTP - verify setup and login
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_URL}/auth/admin-verify-totp-setup`,
        {
          totpCode: totpCode,
        },
        {
          withCredentials: true,
        }
      );

      if (response.status === 200) {
        setMessage("TOTP setup complete! Login successful. Redirecting...");
        setTimeout(() => {
          router.push("/ap-admin-panel");
        }, 1000);
      }
    } catch (error) {
      console.error(
        "TOTP setup verification failed:",
        error.response?.data?.message || error.message
      );
      setMessage(
        error.response?.data?.message ||
          "TOTP setup verification failed. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setRequiresTOTP(false);
    setShowTOTPSetup(false);
    setTotpToken("");
    setTotpCode("");
    setMessage("");
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

        {/* Error/Success Message Display */}
        {message && (
          <div className={`p-3 rounded-lg text-sm mb-4 border ${
            message.includes("successful") || message.includes("complete")
              ? "bg-green-50 text-green-700 border-green-200"
              : "bg-red-50 text-red-700 border-red-200"
          }`}>
            {message}
          </div>
        )}



        {/* Conditional Rendering */}
        {!requiresTOTP && !showTOTPSetup ? (
          /* Login Form */
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            <div className="text-center mb-6 sm:mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
                ADMIN LOGIN
              </h2>
              <p className="text-gray-600 text-sm sm:text-base">
                Enter your credentials to continue
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

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 cursor-pointer text-white font-semibold py-3 px-4 sm:px-6 rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              {isLoading ? "Verifying..." : "Continue"}
            </button>
          </form>
        ) : requiresTOTP ? (
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
                {isLoading ? "Verifying..." : "Verify & Login"}
              </button>

              <button
                type="button"
                onClick={resetForm}
                className="w-full text-blue-600 hover:text-blue-700 text-sm underline"
              >
                ← Back to login
              </button>
            </form>
          </div>
        ) : (
          /* TOTP Setup Form */
          <div className="space-y-4 sm:space-y-6">
            <div className="text-center">
              <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">
                Setup Google Authenticator
              </h3>
              <p className="text-xs sm:text-sm text-gray-600">
                Scan the QR code with Google Authenticator app
              </p>
            </div>

            {/* QR Code Display */}
            {qrCode && (
              <div className="text-center">
                <img 
                  src={qrCode} 
                  alt="TOTP QR Code" 
                  className="mx-auto w-48 h-48 border border-gray-300 rounded-lg"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Secret: {totpSecret}
                </p>
              </div>
            )}

            <form
              onSubmit={handleTOTPSetupSubmit}
              className="space-y-4 sm:space-y-6"
            >
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-3">
                  Enter the 6-digit code from Google Authenticator
                </p>
                <div className="flex justify-center space-x-1 sm:space-x-2">
                  {[0, 1, 2, 3, 4, 5].map((index) => (
                    <input
                      key={index}
                      type="text"
                      maxLength={1}
                      value={totpCode[index] || ""}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value.length <= 1) {
                          const newCode = totpCode.split("");
                          newCode[index] = value;
                          setTotpCode(newCode.join(""));

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
                          !totpCode[index] &&
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
              </div>

              <button
                type="submit"
                disabled={isLoading || totpCode.length !== 6}
                className="w-full bg-blue-600 cursor-pointer text-white font-semibold py-3 px-4 sm:px-6 rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
              >
                {isLoading ? "Setting up..." : "Complete Setup & Login"}
              </button>

              <button
                type="button"
                onClick={resetForm}
                className="w-full text-blue-600 hover:text-blue-700 text-sm underline"
              >
                ← Back to login
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
