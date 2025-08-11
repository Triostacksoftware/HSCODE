import express from "express";
import { authMiddleware } from "../middlewares/auth.mdware.js";
import {
  postRequestedLead,
  getUserRequestedLeads,
  getAllPendingLeads,
  approveRejectLead,
  resendRequestedLead,
} from "../controllers/requestedLeads.ctrls.js";
import leadDocsUpload from "../configurations/multerLeadDocs.js";

const router = express.Router();

// User routes
// Multer middleware to accept multiple documents
router.post(
  "/",
  authMiddleware,
  leadDocsUpload.array("documents", 10),
  postRequestedLead
);
router.get("/user", authMiddleware, getUserRequestedLeads);
router.post(
  "/user/:leadId/resend",
  authMiddleware,
  leadDocsUpload.array("documents", 10),
  resendRequestedLead
);

// Admin routes
router.get("/admin/pending", authMiddleware, getAllPendingLeads);
router.patch("/admin/:leadId", authMiddleware, approveRejectLead);

export default router;
