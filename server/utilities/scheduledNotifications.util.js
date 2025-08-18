import Notification from "../models/Notification.js";
import processNotification from "../controllers/notification.ctrls.js";

let scheduledNotificationsInterval = null;

// Start the scheduled notifications processor
const startScheduledNotificationsProcessor = () => {
  if (scheduledNotificationsInterval) {
    clearInterval(scheduledNotificationsInterval);
  }

  // Check for scheduled notifications every minute
  scheduledNotificationsInterval = setInterval(async () => {
    try {
      const now = new Date();

      // Find notifications that are scheduled and due to be sent
      const scheduledNotifications = await Notification.find({
        status: "scheduled",
        scheduledFor: { $lte: now },
      });

      console.log(
        `Found ${scheduledNotifications.length} scheduled notifications to process`
      );

      // Process each scheduled notification
      for (const notification of scheduledNotifications) {
        try {
          await processNotification(notification);
          console.log(
            `Processed scheduled notification: ${notification.title}`
          );
        } catch (error) {
          console.error(
            `Error processing scheduled notification ${notification._id}:`,
            error
          );

          // Mark as failed if there's an error
          await Notification.findByIdAndUpdate(notification._id, {
            status: "failed",
            "metadata.failureReason": error.message,
          });
        }
      }
    } catch (error) {
      console.error("Error in scheduled notifications processor:", error);
    }
  }, 60000); // Check every minute

  console.log("Scheduled notifications processor started");
};

// Stop the scheduled notifications processor
const stopScheduledNotificationsProcessor = () => {
  if (scheduledNotificationsInterval) {
    clearInterval(scheduledNotificationsInterval);
    scheduledNotificationsInterval = null;
    console.log("Scheduled notifications processor stopped");
  }
};

// Process a specific scheduled notification immediately
const processScheduledNotification = async (notificationId) => {
  try {
    const notification = await Notification.findById(notificationId);

    if (!notification) {
      throw new Error("Notification not found");
    }

    if (notification.status !== "scheduled") {
      throw new Error("Notification is not scheduled");
    }

    if (notification.scheduledFor > new Date()) {
      throw new Error("Notification is not due yet");
    }

    await processNotification(notification);
    return { success: true, message: "Notification processed successfully" };
  } catch (error) {
    console.error(
      `Error processing scheduled notification ${notificationId}:`,
      error
    );
    return { success: false, error: error.message };
  }
};

// Get all scheduled notifications
const getScheduledNotifications = async () => {
  try {
    const scheduledNotifications = await Notification.find({
      status: "scheduled",
    }).sort({ scheduledFor: 1 });

    return scheduledNotifications;
  } catch (error) {
    console.error("Error fetching scheduled notifications:", error);
    throw error;
  }
};

// Reschedule a notification
const rescheduleNotification = async (notificationId, newScheduledFor) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      notificationId,
      {
        scheduledFor: newScheduledFor,
        status: "scheduled",
      },
      { new: true }
    );

    if (!notification) {
      throw new Error("Notification not found");
    }

    return notification;
  } catch (error) {
    console.error(`Error rescheduling notification ${notificationId}:`, error);
    throw error;
  }
};

export {
  startScheduledNotificationsProcessor,
  stopScheduledNotificationsProcessor,
  processScheduledNotification,
  getScheduledNotifications,
  rescheduleNotification,
};
