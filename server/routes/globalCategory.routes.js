import express from "express";
import {
  adminMiddleware,
  authMiddleware,
  superadminMiddleware,
} from "../middlewares/auth.mdware.js";
import {
  getGlobalCategories,
  createGlobalCategory,
  deleteGlobalCategory,
  updateGlobalCategory,
  getadminAllGlobalGroups,
  bulkCreateGlobalCategories,
} from "../controllers/globalCategory.ctrls.js";
import upload from "../configurations/multer.js";

const router = express.Router();

// Global Category routes
router.get("/", authMiddleware, getGlobalCategories); // Anyone can fetch
router.post("/", superadminMiddleware, createGlobalCategory); // Admin only
router.post("/bulk", superadminMiddleware, upload.single("file"), bulkCreateGlobalCategories);
router.delete("/:id", superadminMiddleware, deleteGlobalCategory); // Admin only
router.patch("/:id", superadminMiddleware, updateGlobalCategory); // Admin only

router.get("/allglobalgroups", adminMiddleware, getadminAllGlobalGroups);

export default router;
