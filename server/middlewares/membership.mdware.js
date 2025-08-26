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

    if (groupType === "local") {
      // Check local group limit (max 3)
      const localGroupsCount = user.groupsID ? user.groupsID.length : 0;

      if (localGroupsCount >= 3) {
        return res.status(403).json({
          message:
            "Free users can only join up to 3 local groups. Upgrade to premium for unlimited access.",
        });
      }
    } else if (groupType === "global") {
      // Check global group limit (max 3)
      const globalGroupsCount = user.globalGroupsID
        ? user.globalGroupsID.length
        : 0;

      if (globalGroupsCount >= 3) {
        return res.status(403).json({
          message:
            "Free users can only join up to 3 global groups. Upgrade to premium for unlimited access.",
        });
      }
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
