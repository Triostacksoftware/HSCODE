import Stripe from "stripe";
import UserModel from "../models/user.js";
import PaymentModel from "../models/Payment.js";
import SubscriptionPlanModel from "../models/SubscriptionPlan.js";
import CouponModel from "../models/Coupon.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Handle Stripe webhook events
export const handleWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  // In test mode, webhook secret is optional (can use Stripe CLI for local testing)
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (webhookSecret) {
    try {
      // Verify webhook signature if secret is provided
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        webhookSecret
      );
    } catch (err) {
      console.error(`❌ Webhook signature verification failed:`, err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }
  } else {
    // In test mode without webhook secret, parse event directly
    // WARNING: This should only be used in development/test mode
    // In production, always use webhook secret for security
    console.warn("⚠️ Webhook secret not provided - skipping signature verification (TEST MODE ONLY)");
    try {
      event = JSON.parse(req.body.toString());
    } catch (err) {
      console.error(`❌ Failed to parse webhook event:`, err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }
  }

  console.log(`📨 Webhook received: ${event.type}`);

  // Handle different event types
  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutSessionCompleted(event.data.object);
        break;

      case "invoice.payment_succeeded":
        await handleInvoicePaymentSucceeded(event.data.object);
        break;

      case "invoice.payment_failed":
        await handleInvoicePaymentFailed(event.data.object);
        break;

      case "customer.subscription.created":
        await handleSubscriptionCreated(event.data.object);
        break;

      case "customer.subscription.updated":
        await handleSubscriptionUpdated(event.data.object);
        break;

      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(event.data.object);
        break;

      default:
        console.log(`⚠️ Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error(`❌ Error handling webhook ${event.type}:`, error);
    res.status(500).json({ error: "Webhook handler failed" });
  }
};

// Handle checkout session completed
async function handleCheckoutSessionCompleted(session) {
  try {
    console.log(`💰 Checkout session completed: ${session.id}`);

    const userId = session.metadata?.userId;
    const planId = session.metadata?.planId;
    const billingCycle = session.metadata?.billingCycle;
    const couponCode = session.metadata?.couponCode;

    if (!userId || !planId) {
      console.error("Missing metadata in checkout session");
      return;
    }

    const user = await UserModel.findById(userId);
    if (!user) {
      console.error(`User not found: ${userId}`);
      return;
    }

    const plan = await SubscriptionPlanModel.findOne({ id: planId });
    if (!plan) {
      console.error(`Plan not found: ${planId}`);
      return;
    }

    // Get subscription from Stripe
    const subscriptionId = session.subscription;
    let subscription = null;
    if (subscriptionId) {
      subscription = await stripe.subscriptions.retrieve(subscriptionId);
    }

    // Update payment record
    const payment = await PaymentModel.findOne({
      stripeSessionId: session.id,
    });

    if (payment) {
      payment.status = "succeeded";
      payment.stripePaymentIntentId = session.payment_intent;
      payment.stripeSubscriptionId = subscriptionId;
      payment.subscriptionStatus = subscription?.status || "active";
      payment.paymentDate = new Date();
      if (subscription) {
        payment.subscriptionStartDate = new Date(
          subscription.current_period_start * 1000
        );
        payment.subscriptionEndDate = new Date(
          subscription.current_period_end * 1000
        );
        payment.nextBillingDate = new Date(
          subscription.current_period_end * 1000
        );
      }
      await payment.save();
    }

    // Update user subscription
    user.membership = "premium";
    user.subscriptionId = subscriptionId;
    user.subscriptionStatus = subscription?.status || "active";
    user.currentPlanId = plan._id;
    user.billingCycle = billingCycle;
    user.maxGroups = plan.maxGroups;
    if (subscription) {
      user.subscriptionStartDate = new Date(
        subscription.current_period_start * 1000
      );
      user.subscriptionEndDate = new Date(
        subscription.current_period_end * 1000
      );
    }
    await user.save();

    // Mark coupon as used if applicable
    if (couponCode) {
      const coupon = await CouponModel.findOne({
        code: couponCode.toUpperCase(),
      });
      if (coupon && !coupon.hasUserUsed(userId)) {
        try {
          await coupon.applyCoupon(userId, "premium");
        } catch (error) {
          console.error("Error applying coupon:", error);
        }
      }
    }

    console.log(`✅ User ${userId} subscription activated for plan ${planId}`);
  } catch (error) {
    console.error("Error handling checkout session completed:", error);
    throw error;
  }
}

// Handle invoice payment succeeded
async function handleInvoicePaymentSucceeded(invoice) {
  try {
    console.log(`✅ Invoice payment succeeded: ${invoice.id}`);

    const subscriptionId = invoice.subscription;
    if (!subscriptionId) return;

    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const customerId = invoice.customer;

    // Find user by Stripe customer ID
    const user = await UserModel.findOne({ stripeCustomerId: customerId });
    if (!user) {
      console.error(`User not found for customer: ${customerId}`);
      return;
    }

    // Update payment record
    await PaymentModel.updateMany(
      { stripeSubscriptionId: subscriptionId },
      {
        subscriptionStatus: subscription.status,
        subscriptionEndDate: new Date(subscription.current_period_end * 1000),
        nextBillingDate: new Date(subscription.current_period_end * 1000),
      }
    );

    // Update user subscription dates
    user.subscriptionStatus = subscription.status;
    user.subscriptionEndDate = new Date(
      subscription.current_period_end * 1000
    );
    await user.save();

    console.log(`✅ Subscription renewed for user ${user._id}`);
  } catch (error) {
    console.error("Error handling invoice payment succeeded:", error);
    throw error;
  }
}

// Handle invoice payment failed
async function handleInvoicePaymentFailed(invoice) {
  try {
    console.log(`❌ Invoice payment failed: ${invoice.id}`);

    const subscriptionId = invoice.subscription;
    if (!subscriptionId) return;

    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const customerId = invoice.customer;

    // Find user by Stripe customer ID
    const user = await UserModel.findOne({ stripeCustomerId: customerId });
    if (!user) {
      console.error(`User not found for customer: ${customerId}`);
      return;
    }

    // Update payment record
    await PaymentModel.updateMany(
      { stripeSubscriptionId: subscriptionId },
      {
        subscriptionStatus: "past_due",
        status: "failed",
      }
    );

    // Update user subscription status
    user.subscriptionStatus = "past_due";
    await user.save();

    console.log(`⚠️ Subscription marked as past_due for user ${user._id}`);

    // TODO: Send notification to user about failed payment
  } catch (error) {
    console.error("Error handling invoice payment failed:", error);
    throw error;
  }
}

// Handle subscription created
async function handleSubscriptionCreated(subscription) {
  try {
    console.log(`📝 Subscription created: ${subscription.id}`);

    const customerId = subscription.customer;
    const user = await UserModel.findOne({ stripeCustomerId: customerId });

    if (user) {
      user.subscriptionId = subscription.id;
      user.subscriptionStatus = subscription.status;
      user.subscriptionStartDate = new Date(
        subscription.current_period_start * 1000
      );
      user.subscriptionEndDate = new Date(
        subscription.current_period_end * 1000
      );
      await user.save();
    }
  } catch (error) {
    console.error("Error handling subscription created:", error);
    throw error;
  }
}

// Handle subscription updated
async function handleSubscriptionUpdated(subscription) {
  try {
    console.log(`🔄 Subscription updated: ${subscription.id}`);

    const customerId = subscription.customer;
    const user = await UserModel.findOne({ stripeCustomerId: customerId });

    if (user) {
      user.subscriptionStatus = subscription.status;
      user.subscriptionEndDate = new Date(
        subscription.current_period_end * 1000
      );

      // If subscription is canceled, update membership
      if (
        subscription.status === "canceled" ||
        subscription.status === "unpaid"
      ) {
        // Optionally downgrade to free after period ends
        if (subscription.cancel_at_period_end) {
          // Will be handled when subscription is deleted
        } else {
          user.membership = "free";
          user.maxGroups = 3; // Default free limit
        }
      }

      await user.save();

      // Update payment records
      await PaymentModel.updateMany(
        { stripeSubscriptionId: subscription.id },
        {
          subscriptionStatus: subscription.status,
          subscriptionEndDate: new Date(
            subscription.current_period_end * 1000
          ),
        }
      );
    }
  } catch (error) {
    console.error("Error handling subscription updated:", error);
    throw error;
  }
}

// Handle subscription deleted
async function handleSubscriptionDeleted(subscription) {
  try {
    console.log(`🗑️ Subscription deleted: ${subscription.id}`);

    const customerId = subscription.customer;
    const user = await UserModel.findOne({ stripeCustomerId: customerId });

    if (user) {
      user.subscriptionId = null;
      user.subscriptionStatus = "canceled";
      user.membership = "free";
      user.maxGroups = 3; // Default free limit
      user.currentPlanId = null;
      user.billingCycle = null;
      user.subscriptionStartDate = null;
      user.subscriptionEndDate = null;
      await user.save();

      // Update payment records
      await PaymentModel.updateMany(
        { stripeSubscriptionId: subscription.id },
        {
          subscriptionStatus: "canceled",
        }
      );

      console.log(`✅ User ${user._id} subscription canceled and downgraded to free`);
    }
  } catch (error) {
    console.error("Error handling subscription deleted:", error);
    throw error;
  }
}

