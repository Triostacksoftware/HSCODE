import express from "express";
import {
  getGroups,
  joinGroup,
  leaveGroup,
  getUserById,
} from "../controllers/user.ctrls.js";
import { authMiddleware } from "../middlewares/auth.mdware.js";

const router = express.Router();

// User routes (requires user authentication)
router.post("/groups", authMiddleware, getGroups);
router.patch("/join-group", authMiddleware, joinGroup);
router.patch("/leave-group", authMiddleware, leaveGroup);
router.get("/:userId", authMiddleware, getUserById);

export default router;
