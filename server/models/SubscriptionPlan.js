import mongoose from "mongoose";

const subscriptionPlanSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    monthlyPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    yearlyDiscount: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    maxGroups: {
      type: Number,
      default: 0, // 0 means unlimited
      min: 0,
    },
    maxLeads: {
      type: Number,
      default: 0, // 0 means unlimited
      min: 0,
    },
    features: [
      {
        type: String,
        trim: true,
      },
    ],
    icon: {
      type: String,
      default: "🌟",
    },
    popular: {
      type: Boolean,
      default: false,
    },
    color: {
      type: String,
      default: "blue",
      enum: ["blue", "green", "purple", "red", "yellow", "indigo"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SuperAdmin",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
subscriptionPlanSchema.index({ id: 1 });
subscriptionPlanSchema.index({ isActive: 1 });
subscriptionPlanSchema.index({ popular: 1 });

// Virtual to calculate yearly price
subscriptionPlanSchema.virtual("yearlyPrice").get(function () {
  return this.monthlyPrice * 12 * (1 - this.yearlyDiscount / 100);
});

// Virtual to calculate monthly equivalent when billed yearly
subscriptionPlanSchema.virtual("monthlyEquivalent").get(function () {
  return this.yearlyPrice / 12;
});

// Virtual to calculate savings when billed yearly
subscriptionPlanSchema.virtual("yearlySavings").get(function () {
  return this.monthlyPrice * 12 - this.yearlyPrice;
});

const SubscriptionPlanModel = mongoose.model(
  "SubscriptionPlan",
  subscriptionPlanSchema
);
export default SubscriptionPlanModel;
