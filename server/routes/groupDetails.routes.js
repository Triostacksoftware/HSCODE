import express from "express";
import { authMiddleware } from "../middlewares/auth.mdware.js";
import {
  getLocalGroupDetails,
  getGlobalGroupDetails,
} from "../controllers/groupDetails.ctrls.js";

const router = express.Router();

// Local group details
router.get("/groups/:groupId/details", authMiddleware, getLocalGroupDetails);

// Global group details
router.get(
  "/global-groups/:groupId/details",
  authMiddleware,
  getGlobalGroupDetails
);

export default router;
