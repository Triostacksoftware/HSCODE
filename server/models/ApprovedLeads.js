import mongoose from "mongoose";

const approvedLeadsSchema = new mongoose.Schema(
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
    // legacy text message support
    content: {
      type: String,
      trim: true,
      default: null,
    },
    // structured lead fields
    countryCode: { type: String },
    type: { type: String, enum: ["buy", "sell"], required: false },
    hscode: { type: String },
    description: { type: String },
    quantity: { type: String },
    packing: { type: String },
    targetPrice: { type: String },
    negotiable: { type: Boolean, default: false },
    buyerDeliveryLocation: {
      address: { type: String },
      geo: {
        type: { type: String, enum: ["Point"], default: "Point" },
        coordinates: { type: [Number], default: undefined }, // [lng, lat]
      },
    },
    sellerPickupLocation: {
      address: { type: String },
      geo: {
        type: { type: String, enum: ["Point"], default: "Point" },
      },
      coordinates: { type: [Number], default: undefined },
    },
    specialRequest: { type: String },
    remarks: { type: String },
    documents: [{ type: String }], // stored filenames served via /api/v1/leadDocuments
    leadCode: { type: String, index: true },
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    adminComment: {
      type: String,
      default: null,
    },
    approvedAt: {
      type: Date,
      default: Date.now,
    },
    // Broadcast functionality
    broadcast: {
      type: String,
      enum: ["none", "pending", "approved"],
      default: "none",
    },
    broadcastRequestedAt: {
      type: Date,
      default: null,
    },
    broadcastApprovedAt: {
      type: Date,
      default: null,
    },
    broadcastApprovedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
approvedLeadsSchema.index({ groupId: 1, createdAt: -1 });
approvedLeadsSchema.index({ broadcast: 1, broadcastRequestedAt: -1 });

const ApprovedLeadsModel = mongoose.model("ApprovedLeads", approvedLeadsSchema);
export default ApprovedLeadsModel;
