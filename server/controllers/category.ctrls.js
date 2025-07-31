import LocalCategoryModel from "../models/LocalCategory.js";
import LocalGroupModel from "../models/LocalGroup.js";
import parseFileBuffer from "../utilities/xlsx.util.js";

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
  } catch (err) {
    res.status(500).json({ message: "Error fetching categories" });
  }
};

// CREATE categories (Admin only)
export const createCategory = async (req, res) => {
  if (checkAdmin(req, res)) return;

  try {
    let { name } = req.body;
    const { id, countryCode } = req.user; // Admin ID & country

    const newCategory = await LocalCategoryModel.insertOne({name, countryCode, countryCode});

    res.status(201).json({message: 'Category created successfully'});
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error creating categories" });
  }
};

export const createManyCategory = async (req, res) => {
  if (checkAdmin(req, res)) return;

  try {
    const { id, countryCode } = req.user; // Admin ID & country
    const array = parseFileBuffer(req.file.buffer);

    const formatted = array.map(ob => {
      return  {name: ob.name, countryCode, adminId: id}
    });

    const newCategory = await LocalCategoryModel.insertMany(formatted);

    res.status(201).json({message: 'Categories created successfully'});
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
      image: req.file?.filename || null,
      categoryId,
    }));

    const newGroups = await LocalGroupModel.insertMany(formatted);
    res.status(201).json(newGroups);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error creating groups" });
  }
};

// CREATE MANY groups (Admin only, supports array)
export const createManyGroup = async (req, res) => {
  if (checkAdmin(req, res)) return;

  try {
    const { id, countryCode } = req.user; // Admin ID & country
    const group = parseFileBuffer(req.file.buffer);

    const formatted = group.map(g =>(
      {
        name: g.name,
        hscode: g.hscode,
        image: req.image,
        categoryId,
      }
    ));

    const newGroups = await LocalGroupModel.insertMany(formatted);

    res.status(201).json({message: 'Groups created successfully'});
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error creating categories" });
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
