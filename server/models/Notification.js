import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["local", "global", "individual"],
      required: true,
    },
    targetCountry: {
      type: String,
      required: function () {
        return this.type === "local";
      },
    },
    targetUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    targetGroups: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Group",
      },
    ],
    globalGroups: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "GlobalGroup",
      },
    ],
    priority: {
      type: String,
      enum: ["low", "normal", "high", "urgent"],
      default: "normal",
    },
    category: {
      type: String,
      enum: ["announcement", "update", "reminder", "alert", "news"],
      default: "announcement",
    },
    actionUrl: {
      type: String,
      trim: true,
    },
    actionText: {
      type: String,
      trim: true,
    },
    imageUrl: {
      type: String,
      trim: true,
    },
    scheduledFor: {
      type: Date,
    },
    sentBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SuperAdmin",
      required: true,
    },
    status: {
      type: String,
      enum: ["draft", "scheduled", "sending", "sent", "failed"],
      default: "draft",
    },
    deliveryStats: {
      totalTargets: { type: Number, default: 0 },
      delivered: { type: Number, default: 0 },
      failed: { type: Number, default: 0 },
      read: { type: Number, default: 0 },
    },
    metadata: {
      type: Map,
      of: String,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient querying
notificationSchema.index({ type: 1, targetCountry: 1, status: 1 });
notificationSchema.index({ scheduledFor: 1, status: 1 });
notificationSchema.index({ sentBy: 1, createdAt: -1 });

export default mongoose.model("Notification", notificationSchema);
