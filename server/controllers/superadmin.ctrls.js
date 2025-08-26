import GlobalRequestedLeads from "../models/GlobalRequestedLeads.js";
import GlobalApprovedLeads from "../models/GlobalApprovedLeads.js";
import GlobalGroupModel from "../models/GlobalGroup.js";
import UserModel from "../models/user.js";
import SuperAdminModel from "../models/SuperAdmin.js";
import bcrypt from "bcrypt";
import { io } from "../server.js";
import RequestedLeads from "../models/RequestedLeads.js";
import ApprovedLeads from "../models/ApprovedLeads.js";
import LocalGroupModel from "../models/LocalGroup.js";

// Get dashboard statistics
export const getDashboardStats = async (req, res) => {
  try {
    const [totalGlobalLeads, totalGlobalUsers, totalGlobalGroups, totalAdmins] =
      await Promise.all([
        GlobalApprovedLeads.countDocuments(),
        UserModel.countDocuments(),
        GlobalGroupModel.countDocuments(),
        UserModel.countDocuments({ role: "admin" }),
      ]);

    res.json({
      totalGlobalLeads,
      totalGlobalUsers,
      totalGlobalGroups,
      totalAdmins,
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    res.status(500).json({ message: "Error fetching dashboard statistics" });
  }
};

// -------- Local (Domestic) requested leads for Superadmin --------

// List of countries with pending requested local leads counts
export const getLocalRequestedLeadsCountryCounts = async (req, res) => {
  try {
    const results = await RequestedLeads.aggregate([
      { $match: { status: "pending" } },
      {
        $addFields: {
          extractedCountry: {
            $ifNull: [
              "$countryCode",
              { $arrayElemAt: [{ $split: ["$leadCode", "-"] }, 1] },
            ],
          },
        },
      },
      { $match: { extractedCountry: { $ne: null } } },
      { $group: { _id: "$extractedCountry", count: { $sum: 1 } } },
      { $project: { _id: 0, countryCode: "$_id", count: 1 } },
      { $sort: { countryCode: 1 } },
    ]);
    res.json(results.filter((r) => r.countryCode));
  } catch (error) {
    console.error(
      "Error fetching local requested leads country counts:",
      error
    );
    res.status(500).json({ message: "Error fetching country counts" });
  }
};

// Pending requested local leads by country (with pagination)
export const getPendingLocalRequestedLeadsByCountry = async (req, res) => {
  try {
    const { page = 1, limit = 20, groupId } = req.query;
    const country = (req.query.country || "").toString().toUpperCase();

    if (!country) {
      return res
        .status(400)
        .json({ message: "country query param is required" });
    }

    const baseQuery = { status: "pending" };
    if (groupId) {
      baseQuery.groupId = groupId;
    }

    // Match either explicit countryCode or parse from leadCode (BLD/SLD-CC-...)
    const query = {
      ...baseQuery,
      $or: [
        { countryCode: country },
        { leadCode: { $regex: new RegExp(`^(BLD|SLD)-${country}-`, "i") } },
      ],
    };

    const requestedLeads = await RequestedLeads.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit) * 1)
      .skip((Number(page) - 1) * Number(limit))
      .populate("userId", "name image email")
      .populate("groupId", "name")
      .exec();

    const total = await RequestedLeads.countDocuments(query);

    res.json({
      requestedLeads,
      totalPages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
      total,
    });
  } catch (error) {
    console.error("Error fetching pending local requested leads:", error);
    res
      .status(500)
      .json({ message: "Error fetching pending local requested leads" });
  }
};

// Get all admins (from UserModel with role: 'admin')
export const getAdmins = async (req, res) => {
  try {
    const admins = await UserModel.find({ role: "admin" }).select(
      "name email countryCode phone role image"
    );

    // Compute local leads per admin's country (all leads, not just pending)
    const adminsWithStats = await Promise.all(
      admins.map(async (admin) => {
        // Try to match country code in different formats and also parse from leadCode
        const localLeadsCount = await RequestedLeads.countDocuments({
          $or: [
            { countryCode: admin.countryCode },
            { countryCode: admin.countryCode.toUpperCase() },
            { countryCode: admin.countryCode.toLowerCase() },
            // Also check leadCode format like "BLD/SLD-CC-..." where CC is country code
            {
              leadCode: {
                $regex: new RegExp(`^(BLD|SLD)-${admin.countryCode}-`, "i"),
              },
            },
          ],
        });

        // Get total users in this country (excluding admins)
        const totalUsersInCountry = await UserModel.countDocuments({
          countryCode: admin.countryCode,
          role: { $ne: "admin" },
        });

        return {
          ...admin.toObject(),
          localLeadsCount,
          totalUsersInCountry,
        };
      })
    );

    res.json(adminsWithStats);
  } catch (error) {
    console.error("Error fetching admins:", error);
    res.status(500).json({ message: "Error fetching admins" });
  }
};

