import LocalCategoryModel from "../models/LocalCategory.js";
import LocalGroupModel from "../models/LocalGroup.js";

// Utility to check admin role & country
const checkAdmin = (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Unauthorized" });
  }
};

// -------- CATEGORY CONTROLLERS --------

// GET all categories
export const getCategories = async (req, res) => {
  try {
    const countryCode = req.user.countryCode;

    const categories = await LocalCategoryModel.find({ countryCode });
    res.json(categories);
    console.log(categories);
  } catch (err) {
    res.status(500).json({ message: "Error fetching categories" });
  }
};

// CREATE categories (Admin only, supports array)
export const createCategory = async (req, res) => {
  if (checkAdmin(req, res)) return;

  let categories = req.body; // Can be object or array
  const { id, countryCode } = req.user; // Admin ID & country

  try {
    // Normalize input: if it's a single object, wrap it in array
    if (!Array.isArray(categories)) {
      categories = [categories];
    }

    // Attach adminId & countryCode automatically
    const formatted = categories.map((cat) => ({
      name: cat.name,
      countryCode,
      adminId: id,
    }));

    const newCategories = await LocalCategoryModel.insertMany(formatted);
    res.status(201).json(newCategories);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error creating categories" });
  }
};

// DELETE category (Admin & correct country)
export const deleteCategory = async (req, res) => {
  checkAdmin(req, res);

  const { id: categoryId } = req.params;
  try {
    const category = await LocalCategoryModel.findById(categoryId);
    if (!category)
      return res.status(404).json({ message: "Category not found" });

    if (category.countryCode !== req.user.countryCode) {
      return res
        .status(403)
        .json({ message: "Cannot delete category from another country" });
    }

    await category.deleteOne();
    res.json({ message: "Category deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting category" });
  }
};

// UPDATE category (Admin & correct country)
export const updateCategory = async (req, res) => {
  checkAdmin(req, res);

  const { id: categoryId } = req.params;
  const { name } = req.body;

  try {
    const category = await LocalCategoryModel.findById(categoryId);
    if (!category)
      return res.status(404).json({ message: "Category not found" });

    if (category.countryCode !== req.user.countryCode) {
      return res
        .status(403)
        .json({ message: "Cannot update category from another country" });
    }

    category.name = name || category.name;
    await category.save();

    res.json(category);
  } catch (err) {
    res.status(500).json({ message: "Error updating category" });
  }
};

// -------- GROUP CONTROLLERS --------

// GET groups in a category
export const getGroups = async (req, res) => {
  const { id: categoryId } = req.params;
  try {
    const groups = await LocalGroupModel.find({ categoryId });
    res.json(groups);
  } catch (err) {
    res.status(500).json({ message: "Error fetching groups" });
  }
};

// CREATE groups (Admin only, supports array)
export const createGroup = async (req, res) => {
  if (checkAdmin(req, res)) return;

  const { id: categoryId } = req.params;
  let groups = req.body; // Can be single object or array

  try {
    const category = await LocalCategoryModel.findById(categoryId);
    if (!category)
      return res.status(404).json({ message: "Category not found" });

    if (category.countryCode !== req.user.countryCode) {
      return res
        .status(403)
        .json({ message: "Cannot create group in another country's category" });
    }

    // Normalize to array
    if (!Array.isArray(groups)) {
      groups = [groups];
    }

    // Format group objects
    const formatted = groups.map((g) => ({
      name: g.name,
      hscode: g.hscode,
      image: g.file.filename || null,
      categoryId,
    }));

    const newGroups = await LocalGroupModel.insertMany(formatted);
    res.status(201).json(newGroups);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error creating groups" });
  }
};

// UPDATE group (Admin only)
export const updateGroup = async (req, res) => {
  checkAdmin(req, res);

  const { groupId } = req.params;
  const { name, hscode, image } = req.body;

  try {
    const group = await LocalGroupModel.findById(groupId).populate(
      "categoryId"
    );
    if (!group) return res.status(404).json({ message: "Group not found" });

    if (group.categoryId.countryCode !== req.user.countryCode) {
      return res
        .status(403)
        .json({ message: "Cannot update group in another country's category" });
    }

    group.name = name || group.name;
    group.hscode = hscode || group.hscode;
    group.image = image || group.image;

    await group.save();
    res.json(group);
  } catch (err) {
    res.status(500).json({ message: "Error updating group" });
  }
};

// DELETE group (Admin only)
export const deleteGroup = async (req, res) => {
  checkAdmin(req, res);

  const { groupId } = req.params;

  try {
    const group = await LocalGroupModel.findById(groupId).populate(
      "categoryId"
    );
    if (!group) return res.status(404).json({ message: "Group not found" });

    if (group.categoryId.countryCode !== req.user.countryCode) {
      return res
        .status(403)
        .json({ message: "Cannot delete group in another country's category" });
    }

    await group.deleteOne();
    res.json({ message: "Group deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting group" });
  }
};
