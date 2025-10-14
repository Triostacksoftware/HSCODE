import UserModel from "../models/user.js";

// Middleware to check if user has premium membership
export const premiumMembership = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const user = await UserModel.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.membership !== "premium" && user.role !== "admin") {
      return res.status(403).json({
        message: "Premium membership required for this feature",
      });
    }

    next();
  } catch (error) {
    console.error("Premium membership check error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Middleware to attach membership info to request
export const attachMembership = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const user = await UserModel.findById(userId);

    if (user) {
      req.userMembership = {
        membership: user.membership,
        role: user.role,
      };
    }

    next();
  } catch (error) {
    console.error("Attach membership error:", error);
    next();
  }
};

// Group limits for free users
export const checkGroupLimits = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const user = await UserModel.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Premium users and admins have no restrictions
    if (user.membership === "premium" || user.role === "admin") {
      return next();
    }

    // Determine group type from the route path
    const routePath = req.route?.path || req.path;
    let groupType;

    if (routePath.includes("global-group")) {
      groupType = "global";
    } else if (routePath.includes("group")) {
      groupType = "local";
    } else {
      // Fallback - try to get from body if available
      groupType = req.body.groupType;
    }

    if (!groupType) {
      console.error("Could not determine group type from route:", routePath);
      return res
        .status(400)
        .json({ message: "Group type could not be determined" });
    }

    // Get user's maxGroups limit (0 means unlimited for premium users)
    const maxGroups = user.maxGroups || 3;
    const totalGroupsCount =
      (user.groupsID ? user.groupsID.length : 0) +
      (user.globalGroupsID ? user.globalGroupsID.length : 0);

    // Check if user has reached their group limit
    if (maxGroups > 0 && totalGroupsCount >= maxGroups) {
      return res.status(403).json({
        message: `You have reached your group limit of ${maxGroups} groups. ${
          user.membership === "premium"
            ? "Contact support to upgrade your plan."
            : "Upgrade to premium for more groups."
        }`,
        currentGroups: totalGroupsCount,
        maxGroups: maxGroups,
        membership: user.membership,
        showUpgradeModal: true,
        redirectTo: "/subscription",
      });
    }

    next();
  } catch (error) {
    console.error("Group limits check error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export default {
  premiumMembership,
  attachMembership,
  checkGroupLimits,
};
