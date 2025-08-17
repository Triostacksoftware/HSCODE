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
  getLocalRequestedLeadsCountryCounts,
  getPendingLocalRequestedLeadsByCountry,
  getSuperadmins,
  createSuperadmin,
  updateSuperadmin,
  deleteSuperadmin,
} from "../controllers/superadmin.ctrls.js";
import { approveRejectLead } from "../controllers/requestedLeads.ctrls.js";

const router = express.Router();

// Dashboard routes
router.get("/dashboard-stats", superadminMiddleware, getDashboardStats);

// Admin management routes
router.get("/admins", superadminMiddleware, getAdmins);
router.post("/admins", superadminMiddleware, createAdmin);
router.patch("/admins/:adminId", superadminMiddleware, updateAdmin);
router.delete("/admins/:adminId", superadminMiddleware, deleteAdmin);

// Superadmin management routes
router.get("/superadmins", superadminMiddleware, getSuperadmins);
router.post("/superadmins", createSuperadmin);
router.patch("/superadmins/:superadminId", superadminMiddleware, updateSuperadmin);
router.delete("/superadmins/:superadminId", superadminMiddleware, deleteSuperadmin);

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

// Local (domestic) requested leads management for superadmin
router.get(
  "/local-leads/countries",
  superadminMiddleware,
  getLocalRequestedLeadsCountryCounts
);
router.get(
  "/local-leads/pending",
  superadminMiddleware,
  getPendingLocalRequestedLeadsByCountry
);
router.patch(
  "/local-leads/:leadId",
  superadminMiddleware,
  approveRejectLead
);

export default router;
