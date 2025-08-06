import express from "express";
import { adminMiddleware, authMiddleware } from "../middlewares/auth.mdware.js";
import {
  getGlobalLeadsByGroup,
  postGlobalRequestedLead,
  getUserGlobalRequestedLeads,
  getAllPendingGlobalLeads,
  approveRejectGlobalLead,
} from "../controllers/globalLeads.ctrls.js";

const router = express.Router();

// Global Leads routes
router.get("/:groupId", authMiddleware, getGlobalLeadsByGroup); // Anyone can fetch approved leads
router.post("/requested", authMiddleware, postGlobalRequestedLead); // User submits for approval
router.get("/user/requested", authMiddleware, getUserGlobalRequestedLeads); // User views their leads
router.get("/admin/pending", adminMiddleware, getAllPendingGlobalLeads); // Admin views pending (country filtered)
router.patch("/admin/:leadId", adminMiddleware, approveRejectGlobalLead); // Admin approves/rejects

export default router;