// Get detailed information about a specific admin
export const getAdminDetails = async (req, res) => {
  try {
    const { adminId } = req.params;

    // Get admin basic info
    const admin = await UserModel.findById(adminId).select(
      "name email countryCode phone role image groupsID globalGroupsID"
    );

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    console.log("Admin Object:", {
      _id: admin._id,
      name: admin.name,
      email: admin.email,
      countryCode: admin.countryCode,
      groupsID: admin.groupsID,
      globalGroupsID: admin.globalGroupsID,
    });

    // Get local groups where admin is a member (check both members array and admin's groupsID)
    let localGroups = [];
    try {
      localGroups = await LocalGroupModel.find({
        $or: [
          { members: { $in: [adminId] } },
          { _id: { $in: admin.groupsID || [] } },
        ],
      }).select("name heading image");
    } catch (error) {
      console.error("Error fetching local groups:", error);
      localGroups = [];
    }

    // Get global groups where admin is a member (check both members array and admin's globalGroupsID)
    let globalGroups = [];
    try {
      globalGroups = await GlobalGroupModel.find({
        $or: [
          { members: { $in: [adminId] } },
          { _id: { $in: admin.globalGroupsID || [] } },
        ],
      }).select("name heading image");
    } catch (error) {
      console.error("Error fetching global groups:", error);
      globalGroups = [];
    }

    console.log("Groups Query Debug:", {
      adminId,
      localGroupsQuery: {
        $or: [
          { members: { $in: [adminId] } },
          { _id: { $in: admin.groupsID || [] } },
        ],
      },
      globalGroupsQuery: {
        $or: [
          { members: { $in: [adminId] } },
          { _id: { $in: admin.globalGroupsID || [] } },
        ],
      },
      adminGroupsID: admin.groupsID,
      adminGlobalGroupsID: admin.globalGroupsID,
    });

    // Get local posts count (leads in their country)
    const localPosts = await RequestedLeads.countDocuments({
      countryCode: admin.countryCode,
    });

    // Get global posts count (leads they've posted globally)
    const globalPosts = await GlobalRequestedLeads.countDocuments({
      userId: adminId,
    });

    // Get total leads count
    const totalLeads = localPosts + globalPosts;

    // Create recent activity (you can expand this based on your needs)
    const recentActivity = [
      {
        action: "Local Lead Posted",
        description: `Posted a lead in ${admin.countryCode}`,
        timestamp: new Date(),
      },
      {
        action: "Global Lead Posted",
        description: "Posted a global lead",
        timestamp: new Date(Date.now() - 86400000), // 1 day ago
      },
    ];

    // If no groups found, create some sample data for demonstration
    if (localGroups.length === 0 && globalGroups.length === 0) {
      console.log("No groups found, creating sample data for demonstration");
      localGroups = [
        {
          _id: "sample-local-group",
          name: "Sample Local Group",
          heading: "This is a sample local group for demonstration purposes",
        },
      ];
      globalGroups = [
        {
          _id: "sample-global-group",
          name: "Sample Global Group",
          heading: "This is a sample global group for demonstration purposes",
        },
      ];
    }

    console.log("Admin Details Response:", {
      adminId,
      localGroups: localGroups.length,
      globalGroups: globalGroups.length,
      localPosts,
      globalPosts,
      totalLeads,
    });

    console.log("Found Groups:", {
      localGroups: localGroups.map((g) => ({
        id: g._id,
        name: g.name,
        heading: g.heading,
      })),
      globalGroups: globalGroups.map((g) => ({
        id: g._id,
        name: g.name,
        heading: g.heading,
      })),
    });

    res.json({
      localPosts,
      globalPosts,
      localGroups,
      globalGroups,
      recentActivity,
      totalLeads,
    });
  } catch (error) {
    console.error("Error fetching admin details:", error);
    res.status(500).json({ message: "Error fetching admin details" });
  }
};

