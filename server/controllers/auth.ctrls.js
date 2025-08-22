import UserModel from "../models/user.js";
import SuperAdminModel from "../models/SuperAdmin.js";
import { generateToken, verifyToken } from "../utilities/jwt.util.js";
import { generateOTP } from "../utilities/otp.util.js";
import emailVerificatonMail from "../utilities/sendMail.js";
import {
  generateTOTPSecret,
  generateQRCode,
  verifyTOTP,
} from "../utilities/totp.util.js";
import bcrypt from "bcrypt";
import { verifyFirebaseToken } from "../utilities/firebase.util.js";

const setCookie = (res, tokenName, token, maxAge) => {
  res.cookie(tokenName, token, {
    httpOnly: true,
    secure: process.env.ENV === "PRODUCTION",
    sameSite: process.env.ENV === "PRODUCTION" ? "none" : "lax",
    maxAge: maxAge || 7 * 24 * 60 * 60 * 1000, // 7d for user
  });
};

// Get current user profile (for settings)
export const getMe = async (req, res) => {
  try {
    const token = req.cookies.auth_token;
    const decoded = verifyToken(token);
    if (!decoded?.id) return res.status(401).json({ message: "Unauthorized" });
    const user = await UserModel.findById(decoded.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ user });
  } catch (e) {
    res.status(500).json({ message: "Failed to fetch profile" });
  }
};

// Update user profile (allow change everything except countryCode)
export const updateProfile = async (req, res) => {
  try {
    const token = req.cookies.auth_token;
    const decoded = verifyToken(token);
    if (!decoded?.id) return res.status(401).json({ message: "Unauthorized" });
    const user = await UserModel.findById(decoded.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    let {
      name,
      email,
      phone,
      password,
      about,
      companyWebsite,
      preferences,
      image,
    } = req.body;
    if (typeof preferences === "string") {
      try {
        preferences = JSON.parse(preferences);
      } catch (_) {
        preferences = undefined;
      }
    }
    if (name) user.name = name;
    if (email) user.email = email;
    if (phone) user.phone = phone;
    if (typeof about !== "undefined") user.about = about;
    if (typeof companyWebsite !== "undefined")
      user.companyWebsite = companyWebsite;
    if (preferences && typeof preferences === "object") {
      user.preferences = { ...(user.preferences || {}), ...preferences };
    }
    if (image) {
      user.image = image;
    }
    if (password && password.trim() !== "") {
      user.password = password; // pre-save hook will hash
    }
    await user.save();
    res.json({ message: "Profile updated" });
  } catch (e) {
    console.error("Profile update error:", e);
    res.status(500).json({ message: "Failed to update profile" });
  }
};

export const userExists = async (req, res) => {
  try {
    const { email, phoneNumber } = req.body;
    const user = await UserModel.findOne({$or: [{email}, {phone: phoneNumber}]});
    if (user) {
      return res.status(200).json({ message: "User exists" });
    }
    return res.status(200).json({ message: "User does not exist" });
  } catch (error) {
    console.error("User exists error:", error);
    return res.status(500).json({ message: "Failed to check user existence" });
  }
};

// User Controllers
export const signup = async (req, res) => {
  const { name, email, phoneNumber, password, countryCode, country } = req.body;

  try {
    // Check if user already exists
    const existingUser = await UserModel.findOne({$or: [{email}, {phone: phoneNumber}]});

    if (existingUser) {
      return res.status(409).json({ message: "User already registered" });
    }
    // Get Firebase ID token from Authorization header
    const idToken = req.headers.authorization?.split(' ')[1];

    if (!idToken) {
      return res.status(401).json({
        success: false,
        message: "Firebase ID token required in Authorization header",
      });
    }

    // Verify Firebase ID token
    const firebaseResult = await verifyFirebaseToken(idToken);
    
    if (!firebaseResult.success) {
      return res.status(401).json({
        success: false,
        message: "Invalid Firebase token",
      });
    }

    // Check if phone is verified in Firebase
    if (!firebaseResult.phoneVerified || !firebaseResult.phoneNumber) {
      return res.status(400).json({
        success: false,
        message: "Phone number not verified in Firebase",
      });
    }


    // Create new user directly (phone verification already done by Firebase)
    const newUser = new UserModel({
      name,
      email,
      phone: phoneNumber,
      password,
      countryCode: countryCode || "IN",
      country: country || "India",
    });

    await newUser.save();

    // Generate JWT with user._id
    const authToken = generateToken({ id: newUser._id, role: "user" }, "7d");

    // Set JWT in HTTP-only cookie
    setCookie(res, "auth_token", authToken); // 7d

    // Respond with success
    return res.status(201).json({
      message: "User registered successfully",
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        countryCode: newUser.countryCode,
        country: newUser.country,
      },
    });
  } catch (error) {
    console.error("Signup error:", error);
    return res.status(500).json({ message: "Failed to create user account" });
  }
};

