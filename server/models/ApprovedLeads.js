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
    content: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
approvedLeadsSchema.index({ groupId: 1, createdAt: -1 });

const ApprovedLeadsModel = mongoose.model("ApprovedLeads", approvedLeadsSchema);
export default ApprovedLeadsModel;
