import express from "express";
import { adminMiddleware, authMiddleware } from "../middlewares/auth.mdware.js";
import {
  getHomeDataByCountry,
  getAdminHomeData,
  upsertHomeData,
  deleteHomeData,
  saveDummyData,
  migrateSubscriptionPlans,
} from "../controllers/homeData.ctrls.js";

const router = express.Router();

// Public route to get home data by country code
router.get("/country/:countryCode", getHomeDataByCountry);

// Admin routes (require authentication)
router.get("/admin", adminMiddleware, getAdminHomeData);
router.post("/admin", adminMiddleware, upsertHomeData);
router.put("/admin", adminMiddleware, upsertHomeData);
router.delete("/admin", adminMiddleware, deleteHomeData);
router.post("/admin/reset", adminMiddleware, saveDummyData);
router.post(
  "/admin/migrate-subscription",
  adminMiddleware,
  migrateSubscriptionPlans
);

export default router;