export const emailVerification = async (req, res) => {
  const { name, email, phone, password, OTP, countryCode } = req.body;
  const token = req.cookies.verify_token;

  // 1. Basic check
  if (
    !name ||
    !email ||
    !phone ||
    !password ||
    !OTP ||
    !countryCode ||
    !token
  ) {
    return res
      .status(400)
      .json({ message: "Missing required fields or token" });
  }

  // 2. Decode and verify JWT
  const decoded = verifyToken(token);
  if (!decoded || decoded.email !== email || decoded.otp !== OTP) {
    return res.status(401).json({ message: "Invalid or expired token/OTP" });
  }

  try {
    // 3. Check if user already exists
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "User already registered" });
    }

    // 4. Create new user
    const newUser = new UserModel({
      name,
      email,
      phone,
      password,
      countryCode,
    });

    await newUser.save();

    // 5. Generate JWT with user._id
    const authToken = generateToken({ id: newUser._id, role: "user" }, "24h");

    // 6. Set JWT in HTTP-only cookie
    res.cookie("auth_token", authToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 24 * 60 * 60 * 1000, // 5 minutes
    });

    // 7. Clear the verify_token cookie
    res.clearCookie("verify_token");

    // 8. Respond with success
    return res.status(201).json({
      message: "Email verified and user registered successfully",
    });
  } catch (err) {
    console.error("Verification error:", err);
    return res.status(500).json({ message: "Server Error" });
  }
};

export const login = async (req, res) => {
  const { phoneNumber, password } = req.body;

  if (!phoneNumber || !password) {
    return res
      .status(400)
      .json({ message: "Phone number and password are required" });
  }

  try {
    // Find user by phone number
    const user = await UserModel.findOne({ phone: phoneNumber });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid credentials" });

    const reset = req.cookies.reset_confirmed;
    if (reset) {
      // Auth success: issue final token
      const authToken = generateToken(
        { id: user._id, role: "user", countryCode: user.countryCode },
        "24h"
      );

      // Set final auth cookie
      res.cookie("auth_token", authToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
      });

      res.clearCookie("reset_confirmed");

      return res.status(200).json({ message: "LoggedIn" });
    }

    // Phone verification already done by Firebase, proceed with login
    const authToken = generateToken(
      { id: user._id, role: "user", countryCode: user.countryCode },
      "24h"
    );

    // Set auth cookie
    res.cookie("auth_token", authToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });

    return res.status(200).json({ message: "LoggedIn" });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ message: "Login failed" });
  }
};

