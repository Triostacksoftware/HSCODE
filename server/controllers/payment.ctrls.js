import Stripe from "stripe";
import UserModel from "../models/user.js";
import SubscriptionPlanModel from "../models/SubscriptionPlan.js";
import PaymentModel from "../models/Payment.js";
import CouponModel from "../models/Coupon.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Create Stripe checkout session
export const createCheckoutSession = async (req, res) => {
  try {
    const { planId, billingCycle, couponCode } = req.body;
    const userId = req.user._id || req.user.id;

    if (!planId || !billingCycle) {
      return res.status(400).json({
        message: "Plan ID and billing cycle are required",
      });
    }

    // Find the subscription plan
    const plan = await SubscriptionPlanModel.findOne({
      id: planId,
      isActive: true,
    });
    if (!plan) {
      return res.status(404).json({
        message: "Subscription plan not found or inactive",
      });
    }

    // Find the user
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Validate coupon if provided
    let coupon = null;
    let discountAmount = 0;
    let discountPercentage = 0;

    if (couponCode) {
      coupon = await CouponModel.findOne({
        code: couponCode.toUpperCase(),
        countryCode: user.countryCode,
        isActive: true,
      });

      if (!coupon || !coupon.isValidForUse) {
        return res.status(400).json({
          message: "Invalid or expired coupon code",
        });
      }

      if (coupon.hasUserUsed(userId)) {
        return res.status(400).json({
          message: "You have already used this coupon",
        });
      }

      // Calculate discount
      const basePrice =
        billingCycle === "yearly"
          ? plan.monthlyPrice * 12 * (1 - (plan.yearlyDiscount || 0) / 100)
          : plan.monthlyPrice;

      if (coupon.discountType === "percentage") {
        discountPercentage = coupon.discountValue;
        discountAmount = (basePrice * discountPercentage) / 100;
      } else if (coupon.discountType === "fixed") {
        discountAmount = coupon.discountValue;
      } else if (coupon.discountType === "free") {
        discountAmount = basePrice;
      }
    }

    // Calculate price
    let unitAmount;
    if (billingCycle === "yearly") {
      const yearlyPrice =
        plan.monthlyPrice * 12 * (1 - (plan.yearlyDiscount || 0) / 100);
      unitAmount = Math.round(yearlyPrice * 100); // Convert to cents
    } else {
      unitAmount = Math.round(plan.monthlyPrice * 100); // Convert to cents
    }

    // Apply coupon discount
    if (discountAmount > 0) {
      unitAmount = Math.max(0, Math.round((unitAmount - discountAmount * 100)));
    }

    // Get or create Stripe customer
    let customerId = user.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: {
          userId: userId.toString(),
          countryCode: user.countryCode,
        },
      });
      customerId = customer.id;
      user.stripeCustomerId = customerId;
      await user.save();
    }

    // Create Stripe price
    // Note: product_data doesn't support description field
    const price = await stripe.prices.create({
      unit_amount: unitAmount,
      currency: "usd",
      recurring: {
        interval: billingCycle === "yearly" ? "year" : "month",
      },
      product_data: {
        name: `${plan.name} - ${billingCycle === "yearly" ? "Yearly" : "Monthly"}`,
        // description is not supported in product_data for prices
      },
    });

    // Create checkout session
    const sessionParams = {
      customer: customerId,
      payment_method_types: ["card"],
      line_items: [
        {
          price: price.id,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${req.headers.origin || process.env.ORIGIN || "http://localhost:3000"}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin || process.env.ORIGIN || "http://localhost:3000"}/subscription/cancel`,
      metadata: {
        userId: userId.toString(),
        planId: plan.id,
        planName: plan.name,
        billingCycle: billingCycle,
        couponCode: couponCode || "",
      },
      subscription_data: {
        metadata: {
          userId: userId.toString(),
          planId: plan.id,
          planName: plan.name,
          billingCycle: billingCycle,
          couponCode: couponCode || "",
        },
      },
    };

    // Add coupon to checkout if provided
    if (couponCode && coupon) {
      // Create a Stripe promotion code or coupon
      // For custom validation, we'll apply the discount manually
      // Stripe will handle the discount through the price we created
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    // Create payment record
    const payment = new PaymentModel({
      user: userId,
      subscriptionPlan: plan._id,
      stripeSessionId: session.id,
      stripeCustomerId: customerId,
      amount: unitAmount / 100,
      currency: "usd",
      billingCycle: billingCycle,
      couponCode: couponCode || null,
      couponDiscount: coupon ? coupon.discountValue : 0,
      discountType: coupon ? coupon.discountType : null,
      discountAmount: discountAmount,
      status: "pending",
    });

    await payment.save();

    res.json({
      sessionId: session.id,
      url: session.url,
      paymentId: payment._id,
    });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    res.status(500).json({
      message: "Error creating checkout session",
      error: error.message,
    });
  }
};

// Validate coupon for checkout
export const validateCouponForCheckout = async (req, res) => {
  try {
    const { couponCode, planId, billingCycle } = req.body;
    const userId = req.user._id || req.user.id;

    if (!couponCode) {
      return res.status(400).json({ message: "Coupon code is required" });
    }

    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const coupon = await CouponModel.findOne({
      code: couponCode.toUpperCase(),
      countryCode: user.countryCode,
    });

    if (!coupon) {
      return res.status(404).json({ message: "Invalid coupon code" });
    }

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

    if (coupon.hasUserUsed(userId)) {
      return res.status(400).json({
        message: "You have already used this coupon",
      });
    }

    // Get plan for discount calculation
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
          discountType: coupon.discountType,
          discountValue: coupon.discountValue,
        };
      }
    }

    res.json({
      isValid: true,
      coupon: {
        code: coupon.code,
        description: coupon.description,
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

// Get payment history
export const getPaymentHistory = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;

    const payments = await PaymentModel.find({ user: userId })
      .populate("subscriptionPlan", "id name description monthlyPrice")
      .sort({ createdAt: -1 })
      .select("-__v");

    res.json({
      payments: payments,
      count: payments.length,
    });
  } catch (error) {
    console.error("Error fetching payment history:", error);
    res.status(500).json({ message: "Error fetching payment history" });
  }
};

// Cancel subscription
export const cancelSubscription = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;

    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.subscriptionId) {
      return res.status(400).json({
        message: "No active subscription found",
      });
    }

    // Cancel subscription in Stripe
    const subscription = await stripe.subscriptions.update(
      user.subscriptionId,
      {
        cancel_at_period_end: true,
      }
    );

    // Update user
    user.subscriptionStatus = "canceled";
    await user.save();

    // Update payment record
    await PaymentModel.updateMany(
      { user: userId, stripeSubscriptionId: user.subscriptionId },
      { subscriptionStatus: "canceled" }
    );

    res.json({
      message: "Subscription will be canceled at the end of the billing period",
      subscription: {
        id: subscription.id,
        status: subscription.status,
        cancel_at_period_end: subscription.cancel_at_period_end,
        current_period_end: new Date(subscription.current_period_end * 1000),
      },
    });
  } catch (error) {
    console.error("Error canceling subscription:", error);
    res.status(500).json({
      message: "Error canceling subscription",
      error: error.message,
    });
  }
};

// Update subscription (upgrade/downgrade)
export const updateSubscription = async (req, res) => {
  try {
    const { newPlanId, billingCycle } = req.body;
    const userId = req.user._id || req.user.id;

    if (!newPlanId || !billingCycle) {
      return res.status(400).json({
        message: "New plan ID and billing cycle are required",
      });
    }

    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.subscriptionId) {
      return res.status(400).json({
        message: "No active subscription found",
      });
    }

    // Find new plan
    const newPlan = await SubscriptionPlanModel.findOne({
      id: newPlanId,
      isActive: true,
    });
    if (!newPlan) {
      return res.status(404).json({
        message: "New subscription plan not found",
      });
    }

    // Calculate new price
    let unitAmount;
    if (billingCycle === "yearly") {
      const yearlyPrice =
        newPlan.monthlyPrice * 12 * (1 - (newPlan.yearlyDiscount || 0) / 100);
      unitAmount = Math.round(yearlyPrice * 100);
    } else {
      unitAmount = Math.round(newPlan.monthlyPrice * 100);
    }

    // Create new price
    // Note: product_data doesn't support description field
    const price = await stripe.prices.create({
      unit_amount: unitAmount,
      currency: "usd",
      recurring: {
        interval: billingCycle === "yearly" ? "year" : "month",
      },
      product_data: {
        name: `${newPlan.name} - ${billingCycle === "yearly" ? "Yearly" : "Monthly"}`,
        // description is not supported in product_data for prices
      },
    });

    // Get current subscription to access items
    const currentSubscription = await stripe.subscriptions.retrieve(
      user.subscriptionId
    );

    // Update subscription in Stripe
    const subscription = await stripe.subscriptions.update(
      user.subscriptionId,
      {
        items: [
          {
            id: currentSubscription.items.data[0].id,
            price: price.id,
          },
        ],
        metadata: {
          userId: userId.toString(),
          planId: newPlan.id,
          planName: newPlan.name,
          billingCycle: billingCycle,
        },
        proration_behavior: "always_invoice",
      }
    );

    // Update user
    user.currentPlanId = newPlan._id;
    user.billingCycle = billingCycle;
    await user.save();

    res.json({
      message: "Subscription updated successfully",
      subscription: {
        id: subscription.id,
        status: subscription.status,
        current_period_end: new Date(subscription.current_period_end * 1000),
      },
      plan: {
        id: newPlan.id,
        name: newPlan.name,
      },
    });
  } catch (error) {
    console.error("Error updating subscription:", error);
    res.status(500).json({
      message: "Error updating subscription",
      error: error.message,
    });
  }
};

// Get current subscription status
export const getSubscriptionStatus = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;

    const user = await UserModel.findById(userId)
      .populate("currentPlanId", "id name description monthlyPrice features maxGroups maxLeads");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    let stripeSubscription = null;
    if (user.subscriptionId) {
      try {
        stripeSubscription = await stripe.subscriptions.retrieve(
          user.subscriptionId
        );
      } catch (error) {
        console.error("Error retrieving Stripe subscription:", error);
      }
    }

    res.json({
      user: {
        membership: user.membership,
        subscriptionStatus: user.subscriptionStatus,
        billingCycle: user.billingCycle,
        subscriptionStartDate: user.subscriptionStartDate,
        subscriptionEndDate: user.subscriptionEndDate,
      },
      plan: user.currentPlanId,
      stripeSubscription: stripeSubscription
        ? {
            id: stripeSubscription.id,
            status: stripeSubscription.status,
            current_period_start: new Date(
              stripeSubscription.current_period_start * 1000
            ),
            current_period_end: new Date(
              stripeSubscription.current_period_end * 1000
            ),
            cancel_at_period_end: stripeSubscription.cancel_at_period_end,
          }
        : null,
    });
  } catch (error) {
    console.error("Error fetching subscription status:", error);
    res.status(500).json({ message: "Error fetching subscription status" });
  }
};

