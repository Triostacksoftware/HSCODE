import express from "express";
import { joinGroup, leaveGroup } from "../controllers/user.ctrls.js";
import { userMiddleware } from "../middlewares/auth.mdware.js";

const router = express.Router();

// User routes (requires user authentication)
router.patch("/join-group", userMiddleware, joinGroup);
router.patch("/leave-group", userMiddleware, leaveGroup);

export default router;