// Create new admin
export const createAdmin = async (req, res) => {
  try {
    const { name, email, password, countryCode, phone } = req.body;
    console.log(req.body);
    

    // Check if admin already exists with this email
    const existingAdmin = await UserModel.findOne({ email, role: "admin" });
    if (existingAdmin) {
      return res
        .status(400)
        .json({ message: "Admin with this email already exists" });
    }

    // Check if admin already exists for this country
    const existingCountryAdmin = await UserModel.findOne({
      countryCode,
      role: "admin",
    });
    if (existingCountryAdmin) {
      return res
        .status(400)
        .json({ message: "Admin for this country already exists" });
    }

    // Hash password
    // const hashedPassword = bcrypt.hashSync(password, 10);

    const newAdmin = new UserModel({
      name,
      email,
      password: password,
      countryCode,
      phone,
      role: "admin",
    });
    await newAdmin.save();

    res.status(201).json({
      message: "Admin created successfully",
      admin: {
        _id: newAdmin._id,
        name: newAdmin.name,
        email: newAdmin.email,
        countryCode: newAdmin.countryCode,
        phone: newAdmin.phone,
      },
    });
  } catch (error) {
    console.error("Error creating admin:", error);
    res.status(500).json({ message: "Error creating admin" });
  }
};

// Update admin
export const updateAdmin = async (req, res) => {
  try {
    const { adminId } = req.params;
    const { name, email, password, countryCode, phone } = req.body;

    const admin = await UserModel.findById(adminId);
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    // Check if email is being changed and if it conflicts
    if (email !== admin.email) {
      const existingAdmin = await UserModel.findOne({ email, role: "admin" });
      if (existingAdmin) {
        return res
          .status(400)
          .json({ message: "Admin with this email already exists" });
      }
    }

    // Check if country code is being changed and if it conflicts
    if (countryCode !== admin.countryCode) {
      const existingCountryAdmin = await UserModel.findOne({
        countryCode,
        role: "admin",
      });
      if (existingCountryAdmin) {
        return res
          .status(400)
          .json({ message: "Admin for this country already exists" });
      }
    }

    // Update fields
    admin.name = name;
    admin.email = email;
    admin.countryCode = countryCode;
    admin.phone = phone;

    // Update password only if provided
    if (password && password.trim() !== "") {
      admin.password = password;
    }

    await admin.save();

    res.json({
      message: "Admin updated successfully",
      admin: {
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        countryCode: admin.countryCode,
        phone: admin.phone,
      },
    });
  } catch (error) {
    console.error("Error updating admin:", error);
    res.status(500).json({ message: "Error updating admin" });
  }
};

// Delete admin
export const deleteAdmin = async (req, res) => {
  try {
    const { adminId } = req.params;

    const admin = await UserModel.findById(adminId);
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    await UserModel.findByIdAndDelete(adminId);

    res.json({ message: "Admin deleted successfully" });
  } catch (error) {
    console.error("Error deleting admin:", error);
    res.status(500).json({ message: "Error deleting admin" });
  }
};

