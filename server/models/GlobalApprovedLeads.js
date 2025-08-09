import mongoose from "mongoose";

const globalApprovedLeadsSchema = new mongoose.Schema(
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
    // legacy text support
    content: { type: String, trim: true, default: null },
    countryCode: { type: String, required: true },
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
    leadCode: { type: String, index: true },
  },
  {
    timestamps: true,
  }
);

globalApprovedLeadsSchema.index({ groupId: 1, createdAt: -1 });

const GlobalApprovedLeadsModel = mongoose.model(
  "GlobalApprovedLeads",
  globalApprovedLeadsSchema
);
export default GlobalApprovedLeadsModel;
