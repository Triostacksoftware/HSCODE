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

// Serve chapter documents - returns the latest file for a chapter
router.get(
  "/chapter-document/:countryCode/:chapterNumber",
  authMiddleware,
  (req, res) => {
    try {
      const { countryCode, chapterNumber } = req.params;
      const fs = require("fs");
      const documentsPath = `public/Chapters/${countryCode}`;

      // Check if directory exists
      if (!fs.existsSync(documentsPath)) {
        return res.status(404).json({ message: "Chapter document not found" });
      }

      // Look for files matching the pattern: {countryCode}_Chapter_{number}_{timestamp}.pdf
      // Also support legacy format: {countryCode}_Chapter_{number}.pdf
      const chapterFilePattern = new RegExp(
        `^${countryCode}_Chapter_${chapterNumber}(?:_(\\d+))?\\.pdf$`
      );

      const files = fs.readdirSync(documentsPath);
      const matchingFiles = files
        .filter((file) => chapterFilePattern.test(file))
        .map((file) => {
          const fullPath = `${documentsPath}/${file}`;
          const stats = fs.statSync(fullPath);
          const match = file.match(chapterFilePattern);
          return {
            filename: file,
            path: fullPath,
            timestamp: match[1] ? parseInt(match[1]) : 0,
            lastModified: stats.mtime,
          };
        })
        .sort((a, b) => {
          // Sort by timestamp (newest first), then by lastModified
          if (a.timestamp !== b.timestamp) {
            return b.timestamp - a.timestamp;
          }
          return new Date(b.lastModified) - new Date(a.lastModified);
        });

      if (matchingFiles.length === 0) {
        return res.status(404).json({ message: "Chapter document not found" });
      }

      // Send the latest file
      const latestFile = matchingFiles[0];
      res.sendFile(latestFile.path, { root: process.cwd() });
    } catch (error) {
      console.error("Error retrieving chapter document:", error);
      res.status(500).json({ message: "Error retrieving chapter document" });
    }
  }
);

export default router;
