import express from "express";
const router = express.Router();
import notificationController from "../controllers/notification.ctrls.js";
import userNotificationController from "../controllers/userNotification.ctrls.js";

import {
  superadminMiddleware,
  authMiddleware,
} from "../middlewares/auth.mdware.js";

// Admin routes (require superadmin authentication)
router.use("/admin", superadminMiddleware);

// Create notification
router.post("/admin/create", notificationController.createNotification);

// Get all notifications
router.get("/admin/all", notificationController.getAllNotifications);

// Get notification by ID
router.get("/admin/:id", notificationController.getNotificationById);

// Update notification
router.put("/admin/:id", notificationController.updateNotification);

// Delete notification
router.delete("/admin/:id", notificationController.deleteNotification);

// Get notification statistics
router.get(
  "/admin/stats/overview",
  notificationController.getNotificationStats
);

// User routes (require user authentication)
router.use("/user", authMiddleware);

// Get user notifications
router.get("/user/all", userNotificationController.getUserNotifications);

// Get notification count
router.get("/user/count", userNotificationController.getNotificationCount);

// Mark notification as read
router.put(
  "/user/read/:notificationId",
  userNotificationController.markNotificationAsRead
);

// Mark all notifications as read
router.put(
  "/user/read-all",
  userNotificationController.markAllNotificationsAsRead
);

// Delete user notification
router.delete(
  "/user/:notificationId",
  userNotificationController.deleteUserNotification
);

// Get user notification preferences
router.get(
  "/user/preferences",
  userNotificationController.getUserNotificationPreferences
);

// Update user notification preferences
router.put(
  "/user/preferences",
  userNotificationController.updateUserNotificationPreferences
);

// Mark notification as delivered (for WebSocket delivery confirmation)
router.put(
  "/user/delivered/:notificationId",
  userNotificationController.markNotificationAsDelivered
);

export default router;
