import UserNotification from "../models/UserNotification.js";
import Notification from "../models/Notification.js";
import User from "../models/user.js";

// Get user notifications
const getUserNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, unreadOnly = false } = req.query;
    const userId = req.user.id;

    console.log(`Fetching notifications for user: ${userId}`);
    console.log(
      `Query params: page=${page}, limit=${limit}, status=${status}, unreadOnly=${unreadOnly}`
    );

    const filter = { user: userId };
    if (status) filter.status = status;
    if (unreadOnly === "true") filter.status = { $ne: "read" };

    console.log(`Filter:`, filter);

    const userNotifications = await UserNotification.find(filter)
      .populate({
        path: "notification",
        select:
          "title message type category priority actionUrl actionText imageUrl createdAt",
      })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await UserNotification.countDocuments(filter);
    const unreadCount = await UserNotification.countDocuments({
      user: userId,
      status: { $ne: "read" },
    });

    console.log(
      `Found ${userNotifications.length} user notifications out of ${total} total`
    );
    console.log(`Unread count: ${unreadCount}`);

    res.status(200).json({
      success: true,
      data: userNotifications,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
      },
      unreadCount,
    });
  } catch (error) {
    console.error("Error fetching user notifications:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch notifications",
      error: error.message,
    });
  }
};

// Mark notification as read
const markNotificationAsRead = async (req, res) => {
  console.log("markNotificationAsRead");
  try {
    const { notificationId } = req.params;
    const userId = req.user.id;

    const userNotification = await UserNotification.findOneAndUpdate(
      { user: userId, notification: notificationId },
      {
        status: "read",
        readAt: new Date(),
      },
      { new: true }
    );

    if (!userNotification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    // Update the main notification read count
    await Notification.findByIdAndUpdate(notificationId, {
      $inc: { "deliveryStats.read": 1 },
    });

    res.status(200).json({
      success: true,
      message: "Notification marked as read",
      data: userNotification,
    });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res.status(500).json({
      success: false,
      message: "Failed to mark notification as read",
      error: error.message,
    });
  }
};

// Mark all notifications as read
const markAllNotificationsAsRead = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await UserNotification.updateMany(
      { user: userId, status: { $ne: "read" } },
      {
        status: "read",
        readAt: new Date(),
      }
    );

    // Update read counts for all affected notifications
    const unreadNotifications = await UserNotification.find({
      user: userId,
      status: "read",
      readAt: { $gte: new Date(Date.now() - 1000) }, // Notifications marked as read in the last second
    });

    const notificationIds = [
      ...new Set(unreadNotifications.map((un) => un.notification.toString())),
    ];

    for (const notificationId of notificationIds) {
      await Notification.findByIdAndUpdate(notificationId, {
        $inc: { "deliveryStats.read": 1 },
      });
    }

    res.status(200).json({
      success: true,
      message: `${result.modifiedCount} notifications marked as read`,
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    res.status(500).json({
      success: false,
      message: "Failed to mark notifications as read",
      error: error.message,
    });
  }
};

// Delete user notification
const deleteUserNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user.id;

    const userNotification = await UserNotification.findOneAndDelete({
      user: userId,
      notification: notificationId,
    });

    if (!userNotification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Notification deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting user notification:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete notification",
      error: error.message,
    });
  }
};

// Get user notification preferences
const getUserNotificationPreferences = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select("notificationPreferences");

    res.status(200).json({
      success: true,
      data: user.notificationPreferences || {
        email: true,
        push: true,
        inApp: true,
        local: true,
        global: true,
        individual: true,
      },
    });
  } catch (error) {
    console.error("Error fetching user notification preferences:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch notification preferences",
      error: error.message,
    });
  }
};

// Update user notification preferences
const updateUserNotificationPreferences = async (req, res) => {
  try {
    const userId = req.user.id;
    const preferences = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      { notificationPreferences: preferences },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Notification preferences updated successfully",
      data: user.notificationPreferences,
    });
  } catch (error) {
    console.error("Error updating user notification preferences:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update notification preferences",
      error: error.message,
    });
  }
};

// Get notification count for user
const getNotificationCount = async (req, res) => {
  try {
    const userId = req.user.id;

    const [totalCount, unreadCount] = await Promise.all([
      UserNotification.countDocuments({ user: userId }),
      UserNotification.countDocuments({
        user: userId,
        status: { $ne: "read" },
      }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        total: totalCount,
        unread: unreadCount,
      },
    });
  } catch (error) {
    console.error("Error fetching notification count:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch notification count",
      error: error.message,
    });
  }
};

// Mark notification as delivered (for WebSocket delivery confirmation)
const markNotificationAsDelivered = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user.id;

    const userNotification = await UserNotification.findOneAndUpdate(
      { user: userId, notification: notificationId },
      {
        status: "delivered",
        deliveredAt: new Date(),
      },
      { new: true }
    );

    if (!userNotification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    // Update the main notification delivered count
    await Notification.findByIdAndUpdate(notificationId, {
      $inc: { "deliveryStats.delivered": 1 },
    });

    res.status(200).json({
      success: true,
      message: "Notification marked as delivered",
      data: userNotification,
    });
  } catch (error) {
    console.error("Error marking notification as delivered:", error);
    res.status(500).json({
      success: false,
      message: "Failed to mark notification as delivered",
      error: error.message,
    });
  }
};

export default {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteUserNotification,
  getUserNotificationPreferences,
  updateUserNotificationPreferences,
  getNotificationCount,
  markNotificationAsDelivered,
};
