import RequestedLeads from "../models/RequestedLeads.js";
import ApprovedLeads from "../models/ApprovedLeads.js";
import { io } from "../server.js";

// Post new requested lead (user submits for approval)
export const postRequestedLead = async (req, res) => {
  try {
    const { groupId, content } = req.body;
    const userId = req.user.id;

    if (!groupId || !content) {
      return res
        .status(400)
        .json({ message: "groupId and content are required" });
    }

    const newRequestedLead = new RequestedLeads({
      groupId,
      userId,
      content,
    });

    const savedLead = await newRequestedLead.save();

    // Populate user info for response
    await savedLead.populate("userId", "name image");

    res.status(201).json(savedLead);
  } catch (error) {
    console.error("Error posting requested lead:", error);
    res.status(500).json({ message: "Error posting requested lead" });
  }
};

// Get user's requested leads
export const getUserRequestedLeads = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20, status } = req.query;

    const query = { userId };
    if (status) {
      query.status = status;
    }

    const requestedLeads = await RequestedLeads.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate("userId", "name image")
      .populate("groupId", "name")
      .exec();

    const total = await RequestedLeads.countDocuments(query);

    res.json({
      requestedLeads,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    });
  } catch (error) {
    console.error("Error fetching user requested leads:", error);
    res.status(500).json({ message: "Error fetching requested leads" });
  }
};

// Get all pending requested leads (for admin)
export const getAllPendingLeads = async (req, res) => {
  try {
    const { page = 1, limit = 20, groupId } = req.query;

    const query = { status: "pending" };
    if (groupId) {
      query.groupId = groupId;
    }

    const requestedLeads = await RequestedLeads.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate("userId", "name image email")
      .populate("groupId", "name")
      .exec();

    const total = await RequestedLeads.countDocuments(query);

    res.json({
      requestedLeads,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    });
  } catch (error) {
    console.error("Error fetching pending leads:", error);
    res.status(500).json({ message: "Error fetching pending leads" });
  }
};

// Admin approves/rejects a lead
export const approveRejectLead = async (req, res) => {
  try {
    const { leadId } = req.params;
    const { action, comment } = req.body; // action: "approve" or "reject"
    const adminId = req.user.id;

    if (!["approve", "reject"].includes(action)) {
      return res
        .status(400)
        .json({ message: "Action must be 'approve' or 'reject'" });
    }

    const requestedLead = await RequestedLeads.findById(leadId)
      .populate("userId", "name image")
      .populate("groupId", "name");

    if (!requestedLead) {
      return res.status(404).json({ message: "Requested lead not found" });
    }

    const newStatus = action === "approve" ? "approved" : "rejected";

    // Update the requested lead status
    requestedLead.status = newStatus;
    requestedLead.adminId = adminId;
    requestedLead.adminComment = comment || null;
    await requestedLead.save();

    // If approved, create an approved lead
    if (action === "approve") {
      const newApprovedLead = new ApprovedLeads({
        groupId: requestedLead.groupId._id || requestedLead.groupId,
        userId: requestedLead.userId._id || requestedLead.userId,
        content: requestedLead.content,
      });
      const savedApprovedLead = await newApprovedLead.save();
      await savedApprovedLead.populate("userId", "name image");
      // Emit socket event to group from backend
      io.to(`group-${requestedLead.groupId._id || requestedLead.groupId}`).emit(
        "new-approved-lead",
        {
          _id: savedApprovedLead._id,
          groupId: requestedLead.groupId._id || requestedLead.groupId,
          userId: savedApprovedLead.userId,
          content: savedApprovedLead.content,
          createdAt: savedApprovedLead.createdAt,
          updatedAt: savedApprovedLead.updatedAt,
        }
      );
    }

    res.json({
      message: `Lead ${action}d successfully`,
      requestedLead,
    });
  } catch (error) {
    console.error("Error approving/rejecting lead:", error);
    res.status(500).json({ message: "Error processing lead" });
  }
};
