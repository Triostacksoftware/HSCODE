import express from "express";
import {
  createSubscriptionPlan,
  getSubscriptionPlans,
  getSubscriptionPlanById,
  updateSubscriptionPlan,
  deleteSubscriptionPlan,
  subscribeToPlan,
} from "../controllers/subscriptionPlan.ctrls.js";
import {
  superadminMiddleware,
  authMiddleware,
} from "../middlewares/auth.mdware.js";

const router = express.Router();

// Public routes
router.get("/", getSubscriptionPlans);

// User routes (require authentication)
router.post("/:planId/subscribe", authMiddleware, subscribeToPlan);

// Super admin routes (require superadmin privileges)
router.post("/", superadminMiddleware, createSubscriptionPlan);
router.get("/:id", superadminMiddleware, getSubscriptionPlanById);
router.put("/:id", superadminMiddleware, updateSubscriptionPlan);
router.delete("/:id", superadminMiddleware, deleteSubscriptionPlan);

export default router;
