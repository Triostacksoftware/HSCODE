import GlobalCategoryModel from "../models/GlobalCategory.js";

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
    const { name } = req.body;
    const newCategory = await GlobalCategoryModel.create({ name });
    res.status(201).json({ message: "Global category created successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error creating global category" });
  }
};

// UPDATE global category (Admin only)
export const updateGlobalCategory = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  try {
    const category = await GlobalCategoryModel.findById(id);
    if (!category)
      return res.status(404).json({ message: "Category not found" });
    category.name = name || category.name;
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
    const categories = await LocalCategoryModel.find({
      countryCode: req.user.countryCode,
    });

    const groups = await LocalGroupModel.find({
      categoryId: { $in: categories },
    });
    console.log("groups", groups);
    res.json(groups);
  } catch (err) {
    res.status(500).json({ message: "Error fetching groups" });
  }
};
