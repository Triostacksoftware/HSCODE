import express from "express";
import fs from "fs";
import path from "path";
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

// Serve chapter documents - returns all files for a chapter as JSON, or a specific file if filename is provided
router.get(
  "/chapter-document/:countryCode/:chapterNumber",
  authMiddleware,
  (req, res) => {
    try {
      const { countryCode, chapterNumber } = req.params;
      const { filename: queryFilename } = req.query;
      
      // Use path.join for proper cross-platform path handling
      const documentsPath = path.join(process.cwd(), "public", "Chapters", countryCode);
      
      console.log("Fetching chapter documents:", { countryCode, chapterNumber, documentsPath });

      // Check if directory exists - return empty array instead of 404
      if (!fs.existsSync(documentsPath)) {
        console.log(`Directory does not exist: ${documentsPath}`);
        return res.status(200).json({
          success: true,
          chapterNumber,
          countryCode,
          files: [],
        });
      }

      // Look for files matching the pattern: {countryCode}_Chapter_{number}_{customName}.pdf
      // Supports new format (with custom name) and legacy format (with timestamp or no suffix)
      const chapterFilePattern = new RegExp(
        `^${countryCode}_Chapter_${chapterNumber}(?:_(.+))?\\.pdf$`
      );

      let files = [];
      try {
        files = fs.readdirSync(documentsPath);
        console.log(`Found ${files.length} files in directory:`, files);
      } catch (readError) {
        console.error("Error reading directory:", readError);
        return res.status(200).json({
          success: true,
          chapterNumber,
          countryCode,
          files: [],
        });
      }

      const matchingFiles = files
        .filter((file) => {
          const matches = chapterFilePattern.test(file);
          if (matches) {
            console.log(`File matches pattern: ${file}`);
          }
          return matches;
        })
        .map((file) => {
          try {
            const fullPath = path.join(documentsPath, file);
            const stats = fs.statSync(fullPath);
            const match = file.match(chapterFilePattern);
            return {
              filename: file,
              customName: match && match[1] ? match[1] : '',
              path: fullPath,
              url: `Chapters/${countryCode}/${file}`,
              size: stats.size,
              lastModified: stats.mtime,
            };
          } catch (fileError) {
            console.error(`Error processing file ${file}:`, fileError);
            return null;
          }
        })
        .filter(file => file !== null) // Remove any null entries from errors
        .sort((a, b) => {
          // Sort by custom name alphabetically
          return a.customName.localeCompare(b.customName);
        });

      console.log(`Found ${matchingFiles.length} matching files for chapter ${chapterNumber}`);

      // Return empty array if no files found (don't return 404, as this is a valid state)
      if (matchingFiles.length === 0) {
        return res.status(200).json({
          success: true,
          chapterNumber,
          countryCode,
          files: [],
        });
      }

      // If a specific filename is requested via query parameter, return that file
      if (queryFilename) {
        const decodedFilename = decodeURIComponent(queryFilename);
        const requestedFile = matchingFiles.find(f => f.filename === decodedFilename);
        if (requestedFile) {
          return res.sendFile(requestedFile.path, { root: process.cwd() });
        }
        return res.status(404).json({ message: "Requested file not found" });
      }

      // Otherwise, return all files as JSON
      res.status(200).json({
        success: true,
        chapterNumber,
        countryCode,
        files: matchingFiles,
      });
    } catch (error) {
      console.error("Error retrieving chapter document:", error);
      console.error("Error stack:", error.stack);
      res.status(500).json({ 
        message: "Error retrieving chapter document",
        error: error.message 
      });
    }
  }
);

export default router;
