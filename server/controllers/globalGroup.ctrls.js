import GlobalGroup from "../models/GlobalGroup.js";
import { parseFile } from "../utilities/xlsx.util.js";

// Get all global groups (for superadmin)
export const getAllGlobalGroups = async (req, res) => {
  try {
    const groups = await GlobalGroup.find()
      .populate("members", "name email image")
      .sort({ createdAt: -1 });

    res.json(groups);
  } catch (error) {
    console.error("Error fetching all global groups:", error);
    res.status(500).json({ message: "Error fetching global groups" });
  }
};

// Get global groups by chapterNumber
export const getGlobalGroups = async (req, res) => {
  try {
    const { chapterNumber } = req.query;

    let query = {};

    // If chapter number provided, filter by it
    if (chapterNumber) {
      query.chapterNumber = chapterNumber;
    }

    const groups = await GlobalGroup.find(query)
      .populate("members", "name email image")
      .sort({ createdAt: -1 });

    res.json(groups);
  } catch (error) {
    console.error("Error fetching global groups:", error);
    res.status(500).json({ message: "Error fetching global groups" });
  }
};

// GET single global group by ID with members
export const getGlobalGroupById = async (req, res) => {
  try {
    const { groupId } = req.params;

    const group = await GlobalGroup.findById(groupId)
      .populate("members", "name email image")
      .select("_id name heading image chapterNumber members");

    if (!group) {
      return res.status(404).json({ message: "Global group not found" });
    }

    res.json(group);
  } catch (err) {
    console.error("Error fetching global group by ID:", err);
    res.status(500).json({ message: "Error fetching global group" });
  }
};

// Create global group
export const createGlobalGroup = async (req, res) => {
  try {
    const { name, heading, hscode, chapterNumber } = req.body;
    const image = req.file ? req.file.filename : null;

    if (!chapterNumber) {
      return res.status(400).json({ message: "Chapter number is required" });
    }

    const newGroup = new GlobalGroup({
      name,
      heading: heading || hscode,
      image,
      chapterNumber,
      categoryId: null, // No longer needed
    });

    await newGroup.save();

    res.status(201).json(newGroup);
  } catch (error) {
    console.error("Error creating global group:", error);
    console.error("Error stack:", error.stack);

    // Check if it's a mongoose validation error
    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: "Validation error",
        details: Object.values(error.errors).map((e) => e.message),
      });
    }

    res
      .status(500)
      .json({ message: "Error creating global group", error: error.message });
  }
};

// Update global group
export const updateGlobalGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { name, heading, hscode, chapterNumber } = req.body;
    const image = req.file ? req.file.filename : null;

    const group = await GlobalGroup.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Global group not found" });
    }

    // Update fields
    if (name) group.name = name;
    if (heading || hscode) group.heading = heading || hscode;
    if (chapterNumber) group.chapterNumber = chapterNumber;
    if (image) group.image = image;

    await group.save();

    res.json(group);
  } catch (error) {
    console.error("Error updating global group:", error);
    res.status(500).json({ message: "Error updating global group" });
  }
};

// Delete global group
export const deleteGlobalGroup = async (req, res) => {
  try {
    const { groupId } = req.params;

    const group = await GlobalGroup.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Global group not found" });
    }

    await GlobalGroup.findByIdAndDelete(groupId);

    res.json({ message: "Global group deleted successfully" });
  } catch (error) {
    console.error("Error deleting global group:", error);
    res.status(500).json({ message: "Error deleting global group" });
  }
};

// Bulk create global groups via CSV/Excel (superadmin) - Same pattern as local groups
export const bulkCreateGlobalGroups = async (req, res) => {
  try {
    console.log("🚀 Starting bulk global group creation...");
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
        chapterNumber: req.body.chapter || req.body.chapterNumber || "00",
        categoryId: null,
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
    const newGroups = await GlobalGroup.insertMany(validGroups);
    console.log("✅ Successfully created groups:", newGroups.length);

    res.status(201).json({
      message: "Global groups created successfully",
      count: newGroups.length,
    });
  } catch (error) {
    console.error("❌ Error bulk creating global groups:", error);
    console.error("❌ Error stack:", error.stack);

    // Check if it's a mongoose validation error
    if (error.name === "ValidationError") {
      console.error(
        "❌ Validation errors:",
        Object.values(error.errors).map((e) => e.message)
      );
      return res.status(400).json({
        message: "Validation error",
        details: Object.values(error.errors).map((e) => e.message),
      });
    }

    res
      .status(500)
      .json({ message: "Error creating global groups", error: error.message });
  }
};
