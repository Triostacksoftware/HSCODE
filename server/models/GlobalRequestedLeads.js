import mongoose from "mongoose";

const globalRequestedLeadsSchema = new mongoose.Schema(
  {
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "GlobalGroup",
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
    countryCode: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

globalRequestedLeadsSchema.index({ groupId: 1, status: 1, createdAt: -1 });
globalRequestedLeadsSchema.index({ userId: 1, status: 1 });
globalRequestedLeadsSchema.index({ status: 1, createdAt: -1 });

const GlobalRequestedLeadsModel = mongoose.model(
  "GlobalRequestedLeads",
  globalRequestedLeadsSchema
);
export default GlobalRequestedLeadsModel;
