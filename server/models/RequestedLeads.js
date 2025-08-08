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
    // legacy content support
    content: { type: String, trim: true, default: null },
    // structured fields
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
        coordinates: { type: [Number], default: undefined },
      },
    },
    sellerPickupLocation: {
      address: { type: String },
      geo: {
        type: { type: String, enum: ["Point"], default: "Point" },
        coordinates: { type: [Number], default: undefined },
      },
    },
    specialRequest: { type: String },
    remarks: { type: String },
    documents: [{ type: String }],
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
