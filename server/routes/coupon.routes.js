import express from "express";
import {
  createCoupon,
  getAdminCoupons,
  updateCoupon,
  deleteCoupon,
  validateCoupon,
  applyCoupon,
  getSubscriptionPlans,
} from "../controllers/coupon.ctrls.js";
import { authMiddleware, adminMiddleware } from "../middlewares/auth.mdware.js";

const router = express.Router();

// Public routes
router.get("/subscription/plans", getSubscriptionPlans);

// User routes (require authentication)
router.get("/validate/:code", authMiddleware, validateCoupon);
router.post("/apply", authMiddleware, applyCoupon);

// Admin routes (require admin privileges)
router.post("/", adminMiddleware, createCoupon);
router.get("/admin", adminMiddleware, getAdminCoupons);
router.put("/:couponId", adminMiddleware, updateCoupon);
router.delete("/:couponId", adminMiddleware, deleteCoupon);

export default router;
