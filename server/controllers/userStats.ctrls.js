import ApprovedLeads from "../models/ApprovedLeads.js";
import GlobalApprovedLeads from "../models/GlobalApprovedLeads.js";
import RequestedLeads from "../models/RequestedLeads.js";
import GlobalRequestedLeads from "../models/GlobalRequestedLeads.js";

// Get user statistics for profile display
export const getUserStats = async (req, res) => {
  try {
    const { userId } = req.params;
    console.log("Fetching stats for user:", userId);

    // Get local leads statistics
    const localApprovedLeads = await ApprovedLeads.find({ userId }).lean();
    const localRequestedLeads = await RequestedLeads.find({ userId }).lean();

    // Get global leads statistics
    const globalApprovedLeads = await GlobalApprovedLeads.find({
      userId,
    }).lean();
    const globalRequestedLeads = await GlobalRequestedLeads.find({
      userId,
    }).lean();

    // Combine all leads
    const allApprovedLeads = [...localApprovedLeads, ...globalApprovedLeads];
    const allRequestedLeads = [...localRequestedLeads, ...globalRequestedLeads];
    const allLeads = [...allApprovedLeads, ...allRequestedLeads];

    // Calculate statistics
    const totalLeads = allLeads.length;
    const approvedLeads = allApprovedLeads.length;

    // Lead types breakdown
    const leadTypes = {};
    allLeads.forEach((lead) => {
      const type = lead.type || "unknown";
      leadTypes[type] = (leadTypes[type] || 0) + 1;
    });

    // Get recent leads (last 5)
    const recentLeads = allLeads
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5)
      .map((lead) => ({
        _id: lead._id,
        type: lead.type,
        description: lead.description || lead.content,
        content: lead.content,
        hscode: lead.hscode,
        createdAt: lead.createdAt,
        status: allApprovedLeads.some(
          (approved) => approved._id.toString() === lead._id.toString()
        )
          ? "approved"
          : "pending",
      }));

    const stats = {
      totalLeads,
      approvedLeads,
      pendingLeads: allRequestedLeads.length,
      leadTypes,
      recentLeads,
      localLeads: localApprovedLeads.length + localRequestedLeads.length,
      globalLeads: globalApprovedLeads.length + globalRequestedLeads.length,
    };

    console.log("User stats calculated:", stats);

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Error fetching user stats:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch user statistics",
    });
  }
};
