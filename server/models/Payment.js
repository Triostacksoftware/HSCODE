import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    subscriptionPlan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubscriptionPlan",
      required: true,
    },
    // Stripe identifiers
    stripeSessionId: {
      type: String,
      unique: true,
      sparse: true,
    },
    stripePaymentIntentId: {
      type: String,
      unique: true,
      sparse: true,
    },
    stripeSubscriptionId: {
      type: String,
      unique: true,
      sparse: true,
    },
    stripeCustomerId: {
      type: String,
      index: true,
    },
    stripeInvoiceId: {
      type: String,
    },
    // Payment details
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: "usd",
      uppercase: true,
    },
    billingCycle: {
      type: String,
      enum: ["monthly", "yearly"],
      required: true,
    },
    // Coupon information
    couponCode: {
      type: String,
      default: null,
    },
    couponDiscount: {
      type: Number,
      default: 0,
    },
    discountType: {
      type: String,
      enum: ["percentage", "fixed", "free"],
      default: null,
    },
    discountAmount: {
      type: Number,
      default: 0,
    },
    // Payment status
    status: {
      type: String,
      enum: [
        "pending",
        "processing",
        "succeeded",
        "failed",
        "canceled",
        "refunded",
      ],
      default: "pending",
    },
    // Subscription status
    subscriptionStatus: {
      type: String,
      enum: [
        "active",
        "past_due",
        "canceled",
        "unpaid",
        "trialing",
        "incomplete",
        "incomplete_expired",
      ],
      default: null,
    },
    // Dates
    paymentDate: {
      type: Date,
    },
    subscriptionStartDate: {
      type: Date,
    },
    subscriptionEndDate: {
      type: Date,
    },
    nextBillingDate: {
      type: Date,
    },
    // Metadata
    metadata: {
      type: Map,
      of: String,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
paymentSchema.index({ user: 1, createdAt: -1 });
paymentSchema.index({ stripeSessionId: 1 });
paymentSchema.index({ stripeSubscriptionId: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ subscriptionStatus: 1 });

// Virtual to check if payment is active
paymentSchema.virtual("isActive").get(function () {
  return (
    this.status === "succeeded" &&
    (this.subscriptionStatus === "active" ||
      this.subscriptionStatus === "trialing")
  );
});

// Virtual to check if subscription is expired
paymentSchema.virtual("isExpired").get(function () {
  if (!this.subscriptionEndDate) return false;
  return new Date() > this.subscriptionEndDate;
});

const PaymentModel = mongoose.model("Payment", paymentSchema);
export default PaymentModel;

