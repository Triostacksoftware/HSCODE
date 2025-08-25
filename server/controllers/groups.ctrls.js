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
    const { countryCode } = req.user;
    const groups = parseFile(req.file);

    if (!groups || groups.length === 0) {
      return res.status(400).json({ message: "No valid groups found in file" });
    }

    const formatted = groups.map((g) => ({
      name: g.name,
      heading: g.heading || g.hscode,
      image: g.image,
      chapterNumber: g.chapter,
      countryCode,
      members: [],
      categoryId: null,
    }));

    // Validate that all required fields are present
    const validGroups = formatted.filter(
      (g) => g.name && g.heading && g.chapterNumber
    );

    if (validGroups.length === 0) {
      return res
        .status(400)
        .json({ message: "No valid groups found after validation" });
    }

    const newGroups = await LocalGroupModel.insertMany(validGroups);
    res.status(201).json({
      message: "Groups created successfully",
      count: newGroups.length,
    });
  } catch (err) {
    console.error("Error bulk creating groups:", err);
    console.error("Error stack:", err.stack);

    // Check if it's a mongoose validation error
    if (err.name === "ValidationError") {
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
