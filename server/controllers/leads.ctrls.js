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
      .populate("userId", "name image")
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

// Post new lead
export const postNewLead = async (req, res) => {
  try {
    const { groupId, content } = req.body;
    const userId = req.user.id;

    if (!groupId || !content) {
      return res
        .status(400)
        .json({ message: "groupId and content are required" });
    }

    const newLead = new ApprovedLeads({
      groupId,
      userId,
      content,
    });

    const savedLead = await newLead.save();

    // Populate user info for response
    await savedLead.populate("userId", "name image");

    res.status(201).json(savedLead);
  } catch (error) {
    console.error("Error posting lead:", error);
    res.status(500).json({ message: "Error posting lead" });
  }
};
