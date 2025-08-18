import Notification from "../models/Notification.js";
import UserNotification from "../models/UserNotification.js";
import User from "../models/user.js";
import GlobalGroup from "../models/GlobalGroup.js";
import Group from "../models/LocalGroup.js";
import { io } from "../server.js";

// Create a new notification
const createNotification = async (req, res) => {
  console.log(req.body);
  try {
    const {
      title,
      message,
      type,
      targetCountry,
      targetUsers,
      targetGroups,
      globalGroups,
      priority,
      category,
      actionUrl,
      actionText,
      imageUrl,
      scheduledFor,
    } = req.body;

    const notification = new Notification({
      title,
      message,
      type,
      targetCountry,
      targetUsers,
      targetGroups,
      globalGroups,
      priority,
      category,
      actionUrl,
      actionText,
      imageUrl,
      scheduledFor,
      sentBy: req.user.id,
      status: scheduledFor ? "scheduled" : "draft",
    });

    await notification.save();

    // If not scheduled, process immediately
    if (!scheduledFor) {
      await processNotification(notification);
    }

    res.status(201).json({
      success: true,
      message: "Notification created successfully",
      data: notification,
    });
  } catch (error) {
    console.error("Error creating notification:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create notification",
      error: error.message,
    });
  }
};

// Process notification and create user notifications
const processNotification = async (notification) => {
  try {
    let targetUsers = [];

    switch (notification.type) {
      case "local":
        // Get users from specific country
        const localUsers = await User.find({
          country: notification.targetCountry,
        });
        targetUsers = localUsers.map((user) => user._id);
        break;

      case "global":
        // Get users subscribed to global groups
        if (notification.globalGroups && notification.globalGroups.length > 0) {
          const globalGroupUsers = await GlobalGroup.aggregate([
            { $match: { _id: { $in: notification.globalGroups } } },
            { $unwind: "$subscribers" },
            { $group: { _id: "$subscribers" } },
          ]);
          targetUsers = globalGroupUsers.map((item) => item._id);
        } else {
          // All users (since it's a global notification)
          const allUsers = await User.find({});
          targetUsers = allUsers.map((user) => user._id);
        }
        break;

      case "individual":
        // Specific users
        if (notification.targetUsers) {
          targetUsers = notification.targetUsers;
        }
        break;
    }

    // Create user notifications
    console.log(
      `Creating ${targetUsers.length} user notifications for notification: ${notification.title}`
    );

    const userNotifications = targetUsers.map((userId) => ({
      user: userId,
      notification: notification._id,
      status: "pending",
    }));

    if (userNotifications.length > 0) {
      const result = await UserNotification.insertMany(userNotifications);
      console.log(`Successfully created ${result.length} user notifications`);
    } else {
      console.log("No user notifications to create");
    }

    // Update notification stats
    await Notification.findByIdAndUpdate(notification._id, {
      "deliveryStats.totalTargets": targetUsers.length,
      status: "sending",
    });

    // Send real-time notifications via WebSocket
    await sendWebSocketNotifications(notification, targetUsers);

    // Update status to sent
    await Notification.findByIdAndUpdate(notification._id, { status: "sent" });
  } catch (error) {
    console.error("Error processing notification:", error);
    await Notification.findByIdAndUpdate(notification._id, {
      status: "failed",
    });
  }
};

// Send WebSocket notifications
const sendWebSocketNotifications = async (notification, userIds) => {
  try {
    console.log(
      `Sending notification to ${userIds.length} users:`,
      notification.title
    );

    // Get the io instance from the server
    if (io) {
      // Emit to specific users
      userIds.forEach((userId) => {
        io.to(`user-${userId}`).emit("notification", {
          id: notification._id,
          title: notification.title,
          message: notification.message,
          type: notification.type,
          category: notification.category,
          priority: notification.priority,
          actionUrl: notification.actionUrl,
          actionText: notification.actionText,
          imageUrl: notification.imageUrl,
          timestamp: new Date(),
        });
      });
    }
  } catch (error) {
    console.error("Error sending WebSocket notifications:", error);
  }
};

// Get all notifications (for admin)
const getAllNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, type, category } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (type) filter.type = type;
    if (category) filter.category = category;

    const notifications = await Notification.find(filter)
      .populate("sentBy", "name email")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Notification.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: notifications,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
      },
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch notifications",
      error: error.message,
    });
  }
};

// Get notification by ID
const getNotificationById = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id)
      .populate("sentBy", "name email")
      .populate("targetUsers", "name email country")
      .populate("targetGroups", "name")
      .populate("globalGroups", "name");

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    res.status(200).json({
      success: true,
      data: notification,
    });
  } catch (error) {
    console.error("Error fetching notification:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch notification",
      error: error.message,
    });
  }
};

// Update notification
const updateNotification = async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Notification updated successfully",
      data: notification,
    });
  } catch (error) {
    console.error("Error updating notification:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update notification",
      error: error.message,
    });
  }
};

// Delete notification
const deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findByIdAndDelete(req.params.id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    // Also delete associated user notifications
    await UserNotification.deleteMany({ notification: req.params.id });

    res.status(200).json({
      success: true,
      message: "Notification deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting notification:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete notification",
      error: error.message,
    });
  }
};

// Get notification statistics
const getNotificationStats = async (req, res) => {
  try {
    const stats = await Notification.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          totalSent: { $sum: { $cond: [{ $eq: ["$status", "sent"] }, 1, 0] } },
          totalFailed: {
            $sum: { $cond: [{ $eq: ["$status", "failed"] }, 1, 0] },
          },
          totalScheduled: {
            $sum: { $cond: [{ $eq: ["$status", "scheduled"] }, 1, 0] },
          },
          totalDelivered: { $sum: "$deliveryStats.delivered" },
          totalRead: { $sum: "$deliveryStats.read" },
        },
      },
    ]);

    const typeStats = await Notification.aggregate([
      {
        $group: {
          _id: "$type",
          count: { $sum: 1 },
        },
      },
    ]);

    const categoryStats = await Notification.aggregate([
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        overview: stats[0] || {},
        byType: typeStats,
        byCategory: categoryStats,
      },
    });
  } catch (error) {
    console.error("Error fetching notification stats:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch notification statistics",
      error: error.message,
    });
  }
};

// Send scheduled notifications (to be called by cron job)
const sendScheduledNotifications = async () => {
  try {
    const scheduledNotifications = await Notification.find({
      status: "scheduled",
      scheduledFor: { $lte: new Date() },
    });

    for (const notification of scheduledNotifications) {
      await processNotification(notification);
    }
  } catch (error) {
    console.error("Error sending scheduled notifications:", error);
  }
};

export default {
  createNotification,
  getAllNotifications,
  getNotificationById,
  updateNotification,
  deleteNotification,
  getNotificationStats,
  sendScheduledNotifications,
};
