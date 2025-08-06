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
    content: {
      type: String,
      required: true,
      trim: true,
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

globalApprovedLeadsSchema.index({ groupId: 1, createdAt: -1 });

const GlobalApprovedLeadsModel = mongoose.model(
  "GlobalApprovedLeads",
  globalApprovedLeadsSchema
);
export default GlobalApprovedLeadsModel;
