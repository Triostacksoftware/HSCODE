import LocalCategoryModel from "../models/LocalCategory.js";
import LocalGroupModel from "../models/LocalGroup.js";
import { parseFile } from "../utilities/xlsx.util.js";

// -------- CATEGORY CONTROLLERS --------

// GET all categories
export const getCategories = async (req, res) => {
  try {
    const countryCode = req.user.countryCode;

    if (!countryCode) {
      return res.json([]);
    }

    let categories = await LocalCategoryModel.find({ countryCode });

    // TEMPORARY: If no categories exist for this country, create test data
    if (categories.length === 0) {
      // Create test categories for any country that doesn't have them
      const testCategories = [
        {
          name: "Live Animals",
          chapter: "01",
          countryCode: countryCode,
          adminId: req.user.id,
        },
        {
          name: "Meat And Edible Meat Offal",
          chapter: "02",
          countryCode: countryCode,
          adminId: req.user.id,
        },
        {
          name: "Fish; Crustaceans & Aquatic Invertebrates",
          chapter: "03",
          countryCode: countryCode,
          adminId: req.user.id,
        },
        {
          name: "Dairy Products; Birds Eggs; Honey",
          chapter: "04",
          countryCode: countryCode,
          adminId: req.user.id,
        },
        {
          name: "Products Of Animal Origin",
          chapter: "05",
          countryCode: countryCode,
          adminId: req.user.id,
        },
        {
          name: "Live Trees; Plants; Bulbs; Cut Flowers",
          chapter: "06",
          countryCode: countryCode,
          adminId: req.user.id,
        },
        {
          name: "Edible Vegetables And Roots",
          chapter: "07",
          countryCode: countryCode,
          adminId: req.user.id,
        },
        {
          name: "Edible Fruit And Nuts",
          chapter: "08",
          countryCode: countryCode,
          adminId: req.user.id,
        },
        {
          name: "Coffee; Tea; Mate And Spices",
          chapter: "09",
          countryCode: countryCode,
          adminId: req.user.id,
        },
        {
          name: "Cereals",
          chapter: "10",
          countryCode: countryCode,
          adminId: req.user.id,
        },
        {
          name: "Milling Products; Malt; Starch",
          chapter: "11",
          countryCode: countryCode,
          adminId: req.user.id,
        },
        {
          name: "Oil Seeds; Misc Grain; Seeds",
          chapter: "12",
          countryCode: countryCode,
          adminId: req.user.id,
        },
        {
          name: "Lac; Gums; Resins; Vegetable Saps",
          chapter: "13",
          countryCode: countryCode,
          adminId: req.user.id,
        },
        {
          name: "Vegetable Plaiting Materials",
          chapter: "14",
          countryCode: countryCode,
          adminId: req.user.id,
        },
      ];

      try {
        const createdCategories = await LocalCategoryModel.insertMany(
          testCategories
        );
        categories = createdCategories;
      } catch (createError) {
        console.error("Error creating test categories:", createError);
      }
    }

    res.json(categories);
  } catch (err) {
    console.error("Error in getCategories:", err);
    res.status(500).json({ message: "Error fetching categories" });
  }
};

// CREATE categories (Admin only)
export const createCategory = async (req, res) => {
  try {
    let { name, chapter } = req.body;
    const { id, countryCode } = req.user; // Admin ID & country

    const newCategory = await LocalCategoryModel.create({
      name,
      countryCode,
      adminId: id,
      chapter,
    });

    res.status(201).json({ message: "Category created successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error creating categories" });
  }
};

export const createManyCategory = async (req, res) => {
  try {
    const { id, countryCode } = req.user; // Admin ID & country
    const array = parseFile(req.file);

    const formatted = array.map((ob) => {
      return { name: ob.name, chapter: ob.chapter, countryCode, adminId: id };
    });

    const newCategory = await LocalCategoryModel.insertMany(formatted);

    res.status(201).json({ message: "Categories created successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error creating categories" });
  }
};

// DELETE category (Admin & correct country)
export const deleteCategory = async (req, res) => {
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
  const { id: categoryId } = req.params;
  const { name, chapter } = req.body;

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
    category.chapter = chapter || category.chapter;
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
    const groups = await LocalGroupModel.find({ categoryId }).populate(
      "categoryId",
      "chapter"
    );
    res.json(groups);
  } catch (err) {
    res.status(500).json({ message: "Error fetching groups" });
  }
};

// CREATE groups (Admin only, supports array)
export const createGroup = async (req, res) => {
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

    // Validate that category has chapter field
    if (!category.chapter) {
      return res.status(400).json({ message: "Category is missing chapter number" });
    }

    // Normalize to array
    if (!Array.isArray(groups)) {
      groups = [groups];
    }

    // Debug logging
    console.log("Category object:", category);
    console.log("Category chapter:", category.chapter);
    
    // Format group objects
    const formatted = groups.map((g) => ({
      name: g.name,
      heading: g.heading || g.hscode,
      image: req.file?.filename || null,
      chapterNumber: category.chapter || "00", // Save chapter number from category, fallback to "00"
      categoryId,
    }));

    const newGroups = await LocalGroupModel.insertMany(formatted);
    res.status(201).json(newGroups);
  } catch (err) {
    console.error("Error creating groups:", err);
    console.error("Error stack:", err.stack);
    
    // Check if it's a mongoose validation error
    if (err.name === 'ValidationError') {
      return res.status(400).json({ 
        message: "Validation error", 
        details: Object.values(err.errors).map(e => e.message) 
      });
    }
    
    res.status(500).json({ message: "Error creating groups", error: err.message });
  }
};

// CREATE MANY groups (Admin only, supports array)
export const createManyGroup = async (req, res) => {
  try {
    const { id, countryCode } = req.user; // Admin ID & country
    const group = parseFile(req.file);
    
    // Get category to access chapter number
    const category = await LocalCategoryModel.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    // Validate that category has chapter field
    if (!category.chapter) {
      return res.status(400).json({ message: "Category is missing chapter number" });
    }

    const formatted = group.map((g) => ({
      name: g.name,
      heading: g.heading || g.hscode,
      image: g.image,
      chapterNumber: g.chapter || category.chapter || "00", // Save chapter number from CSV or category, fallback to "00"
      categoryId: req.params.id,
    }));

    const newGroups = await LocalGroupModel.insertMany(formatted);

    res.status(201).json({ message: "Groups created successfully" });
  } catch (err) {
    console.error("Error bulk creating groups:", err);
    console.error("Error stack:", err.stack);
    
    // Check if it's a mongoose validation error
    if (err.name === 'ValidationError') {
      return res.status(400).json({ 
        message: "Validation error", 
        details: Object.values(err.errors).map(e => e.message) 
      });
    }
    
    res.status(500).json({ message: "Error creating groups", error: err.message });
  }
};

// UPDATE group (Admin only)
export const updateGroup = async (req, res) => {
  const { groupId } = req.params;
  const { name, heading, hscode, image } = req.body;

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
    group.heading = heading || hscode || group.heading;
    group.image = image || group.image;

    await group.save();
    res.json(group);
  } catch (err) {
    res.status(500).json({ message: "Error updating group" });
  }
};

// DELETE group (Admin only)
export const deleteGroup = async (req, res) => {
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

export const getAllGroups = async (req, res) => {
  try {
    const categories = await LocalCategoryModel.find({
      countryCode: req.user.countryCode,
    });

    const groups = await LocalGroupModel.find({
      categoryId: { $in: categories },
    });
    res.json(groups);
  } catch (err) {
    res.status(500).json({ message: "Error fetching groups" });
  }
};
