import GlobalRequestedLeads from "../models/GlobalRequestedLeads.js";
import GlobalApprovedLeads from "../models/GlobalApprovedLeads.js";
import { io } from "../server.js";

// Get global leads by groupId (approved leads only)
export const getGlobalLeadsByGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const leads = await GlobalApprovedLeads.find({ groupId })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate("userId", "name image email")
      .exec();

    const total = await GlobalApprovedLeads.countDocuments({ groupId });

    res.json({
      leads,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    });
  } catch (error) {
    console.error("Error fetching global leads:", error);
    res.status(500).json({ message: "Error fetching global leads" });
  }
};

// Post new global requested lead (user submits for approval)
export const postGlobalRequestedLead = async (req, res) => {
  try {
    const { groupId, content } = req.body;
    const userId = req.user.id;
    const countryCode = req.user.countryCode;

    if (!groupId || !content) {
      return res
        .status(400)
        .json({ message: "groupId and content are required" });
    }

    const newRequestedLead = new GlobalRequestedLeads({
      groupId,
      userId,
      content,
      countryCode,
    });

    const savedLead = await newRequestedLead.save();

    // Populate user info for response
    await savedLead.populate("userId", "name image");

    res.status(201).json(savedLead);
  } catch (error) {
    console.error("Error posting global requested lead:", error);
    res.status(500).json({ message: "Error posting global requested lead" });
  }
};

// Get user's global requested leads
export const getUserGlobalRequestedLeads = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20, status } = req.query;

    const query = { userId };
    if (status) {
      query.status = status;
    }

    const requestedLeads = await GlobalRequestedLeads.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate("userId", "name image")
      .populate("groupId", "name")
      .exec();

    const total = await GlobalRequestedLeads.countDocuments(query);

    res.json({
      requestedLeads,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    });
  } catch (error) {
    console.error("Error fetching user global requested leads:", error);
    res.status(500).json({ message: "Error fetching global requested leads" });
  }
};

// Get all pending global requested leads (for admin - filtered by admin's country)
export const getAllPendingGlobalLeads = async (req, res) => {
  console.log("getallpending hit");
  try {
    const { page = 1, limit = 20, groupId } = req.query;
    const adminCountryCode = req.user.countryCode;

    const query = { status: "pending", countryCode: adminCountryCode };
    if (groupId) {
      query.groupId = groupId;
    }

    const requestedLeads = await GlobalRequestedLeads.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate("userId", "name image email")
      .populate("groupId", "name")
      .exec();
    console.log("requested global leads", requestedLeads);

    const total = await GlobalRequestedLeads.countDocuments(query);

    res.json({
      requestedLeads,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    });
  } catch (error) {
    console.error("Error fetching pending global leads:", error);
    res.status(500).json({ message: "Error fetching pending global leads" });
  }
};

// Admin approves/rejects a global lead (only from admin's country)
export const approveRejectGlobalLead = async (req, res) => {
  try {
    const { leadId } = req.params;
    const { action, comment } = req.body; // action: "approve" or "reject"
    const adminId = req.user.id;
    const adminCountryCode = req.user.countryCode;

    if (!["approve", "reject"].includes(action)) {
      return res
        .status(400)
        .json({ message: "Action must be 'approve' or 'reject'" });
    }

    const requestedLead = await GlobalRequestedLeads.findById(leadId)
      .populate("userId", "name image")
      .populate("groupId", "name");

    if (!requestedLead) {
      return res
        .status(404)
        .json({ message: "Global requested lead not found" });
    }

    // Check if admin can approve this lead (same country)
    if (requestedLead.countryCode !== adminCountryCode) {
      return res.status(403).json({
        message: "Cannot approve leads from different country",
      });
    }

    const newStatus = action === "approve" ? "approved" : "rejected";

    // Update the requested lead status
    requestedLead.status = newStatus;
    requestedLead.adminId = adminId;
    requestedLead.adminComment = comment || null;
    await requestedLead.save();

    // If approved, create an approved global lead
    if (action === "approve") {
      const newApprovedLead = new GlobalApprovedLeads({
        groupId: requestedLead.groupId._id || requestedLead.groupId,
        userId: requestedLead.userId._id || requestedLead.userId,
        content: requestedLead.content,
        countryCode: requestedLead.countryCode,
      });
      const savedApprovedLead = await newApprovedLead.save();
      await savedApprovedLead.populate("userId", "name image");

      // Emit socket event to group from backend
      io.to(
        `global-group-${requestedLead.groupId._id || requestedLead.groupId}`
      ).emit("new-approved-global-lead", {
        _id: savedApprovedLead._id,
        groupId: requestedLead.groupId._id || requestedLead.groupId,
        userId: savedApprovedLead.userId,
        content: savedApprovedLead.content,
        createdAt: savedApprovedLead.createdAt,
        updatedAt: savedApprovedLead.updatedAt,
      });
    }

    res.json({
      message: `Global lead ${action}d successfully`,
      requestedLead,
    });
  } catch (error) {
    console.error("Error approving/rejecting global lead:", error);
    res.status(500).json({ message: "Error processing global lead" });
  }
};
