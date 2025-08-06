import express from "express";
import {
  superadminMiddleware,
  authMiddleware,
} from "../middlewares/auth.mdware.js";
import {
  getDashboardStats,
  getAdmins,
  createAdmin,
  updateAdmin,
  deleteAdmin,
  getAllPendingGlobalLeads,
  approveRejectGlobalLead,
} from "../controllers/superadmin.ctrls.js";

const router = express.Router();

// Dashboard routes
router.get("/dashboard-stats", superadminMiddleware, getDashboardStats);

// Admin management routes
router.get("/admins", superadminMiddleware, getAdmins);
router.post("/admins", superadminMiddleware, createAdmin);
router.patch("/admins/:adminId", superadminMiddleware, updateAdmin);
router.delete("/admins/:adminId", superadminMiddleware, deleteAdmin);

// Global leads management routes
router.get(
  "/global-leads/pending",
  superadminMiddleware,
  getAllPendingGlobalLeads
);
router.patch(
  "/global-leads/:leadId",
  superadminMiddleware,
  approveRejectGlobalLead
);

export default router;