// Get all pending global leads (no country filtering for superadmin)
export const getAllPendingGlobalLeads = async (req, res) => {
  try {
    const { page = 1, limit = 20, groupId } = req.query;

    const query = { status: "pending" };
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

// Superadmin approves/rejects a global lead (no country restriction)
export const approveRejectGlobalLead = async (req, res) => {
  try {
    const { leadId } = req.params;
    const { action, comment } = req.body; // action: "approve" or "reject"

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

    const newStatus = action === "approve" ? "approved" : "rejected";

    // Update the requested lead status
    requestedLead.status = newStatus;
    requestedLead.adminId = req.user.id;
    requestedLead.adminComment = comment || null;
    await requestedLead.save();

    // If approved, create an approved global lead
    if (action === "approve") {
      const newApprovedLead = new GlobalApprovedLeads({
        groupId: requestedLead.groupId._id || requestedLead.groupId,
        userId: requestedLead.userId._id || requestedLead.userId,
        content: requestedLead.content,
        countryCode: requestedLead.countryCode,
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

      // Emit socket event to group from backend with full structured payload
      io.to(
        `global-group-${requestedLead.groupId._id || requestedLead.groupId}`
      ).emit("new-approved-global-lead", {
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

// Superadmin posts a message directly to a global group
export const postSuperadminMessage = async (req, res) => {
  try {
    const { groupId } = req.params;
    const {
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
    } = req.body;
    const superadminId = req.user.id;

    if (!content && !description) {
      return res
        .status(400)
        .json({ message: "Content or description is required" });
    }

    // Create a new approved lead directly (superadmin bypasses approval)
    const newLead = new GlobalApprovedLeads({
      groupId,
      userId: superadminId,
      content: content || description,
      type: type || "lead",
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
      countryCode: "SUPERADMIN", // Special identifier for superadmin posts
      adminId: superadminId,
      isAdminPost: true,
      leadCode: `SUPER-${Date.now()}`,
    });

    const savedLead = await newLead.save();
    await savedLead.populate("userId", "name image email");

    // Emit socket event to group
    io.to(`global-group-${groupId}`).emit("new-approved-global-lead", {
      _id: savedLead._id,
      groupId,
      userId: savedLead.userId,
      content: savedLead.content,
      type: savedLead.type,
      hscode: savedLead.hscode,
      description: savedLead.description,
      quantity: savedLead.quantity,
      packing: savedLead.packing,
      targetPrice: savedLead.targetPrice,
      negotiable: savedLead.negotiable,
      buyerDeliveryAddress: savedLead.buyerDeliveryAddress,
      sellerPickupAddress: savedLead.sellerPickupAddress,
      specialRequest: savedLead.specialRequest,
      remarks: savedLead.remarks,
      leadCode: savedLead.leadCode,
      createdAt: savedLead.createdAt,
      updatedAt: savedLead.updatedAt,
      isAdminPost: true,
    });

    res.json({
      message: "Message posted successfully",
      lead: savedLead,
    });
  } catch (error) {
    console.error("Error posting superadmin message:", error);
    res.status(500).json({ message: "Error posting message" });
  }
};

// Superadmin posts a message directly to a local group
export const postSuperadminLocalMessage = async (req, res) => {
  try {
    const { groupId } = req.params;
    const {
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
    } = req.body;
    const superadminId = req.user.id;

    if (!content && !description) {
      return res
        .status(400)
        .json({ message: "Content or description is required" });
    }

    // Create a new approved lead directly (superadmin bypasses approval)
    const newLead = new ApprovedLeads({
      groupId,
      userId: superadminId,
      content: content || description,
      type: type || "lead",
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
      countryCode: "SUPERADMIN", // Special identifier for superadmin posts
      adminId: superadminId,
      isAdminPost: true,
      leadCode: `SUPER-LOCAL-${Date.now()}`,
    });

    const savedLead = await newLead.save();
    await savedLead.populate("userId", "name image email");

    // Emit socket event to group
    io.to(`group-${groupId}`).emit("new-approved-lead", {
      _id: savedLead._id,
      groupId,
      userId: savedLead.userId,
      content: savedLead.content,
      type: savedLead.type,
      hscode: savedLead.hscode,
      description: savedLead.description,
      quantity: savedLead.quantity,
      packing: savedLead.packing,
      targetPrice: savedLead.targetPrice,
      negotiable: savedLead.negotiable,
      buyerDeliveryAddress: savedLead.buyerDeliveryAddress,
      sellerPickupAddress: savedLead.sellerPickupAddress,
      specialRequest: savedLead.specialRequest,
      remarks: savedLead.remarks,
      leadCode: savedLead.leadCode,
      createdAt: savedLead.createdAt,
      updatedAt: savedLead.updatedAt,
      isAdminPost: true,
    });

    res.json({
      message: "Message posted successfully",
      lead: savedLead,
    });
  } catch (error) {
    console.error("Error posting superadmin local message:", error);
    res.status(500).json({ message: "Error posting message" });
  }
};

// Superadmin posts lead directly to approved leads (local)
export const postLeadDirect = async (req, res) => {
  try {
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
      chapterNo,
    } = req.body;

    const documents = req.files || [];

    // Create the lead directly in approved leads
    const newLead = new ApprovedLeads({
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
      chapterNo,
      documents: documents.map((file) => file.filename),
      userId: req.user._id,
      isAdminPost: true,
      status: "approved",
      approvedAt: new Date(),
      approvedBy: req.user._id,
    });

    await newLead.save();

    // Emit socket event for real-time updates
    if (req.app.get("io")) {
      req.app.get("io").to(groupId).emit("new-approved-lead", newLead);
    }

    res.status(201).json({
      success: true,
      message: "Lead posted successfully",
      lead: newLead,
    });
  } catch (error) {
    console.error("Error posting lead directly:", error);
    res.status(500).json({
      success: false,
      message: "Failed to post lead",
      error: error.message,
    });
  }
};

// Superadmin posts global lead directly to approved global leads
export const postGlobalLeadDirect = async (req, res) => {
  try {
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
      chapterNo,
    } = req.body;

    const documents = req.files || [];

    // Create the global lead directly in approved global leads
    const newGlobalLead = new GlobalApprovedLeads({
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
      chapterNo,
      documents: documents.map((file) => file.filename),
      userId: req.user._id,
      isAdminPost: true,
      status: "approved",
      approvedAt: new Date(),
      approvedBy: req.user._id,
    });

    await newGlobalLead.save();

    // Emit socket event for real-time updates
    if (req.app.get("io")) {
      req.app
        .get("io")
        .to(groupId)
        .emit("new-approved-global-lead", newGlobalLead);
    }

    res.status(201).json({
      success: true,
      message: "Global lead posted successfully",
      lead: newGlobalLead,
    });
  } catch (error) {
    console.error("Error posting global lead directly:", error);
    res.status(500).json({
      success: false,
      message: "Failed to post global lead",
      error: error.message,
    });
  }
};

// ===== SUPERADMIN MANAGEMENT FUNCTIONS =====

// Get all superadmins
export const getSuperadmins = async (req, res) => {
  try {
    const superadmins = await SuperAdminModel.find().select(
      "name email countryCode phone totpEnabled createdAt"
    );
    res.json(superadmins);
  } catch (error) {
    console.error("Error fetching superadmins:", error);
    res.status(500).json({ message: "Error fetching superadmins" });
  }
};

// Create new superadmin
export const createSuperadmin = async (req, res) => {
  try {
    const { name, email, password, countryCode, phone } = req.body;

    // Check if superadmin already exists with this email
    const existingSuperadmin = await SuperAdminModel.findOne({ email });
    if (existingSuperadmin) {
      return res
        .status(400)
        .json({ message: "Superadmin with this email already exists" });
    }

    const newSuperadmin = new SuperAdminModel({
      name,
      email,
      password,
      countryCode,
      phone,
    });
    await newSuperadmin.save();

    res.status(201).json({
      message: "Superadmin created successfully",
      superadmin: {
        _id: newSuperadmin._id,
        name: newSuperadmin.name,
        email: newSuperadmin.email,
        countryCode: newSuperadmin.countryCode,
        phone: newSuperadmin.phone,
      },
    });
  } catch (error) {
    console.error("Error creating superadmin:", error);
    res.status(500).json({ message: "Error creating superadmin" });
  }
};

// Update superadmin
export const updateSuperadmin = async (req, res) => {
  try {
    const { superadminId } = req.params;
    const { name, email, password, countryCode, phone } = req.body;

    const superadmin = await SuperAdminModel.findById(superadminId);
    if (!superadmin) {
      return res.status(404).json({ message: "Superadmin not found" });
    }

    // Check if email is being changed and if it conflicts
    if (email !== superadmin.email) {
      const existingSuperadmin = await SuperAdminModel.findOne({ email });
      if (existingSuperadmin) {
        return res
          .status(400)
          .json({ message: "Superadmin with this email already exists" });
      }
    }

    // Update fields
    superadmin.name = name;
    superadmin.email = email;
    superadmin.countryCode = countryCode;
    superadmin.phone = phone;

    // Update password only if provided
    if (password && password.trim() !== "") {
      superadmin.password = password;
    }

    await superadmin.save();

    res.json({
      message: "Superadmin updated successfully",
      superadmin: {
        _id: superadmin._id,
        name: superadmin.name,
        email: superadmin.email,
        countryCode: superadmin.countryCode,
        phone: superadmin.phone,
      },
    });
  } catch (error) {
    console.error("Error updating superadmin:", error);
    res.status(500).json({ message: "Error updating superadmin" });
  }
};

// Delete superadmin
export const deleteSuperadmin = async (req, res) => {
  try {
    const { superadminId } = req.params;

    const superadmin = await SuperAdminModel.findById(superadminId);
    if (!superadmin) {
      return res.status(404).json({ message: "Superadmin not found" });
    }

    await SuperAdminModel.findByIdAndDelete(superadminId);

    res.json({ message: "Superadmin deleted successfully" });
  } catch (error) {
    console.error("Error deleting superadmin:", error);
    res.status(500).json({ message: "Error deleting superadmin" });
  }
};
