import RequestedLeads from "../models/RequestedLeads.js";
import ApprovedLeads from "../models/ApprovedLeads.js";
import { io } from "../server.js";

// Post new requested lead (user submits for approval)
export const postRequestedLead = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      groupId,
      type,
      hscode,
      description,
      quantity,
      packing,
      targetPrice,
      negotiable,
      buyerDeliveryAddress,
      buyerLat,
      buyerLng,
      sellerPickupAddress,
      sellerLat,
      sellerLng,
      specialRequest,
      remarks,
      content, // legacy
    } = req.body;

    if (!groupId) {
      return res.status(400).json({ message: "groupId is required" });
    }

    const documents = (req.files || []).map((f) => f.filename);

    // Build leadCode
    // Prefix: BLD for buy, SLD for sell; scope: domestic; country from user
    const countryCode = req.user.countryCode || "";
    const chapter = req.body.chapterNo;
    const typePrefix = (type === "buy" ? "BLD" : "SLD");
    // Find sequence for this day and chapter + country + type
    const seqBase = { type, hscode: { $regex: `^${chapter}` }, documents: { $exists: true } };
    // Count existing leads for chapter and country to generate next sequence
    const existingRequestedCount = await RequestedLeads.countDocuments({
      type,
      hscode: { $regex: `^${chapter}` },
      // domestic scope uses user's country; optional filter by user country if stored
    });
    const existingApprovedCount = await ApprovedLeads.countDocuments({
      type,
      hscode: { $regex: `^${chapter}` },
      // domestic scope uses user's country; optional filter by user country if stored
    });
    const sequence = String(existingRequestedCount + existingApprovedCount + 1).padStart(2, "0");
    const leadCode = `${typePrefix}-${countryCode}-${chapter}-${sequence}`;

    const newRequestedLead = new RequestedLeads({
      groupId,
      userId,
      type,
      hscode,
      description,
      quantity,
      packing,
      targetPrice,
      negotiable: negotiable === "true" || negotiable === true,
      countryCode,
      buyerDeliveryLocation: buyerDeliveryAddress
        ? {
            address: buyerDeliveryAddress,
            geo:
              buyerLng && buyerLat
                ? { type: "Point", coordinates: [Number(buyerLng), Number(buyerLat)] }
                : undefined,
          }
        : undefined,
      sellerPickupLocation: sellerPickupAddress
        ? {
            address: sellerPickupAddress,
            geo:
              sellerLng && sellerLat
                ? { type: "Point", coordinates: [Number(sellerLng), Number(sellerLat)] }
                : undefined,
          }
        : undefined,
      specialRequest,
      remarks,
      content,
      documents,
      leadCode,
    });

    const savedLead = await newRequestedLead.save();
    await savedLead.populate("userId", "name");
    res.status(201).json("savedLead");
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
        type: requestedLead.type,
        hscode: requestedLead.hscode,
        description: requestedLead.description,
        quantity: requestedLead.quantity,
        packing: requestedLead.packing,
        targetPrice: requestedLead.targetPrice,
        negotiable: requestedLead.negotiable,
        buyerDeliveryLocation: requestedLead.buyerDeliveryLocation,
        sellerPickupLocation: requestedLead.sellerPickupLocation,
        specialRequest: requestedLead.specialRequest,
        remarks: requestedLead.remarks,
        documents: requestedLead.documents,
        leadCode: requestedLead.leadCode,
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
          type: savedApprovedLead.type,
          hscode: savedApprovedLead.hscode,
          description: savedApprovedLead.description,
          quantity: savedApprovedLead.quantity,
          packing: savedApprovedLead.packing,
          targetPrice: savedApprovedLead.targetPrice,
          negotiable: savedApprovedLead.negotiable,
          buyerDeliveryLocation: savedApprovedLead.buyerDeliveryLocation,
          sellerPickupLocation: savedApprovedLead.sellerPickupLocation,
          specialRequest: savedApprovedLead.specialRequest,
          remarks: savedApprovedLead.remarks,
          documents: savedApprovedLead.documents,
          leadCode: savedApprovedLead.leadCode,
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

// Resend a rejected requested lead (user can edit and resubmit). Keeps the same lead document
export const resendRequestedLead = async (req, res) => {
  try {
    const { leadId } = req.params;
    const userId = req.user.id;

    const lead = await RequestedLeads.findById(leadId);
    if (!lead) return res.status(404).json({ message: "Requested lead not found" });
    if (String(lead.userId) !== String(userId)) {
      return res.status(403).json({ message: "You can only edit your own lead" });
    }
    if (lead.status !== "rejected") {
      return res.status(400).json({ message: "Only rejected leads can be resent" });
    }

    // Parse retained docs coming from client
    let retained = [];
    try {
      if (req.body.retainDocuments) {
        const parsed = JSON.parse(req.body.retainDocuments);
        if (Array.isArray(parsed)) retained = parsed;
      }
    } catch (_) {}

    const newDocs = (req.files || []).map((f) => f.filename);
    const documents = [...retained, ...newDocs];

    // Update fields if provided
    const fields = [
      "type",
      "hscode",
      "description",
      "quantity",
      "packing",
      "targetPrice",
      "negotiable",
      "specialRequest",
      "remarks",
    ];
    fields.forEach((key) => {
      if (typeof req.body[key] !== "undefined") {
        lead[key] = key === "negotiable" ? (req.body[key] === "true" || req.body[key] === true) : req.body[key];
      }
    });

    // Addresses
    if (typeof req.body.buyerDeliveryAddress !== "undefined") {
      const buyerAddr = req.body.buyerDeliveryAddress;
      const buyerLat = req.body.buyerLat;
      const buyerLng = req.body.buyerLng;
      lead.buyerDeliveryLocation = buyerAddr
        ? {
            address: buyerAddr,
            geo:
              buyerLng && buyerLat
                ? { type: "Point", coordinates: [Number(buyerLng), Number(buyerLat)] }
                : undefined,
          }
        : undefined;
    }
    if (typeof req.body.sellerPickupAddress !== "undefined") {
      const sellerAddr = req.body.sellerPickupAddress;
      const sellerLat = req.body.sellerLat;
      const sellerLng = req.body.sellerLng;
      lead.sellerPickupLocation = sellerAddr
        ? {
            address: sellerAddr,
            geo:
              sellerLng && sellerLat
                ? { type: "Point", coordinates: [Number(sellerLng), Number(sellerLat)] }
                : undefined,
          }
        : undefined;
    }

    // Documents
    lead.documents = documents;

    // Reset status and admin metadata; keep same leadCode
    lead.status = "pending";
    lead.adminId = null;
    lead.adminComment = null;

    await lead.save();
    await lead.populate("userId", "name image");
    await lead.populate("groupId", "name");

    res.json({ message: "Lead resent successfully", requestedLead: lead });
  } catch (error) {
    console.error("Error resending requested lead:", error);
    res.status(500).json({ message: "Error resending requested lead" });
  }
};
