import express from "express";
import {
  getGroups,
  joinGroup,
  leaveGroup,
  getUserById,
  getGlobalGroups,
  joinGlobalGroup,
  leaveGlobalGroup,
  markGroupRead,
  markGlobalGroupRead,
} from "../controllers/user.ctrls.js";
import { authMiddleware } from "../middlewares/auth.mdware.js";

const router = express.Router();

// User routes (requires user authentication)
router.post("/groups", authMiddleware, getGroups);
router.patch("/join-group", authMiddleware, joinGroup);
router.patch("/leave-group", authMiddleware, leaveGroup);
router.patch("/mark-group-read", authMiddleware, markGroupRead);
router.get("/:userId", authMiddleware, getUserById);

// Global group routes
router.post("/global-groups", authMiddleware, getGlobalGroups);
router.patch("/join-global-group", authMiddleware, joinGlobalGroup);
router.patch("/leave-global-group", authMiddleware, leaveGlobalGroup);
router.patch("/mark-global-group-read", authMiddleware, markGlobalGroupRead);

export default router;
