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

    const total = await ApprovedLeads.countDocuments({ groupId });

    res.json({
      leads,
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
      type,
      hscode,
      description,
      quantity,
      packing,
      targetPrice,
      negotiable,
      buyerDeliveryLocation: buyerDeliveryAddress ? { address: buyerDeliveryAddress } : undefined,
      sellerPickupLocation: sellerPickupAddress ? { address: sellerPickupAddress } : undefined,
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
