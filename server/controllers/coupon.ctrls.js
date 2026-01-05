import CouponModel from "../models/Coupon.js";
import UserModel from "../models/user.js";
import HomeDataModel from "../models/HomeData.js";
import SubscriptionPlanModel from "../models/SubscriptionPlan.js";
import SuperAdminModel from "../models/SuperAdmin.js";

// Create a new coupon (Admin or Superadmin)
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
    const userRole = req.user.role;

    // Validate admin or superadmin role
    let admin = null;
    let adminCountryCode = null;

    if (userRole === "superadmin") {
      admin = await SuperAdminModel.findById(adminId);
      if (!admin) {
        return res.status(403).json({ message: "Superadmin not found" });
      }
      // Superadmin might not have countryCode, use provided one or default
      adminCountryCode = countryCode || admin.countryCode || "US";
    } else if (userRole === "admin") {
      admin = await UserModel.findById(adminId);
      if (!admin || admin.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }
      adminCountryCode = countryCode || admin.countryCode;
    } else {
      return res.status(403).json({ message: "Admin or Superadmin access required" });
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

    // Validate planId - can be "free", "premium", or a subscription plan ID
    // If it's a subscription plan ID, we'll store it as-is (model no longer has enum restriction)
    let validPlanId = planId;
    if (!planId || (planId !== "free" && planId !== "premium")) {
      // Check if it's a valid subscription plan ID
      const plan = await SubscriptionPlanModel.findOne({ id: planId });
      if (!plan) {
        // If not a valid plan ID, default to premium
        validPlanId = "premium";
      }
      // If it's a valid plan, use the plan ID as-is
    }

    // Validate discountValue based on discountType
    let validDiscountValue = discountValue || 100;
    if (discountType === "percentage" && validDiscountValue > 100) {
      validDiscountValue = 100; // Cap percentage at 100%
    }

    // Create new coupon
    // Note: createdBy stores the ID, but the ref is to User
    // For superadmins, we'll store the ID anyway (MongoDB won't validate the ref on save)
    const newCoupon = new CouponModel({
      code: code.toUpperCase(),
      description,
      planId: validPlanId,
      discountType: discountType || "free",
      discountValue: validDiscountValue,
      usageLimit: usageLimit ? parseInt(usageLimit) : null,
      validUntil: new Date(validUntil),
      createdBy: adminId, // Store ID (works for both User and SuperAdmin IDs)
      countryCode: adminCountryCode,
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
    console.error("Error details:", {
      message: error.message,
      stack: error.stack,
      name: error.name,
    });
    res.status(500).json({ 
      message: "Error creating coupon",
      error: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
};

// Get all coupons for admin's country (or all coupons for superadmin)
export const getAdminCoupons = async (req, res) => {
  try {
    const adminId = req.user._id || req.user.id;
    const userRole = req.user.role;

    let query = {};

    if (userRole === "superadmin") {
      // Superadmin can see all coupons
      const superadmin = await SuperAdminModel.findById(adminId);
      if (!superadmin) {
        return res.status(403).json({ message: "Superadmin not found" });
      }
      // No country filter for superadmin - show all
    } else if (userRole === "admin") {
      const admin = await UserModel.findById(adminId);
      if (!admin || admin.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }
      query.countryCode = admin.countryCode;
    } else {
      return res.status(403).json({ message: "Admin or Superadmin access required" });
    }

    const coupons = await CouponModel.find(query)
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    res.json(coupons);
  } catch (error) {
    console.error("Error fetching admin coupons:", error);
    res.status(500).json({ message: "Error fetching coupons" });
  }
};

// Update coupon (Admin or Superadmin)
export const updateCoupon = async (req, res) => {
  try {
    const { couponId } = req.params;
    const { description, usageLimit, validUntil, isActive } = req.body;

    const adminId = req.user._id || req.user.id;
    const userRole = req.user.role;

    let admin = null;
    let adminCountryCode = null;

    if (userRole === "superadmin") {
      admin = await SuperAdminModel.findById(adminId);
      if (!admin) {
        return res.status(403).json({ message: "Superadmin not found" });
      }
      // Superadmin can edit any coupon
    } else if (userRole === "admin") {
      admin = await UserModel.findById(adminId);
      if (!admin || admin.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }
      adminCountryCode = admin.countryCode;
    } else {
      return res.status(403).json({ message: "Admin or Superadmin access required" });
    }

    const coupon = await CouponModel.findById(couponId);
    if (!coupon) {
      return res.status(404).json({ message: "Coupon not found" });
    }

    // Check if admin can edit this coupon (same country, unless superadmin)
    if (userRole === "admin" && coupon.countryCode !== adminCountryCode) {
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

// Delete coupon (Admin or Superadmin)
export const deleteCoupon = async (req, res) => {
  try {
    const { couponId } = req.params;
    const adminId = req.user._id || req.user.id;
    const userRole = req.user.role;

    let admin = null;
    let adminCountryCode = null;

    if (userRole === "superadmin") {
      admin = await SuperAdminModel.findById(adminId);
      if (!admin) {
        return res.status(403).json({ message: "Superadmin not found" });
      }
      // Superadmin can delete any coupon
    } else if (userRole === "admin") {
      admin = await UserModel.findById(adminId);
      if (!admin || admin.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }
      adminCountryCode = admin.countryCode;
    } else {
      return res.status(403).json({ message: "Admin or Superadmin access required" });
    }

    const coupon = await CouponModel.findById(couponId);
    if (!coupon) {
      return res.status(404).json({ message: "Coupon not found" });
    }

    // Check if admin can delete this coupon (same country, unless superadmin)
    if (userRole === "admin" && coupon.countryCode !== adminCountryCode) {
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
    const { planId, billingCycle } = req.query; // Optional: for price calculation
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

    // Calculate discount if plan info provided
    let discountInfo = null;
    if (planId && billingCycle) {
      const plan = await SubscriptionPlanModel.findOne({ id: planId });
      if (plan) {
        const basePrice =
          billingCycle === "yearly"
            ? plan.monthlyPrice * 12 * (1 - (plan.yearlyDiscount || 0) / 100)
            : plan.monthlyPrice;

        let discountAmount = 0;
        if (coupon.discountType === "percentage") {
          discountAmount = (basePrice * coupon.discountValue) / 100;
        } else if (coupon.discountType === "fixed") {
          discountAmount = coupon.discountValue;
        } else if (coupon.discountType === "free") {
          discountAmount = basePrice;
        }

        discountInfo = {
          originalPrice: basePrice,
          discountAmount: discountAmount,
          finalPrice: Math.max(0, basePrice - discountAmount),
        };
      }
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
      discountInfo,
    });
  } catch (error) {
    console.error("Error validating coupon:", error);
    res.status(500).json({ message: "Error validating coupon" });
  }
};

// Calculate discount amount for Stripe
export const calculateDiscountAmount = (basePrice, coupon) => {
  if (!coupon) return 0;

  let discountAmount = 0;
  if (coupon.discountType === "percentage") {
    discountAmount = (basePrice * coupon.discountValue) / 100;
  } else if (coupon.discountType === "fixed") {
    discountAmount = coupon.discountValue;
  } else if (coupon.discountType === "free") {
    discountAmount = basePrice;
  }

  return discountAmount;
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

    // Update user membership to premium and set maxGroups from coupon
    user.membership = "premium";
    user.maxGroups = coupon.maxGroups || 0; // 0 means unlimited for premium users
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

    res.json({
      title: "Choose Your Plan",
      subtitle: "Select the perfect plan for your business needs",
      currency: "USD",
      // Removed global yearlyDiscount - each plan has its own yearlyDiscount
      plans: plans.map((plan) => ({
        id: plan.id,
        name: plan.name,
        description: plan.description,
        monthlyPrice: plan.monthlyPrice,
        yearlyDiscount: plan.yearlyDiscount || 0, // Include each plan's own discount
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
