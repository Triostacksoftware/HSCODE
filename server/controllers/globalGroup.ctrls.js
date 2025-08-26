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

// Bulk create global groups via CSV/Excel (superadmin)
export const bulkCreateGlobalGroups = async (req, res) => {
  try {
    const rows = parseFile(req.file);

    const docs = rows
      .map((r) => ({
        name: r.name,
        heading: r.heading,
        image: r.image,
        chapterNumber: r.chapter || "00", // Chapter number from CSV, fallback to "00"
        categoryId: null, // No longer needed
      }))
      .filter((d) => d.name && d.heading);

    if (!docs.length)
      return res.status(400).json({ message: "No valid rows found" });

    const created = await GlobalGroup.insertMany(docs);
    res.status(201).json({
      message: "Global groups imported successfully",
      count: created.length,
    });
  } catch (error) {
    console.error("Error bulk creating global groups:", error);
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
      .json({ message: "Error importing global groups", error: error.message });
  }
};
