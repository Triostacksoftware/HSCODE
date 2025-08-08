import multer from "multer";
import fs from "fs";
import path from "path";

const LEAD_DOCS_DIR = path.join("public", "leadDocuments");

// Ensure destination directory exists
if (!fs.existsSync(LEAD_DOCS_DIR)) {
  fs.mkdirSync(LEAD_DOCS_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, LEAD_DOCS_DIR);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = file.originalname.split(".").pop();
    cb(null, `${file.fieldname}-${uniqueSuffix}.${ext}`);
  },
});

const leadDocsUpload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB per file
  },
});

export default leadDocsUpload;

