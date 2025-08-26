import express from "express";
import {
  superadminMiddleware,
  authMiddleware,
} from "../middlewares/auth.mdware.js";
import upload from "../configurations/multer.js";
import {
  getDashboardStats,
  getAdmins,
  getAdminDetails,
  createAdmin,
  updateAdmin,
  deleteAdmin,
  getAllPendingGlobalLeads,
  approveRejectGlobalLead,
  postSuperadminMessage,
  postSuperadminLocalMessage,
  postLeadDirect,
  postGlobalLeadDirect,
  getLocalRequestedLeadsCountryCounts,
  getPendingLocalRequestedLeadsByCountry,
  getSuperadmins,
  createSuperadmin,
  updateSuperadmin,
  deleteSuperadmin,
} from "../controllers/superadmin.ctrls.js";
import { approveRejectLead } from "../controllers/requestedLeads.ctrls.js";
import { getGlobalLeadsByGroup } from "../controllers/globalLeads.ctrls.js";
import ApprovedLeads from "../models/ApprovedLeads.js";
import GlobalApprovedLeads from "../models/GlobalApprovedLeads.js";

const router = express.Router();

// Dashboard routes
router.get("/dashboard-stats", superadminMiddleware, getDashboardStats);

// Admin management routes
router.get("/admins", superadminMiddleware, getAdmins);
router.get("/admin-details/:adminId", superadminMiddleware, getAdminDetails);
router.post("/admins", superadminMiddleware, createAdmin);
router.patch("/admins/:adminId", superadminMiddleware, updateAdmin);
router.delete("/admins/:adminId", superadminMiddleware, deleteAdmin);

// Superadmin management routes
router.get("/superadmins", superadminMiddleware, getSuperadmins);
router.post("/superadmins", createSuperadmin);
router.patch(
  "/superadmins/:superadminId",
  superadminMiddleware,
  updateSuperadmin
);
router.delete(
  "/superadmins/:superadminId",
  superadminMiddleware,
  deleteSuperadmin
);

// Global leads management routes
router.get(
  "/global-leads/pending",
  superadminMiddleware,
  getAllPendingGlobalLeads
);
router.get(
  "/global-leads/group/:groupId",
  superadminMiddleware,
  getGlobalLeadsByGroup
);
router.patch(
  "/global-leads/:leadId",
  superadminMiddleware,
  approveRejectGlobalLead
);

// Superadmin post message to global group
router.post(
  "/global-leads/post/:groupId",
  superadminMiddleware,
  postSuperadminMessage
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
router.patch("/local-leads/:leadId", superadminMiddleware, approveRejectLead);

// Superadmin post message to local group
router.post(
  "/local-leads/post/:groupId",
  superadminMiddleware,
  postSuperadminLocalMessage
);

// Superadmin post lead directly to approved leads (local)
router.post(
  "/lead-direct",
  superadminMiddleware,
  upload.array("documents", 10),
  postLeadDirect
);

// Superadmin post global lead directly to approved global leads
router.post(
  "/global-lead-direct",
  superadminMiddleware,
  upload.array("documents", 10),
  postGlobalLeadDirect
);

// Superadmin fetch leads from any local group
router.get("/leads/:groupId", superadminMiddleware, async (req, res) => {
  try {
    const { groupId } = req.params;
    const leads = await ApprovedLeads.find({ groupId })
      .populate("userId", "name email image")
      .sort({ createdAt: -1 });
    res.json({ leads });
  } catch (error) {
    console.error("Error fetching leads:", error);
    res.status(500).json({ message: "Error fetching leads" });
  }
});

// Superadmin fetch leads from any global group
router.get("/global-leads/:groupId", superadminMiddleware, async (req, res) => {
  try {
    const { groupId } = req.params;
    const leads = await GlobalApprovedLeads.find({ groupId })
      .populate("userId", "name email image")
      .sort({ createdAt: -1 });
    res.json({ leads });
  } catch (error) {
    console.error("Error fetching global leads:", error);
    res.status(500).json({ message: "Error fetching global leads" });
  }
});

export default router;
