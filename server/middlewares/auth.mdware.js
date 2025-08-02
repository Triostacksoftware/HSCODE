import { verifyToken } from "../utilities/jwt.util.js";
import AdminModel from "../models/Admin.js";

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
    const admin = await AdminModel.findById(decoded.id);
    if (!admin) {
      return res.status(401).json({ message: "Admin not found" });
    }

    req.user = decoded;
    req.admin = admin;
    next();
  } catch (err) {
    console.error("Admin middleware error:", err);
    return res.status(401).json({ message: "Unauthorized or token expired" });
  }
};
