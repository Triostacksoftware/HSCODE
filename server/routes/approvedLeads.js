import express from "express";
import { authMiddleware } from "../middlewares/auth.mdware.js";
import {
  getLeadsByGroup,
  postNewLead,
  requestBroadcast,
  getBroadcastRequests,
  updateBroadcastStatus,
} from "../controllers/approvedLeads.js";

const router = express.Router();

// Get all broadcast requests (admin only) - MUST come before any dynamic routes
router.get("/broadcast-requests", authMiddleware, getBroadcastRequests);

// Update broadcast status (admin only) - MUST come before any dynamic routes
router.patch("/broadcast/:leadId", authMiddleware, updateBroadcastStatus);

// Request broadcast for a lead - MUST come before /:groupId route
router.post("/broadcast-request/:leadId", authMiddleware, requestBroadcast);

// Get leads by groupId
router.get("/:groupId", authMiddleware, getLeadsByGroup);

// Post new lead
router.post("/", authMiddleware, postNewLead);

export default router;
