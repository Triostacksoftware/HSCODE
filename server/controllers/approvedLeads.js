import ApprovedLeads from "../models/ApprovedLeads.js";

// Get leads by groupId
export const getLeadsByGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const leads = await ApprovedLeads.find({ groupId })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate("userId", "name image email")
      .exec();

    // Add isAdminPost field to leads that were posted by admins
    const leadsWithAdminInfo = leads.map((lead) => ({
      ...lead.toObject(),
      isAdminPost: !!lead.adminId,
    }));

    const total = await ApprovedLeads.countDocuments({ groupId });

    res.json({
      leads: leadsWithAdminInfo,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    });
  } catch (error) {
    console.error("Error fetching leads:", error);
    res.status(500).json({ message: "Error fetching leads" });
  }
};

// Post new lead (direct, not via approval)
export const postNewLead = async (req, res) => {
  try {
    const {
      groupId,
      content,
      type,
      hscode,
      description,
      quantity,
      packing,
      targetPrice,
      negotiable,
      buyerDeliveryAddress,
      sellerPickupAddress,
      specialRequest,
      remarks,
      leadCode,
    } = req.body;
    const userId = req.user.id;

    if (!groupId) {
      return res.status(400).json({ message: "groupId is required" });
    }

    const newLead = new ApprovedLeads({
      groupId,
      userId,
      content: content || null,
      countryCode: req.user.countryCode || undefined,
      type,
      hscode,
      description,
      quantity,
      packing,
      targetPrice,
      negotiable,
      buyerDeliveryLocation: buyerDeliveryAddress
        ? { address: buyerDeliveryAddress }
        : undefined,
      sellerPickupLocation: sellerPickupAddress
        ? { address: sellerPickupAddress }
        : undefined,
      specialRequest,
      remarks,
      leadCode: leadCode || undefined,
    });

    const savedLead = await newLead.save();
    await savedLead.populate("userId", "name image");
    res.status(201).json(savedLead);
  } catch (error) {
    console.error("Error posting lead:", error);
    res.status(500).json({ message: "Error posting lead" });
  }
};

// Request broadcast for a lead
export const requestBroadcast = async (req, res) => {
  try {
    const { leadId } = req.params;
    const { id } = req.user;
    console.log("userId", id);

    const lead = await ApprovedLeads.findById(leadId);
    if (!lead) {
      return res.status(404).json({
        success: false,
        message: "Lead not found",
      });
    }

    // Check if user owns this lead
    if (lead.userId.toString() !== id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to request broadcast for this lead",
      });
    }

    // Check if already requested or approved
    if (lead.broadcast !== "none") {
      return res.status(400).json({
        success: false,
        message: "Broadcast already requested or approved",
      });
    }

    // Update lead with broadcast request
    lead.broadcast = "pending";
    lead.broadcastRequestedAt = new Date();
    await lead.save();

    res.json({
      success: true,
      message: "Broadcast request submitted successfully",
    });
  } catch (error) {
    console.error("Error requesting broadcast:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get all broadcast requests (admin only)
export const getBroadcastRequests = async (req, res) => {
  console.log("getBroadcastRequests");
  try {
    const { user } = req;
    console.log("user-new", user);

    // Check if user is admin
    if (user.role !== "admin" && user.role !== "superadmin") {
      return res.status(403).json({
        success: false,
        message: "Admin access required",
      });
    }

    const leads = await ApprovedLeads.find({
      broadcast: { $in: ["pending", "approved"] },
    })
      .populate("userId", "name email")
      .populate("groupId", "name")
      .sort({ broadcastRequestedAt: -1 });

    res.json({ success: true, leads });
  } catch (error) {
    console.error("Error fetching broadcast requests:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Update broadcast status (admin only)
export const updateBroadcastStatus = async (req, res) => {
  try {
    const { leadId } = req.params;
    const { action } = req.body;
    const { user } = req;

    // Check if user is admin
    if (user.role !== "admin" && user.role !== "superadmin") {
      return res.status(403).json({
        success: false,
        message: "Admin access required",
      });
    }

    if (!["approve", "reject"].includes(action)) {
      return res.status(400).json({
        success: false,
        message: "Invalid action",
      });
    }

    const lead = await ApprovedLeads.findById(leadId);
    if (!lead) {
      return res.status(404).json({
        success: false,
        message: "Lead not found",
      });
    }

    if (action === "approve") {
      lead.broadcast = "approved";
      lead.broadcastApprovedAt = new Date();
      lead.broadcastApprovedBy = user.id;
    } else {
      lead.broadcast = "none";
      lead.broadcastRequestedAt = null;
    }

    await lead.save();

    res.json({
      success: true,
      message: `Broadcast ${
        action === "approve" ? "approved" : "rejected"
      } successfully`,
    });
  } catch (error) {
    console.error("Error updating broadcast status:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
