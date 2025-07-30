import express from "express";
import { authMiddleware } from "../middlewares/auth.mdware.js";
import {
  getCategories,
  createCategory,
  deleteCategory,
  updateCategory,
  getGroups,
  createGroup,
  updateGroup,
  deleteGroup,
} from "../controllers/category.ctrls.js";
import multer from "multer";

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // Make sure this directory exists
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname +
        "-" +
        uniqueSuffix +
        "." +
        file.originalname.split(".").pop()
    );
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed!"), false);
    }
  },
});

// Category routes
router.get("/", authMiddleware, getCategories);
router.post("/", authMiddleware, createCategory);
router.delete("/:id", authMiddleware, deleteCategory);
router.patch("/:id", authMiddleware, updateCategory);

// Group routes inside category
router.get("/:id/group", authMiddleware, getGroups);
router.post("/:id/group", authMiddleware, upload.single("file"), createGroup);
router.patch("/:id/group/:groupId", authMiddleware, updateGroup);
router.delete("/:id/group/:groupId", authMiddleware, deleteGroup);

export default router;