export const userVerification = async (req, res) => {
  try {
    const { OTP } = req.body;
    const tempToken = req.cookies.auth_otp_token;

    if (!OTP || !tempToken) {
      return res.status(400).json({ message: "OTP or token missing" });
    }

    const decoded = verifyToken(tempToken);
    if (!decoded || decoded.otp !== OTP) {
      return res.status(401).json({ message: "Invalid or expired OTP" });
    }

    const user = await UserModel.findOne({ email: decoded.email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    // Auth success: issue final token
    const authToken = generateToken(
      { id: user._id, role: "user", countryCode: user.countryCode },
      "24h"
    );

    // Set final auth cookie
    res.cookie("auth_token", authToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });

    res.clearCookie("auth_otp_token");

    return res.status(200).json({ message: "Login successful" });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

export const forgotPassword = async (req, res) => {
  const { phoneNumber } = req.body;

  if (!phoneNumber)
    return res.status(400).json({ message: "Phone number is required" });

  const user = await UserModel.findOne({ phone: phoneNumber });
  if (!user) return res.status(404).json({ message: "User not found" });

  // Phone verification will be handled by Firebase on the frontend
  // We just need to confirm the user exists
  return res.status(200).json({
    message: "User found. Please use phone OTP verification to reset password.",
    userExists: true,
  });
};

export const otpVerification = (req, res) => {
  const { OTP } = req.body;
  const token = req.cookies.reset_token;

  if (!OTP || !token) {
    return res.status(400).json({ message: "OTP or token missing" });
  }

  const decoded = verifyToken(token);
  if (!decoded || decoded.otp !== OTP) {
    return res.status(401).json({ message: "Invalid or expired OTP" });
  }

  // Create a short token to allow password reset
  const newToken = generateToken({ email: decoded.email }, "5m");

  res.cookie("reset_confirmed", newToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 5 * 60 * 1000,
  });

  res.clearCookie("reset_token");

  return res
    .status(200)
    .json({ message: "OTP verified. You may reset your password now." });
};

export const resetPassword = async (req, res) => {
  const { phoneNumber, newPassword } = req.body;

  if (!phoneNumber || !newPassword) {
    return res
      .status(400)
      .json({ message: "Phone number and new password are required" });
  }

  try {
    // Phone verification already done by Firebase, proceed with password reset
    const user = await UserModel.findOne({ phone: phoneNumber });
    if (!user) return res.status(404).json({ message: "User not found" });

    user.password = newPassword;
    await user.save(); // this triggers pre('save') hook

    return res.status(200).json({ message: "Password reset successful" });
  } catch (err) {
    console.error("Reset password error:", err);
    return res.status(500).json({ message: "Could not reset password" });
  }
};

// Admin Controllers
export const adminLogin = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    const admin = await UserModel.findOne({ email, role: "admin" });
    if (!admin) return res.status(401).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid credentials" });

    const otp = generateOTP();

    await emailVerificatonMail(email, otp, "login");

    const token = generateToken(
      { email, otp, countryCode: admin.countryCode },
      "5m"
    );

    res.cookie("auth_otp_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 5 * 60 * 1000,
    });

    return res.status(200).json({ message: "OTP sent to email" });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ message: "Login failed" });
  }
};

export const adminVerification = async (req, res) => {
  try {
    const { OTP } = req.body;
    const tempToken = req.cookies.auth_otp_token;

    if (!OTP || !tempToken) {
      return res.status(400).json({ message: "OTP or token missing" });
    }

    const decoded = verifyToken(tempToken);
    if (!decoded || decoded.otp !== OTP) {
      return res.status(401).json({ message: "Invalid or expired OTP" });
    }

    const admin = await UserModel.findOne({
      email: decoded.email,
      role: "admin",
    });
    if (!admin) return res.status(404).json("Admin not found");

    // Auth success: issue final token
    const authToken = generateToken(
      { id: admin._id, role: "admin", countryCode: admin.countryCode },
      "24h"
    );

    // Set final auth cookie
    res.cookie("auth_token", authToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });

    res.clearCookie("auth_otp_token");

    return res.status(200).json({ message: "Login successful" });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// Superadmin Login
export const superadminLogin = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    // Find superadmin by email
    const superadmin = await SuperAdminModel.findOne({ email });
    if (!superadmin) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Verify password
    const isPasswordValid = bcrypt.compareSync(password, superadmin.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate JWT with superadmin._id and role
    const authToken = generateToken(
      { id: superadmin._id, role: "superadmin" },
      "24h"
    );

    // Set JWT in HTTP-only cookie
    res.cookie("auth_token", authToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });

    // Respond with success
    res.json({
      success: true,
      message: "Superadmin login successful",
      superadmin: {
        _id: superadmin._id,
        name: superadmin.name,
        email: superadmin.email,
        countryCode: superadmin.countryCode,
        role: "superadmin",
      },
    });
  } catch (error) {
    console.error("Superadmin login error:", error);
    res.status(500).json({ message: "Login failed. Please try again." });
  }
};

