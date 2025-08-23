import GlobalGroup from "../models/GlobalGroup.js";
import GlobalCategory from "../models/GlobalCategory.js";
import { parseFile } from "../utilities/xlsx.util.js";

// Get all global groups (for superadmin)
export const getAllGlobalGroups = async (req, res) => {
  try {
    const groups = await GlobalGroup.find()
      .populate("categoryId", "name chapter")
      .sort({ createdAt: -1 });

    res.json(groups);
  } catch (error) {
    console.error("Error fetching all global groups:", error);
    res.status(500).json({ message: "Error fetching global groups" });
  }
};

// Get global groups by categoryId
export const getGlobalGroups = async (req, res) => {
  try {
    const { categoryId } = req.params;

    const groups = await GlobalGroup.find({ categoryId })
      .populate("categoryId", "name chapter")
      .sort({ createdAt: -1 });

    res.json(groups);
  } catch (error) {
    console.error("Error fetching global groups:", error);
    res.status(500).json({ message: "Error fetching global groups" });
  }
};

// Create global group
export const createGlobalGroup = async (req, res) => {
  try {
    const { categoryId } = req.params;
  const { name, heading, hscode } = req.body;
    const image = req.file ? req.file.filename : null;

    // Check if category exists
    const category = await GlobalCategory.findById(categoryId);
    if (!category) {
      return res.status(404).json({ message: "Global category not found" });
    }

    // Validate that category has chapter field
    if (!category.chapter) {
      return res.status(400).json({ message: "Global category is missing chapter number" });
    }

    const newGroup = new GlobalGroup({
      name,
      heading: heading || hscode,
      image,
      chapterNumber: category.chapter || "00", // Save chapter number from category, fallback to "00"
      categoryId,
    });

    await newGroup.save();
    await newGroup.populate("categoryId", "name");

    res.status(201).json(newGroup);
  } catch (error) {
    console.error("Error creating global group:", error);
    console.error("Error stack:", error.stack);
    
    // Check if it's a mongoose validation error
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: "Validation error", 
        details: Object.values(error.errors).map(e => e.message) 
      });
    }
    
    res.status(500).json({ message: "Error creating global group", error: error.message });
  }
};

// Update global group
export const updateGlobalGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
  const { name, heading, hscode, categoryId } = req.body;
    const image = req.file ? req.file.filename : null;

    const group = await GlobalGroup.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Global group not found" });
    }

    // Update fields
    if (name) group.name = name;
  if (heading || hscode) group.heading = heading || hscode;
    if (categoryId) group.categoryId = categoryId;
    if (image) group.image = image;

    await group.save();
    await group.populate("categoryId", "name");

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
    const { categoryId } = req.params;
    const rows = parseFile(req.file);
    // Get category to access chapter number
    const category = await GlobalCategory.findById(categoryId);
    if (!category) {
      return res.status(404).json({ message: "Global category not found" });
    }

    // Validate that category has chapter field
    if (!category.chapter) {
      return res.status(400).json({ message: "Global category is missing chapter number" });
    }

    const docs = rows
      .map((r) => ({
        name: r.name,
        heading: r.heading,
        image: r.image,
        chapterNumber: r.chapter || category.chapter || "00", // Save chapter number from CSV or category, fallback to "00"
        categoryId,
      }))
      .filter((d) => d.name && d.heading);
    if (!docs.length) return res.status(400).json({ message: "No valid rows found" });
    const created = await GlobalGroup.insertMany(docs);
    res.status(201).json({ message: "Global groups imported successfully", count: created.length });
  } catch (error) {
    console.error("Error bulk creating global groups:", error);
    console.error("Error stack:", error.stack);
    
    // Check if it's a mongoose validation error
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: "Validation error", 
        details: Object.values(error.errors).map(e => e.message) 
      });
    }
    
    res.status(500).json({ message: "Error importing global groups", error: error.message });
  }
};
