import AdminModel from "../models/Admin.js";
import GlobalRequestedLeads from "../models/GlobalRequestedLeads.js";
import GlobalApprovedLeads from "../models/GlobalApprovedLeads.js";
import GlobalCategory from "../models/GlobalCategory.js";
import GlobalGroup from "../models/GlobalGroup.js";
import UserModel from "../models/user.js";
import bcrypt from "bcrypt";
import { io } from "../server.js";

// Get dashboard statistics
export const getDashboardStats = async (req, res) => {
  try {
    const [
      totalGlobalLeads,
      totalGlobalUsers,
      totalGlobalCategories,
      totalGlobalGroups,
      totalAdmins,
    ] = await Promise.all([
      GlobalApprovedLeads.countDocuments(),
      UserModel.countDocuments(),
      GlobalCategory.countDocuments(),
      GlobalGroup.countDocuments(),
      AdminModel.countDocuments(),
    ]);

    res.json({
      totalGlobalLeads,
      totalGlobalUsers,
      totalGlobalCategories,
      totalGlobalGroups,
      totalAdmins,
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    res.status(500).json({ message: "Error fetching dashboard statistics" });
  }
};

// Get all admins
export const getAdmins = async (req, res) => {
  try {
    const admins = await AdminModel.find().select("-password");

    // Get local leads count for each admin
    const adminsWithStats = await Promise.all(
      admins.map(async (admin) => {
        const localLeadsCount = await GlobalRequestedLeads.countDocuments({
          countryCode: admin.countryCode,
          status: "pending",
        });
        return {
          ...admin.toObject(),
          localLeadsCount,
        };
      })
    );

    res.json(adminsWithStats);
  } catch (error) {
    console.error("Error fetching admins:", error);
    res.status(500).json({ message: "Error fetching admins" });
  }
};

// Create new admin
export const createAdmin = async (req, res) => {
  try {
    const { name, email, password, countryCode, phone } = req.body;

    // Check if admin already exists with this email
    const existingAdmin = await AdminModel.findOne({ email });
    if (existingAdmin) {
      return res
        .status(400)
        .json({ message: "Admin with this email already exists" });
    }

    // Check if admin already exists for this country
    const existingCountryAdmin = await AdminModel.findOne({ countryCode });
    if (existingCountryAdmin) {
      return res
        .status(400)
        .json({ message: "Admin for this country already exists" });
    }

    // Hash password
    // const hashedPassword = bcrypt.hashSync(password, 10);

    const newAdmin = new AdminModel({
      name,
      email,
      password: password,
      countryCode,
      phone,
    });
    console.log("new admin", newAdmin);
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

    const admin = await AdminModel.findById(adminId);
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    // Check if email is being changed and if it conflicts
    if (email !== admin.email) {
      const existingAdmin = await AdminModel.findOne({ email });
      if (existingAdmin) {
        return res
          .status(400)
          .json({ message: "Admin with this email already exists" });
      }
    }

    // Check if country code is being changed and if it conflicts
    if (countryCode !== admin.countryCode) {
      const existingCountryAdmin = await AdminModel.findOne({ countryCode });
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

    const admin = await AdminModel.findById(adminId);
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    await AdminModel.findByIdAndDelete(adminId);

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
