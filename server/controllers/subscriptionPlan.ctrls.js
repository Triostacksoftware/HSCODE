import SubscriptionPlanModel from "../models/SubscriptionPlan.js";
import UserModel from "../models/user.js";

// Create a new subscription plan (Super Admin only)
export const createSubscriptionPlan = async (req, res) => {
  try {
    const {
      id,
      name,
      description,
      monthlyPrice,
      yearlyDiscount,
      maxGroups,
      maxLeads,
      features,
      icon,
      popular,
      color,
      isActive,
    } = req.body;

    const superadminId = req.user._id || req.user.id;

    // Check if plan ID already exists
    const existingPlan = await SubscriptionPlanModel.findOne({ id });
    if (existingPlan) {
      return res.status(400).json({
        message: "Subscription plan ID already exists",
      });
    }

    // Create new subscription plan
    const newPlan = new SubscriptionPlanModel({
      id,
      name,
      description,
      monthlyPrice,
      yearlyDiscount: yearlyDiscount || 0,
      maxGroups: maxGroups || 0,
      maxLeads: maxLeads || 0,
      features: features || [],
      icon: icon || "🌟",
      popular: popular || false,
      color: color || "blue",
      isActive: isActive !== false,
      createdBy: superadminId,
    });

    await newPlan.save();

    res.status(201).json({
      message: "Subscription plan created successfully",
      plan: newPlan,
    });
  } catch (error) {
    console.error("Error creating subscription plan:", error);
    res.status(500).json({ message: "Error creating subscription plan" });
  }
};

// Get all subscription plans (Public)
export const getSubscriptionPlans = async (req, res) => {
  try {
    const { isActive } = req.query;

    let query = {};
    if (isActive !== undefined) {
      query.isActive = isActive === "true";
    }

    const plans = await SubscriptionPlanModel.find(query)
      .populate("createdBy", "name email")
      .sort({ monthlyPrice: 1 })
      .select("-__v");

    res.json(plans);
  } catch (error) {
    console.error("Error fetching subscription plans:", error);
    res.status(500).json({ message: "Error fetching subscription plans" });
  }
};

// Get subscription plan by ID (Super Admin only)
export const getSubscriptionPlanById = async (req, res) => {
  try {
    const { id } = req.params;

    const plan = await SubscriptionPlanModel.findOne({ id })
      .populate("createdBy", "name email")
      .select("-__v");

    if (!plan) {
      return res.status(404).json({ message: "Subscription plan not found" });
    }

    res.json(plan);
  } catch (error) {
    console.error("Error fetching subscription plan:", error);
    res.status(500).json({ message: "Error fetching subscription plan" });
  }
};

// Update subscription plan (Super Admin only)
export const updateSubscriptionPlan = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const plan = await SubscriptionPlanModel.findOne({ id });
    if (!plan) {
      return res.status(404).json({ message: "Subscription plan not found" });
    }

    // Update fields
    Object.keys(updateData).forEach((key) => {
      if (updateData[key] !== undefined) {
        plan[key] = updateData[key];
      }
    });

    await plan.save();

    res.json({
      message: "Subscription plan updated successfully",
      plan,
    });
  } catch (error) {
    console.error("Error updating subscription plan:", error);
    res.status(500).json({ message: "Error updating subscription plan" });
  }
};

// Delete subscription plan (Super Admin only)
export const deleteSubscriptionPlan = async (req, res) => {
  try {
    const { id } = req.params;

    const plan = await SubscriptionPlanModel.findOne({ id });
    if (!plan) {
      return res.status(404).json({ message: "Subscription plan not found" });
    }

    await SubscriptionPlanModel.findOneAndDelete({ id });

    res.json({ message: "Subscription plan deleted successfully" });
  } catch (error) {
    console.error("Error deleting subscription plan:", error);
    res.status(500).json({ message: "Error deleting subscription plan" });
  }
};

// Subscribe to a subscription plan (User)
export const subscribeToPlan = async (req, res) => {
  try {
    const { planId } = req.params;
    const userId = req.user._id || req.user.id;

    // Find the subscription plan
    const plan = await SubscriptionPlanModel.findOne({
      id: planId,
      isActive: true,
    });
    if (!plan) {
      return res
        .status(404)
        .json({ message: "Subscription plan not found or inactive" });
    }

    // Find the user
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update user's membership and maxGroups
    user.membership = "premium";
    user.maxGroups = plan.maxGroups; // Set the maxGroups from the plan
    await user.save();

    res.json({
      message: `Successfully subscribed to ${plan.name}`,
      plan: {
        id: plan.id,
        name: plan.name,
        maxGroups: plan.maxGroups,
        maxLeads: plan.maxLeads,
      },
      user: {
        membership: user.membership,
        maxGroups: user.maxGroups,
        currentGroupsCount: user.groupsID.length,
      },
    });
  } catch (error) {
    console.error("Error subscribing to plan:", error);
    res.status(500).json({ message: "Error subscribing to plan" });
  }
};
