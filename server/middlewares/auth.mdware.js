import { verifyToken } from "../utilities/jwt.util.js";
import UserModel from "../models/user.js";
import SuperAdminModel from "../models/SuperAdmin.js";

export const authMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies.auth_token;
    console.log("token", token);

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

    console.log("Auth middleware - decoded token:", decoded);
    console.log("Auth middleware - setting req.user:", decoded);

    req.user = decoded;
    next();
  } catch (err) {
    console.error("Auth middleware error:", err);
    return res.status(401).json({ message: "Unauthorized or token expired" });
  }
};

// Admin-specific middleware (allows both admin and superadmin)
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

    // Check if user is admin or superadmin
    if (decoded.role !== "admin" && decoded.role !== "superadmin") {
      return res
        .status(403)
        .json({ message: "Access denied. Admin or Superadmin role required." });
    }

    // Verify user exists in database
    if (decoded.role === "admin") {
      const admin = await UserModel.findById(decoded.id);
      if (!admin) {
        return res.status(401).json({ message: "Admin not found" });
      }
    } else if (decoded.role === "superadmin") {
      const superadmin = await SuperAdminModel.findById(decoded.id);
      if (!superadmin) {
        return res.status(401).json({ message: "Superadmin not found" });
      }
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
      return res
        .status(401)
        .json({ message: "No token provided. Please log in." });
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
