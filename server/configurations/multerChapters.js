import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { dirname } from "path";

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configure multer for chapter document uploads
const chapterStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    try {
      // Get country code from authenticated user
      const countryCode = req.user?.countryCode || "DEFAULT";

      // Create country-specific folder path using path.join for cross-platform compatibility
      const uploadPath = path.join(
        process.cwd(),
        "public",
        "Chapters",
        countryCode
      );

      // Create directory if it doesn't exist
      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
        console.log(`Created directory: ${uploadPath}`);
      }

      cb(null, uploadPath);
    } catch (error) {
      console.error("Error creating directory:", error);
      cb(error);
    }
  },
  filename: function (req, file, cb) {
    try {
      // Get chapter number from request - add debugging
      console.log("Multer filename function - req.body:", req.body);
      console.log("Multer filename function - req.params:", req.params);

      // For multer, req.body might not be available yet during filename generation
      // We'll use a timestamp-based filename and let the controller handle the rename
      const countryCode = req.user?.countryCode || "DEFAULT";
      const timestamp = Date.now();
      const tempFilename = `${countryCode}_Chapter_temp_${timestamp}.pdf`;

      console.log(`Saving chapter document as temporary file: ${tempFilename}`);
      cb(null, tempFilename);
    } catch (error) {
      console.error("Error generating filename:", error);
      cb(error);
    }
  },
});

// File filter to only allow PDFs
const chapterFileFilter = (req, file, cb) => {
  if (file.mimetype === "application/pdf") {
    cb(null, true);
  } else {
    cb(new Error("Only PDF files are allowed for chapter documents"), false);
  }
};

const uploadChapterDoc = multer({
  storage: chapterStorage,
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB limit for PDF documents
  },
  fileFilter: chapterFileFilter,
});

export default uploadChapterDoc;
