import LocalGroupModel from "../models/LocalGroup.js";
import { parseFile } from "../utilities/xlsx.util.js";

// GET groups (can filter by chapter number)
export const getGroups = async (req, res) => {
  try {
    const { chapterNumber, countryCode } = req.query;
    console.log("Query params:", { chapterNumber, countryCode });
    const userCountryCode = req.user.countryCode;

    let query = {};

    // If chapter number provided, filter by it
    if (chapterNumber) {
      query.chapterNumber = chapterNumber;
    }

    // If countryCode is provided in query (for superadmin), use that
    // Otherwise, use the user's own country code
    if (countryCode) {
      query.countryCode = countryCode;
    } else if (userCountryCode) {
      query.countryCode = userCountryCode;
    }

    console.log("Final query:", query);

    const groups = await LocalGroupModel.find(query)
      .populate("members", "name email image")
      .select("_id name heading image chapterNumber countryCode members");
    res.json(groups);
  } catch (err) {
    console.error("Error fetching groups:", err);
    res.status(500).json({ message: "Error fetching groups" });
  }
};

// GET single group by ID with members
export const getGroupById = async (req, res) => {
  try {
    const { groupId } = req.params;

    const group = await LocalGroupModel.findById(groupId)
      .populate("members", "name email image")
      .select("_id name heading image chapterNumber countryCode members");

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    res.json(group);
  } catch (err) {
    console.error("Error fetching group by ID:", err);
    res.status(500).json({ message: "Error fetching group" });
  }
};

// CREATE group directly (Admin only)
export const createGroup = async (req, res) => {
  try {
    const { name, heading, chapterNumber } = req.body;
    const { countryCode } = req.user;
    const image = req.file ? req.file.filename : null;

    // Validate required fields
    if (!name || !heading || !chapterNumber) {
      return res.status(400).json({
        message:
          "Missing required fields: name, heading, and chapterNumber are required",
      });
    }

    const newGroup = new LocalGroupModel({
      name,
      heading,
      image,
      chapterNumber,
      countryCode,
      members: [],
      categoryId: null, // No category ID needed
    });

    await newGroup.save();
    res.status(201).json(newGroup);
  } catch (err) {
    console.error("Error creating group:", err);

    // Check if it's a mongoose validation error
    if (err.name === "ValidationError") {
      return res.status(400).json({
        message: "Validation error",
        details: Object.values(err.errors).map((e) => e.message),
      });
    }

    res
      .status(500)
      .json({ message: "Error creating group", error: err.message });
  }
};

// CREATE MANY groups directly (Admin only)
export const createManyGroup = async (req, res) => {
  try {
    console.log("🚀 Starting bulk local group creation...");
    console.log("👤 User countryCode:", req.user?.countryCode);
    console.log(
      "📁 File received:",
      req.file
        ? {
            originalname: req.file.originalname,
            mimetype: req.file.mimetype,
            size: req.file.size,
          }
        : "No file"
    );
    console.log("📋 Request body:", req.body);

    const { countryCode } = req.user;

    if (!req.file) {
      console.error("❌ No file uploaded");
      return res.status(400).json({ message: "No file uploaded" });
    }

    const groups = parseFile(req.file);
    console.log("📊 Parsed groups count:", groups.length);
    console.log("📊 First few groups:", groups.slice(0, 3));

    if (!groups || groups.length === 0) {
      console.error("❌ No groups found in file");
      return res.status(400).json({ message: "No valid groups found in file" });
    }

    const formatted = groups.map((g, index) => {
      const formattedGroup = {
        name: g.name,
        heading: g.heading || g.hscode,
        image: g.image,
        chapterNumber: req.body.chapter,
        countryCode,
        members: [],
      };
      console.log(`📝 Group ${index + 1}:`, formattedGroup);
      return formattedGroup;
    });

    // Validate that all required fields are present
    const validGroups = formatted.filter((g) => {
      const isValid = g.name && g.heading && g.chapterNumber;
      if (!isValid) {
        console.log("❌ Invalid group filtered out:", g);
      }
      return isValid;
    });

    console.log("✅ Valid groups count:", validGroups.length);
    console.log("✅ Valid groups:", validGroups);

    if (validGroups.length === 0) {
      console.error("❌ No valid groups found after validation");
      return res
        .status(400)
        .json({ message: "No valid groups found after validation" });
    }

    console.log("💾 Inserting groups into database...");
    const newGroups = await LocalGroupModel.insertMany(validGroups);
    console.log("✅ Successfully created groups:", newGroups.length);

    res.status(201).json({
      message: "Groups created successfully",
      count: newGroups.length,
    });
  } catch (err) {
    console.error("❌ Error bulk creating groups:", err);
    console.error("❌ Error stack:", err.stack);

    // Check if it's a mongoose validation error
    if (err.name === "ValidationError") {
      console.error(
        "❌ Validation errors:",
        Object.values(err.errors).map((e) => e.message)
      );
      return res.status(400).json({
        message: "Validation error",
        details: Object.values(err.errors).map((e) => e.message),
      });
    }

    res
      .status(500)
      .json({ message: "Error creating groups", error: err.message });
  }
};

// UPDATE group (Admin only)
export const updateGroup = async (req, res) => {
  const { groupId } = req.params;
  const { name, heading, chapterNumber, image } = req.body;

  try {
    const group = await LocalGroupModel.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    // Check if user can modify this group (same country)
    if (group.countryCode !== req.user.countryCode) {
      return res.status(403).json({
        message: "Cannot modify group from another country",
      });
    }

    // Update fields
    if (name) group.name = name;
    if (heading) group.heading = heading;
    if (chapterNumber) group.chapterNumber = chapterNumber;
    if (image) group.image = image;

    await group.save();
    res.json(group);
  } catch (err) {
    console.error("Error updating group:", err);
    res.status(500).json({ message: "Error updating group" });
  }
};

// DELETE group (Admin only)
export const deleteGroup = async (req, res) => {
  const { groupId } = req.params;

  try {
    const group = await LocalGroupModel.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    // Check if user can delete this group (same country)
    if (group.countryCode !== req.user.countryCode) {
      return res.status(403).json({
        message: "Cannot delete group from another country",
      });
    }

    await group.deleteOne();
    res.json({ message: "Group deleted successfully" });
  } catch (err) {
    console.error("Error deleting group:", err);
    res.status(500).json({ message: "Error deleting group" });
  }
};

// GET all groups for admin
export const getAllGroups = async (req, res) => {
  try {
    const groups = await LocalGroupModel.find({
      countryCode: req.user.countryCode,
    }).select("_id name heading image chapterNumber countryCode members");
    res.json(groups);
  } catch (err) {
    console.error("Error fetching all groups:", err);
    res.status(500).json({ message: "Error fetching groups" });
  }
};
