import AdminModel from "../models/Admin.js";
import UserModel from "../models/User.js";
import { generateToken, verifyToken } from "../utilities/jwt.util.js";
import { generateOTP } from "../utilities/otp.util.js";
import emailVerificatonMail from "../utilities/sendMail.js";
import bcrypt from "bcrypt";

// User Controllers
export const signup = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  try {
    // 1. Generate OTP
    const otp = generateOTP();

    // 2. Send OTP email
    await emailVerificatonMail(email, otp, "signup");

    // 3. Generate JWT with email and OTP (expires in 5 min)
    const token = generateToken({ email, otp }, "5m");

    // 4. Set JWT in HTTP-only cookie
    res.cookie("verify_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 5 * 60 * 1000, // 5 minutes
    });

    // 5. Respond
    return res.status(200).json({ message: "verification please" });
  } catch (error) {
    console.error("Signup error:", error);
    return res
      .status(500)
      .json({ message: "Failed to send verification email" });
  }
};

export const emailVerification = async (req, res) => {
  console.log(req.body);
  const { name, email, phone, password, OTP, countryCode } = req.body;
  console.log(req.cookies.verify_token);
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
    const authToken = generateToken({ id: newUser._id, role: 'user' }, "24h");

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
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    const user = await UserModel.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid credentials" });

    const reset = req.cookies.reset_confirmed;
    if (reset) {
      // Auth success: issue final token
      const authToken = generateToken({ id: user._id, role: 'user', countryCode: user.countryCode }, "24h");

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

    const otp = generateOTP();

    await emailVerificatonMail(email, otp, "login");

    const token = generateToken({ email, otp }, "5m");

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
    const authToken = generateToken({ id: user._id, role: 'user', countryCode: user.countryCode }, "24h");

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
  const { email } = req.body;

  if (!email) return res.status(400).json({ message: "Email is required" });

  const user = await UserModel.findOne({ email });
  if (!user) return res.status(404).json({ message: "User not found" });

  const otp = generateOTP();

  try {
    await emailVerificatonMail(email, otp, "forgot");

    const token = generateToken({ email, otp }, "5m");

    res.cookie("reset_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 5 * 60 * 1000,
    });

    return res.status(200).json({ message: "OTP sent to email" });
  } catch (err) {
    console.error("Forgot Password Error:", err);
    return res.status(500).json({ message: "Failed to send OTP" });
  }
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
  const { newPassword } = req.body;
  const token = req.cookies.reset_confirmed;

  if (!newPassword || !token) {
    return res.status(400).json({ message: "Missing password or token" });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }

  try {
    const user = await UserModel.findOne({ email: decoded.email });
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
  console.log(req.body);
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    const admin = await AdminModel.findOne({ email });
    if (!admin) return res.status(401).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid credentials" });

    const otp = generateOTP();

    await emailVerificatonMail(email, otp, "login");

    const token = generateToken({ email, otp, countryCode: admin.countryCode }, "5m");

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

    // Auth success: issue final token
    const authToken = generateToken({ id: decoded.id, role: 'admin', countryCode: decoded.countryCode }, "24h");

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
