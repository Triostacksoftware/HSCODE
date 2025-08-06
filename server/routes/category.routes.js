import express from "express";
import { adminMiddleware, authMiddleware } from "../middlewares/auth.mdware.js";
import {
  getCategories,
  createCategory,
  deleteCategory,
  updateCategory,
  getGroups,
  createGroup,
  updateGroup,
  deleteGroup,
  createManyCategory,
  createManyGroup,
  getAllGroups,
} from "../controllers/category.ctrls.js";
import upload from "../configurations/multer.js";

const router = express.Router();

// Category routes (admin only)
router.get("/", authMiddleware, getCategories);
router.post("/", adminMiddleware, createCategory);
router.post(
  "/many",
  adminMiddleware,
  upload.single("file"),
  createManyCategory
);
router.delete("/:id", adminMiddleware, deleteCategory);
router.patch("/:id", adminMiddleware, updateCategory);

// Group routes inside category (admin only)
router.get("/:id/groups", authMiddleware, getGroups);
router.post("/:id/group", adminMiddleware, upload.single("file"), createGroup);
router.post(
  "/:id/group/many",
  adminMiddleware,
  upload.single("file"),
  createManyGroup
);
router.patch("/:id/group/:groupId", adminMiddleware, updateGroup);
router.delete("/:id/group/:groupId", adminMiddleware, deleteGroup);

router.get("/allgroups", adminMiddleware, getAllGroups);

export default router;
