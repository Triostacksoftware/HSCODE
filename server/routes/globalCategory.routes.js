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
} from "../controllers/globalCategory.ctrls.js";

const router = express.Router();

// Global Category routes
router.get("/", authMiddleware, getGlobalCategories); // Anyone can fetch
router.post("/", superadminMiddleware, createGlobalCategory); // Admin only
router.delete("/:id", superadminMiddleware, deleteGlobalCategory); // Admin only
router.patch("/:id", superadminMiddleware, updateGlobalCategory); // Admin only

router.get("/allglobalgroups", adminMiddleware, getadminAllGlobalGroups);

export default router;
