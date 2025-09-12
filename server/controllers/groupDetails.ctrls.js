import LocalGroup from "../models/LocalGroup.js";
import GlobalGroup from "../models/GlobalGroup.js";
import ApprovedLeads from "../models/ApprovedLeads.js";
import GlobalApprovedLeads from "../models/GlobalApprovedLeads.js";

// Get local group details with statistics
export const getLocalGroupDetails = async (req, res) => {
  try {
    const { groupId } = req.params;

    // Get group basic info
    const group = await LocalGroup.findById(groupId)
      .populate("members", "name image role")
      .lean();

    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Group not found",
      });
    }

    // Get lead count
    const leadCount = await ApprovedLeads.countDocuments({ groupId });

    // Get recent leads (last 5)
    const recentLeads = await ApprovedLeads.find({ groupId })
      .populate("userId", "name")
      .sort({ createdAt: -1 })
      .limit(5)
      .select("type description content hscode createdAt")
      .lean();

    // Get recent members (last 5)
    const recentMembers = group.members
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);

    const groupDetails = {
      ...group,
      memberCount: group.members.length,
      leadCount,
      recentMembers,
      recentLeads,
    };

    res.json({
      success: true,
      data: groupDetails,
    });
  } catch (error) {
    console.error("Error fetching local group details:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch group details",
    });
  }
};

// Get global group details with statistics
export const getGlobalGroupDetails = async (req, res) => {
  try {
    const { groupId } = req.params;

    // Get group basic info
    const group = await GlobalGroup.findById(groupId)
      .populate("members", "name image role")
      .lean();

    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Group not found",
      });
    }

    // Get lead count
    const leadCount = await GlobalApprovedLeads.countDocuments({ groupId });

    // Get recent leads (last 5)
    const recentLeads = await GlobalApprovedLeads.find({ groupId })
      .populate("userId", "name")
      .sort({ createdAt: -1 })
      .limit(5)
      .select("type description content hscode createdAt")
      .lean();

    // Get recent members (last 5)
    const recentMembers = group.members
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);

    const groupDetails = {
      ...group,
      memberCount: group.members.length,
      leadCount,
      recentMembers,
      recentLeads,
    };

    res.json({
      success: true,
      data: groupDetails,
    });
  } catch (error) {
    console.error("Error fetching global group details:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch group details",
    });
  }
};
