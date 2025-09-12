import express from "express";
import {
  createSubscriptionPlan,
  getSubscriptionPlans,
  getSubscriptionPlanById,
  updateSubscriptionPlan,
  deleteSubscriptionPlan,
} from "../controllers/subscriptionPlan.ctrls.js";
import { superadminMiddleware } from "../middlewares/auth.mdware.js";

const router = express.Router();

// Public routes
router.get("/", getSubscriptionPlans);

// Super admin routes (require superadmin privileges)
router.post("/", superadminMiddleware, createSubscriptionPlan);
router.get("/:id", superadminMiddleware, getSubscriptionPlanById);
router.put("/:id", superadminMiddleware, updateSubscriptionPlan);
router.delete("/:id", superadminMiddleware, deleteSubscriptionPlan);

export default router;
