import ApprovedLeads from "../models/ApprovedLeads.js";

// Function to disable expired broadcasts
export const disableExpiredBroadcasts = async () => {
  try {
    const now = new Date();

    // Find all approved broadcasts that have expired
    const expiredBroadcasts = await ApprovedLeads.find({
      broadcast: "approved",
      broadcastExpiresAt: { $lte: now },
    });

    if (expiredBroadcasts.length > 0) {
      console.log(
        `Found ${expiredBroadcasts.length} expired broadcasts to disable`
      );

      // Update all expired broadcasts
      const result = await ApprovedLeads.updateMany(
        {
          broadcast: "approved",
          broadcastExpiresAt: { $lte: now },
        },
        {
          $set: {
            broadcast: "none",
            broadcastExpiresAt: null,
            broadcastDuration: null,
          },
        }
      );

      console.log(
        `Successfully disabled ${result.modifiedCount} expired broadcasts`
      );
      return result.modifiedCount;
    }

    return 0;
  } catch (error) {
    console.error("Error disabling expired broadcasts:", error);
    return 0;
  }
};

// Function to get broadcast expiry info for a lead
export const getBroadcastExpiryInfo = (lead) => {
  if (!lead.broadcastExpiresAt) {
    return null;
  }

  const now = new Date();
  const expiresAt = new Date(lead.broadcastExpiresAt);
  const timeLeft = expiresAt.getTime() - now.getTime();

  if (timeLeft <= 0) {
    return {
      expired: true,
      timeLeft: 0,
      timeLeftText: "Expired",
    };
  }

  const hoursLeft = Math.ceil(timeLeft / (1000 * 60 * 60));
  const daysLeft = Math.floor(hoursLeft / 24);
  const remainingHours = hoursLeft % 24;

  let timeLeftText = "";
  if (daysLeft > 0) {
    timeLeftText = `${daysLeft} day${daysLeft > 1 ? "s" : ""}`;
    if (remainingHours > 0) {
      timeLeftText += ` ${remainingHours} hour${remainingHours > 1 ? "s" : ""}`;
    }
  } else {
    timeLeftText = `${hoursLeft} hour${hoursLeft > 1 ? "s" : ""}`;
  }

  return {
    expired: false,
    timeLeft: timeLeft,
    timeLeftText: timeLeftText,
    expiresAt: expiresAt,
  };
};
