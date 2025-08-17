import express from "express";
import {
  adminLogin,
  adminVerification,
  emailVerification,
  forgotPassword,
  login,
  otpVerification,
  resetPassword,
  signup,
  userVerification,
  setupAdminTOTP,
  verifyAndEnableTOTP,
  adminLoginWithTOTP,
  logout,
  verifyAuth,
  verifyUserAuth,
  superadminLogin,
  getMe,
  updateProfile,
  checkUserBeforeOTP,
} from "../controllers/auth.ctrls.js";
import upload from "../configurations/multer.js";

const router = express.Router();

// user auth
router.post("/signup", signup);
router.post("/email-verification", emailVerification);
router.post("/login", login);
router.post("/check-user-before-otp", checkUserBeforeOTP);
router.post("/user-verification", userVerification);
router.post("/forgot-password", forgotPassword);
router.post("/otp-verification", otpVerification);
router.post("/reset-password", resetPassword);
router.post("/logout", logout);
router.get("/me", getMe);
router.patch(
  "/profile",
  upload.single("image"),
  (req, res, next) => {
    // attach file path to body if provided
    if (req.file?.filename) {
      req.body.image = req.file.filename;
    }
    next();
  },
  updateProfile
);

// auth verification
router.get("/verify", verifyAuth);
router.get("/verify-user", verifyUserAuth);

// admin auth
router.post("/admin-login", adminLogin);
router.post("/admin-verification", adminVerification);

// superadmin auth
router.post("/superadmin-login", superadminLogin);

// TOTP admin auth (Google Authenticator)
router.post("/admin-setup-totp", setupAdminTOTP);
router.post("/admin-verify-totp", verifyAndEnableTOTP);
router.post("/admin-login-totp", adminLoginWithTOTP);

router.post("/admin-signup", async (req, res) => {
  const { name, email, phone, password, countryCode } = req.body;
  
  // Import UserModel here since it's not imported at the top
  const UserModel = (await import("../models/user.js")).default;
  
  const admin = await UserModel.create({
    name,
    email,
    phone,
    password,
    role: "admin", // Always set role to admin for admin signup
    countryCode,
  });
  res.status(201).json({ message: "Admin created successfully", admin });
});

export default router;
