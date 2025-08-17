import { verifyToken } from "../utilities/jwt.util.js";
import UserModel from "../models/user.js";
import SuperAdminModel from "../models/SuperAdmin.js";

export const authMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies.auth_token;

    if (!token) {
      return res
        .status(401)
        .json({ message: "No token provided. Please log in." });
    }

    // Verify token and extract id & role
    const decoded = verifyToken(token);

    if (!decoded) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    req.user = decoded;
    next();
  } catch (err) {
    console.error("Auth middleware error:", err);
    return res.status(401).json({ message: "Unauthorized or token expired" });
  }
};

// Admin-specific middleware
export const adminMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies.auth_token;

    if (!token) {
      return res
        .status(401)
        .json({ message: "No token provided. Please log in." });
    }

    // Verify token
    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    // Check if user is admin
    if (decoded.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Access denied. Admin role required." });
    }

    // Verify admin exists in database
    const admin = await UserModel.findById(decoded.id);
    if (!admin) {
      return res.status(401).json({ message: "Admin not found" });
    }

    req.user = decoded;
    next();
  } catch (err) {
    console.error("Admin middleware error:", err);
    return res.status(401).json({ message: "Unauthorized or token expired" });
  }
};

// Superadmin-specific middleware
export const superadminMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies.auth_token;

    if (!token) {
      return res.status(401).json({ message: "No token provided. Please log in." });
    }

    // Verify token
    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    // Check if user is superadmin
    if (decoded.role !== "superadmin") {
      return res
        .status(403)
        .json({ message: "Access denied. Superadmin role required." });
    }

    // Verify superadmin exists in database
    const superadmin = await SuperAdminModel.findById(decoded.id);
    if (!superadmin) {
      return res.status(401).json({ message: "Superadmin not found" });
    }

    req.user = decoded;
    next();
  } catch (err) {
    console.error("Superadmin middleware error:", err);
    return res.status(401).json({ message: "Unauthorized or token expired" });
  }
};
