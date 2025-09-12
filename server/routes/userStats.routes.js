import express from "express";
import { authMiddleware } from "../middlewares/auth.mdware.js";
import { getUserStats } from "../controllers/userStats.ctrls.js";

const router = express.Router();

// Get user statistics
router.get("/user/:userId/stats", authMiddleware, getUserStats);

export default router;
