import CouponModel from "../models/Coupon.js";
import UserModel from "../models/user.js";
import HomeDataModel from "../models/HomeData.js";
import SubscriptionPlanModel from "../models/SubscriptionPlan.js";

// Create a new coupon (Admin only)
export const createCoupon = async (req, res) => {
  try {
    const {
      code,
      description,
      planId,
      discountType,
      discountValue,
      usageLimit,
      validUntil,
      countryCode,
    } = req.body;

    const adminId = req.user._id || req.user.id;

    // Validate admin role
    const admin = await UserModel.findById(adminId);
    if (!admin || admin.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    // Check if coupon code already exists
    const existingCoupon = await CouponModel.findOne({
      code: code.toUpperCase(),
    });

    if (existingCoupon) {
      return res.status(400).json({
        message: "Coupon code already exists",
      });
    }

    // Create new coupon
    const newCoupon = new CouponModel({
      code: code.toUpperCase(),
      description,
      planId,
      discountType: discountType || "free",
      discountValue: discountValue || 100,
      usageLimit: usageLimit || null,
      validUntil: new Date(validUntil),
      createdBy: adminId,
      countryCode: countryCode || admin.countryCode,
    });

    await newCoupon.save();

    res.status(201).json({
      message: "Coupon created successfully",
      coupon: {
        _id: newCoupon._id,
        code: newCoupon.code,
        description: newCoupon.description,
        planId: newCoupon.planId,
        discountType: newCoupon.discountType,
        discountValue: newCoupon.discountValue,
        usageLimit: newCoupon.usageLimit,
        usedCount: newCoupon.usedCount,
        validUntil: newCoupon.validUntil,
        isActive: newCoupon.isActive,
        countryCode: newCoupon.countryCode,
      },
    });
  } catch (error) {
    console.error("Error creating coupon:", error);
    res.status(500).json({ message: "Error creating coupon" });
  }
};

// Get all coupons for admin's country
export const getAdminCoupons = async (req, res) => {
  try {
    const adminId = req.user._id || req.user.id;

    const admin = await UserModel.findById(adminId);
    if (!admin || admin.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    const coupons = await CouponModel.find({
      countryCode: admin.countryCode,
    })
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    res.json(coupons);
  } catch (error) {
    console.error("Error fetching admin coupons:", error);
    res.status(500).json({ message: "Error fetching coupons" });
  }
};

// Update coupon (Admin only)
export const updateCoupon = async (req, res) => {
  try {
    const { couponId } = req.params;
    const { description, usageLimit, validUntil, isActive } = req.body;

    const adminId = req.user._id || req.user.id;

    const admin = await UserModel.findById(adminId);
    if (!admin || admin.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    const coupon = await CouponModel.findById(couponId);
    if (!coupon) {
      return res.status(404).json({ message: "Coupon not found" });
    }

    // Check if admin can edit this coupon (same country)
    if (coupon.countryCode !== admin.countryCode) {
      return res.status(403).json({
        message: "Cannot edit coupons from other countries",
      });
    }

    // Update fields
    if (description) coupon.description = description;
    if (usageLimit !== undefined) coupon.usageLimit = usageLimit;
    if (validUntil) coupon.validUntil = new Date(validUntil);
    if (isActive !== undefined) coupon.isActive = isActive;

    await coupon.save();

    res.json({
      message: "Coupon updated successfully",
      coupon,
    });
  } catch (error) {
    console.error("Error updating coupon:", error);
    res.status(500).json({ message: "Error updating coupon" });
  }
};

// Delete coupon (Admin only)
export const deleteCoupon = async (req, res) => {
  try {
    const { couponId } = req.params;
    const adminId = req.user._id || req.user.id;

    const admin = await UserModel.findById(adminId);
    if (!admin || admin.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    const coupon = await CouponModel.findById(couponId);
    if (!coupon) {
      return res.status(404).json({ message: "Coupon not found" });
    }

    // Check if admin can delete this coupon (same country)
    if (coupon.countryCode !== admin.countryCode) {
      return res.status(403).json({
        message: "Cannot delete coupons from other countries",
      });
    }

    await CouponModel.findByIdAndDelete(couponId);

    res.json({ message: "Coupon deleted successfully" });
  } catch (error) {
    console.error("Error deleting coupon:", error);
    res.status(500).json({ message: "Error deleting coupon" });
  }
};

// Validate coupon code (User)
export const validateCoupon = async (req, res) => {
  try {
    const { code } = req.params;
    const userId = req.user._id || req.user.id;

    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const coupon = await CouponModel.findOne({
      code: code.toUpperCase(),
      countryCode: user.countryCode,
    });

    if (!coupon) {
      return res.status(404).json({
        message: "Invalid coupon code",
      });
    }

    // Check if coupon is valid
    if (!coupon.isValidForUse) {
      let message = "Coupon is not valid";
      if (coupon.isExpired) {
        message = "Coupon has expired";
      } else if (coupon.isUsageLimitReached) {
        message = "Coupon usage limit reached";
      } else if (!coupon.isActive) {
        message = "Coupon is inactive";
      }

      return res.status(400).json({ message });
    }

    // Check if user has already used this coupon
    if (coupon.hasUserUsed(userId)) {
      return res.status(400).json({
        message: "You have already used this coupon",
      });
    }

    res.json({
      isValid: true,
      coupon: {
        code: coupon.code,
        description: coupon.description,
        planId: coupon.planId,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
      },
    });
  } catch (error) {
    console.error("Error validating coupon:", error);
    res.status(500).json({ message: "Error validating coupon" });
  }
};

// Apply coupon to get premium membership
export const applyCoupon = async (req, res) => {
  try {
    const { code } = req.body;
    const userId = req.user._id || req.user.id;

    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if user is already premium or admin
    if (user.membership === "premium" || user.role === "admin") {
      return res.status(400).json({
        message: "You already have premium access",
      });
    }

    const coupon = await CouponModel.findOne({
      code: code.toUpperCase(),
      countryCode: user.countryCode,
    });

    if (!coupon) {
      return res.status(404).json({
        message: "Invalid coupon code",
      });
    }

    // Apply coupon (this will validate and mark as used)
    try {
      await coupon.applyCoupon(userId, "premium");
    } catch (couponError) {
      return res.status(400).json({
        message: couponError.message,
      });
    }

    // Update user membership to premium
    user.membership = "premium";
    await user.save();

    res.json({
      message: "Coupon applied successfully! You now have premium membership.",
      membership: user.membership,
      couponCode: coupon.code,
      appliedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error applying coupon:", error);
    res.status(500).json({ message: "Error applying coupon" });
  }
};

// Get subscription plans with coupon support
export const getSubscriptionPlans = async (req, res) => {
  try {
    const { countryCode } = req.query;

    if (!countryCode) {
      return res.status(400).json({ message: "Country code is required" });
    }

    // Get active subscription plans from the new model
    const plans = await SubscriptionPlanModel.find({ isActive: true })
      .sort({ monthlyPrice: 1 })
      .select("-__v");

    if (!plans || plans.length === 0) {
      return res.status(404).json({
        message: "No subscription plans found",
      });
    }

    // Get active coupons for this country
    const activeCoupons = await CouponModel.find({
      countryCode,
      isActive: true,
      validFrom: { $lte: new Date() },
      validUntil: { $gte: new Date() },
      $or: [
        { usageLimit: null },
        { $expr: { $lt: ["$usedCount", "$usageLimit"] } },
      ],
    }).select("code description planId discountType discountValue");

    // Calculate global yearly discount (you can make this configurable)
    const globalYearlyDiscount = 20; // Default 20% discount for yearly billing

    res.json({
      title: "Choose Your Plan",
      subtitle: "Select the perfect plan for your business needs",
      currency: "USD",
      yearlyDiscount: globalYearlyDiscount,
      plans: plans.map((plan) => ({
        id: plan.id,
        name: plan.name,
        description: plan.description,
        monthlyPrice: plan.monthlyPrice,
        features: plan.features,
        icon: plan.icon,
        popular: plan.popular,
        color: plan.color,
        maxGroups: plan.maxGroups,
        maxLeads: plan.maxLeads,
      })),
      faqSection: {
        title: "Frequently Asked Questions",
        faqs: [
          {
            id: 1,
            question: "What happens if I exceed my plan limits?",
            answer:
              "If you exceed your plan limits, you'll be notified and can upgrade to a higher plan or purchase additional capacity.",
          },
          {
            id: 2,
            question: "Can I change my plan anytime?",
            answer:
              "Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.",
          },
          {
            id: 3,
            question: "Do you offer refunds?",
            answer:
              "We offer a 30-day money-back guarantee for all paid plans. Contact support for assistance.",
          },
        ],
      },
      ctaSection: {
        title: "Ready to Get Started?",
        subtitle: "Join thousands of businesses already using HSCODE",
        primaryButtonText: "Start Free Trial",
        primaryButtonLink: "/auth",
        secondaryButtonText: "Contact Sales",
        secondaryButtonLink: "/contact",
      },
      availableCoupons: activeCoupons.length,
      supportsCoupons: true,
    });
  } catch (error) {
    console.error("Error fetching subscription plans:", error);
    res.status(500).json({ message: "Error fetching subscription plans" });
  }
};

// Get subscription plans for coupon creation (simplified)
export const getSubscriptionPlansForCoupons = async (req, res) => {
  try {
    // Get active subscription plans from the new model
    const plans = await SubscriptionPlanModel.find({ isActive: true })
      .select("id name description monthlyPrice")
      .sort({ monthlyPrice: 1 });

    res.json(plans);
  } catch (error) {
    console.error("Error fetching subscription plans for coupons:", error);
    res.status(500).json({ message: "Error fetching subscription plans" });
  }
};