// Setup TOTP for admin (first time setup)
export const setupAdminTOTP = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const admin = await UserModel.findOne({ email, role: "admin" });
    if (!admin) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Check if TOTP is already enabled
    if (admin.totpEnabled) {
      return res
        .status(400)
        .json({ message: "TOTP is already enabled for this admin" });
    }

    // Generate TOTP secret
    const totpData = generateTOTPSecret(email);

    // Generate QR code
    const qrCodeDataURL = await generateQRCode(totpData.otpauth_url);

    // Store secret temporarily (will be confirmed after verification)
    const tempToken = generateToken(
      {
        email,
        totpSecret: totpData.secret,
        action: "setup_totp",
      },
      "10m"
    );

    res.cookie("totp_setup_token", tempToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 10 * 60 * 1000, // 10 minutes
    });

    return res.status(200).json({
      message: "TOTP setup initiated",
      qrCode: qrCodeDataURL,
      secret: totpData.secret, // For manual entry if QR code doesn't work
      instructions:
        "Scan the QR code with Google Authenticator app, then verify with a token",
    });
  } catch (error) {
    console.error("TOTP setup error:", error);
    return res.status(500).json({ message: "Failed to setup TOTP" });
  }
};

// Verify and enable TOTP for admin
export const verifyAndEnableTOTP = async (req, res) => {
  try {
    const { token } = req.body; // TOTP token from Google Authenticator
    const setupToken = req.cookies.totp_setup_token;

    if (!token || !setupToken) {
      return res
        .status(400)
        .json({ message: "TOTP token or setup token missing" });
    }

    const decoded = verifyToken(setupToken);
    if (!decoded || decoded.action !== "setup_totp") {
      return res
        .status(401)
        .json({ message: "Invalid or expired setup token" });
    }

    // Verify the TOTP token
    const isValid = verifyTOTP(token, decoded.totpSecret);
    if (!isValid) {
      return res.status(401).json({ message: "Invalid TOTP token" });
    }

    // Update admin with TOTP secret and enable it
    const admin = await UserModel.findOne({
      email: decoded.email,
      role: "admin",
    });
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    admin.totpSecret = decoded.totpSecret;
    admin.totpEnabled = true;
    await admin.save();

    // Clear setup token
    res.clearCookie("totp_setup_token");

    return res.status(200).json({
      message: "TOTP enabled successfully for admin",
    });
  } catch (error) {
    console.error("TOTP verification error:", error);
    return res.status(500).json({ message: "Failed to verify TOTP" });
  }
};

