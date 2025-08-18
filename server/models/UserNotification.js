import mongoose from "mongoose";

const userNotificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    notification: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Notification",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "delivered", "failed", "read"],
      default: "pending",
    },
    deliveredAt: {
      type: Date,
    },
    readAt: {
      type: Date,
    },
    deliveryMethod: {
      type: String,
      enum: ["websocket", "email", "push"],
      default: "websocket",
    },
    failureReason: {
      type: String,
      trim: true,
    },
    userPreferences: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      inApp: { type: Boolean, default: true },
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient querying
userNotificationSchema.index({ user: 1, status: 1 });
userNotificationSchema.index({ notification: 1, status: 1 });
userNotificationSchema.index({ user: 1, createdAt: -1 });

// Ensure unique user-notification combinations
userNotificationSchema.index({ user: 1, notification: 1 }, { unique: true });

export default mongoose.model("UserNotification", userNotificationSchema);
