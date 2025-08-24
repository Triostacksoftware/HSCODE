import express from "express";
import {
  adminMiddleware,
  authMiddleware,
  superadminMiddleware,
} from "../middlewares/auth.mdware.js";
import {
  getGlobalGroups,
  getAllGlobalGroups,
  createGlobalGroup,
  updateGlobalGroup,
  deleteGlobalGroup,
  bulkCreateGlobalGroups,
} from "../controllers/globalGroup.ctrls.js";
import upload from "../configurations/multer.js";

const router = express.Router();

// Global Group routes
router.get("/", authMiddleware, getGlobalGroups); // Anyone can fetch
router.get("/all", superadminMiddleware, getAllGlobalGroups); // Get all groups for superadmin
router.post(
  "/",
  superadminMiddleware,
  upload.single("file"),
  createGlobalGroup
); // Admin only
router.patch("/:groupId", superadminMiddleware, updateGlobalGroup); // Admin only
router.delete("/:groupId", superadminMiddleware, deleteGlobalGroup); // Admin only

// Bulk create groups
router.post(
  "/bulk",
  superadminMiddleware,
  upload.single("file"),
  bulkCreateGlobalGroups
);

export default router;
