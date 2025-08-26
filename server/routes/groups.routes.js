import express from "express";
import { adminMiddleware, authMiddleware } from "../middlewares/auth.mdware.js";
import {
  getGroups,
  getGroupById,
  createGroup,
  updateGroup,
  deleteGroup,
  createManyGroup,
  getAllGroups,
} from "../controllers/groups.ctrls.js";
import upload from "../configurations/multer.js";

const router = express.Router();

// Direct group routes (admin only)
router.get("/", authMiddleware, getGroups);
router.get("/:groupId", authMiddleware, getGroupById);
router.post("/", adminMiddleware, upload.single("file"), createGroup);
router.post("/many", adminMiddleware, upload.single("file"), createManyGroup);
router.patch("/:groupId", adminMiddleware, updateGroup);
router.delete("/:groupId", adminMiddleware, deleteGroup);

// Get all groups for admin
router.get("/all", adminMiddleware, getAllGroups);

export default router;