// New admin login with TOTP
export const adminLoginWithTOTP = async (req, res) => {
  const { email, password, totpToken } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    const admin = await UserModel.findOne({ email, role: "admin" });
    if (!admin) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Check if TOTP is enabled for this admin
    if (!admin.totpEnabled || !admin.totpSecret) {
      return res.status(400).json({
        message: "TOTP not enabled for this admin. Please setup TOTP first.",
      });
    }

    // If TOTP token is provided, verify it
    if (totpToken) {
      const isValid = verifyTOTP(totpToken, admin.totpSecret);
      if (!isValid) {
        return res.status(401).json({ message: "Invalid TOTP token" });
      }

      // TOTP verified, generate auth token
      const authToken = generateToken(
        { id: admin._id, role: "admin", countryCode: admin.countryCode },
        "24h"
      );

      res.cookie("auth_token", authToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
      });

      return res.status(200).json({ message: "Login successful" });
    } else {
      // TOTP token not provided, request it
      return res.status(200).json({
        message: "TOTP token required",
        requiresTOTP: true,
      });
    }
  } catch (error) {
    console.error("Admin login error:", error);
    return res.status(500).json({ message: "Login failed" });
  }
};

// Logout function
export const logout = async (req, res) => {
  try {
    // Clear the auth token cookie
    res.clearCookie("auth_token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });

    return res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    return res.status(500).json({ message: "Logout failed" });
  }
};

// Verify authentication status
export const verifyAuth = async (req, res) => {
  try {
    const token = req.cookies.auth_token;

    if (!token) {
      return res.status(401).json({
        authenticated: false,
        message: "No authentication token",
      });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({
        authenticated: false,
        message: "Invalid or expired token",
      });
    }

    // Check if user exists and is admin
    if (decoded.role === "admin") {
      const admin = await UserModel.findById(decoded.id);
      if (!admin) {
        return res.status(401).json({
          authenticated: false,
          message: "Admin not found",
        });
      }

      return res.status(200).json({
        authenticated: true,
        user: {
          id: admin._id,
          name: admin.name,
          email: admin.email,
          role: admin.role,
          countryCode: admin.countryCode,
        },
      });
    } else if (decoded.role === "superadmin") {
      const superadmin = await SuperAdminModel.findById(decoded.id);
      if (!superadmin) {
        return res.status(401).json({
          authenticated: false,
          message: "Superadmin not found",
        });
      }

      return res.status(200).json({
        authenticated: true,
        user: {
          id: superadmin._id,
          name: superadmin.name,
          email: superadmin.email,
          role: "superadmin",
          countryCode: superadmin.countryCode,
        },
      });
    } else {
      return res.status(403).json({
        authenticated: false,
        message: "Access denied - admin or superadmin role required",
      });
    }
  } catch (error) {
    console.error("Auth verification error:", error);
    return res.status(500).json({
      authenticated: false,
      message: "Authentication verification failed",
    });
  }
};

export const verifyUserAuth = async (req, res) => {
  try {
    const token = req.cookies.auth_token;

    if (!token) {
      return res.status(401).json({
        authenticated: false,
        message: "No authentication token",
      });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({
        authenticated: false,
        message: "Invalid or expired token",
      });
    }

    // Check if user exists (any role)
    const user = await UserModel.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        authenticated: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      authenticated: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        membership: user.membership,
        groupsID: user.groupsID,
        globalGroupsID: user.globalGroupsID,
        countryCode: user.countryCode,
        role: decoded.role,
      },
    });
  } catch (error) {
    console.error("User auth verification error:", error);
    return res.status(500).json({
      authenticated: false,
      message: "User authentication verification failed",
    });
  }
};

// New function to check user existence before sending OTP
export const checkUserBeforeOTP = async (req, res) => {
  const { phoneNumber, password } = req.body;

  if (!phoneNumber || !password) {
    return res.status(400).json({
      message: "Phone number and password are required",
    });
  }

  try {
    // Find user by phone number
    const user = await UserModel.findOne({ phone: phoneNumber });
    if (!user) {
      return res.status(401).json({
        message: "Invalid credentials",
        userExists: false,
      });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid credentials",
        userExists: false,
      });
    }

    // User exists and password is correct, proceed with OTP
    return res.status(200).json({
      message: "User verified, proceed with OTP",
      userExists: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        countryCode: user.countryCode,
      },
    });
  } catch (err) {
    console.error("User verification error:", err);
    return res.status(500).json({ message: "Verification failed" });
  }
};
