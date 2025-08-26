import mongoose from "mongoose";

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      minlength: 3,
      maxlength: 20,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    planId: {
      type: String,
      required: true, // e.g., "premium", "free"
      enum: ["free", "premium"],
    },
    discountType: {
      type: String,
      required: true,
      enum: ["percentage", "fixed", "free"], // free = 100% discount
      default: "free",
    },
    discountValue: {
      type: Number,
      required: true,
      min: 0,
      max: 100, // for percentage, 100 means free
      default: 100,
    },
    usageLimit: {
      type: Number,
      default: null, // null means unlimited
      min: 1,
    },
    usedCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    validFrom: {
      type: Date,
      default: Date.now,
    },
    validUntil: {
      type: Date,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true, // Admin who created this coupon
    },
    countryCode: {
      type: String,
      required: true, // Coupon is valid for specific country
      trim: true,
    },
    usedBy: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        usedAt: {
          type: Date,
          default: Date.now,
        },
        appliedPlan: {
          type: String,
          enum: ["free", "premium"],
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
couponSchema.index({ code: 1 });
couponSchema.index({ countryCode: 1, isActive: 1 });
couponSchema.index({ validFrom: 1, validUntil: 1 });

// Virtual to check if coupon is expired
couponSchema.virtual("isExpired").get(function () {
  return new Date() > this.validUntil;
});

// Virtual to check if coupon has reached usage limit
couponSchema.virtual("isUsageLimitReached").get(function () {
  return this.usageLimit && this.usedCount >= this.usageLimit;
});

// Virtual to check if coupon is valid for use
couponSchema.virtual("isValidForUse").get(function () {
  const now = new Date();
  return (
    this.isActive &&
    now >= this.validFrom &&
    now <= this.validUntil &&
    !this.isUsageLimitReached
  );
});

// Method to check if user has already used this coupon
couponSchema.methods.hasUserUsed = function (userId) {
  return this.usedBy.some(
    (usage) => usage.userId.toString() === userId.toString()
  );
};

// Method to apply coupon to user
couponSchema.methods.applyCoupon = function (userId, planId) {
  if (!this.isValidForUse) {
    throw new Error("Coupon is not valid for use");
  }

  if (this.hasUserUsed(userId)) {
    throw new Error("User has already used this coupon");
  }

  this.usedBy.push({
    userId,
    appliedPlan: planId,
  });

  this.usedCount += 1;
  return this.save();
};

const CouponModel = mongoose.model("Coupon", couponSchema);
export default CouponModel;
