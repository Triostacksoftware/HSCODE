import express from "express";
import {
  createCheckoutSession,
  validateCouponForCheckout,
  getPaymentHistory,
  cancelSubscription,
  updateSubscription,
  getSubscriptionStatus,
} from "../controllers/payment.ctrls.js";
import { handleWebhook } from "../controllers/webhook.ctrls.js";
import { authMiddleware } from "../middlewares/auth.mdware.js";

const router = express.Router();

// Webhook endpoint - must be before JSON middleware (handled in app.js)
router.post("/webhook", handleWebhook);

// User routes (require authentication)
router.post("/create-checkout-session", authMiddleware, createCheckoutSession);
router.post("/validate-coupon", authMiddleware, validateCouponForCheckout);
router.get("/payment-history", authMiddleware, getPaymentHistory);
router.get("/subscription-status", authMiddleware, getSubscriptionStatus);
router.post("/cancel-subscription", authMiddleware, cancelSubscription);
router.post("/update-subscription", authMiddleware, updateSubscription);

export default router;

