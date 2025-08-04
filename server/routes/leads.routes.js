import express from "express";
import { authMiddleware } from "../middlewares/auth.mdware.js";
import { getLeadsByGroup, postNewLead } from "../controllers/leads.ctrls.js";

const router = express.Router();

// Get leads by groupId
router.get("/:groupId", authMiddleware, getLeadsByGroup);

// Post new lead
router.post("/", authMiddleware, postNewLead);

export default router;
