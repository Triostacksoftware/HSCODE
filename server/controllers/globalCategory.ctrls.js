import GlobalCategoryModel from "../models/GlobalCategory.js";
import upload from "../configurations/multer.js";
import { parseFile } from "../utilities/xlsx.util.js";

// GET all global categories (no country restriction)
export const getGlobalCategories = async (req, res) => {
  try {
    const categories = await GlobalCategoryModel.find();
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: "Error fetching global categories" });
  }
};

// CREATE global category (Admin only)
export const createGlobalCategory = async (req, res) => {
  try {
    const { name, chapter } = req.body;
    const newCategory = await GlobalCategoryModel.create({ name, chapter });
    res.status(201).json({ message: "Global category created successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error creating global category" });
  }
};

// BULK create global categories from CSV/Excel
export const bulkCreateGlobalCategories = async (req, res) => {
  try {
    const rows = parseFile(req.file);
    const docs = rows
      .map((r) => ({ name: r.name, chapter: r.chapter.trim() }))
      .filter((r) => r.name && r.chapter);
    if (!docs.length) return res.status(400).json({ message: "No valid rows found" });
    await GlobalCategoryModel.insertMany(docs);
    res.status(201).json({ message: "Global categories imported successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error importing global categories" });
  }
};

// UPDATE global category (Admin only)
export const updateGlobalCategory = async (req, res) => {
  const { id } = req.params;
  const { name, chapter } = req.body;
  try {
    const category = await GlobalCategoryModel.findById(id);
    if (!category)
      return res.status(404).json({ message: "Category not found" });
    category.name = name || category.name;
    category.chapter = chapter || category.chapter;
    await category.save();
    res.json(category);
  } catch (err) {
    res.status(500).json({ message: "Error updating global category" });
  }
};

// DELETE global category (Admin only)
export const deleteGlobalCategory = async (req, res) => {
  const { id } = req.params;
  try {
    const category = await GlobalCategoryModel.findById(id);
    if (!category)
      return res.status(404).json({ message: "Category not found" });
    await category.deleteOne();
    res.json({ message: "Global category deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting global category" });
  }
};
export const getadminAllGlobalGroups = async (req, res) => {
  try {
    const categories = await GlobalCategoryModel.find({
      countryCode: req.user.countryCode,
    });

    const groups = await GlobalGroupModel.find({
      categoryId: { $in: categories },
    });
    res.json(groups);
  } catch (err) {
    res.status(500).json({ message: "Error fetching groups" });
  }
};
