import express from "express";
import { adminMiddleware, authMiddleware } from "../middlewares/auth.mdware.js";
import {
  getGroups,
  getGroupById,
  createGroup,
  updateGroup,
  deleteGroup,
  createManyGroup,
  getAllGroups,
  uploadChapterDocument,
  getChapterDocuments,
  deleteChapterDocument,
} from "../controllers/groups.ctrls.js";
import upload from "../configurations/multer.js";
import uploadChapterDoc from "../configurations/multerChapters.js";

const router = express.Router();

// Direct group routes (admin only)
router.get("/", authMiddleware, getGroups);

// Get all groups for admin
router.get("/all", adminMiddleware, getAllGroups);

// Upload chapter document (Admin only)
router.post(
  "/chapter-document",
  adminMiddleware,
  uploadChapterDoc.single("chapterDocument"),
  uploadChapterDocument
);

// Get available chapter documents (Admin only)
router.get("/chapter-documents", adminMiddleware, getChapterDocuments);

// Delete chapter document (Admin only) - accepts filename as parameter
router.delete(
  "/chapter-document/:filename",
  adminMiddleware,
  deleteChapterDocument
);

// Group ID routes (must come after specific routes)
router.get("/:groupId", authMiddleware, getGroupById);
router.post("/", adminMiddleware, upload.single("file"), createGroup);
router.post("/many", adminMiddleware, upload.single("file"), createManyGroup);
router.patch("/:groupId", adminMiddleware, updateGroup);
router.delete("/:groupId", adminMiddleware, deleteGroup);

// Serve chapter documents
router.get(
  "/chapter-document/:countryCode/:chapterNumber",
  authMiddleware,
  (req, res) => {
    try {
      const { countryCode, chapterNumber } = req.params;
      const filePath = `public/Chapters/${countryCode}/${countryCode}_Chapter_${chapterNumber}.pdf`;

      // Check if file exists
      const fs = require("fs");
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ message: "Chapter document not found" });
      }

      // Send file
      res.sendFile(filePath, { root: process.cwd() });
    } catch (error) {
      console.error("Error retrieving chapter document:", error);
      res.status(500).json({ message: "Error retrieving chapter document" });
    }
  }
);

export default router;
