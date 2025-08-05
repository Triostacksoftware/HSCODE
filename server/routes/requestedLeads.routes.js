import express from "express";
import { authMiddleware } from "../middlewares/auth.mdware.js";
import {
  postRequestedLead,
  getUserRequestedLeads,
  getAllPendingLeads,
  approveRejectLead,
} from "../controllers/requestedLeads.ctrls.js";

const router = express.Router();

// User routes
router.post("/", authMiddleware, postRequestedLead);
router.get("/user", authMiddleware, getUserRequestedLeads);

// Admin routes
router.get("/admin/pending", authMiddleware, getAllPendingLeads);
router.patch("/admin/:leadId", authMiddleware, approveRejectLead);

export default router;
