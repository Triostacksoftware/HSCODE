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
    content: { type: String, trim: true, default: null },
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
    countryCode: { type: String, required: true },
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
