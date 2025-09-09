import Notification from "../models/Notification.js";
import UserNotification from "../models/UserNotification.js";
import LocalGroup from "../models/LocalGroup.js";
import GlobalGroup from "../models/GlobalGroup.js";
import { io } from "../server.js";

// Send lead approval notification to group members
export const sendLeadApprovalNotification = async (lead, groupType) => {
  try {
    console.log(`🔔 Sending lead approval notification for lead: ${lead._id}`);

    // Create the notification
    const notification = new Notification({
      title: "New Lead Approved!",
      message: `A new lead "${lead.productName}" has been approved in your ${groupType} group.`,
      type: "lead_approval",
      category: "lead_approval",
      priority: "high",
      actionUrl: `/leads/${lead._id}`,
      actionText: "View Lead",
      targetAudience: {
        type: "group",
        groupType: groupType,
        groupId: lead.groupId,
      },
      deliveryStats: {
        totalTargets: 0,
        delivered: 0,
        read: 0,
        failed: 0,
      },
      status: "pending",
    });

    await notification.save();

    // Get group members based on group type
    let group;
    if (groupType === "local") {
      group = await LocalGroup.findById(lead.groupId).populate("members");
    } else if (groupType === "global") {
      group = await GlobalGroup.findById(lead.groupId).populate("members");
    }

    if (!group || !group.members || group.members.length === 0) {
      console.log(`🔔 No members found in ${groupType} group: ${lead.groupId}`);
      return;
    }

    // Process the notification for all group members
    await processLeadNotification(notification, group.members);

    console.log(`🔔 Lead approval notification sent successfully`);
  } catch (error) {
    console.error("🔔 Error sending lead approval notification:", error);
  }
};

// Process lead notification for target users
const processLeadNotification = async (notification, targetUsers) => {
  try {
    console.log(
      `🔔 Creating ${targetUsers.length} user notifications for lead approval`
    );

    const userNotifications = targetUsers.map((user) => ({
      user: user._id,
      notification: notification._id,
      status: "pending",
    }));

    if (userNotifications.length > 0) {
      const result = await UserNotification.insertMany(userNotifications);
      console.log(
        `🔔 Successfully created ${result.length} user notifications for lead approval`
      );
    }

    // Update notification stats
    await Notification.findByIdAndUpdate(notification._id, {
      "deliveryStats.totalTargets": targetUsers.length,
      status: "sending",
    });

    // Send real-time notifications via WebSocket
    await sendWebSocketLeadNotifications(notification, targetUsers);

    // Mark as sent
    await Notification.findByIdAndUpdate(notification._id, {
      status: "sent",
      sentAt: new Date(),
    });
  } catch (error) {
    console.error("🔔 Error processing lead notification:", error);
  }
};

// Send WebSocket notifications for lead approval
const sendWebSocketLeadNotifications = async (notification, targetUsers) => {
  try {
    for (const user of targetUsers) {
      try {
        // Emit to user's personal room
        io.to(`user-${user._id}`).emit("notification", {
          id: notification._id,
          title: notification.title,
          message: notification.message,
          type: notification.type,
          category: notification.category,
          priority: notification.priority,
          actionUrl: notification.actionUrl,
          actionText: notification.actionText,
          createdAt: notification.createdAt,
        });

        console.log(
          `🔔 Lead notification sent via WebSocket to user: ${user._id}`
        );

        // Mark as delivered
        await UserNotification.findOneAndUpdate(
          { user: user._id, notification: notification._id },
          {
            status: "delivered",
            deliveredAt: new Date(),
          }
        );
      } catch (error) {
        console.error(
          `🔔 Error sending WebSocket notification to user ${user._id}:`,
          error
        );

        // Mark as failed
        await UserNotification.findOneAndUpdate(
          { user: user._id, notification: notification._id },
          {
            status: "failed",
            failureReason: error.message,
          }
        );
      }
    }

    console.log(
      `🔔 Lead approval notification sent to ${targetUsers.length} group members`
    );
  } catch (error) {
    console.error("🔔 Error sending WebSocket lead notifications:", error);
  }
};
