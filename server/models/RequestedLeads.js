import mongoose from "mongoose";

const requestedLeadsSchema = new mongoose.Schema(
  {
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LocalGroup",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      default: null,
    },
    adminComment: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
requestedLeadsSchema.index({ groupId: 1, status: 1, createdAt: -1 });
requestedLeadsSchema.index({ userId: 1, status: 1 });
requestedLeadsSchema.index({ status: 1, createdAt: -1 });

const RequestedLeadsModel = mongoose.model(
  "RequestedLeads",
  requestedLeadsSchema
);
export default RequestedLeadsModel;
