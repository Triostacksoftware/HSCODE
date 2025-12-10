import LocalGroupModel from "../models/LocalGroup.js";
import { parseFile } from "../utilities/xlsx.util.js";
import fs from "fs";
import path from "path";

// GET groups (can filter by chapter number)
export const getGroups = async (req, res) => {
  try {
    const { chapterNumber, countryCode } = req.query;
    console.log("Query params:", { chapterNumber, countryCode });
    const userCountryCode = req.user.countryCode;

    let query = {};

    // If chapter number provided, filter by it
    if (chapterNumber) {
      query.chapterNumber = chapterNumber;
    }

    // If countryCode is provided in query (for superadmin), use that
    // Otherwise, use the user's own country code
    if (countryCode) {
      query.countryCode = countryCode;
    } else if (userCountryCode) {
      query.countryCode = userCountryCode;
    }

    console.log("Final query:", query);

    const groups = await LocalGroupModel.find(query)
      .populate("members", "name email image")
      .select("_id name heading image chapterNumber countryCode members");
    res.json(groups);
  } catch (err) {
    console.error("Error fetching groups:", err);
    res.status(500).json({ message: "Error fetching groups" });
  }
};

// GET single group by ID with members
export const getGroupById = async (req, res) => {
  try {
    const { groupId } = req.params;

    const group = await LocalGroupModel.findById(groupId)
      .populate("members", "name email image")
      .select("_id name heading image chapterNumber countryCode members");

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    res.json(group);
  } catch (err) {
    console.error("Error fetching group by ID:", err);
    res.status(500).json({ message: "Error fetching group" });
  }
};

// CREATE group directly (Admin only)
export const createGroup = async (req, res) => {
  try {
    const { name, heading, chapterNumber } = req.body;
    const { countryCode } = req.user;

    // Handle image file
    const image = req.file ? req.file.filename : null;

    // Validate required fields
    if (!name || !heading || !chapterNumber) {
      return res.status(400).json({
        message:
          "Missing required fields: name, heading, and chapterNumber are required",
      });
    }

    const newGroup = new LocalGroupModel({
      name,
      heading,
      image,
      chapterNumber,
      countryCode,
      members: [],
      categoryId: null, // No category ID needed
    });

    await newGroup.save();
    res.status(201).json(newGroup);
  } catch (err) {
    console.error("Error creating group:", err);

    // Check if it's a mongoose validation error
    if (err.name === "ValidationError") {
      return res.status(400).json({
        message: "Validation error",
        details: Object.values(err.errors).map((e) => e.message),
      });
    }

    res
      .status(500)
      .json({ message: "Error creating group", error: err.message });
  }
};

// CREATE MANY groups directly (Admin only)
export const createManyGroup = async (req, res) => {
  try {
    console.log("🚀 Starting bulk local group creation...");
    console.log("👤 User countryCode:", req.user?.countryCode);
    console.log(
      "📁 File received:",
      req.file
        ? {
            originalname: req.file.originalname,
            mimetype: req.file.mimetype,
            size: req.file.size,
          }
        : "No file"
    );
    console.log("📋 Request body:", req.body);

    const { countryCode } = req.user;

    if (!req.file) {
      console.error("❌ No file uploaded");
      return res.status(400).json({ message: "No file uploaded" });
    }

    const groups = parseFile(req.file);
    console.log("📊 Parsed groups count:", groups.length);
    console.log("📊 First few groups:", groups.slice(0, 3));

    if (!groups || groups.length === 0) {
      console.error("❌ No groups found in file");
      return res.status(400).json({ message: "No valid groups found in file" });
    }

    const formatted = groups.map((g, index) => {
      const formattedGroup = {
        name: g.name,
        heading: g.heading || g.hscode,
        image: g.image,
        chapterNumber: req.body.chapter,
        countryCode,
        members: [],
      };
      console.log(`📝 Group ${index + 1}:`, formattedGroup);
      return formattedGroup;
    });

    // Validate that all required fields are present
    const validGroups = formatted.filter((g) => {
      const isValid = g.name && g.heading && g.chapterNumber;
      if (!isValid) {
        console.log("❌ Invalid group filtered out:", g);
      }
      return isValid;
    });

    console.log("✅ Valid groups count:", validGroups.length);
    console.log("✅ Valid groups:", validGroups);

    if (validGroups.length === 0) {
      console.error("❌ No valid groups found after validation");
      return res
        .status(400)
        .json({ message: "No valid groups found after validation" });
    }

    console.log("💾 Inserting groups into database...");
    const newGroups = await LocalGroupModel.insertMany(validGroups);
    console.log("✅ Successfully created groups:", newGroups.length);

    res.status(201).json({
      message: "Groups created successfully",
      count: newGroups.length,
    });
  } catch (err) {
    console.error("❌ Error bulk creating groups:", err);
    console.error("❌ Error stack:", err.stack);

    // Check if it's a mongoose validation error
    if (err.name === "ValidationError") {
      console.error(
        "❌ Validation errors:",
        Object.values(err.errors).map((e) => e.message)
      );
      return res.status(400).json({
        message: "Validation error",
        details: Object.values(err.errors).map((e) => e.message),
      });
    }

    res
      .status(500)
      .json({ message: "Error creating groups", error: err.message });
  }
};

// UPDATE group (Admin only)
export const updateGroup = async (req, res) => {
  const { groupId } = req.params;
  const { name, heading, chapterNumber, image } = req.body;

  try {
    const group = await LocalGroupModel.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    // Check if user can modify this group (same country)
    if (group.countryCode !== req.user.countryCode) {
      return res.status(403).json({
        message: "Cannot modify group from another country",
      });
    }

    // Update fields
    if (name) group.name = name;
    if (heading) group.heading = heading;
    if (chapterNumber) group.chapterNumber = chapterNumber;
    if (image) group.image = image;

    await group.save();
    res.json(group);
  } catch (err) {
    console.error("Error updating group:", err);
    res.status(500).json({ message: "Error updating group" });
  }
};

// DELETE group (Admin only)
export const deleteGroup = async (req, res) => {
  const { groupId } = req.params;

  try {
    const group = await LocalGroupModel.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    // Check if user can delete this group (same country)
    if (group.countryCode !== req.user.countryCode) {
      return res.status(403).json({
        message: "Cannot delete group from another country",
      });
    }

    await group.deleteOne();
    res.json({ message: "Group deleted successfully" });
  } catch (err) {
    console.error("Error deleting group:", err);
    res.status(500).json({ message: "Error deleting group" });
  }
};

// GET all groups for admin
export const getAllGroups = async (req, res) => {
  try {
    const groups = await LocalGroupModel.find({
      countryCode: req.user.countryCode,
    }).select("_id name heading image chapterNumber countryCode members");
    res.json(groups);
  } catch (err) {
    console.error("Error fetching all groups:", err);
    res.status(500).json({ message: "Error fetching groups" });
  }
};

// GET available chapter documents (Admin only)
export const getChapterDocuments = async (req, res) => {
  try {
    const { countryCode } = req.user;
    const documentsPath = `public/Chapters/${countryCode}`;

    console.log(`Looking for chapter documents in: ${documentsPath}`);

    // Check if directory exists
    if (!fs.existsSync(documentsPath)) {
      console.log(`Directory does not exist: ${documentsPath}`);
      return res.status(200).json({
        success: true,
        documents: [],
      });
    }

    // Read directory and get only chapter document files
    const files = fs.readdirSync(documentsPath);
    console.log(`Found files in directory:`, files);

    // Look for files matching the pattern: {countryCode}_Chapter_{number}_{customName}.pdf
    // Supports: 
    // - New format: IN_Chapter_01_Export.pdf, IN_Chapter_01_Import.pdf
    // - Legacy format: IN_Chapter_01_1234567890.pdf (timestamp only)
    // - Legacy format: IN_Chapter_01.pdf (no suffix)
    const chapterFilePattern = new RegExp(
      `^${countryCode}_Chapter_(\\d+)(?:_(.+))?\\.pdf$`
    );

    const pdfFiles = files
      .filter((file) => {
        const matches = chapterFilePattern.test(file);
        console.log(`File ${file} matches pattern:`, matches);
        return matches;
      })
      .map((file) => {
        console.log(`Processing chapter document: ${file}`);
        // Extract chapter number from filename (e.g., IN_Chapter_3_1234567890.pdf -> 3)
        const match = file.match(chapterFilePattern);
        console.log(`Regex match for ${file}:`, match);

        const fullPath = `${documentsPath}/${file}`;
        const stats = fs.statSync(fullPath);

        return {
          filename: file,
          chapterNumber: match[1], // Chapter number
          customName: match[2] || null, // Custom name (Export, Import, etc.) or timestamp for legacy files
          path: `Chapters/${countryCode}/${file}`,
          size: stats.size,
          lastModified: stats.mtime,
        };
      })
      .sort((a, b) => {
        // Sort by chapter number first, then by custom name alphabetically
        const chapterDiff =
          parseInt(a.chapterNumber) - parseInt(b.chapterNumber);
        if (chapterDiff !== 0) return chapterDiff;
        // If same chapter, sort by custom name alphabetically
        const nameA = a.customName || '';
        const nameB = b.customName || '';
        return nameA.localeCompare(nameB);
      });

    console.log(
      `Found ${pdfFiles.length} chapter documents for ${countryCode}:`,
      pdfFiles
    );

    res.status(200).json({
      success: true,
      documents: pdfFiles,
    });
  } catch (error) {
    console.error("Error fetching chapter documents:", error);
    res.status(500).json({
      message: "Error fetching chapter documents",
      error: error.message,
    });
  }
};

// RENAME chapter document (Admin only)
export const renameChapterDocument = async (req, res) => {
  try {
    const { filename } = req.params;
    const { newName } = req.body;
    const { countryCode } = req.user;

    if (!filename) {
      return res.status(400).json({
        message: "Filename is required",
      });
    }

    if (!newName) {
      return res.status(400).json({
        message: "New name is required",
      });
    }

    // Decode filename in case it was URL encoded
    const decodedFilename = decodeURIComponent(filename);

    // Security check: ensure filename belongs to the user's country
    if (!decodedFilename.startsWith(countryCode)) {
      return res.status(403).json({
        message: "Unauthorized: Cannot rename files from other countries",
      });
    }

    // Sanitize the new name
    let sanitizedNewName = newName.replace(/[^a-zA-Z0-9_-]/g, '_');
    if (!sanitizedNewName || sanitizedNewName.trim() === '') {
      return res.status(400).json({
        message: "Invalid new name",
      });
    }

    // Extract chapter number from current filename
    // Pattern: {countryCode}_Chapter_{number}_{oldName}.pdf
    const filenamePattern = new RegExp(`^${countryCode}_Chapter_(\\d+)(?:_(.+))?\\.pdf$`);
    const match = decodedFilename.match(filenamePattern);

    if (!match) {
      return res.status(400).json({
        message: "Invalid filename format",
      });
    }

    const chapterNumber = match[1];
    const oldPath = path.join(process.cwd(), "public", "Chapters", countryCode, decodedFilename);
    const newFilename = `${countryCode}_Chapter_${chapterNumber}_${sanitizedNewName}.pdf`;
    const newPath = path.join(process.cwd(), "public", "Chapters", countryCode, newFilename);

    // Check if old file exists
    if (!fs.existsSync(oldPath)) {
      return res.status(404).json({
        message: "File not found",
      });
    }

    // Check if new filename already exists
    if (fs.existsSync(newPath) && decodedFilename !== newFilename) {
      return res.status(400).json({
        message: "A file with this name already exists",
      });
    }

    // Rename the file
    fs.renameSync(oldPath, newPath);
    console.log(`Chapter document renamed from ${decodedFilename} to ${newFilename}`);

    res.status(200).json({
      success: true,
      message: "Chapter document renamed successfully",
      oldFilename: decodedFilename,
      newFilename: newFilename,
      chapterNumber,
      countryCode,
    });
  } catch (error) {
    console.error("Error renaming chapter document:", error);
    res.status(500).json({
      message: "Error renaming chapter document",
      error: error.message,
    });
  }
};

// DELETE chapter document (Admin only)
export const deleteChapterDocument = async (req, res) => {
  try {
    const { filename } = req.params;
    const { countryCode } = req.user;

    if (!filename) {
      return res.status(400).json({
        message: "Filename is required",
      });
    }

    // Decode filename in case it was URL encoded
    const decodedFilename = decodeURIComponent(filename);

    // Security check: ensure filename belongs to the user's country
    if (!decodedFilename.startsWith(countryCode)) {
      return res.status(403).json({
        message: "Unauthorized: Cannot delete files from other countries",
      });
    }

    const filePath = `public/Chapters/${countryCode}/${decodedFilename}`;

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        message: "Chapter document not found",
      });
    }

    // Delete the file
    fs.unlinkSync(filePath);
    console.log(`Chapter document deleted: ${decodedFilename}`);

    res.status(200).json({
      success: true,
      message: "Chapter document deleted successfully",
      deletedFile: decodedFilename,
    });
  } catch (error) {
    console.error("Error deleting chapter document:", error);
    res.status(500).json({
      message: "Error deleting chapter document",
      error: error.message,
    });
  }
};

// UPLOAD chapter document (Admin only)
export const uploadChapterDocument = async (req, res) => {
  try {
    const { chapterNumber, fileName } = req.body;
    const { countryCode } = req.user;

    // Debug logging
    console.log("Upload controller - req.body:", req.body);
    console.log("Upload controller - chapterNumber:", chapterNumber);
    console.log("Upload controller - fileName:", fileName);
    console.log("Upload controller - countryCode:", countryCode);

    // Validate required fields
    if (!chapterNumber) {
      console.error("Chapter number validation failed:", chapterNumber);
      return res.status(400).json({
        message: "Chapter number is required",
      });
    }

    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        message: "No file uploaded",
      });
    }

    // File info
    const uploadedFile = req.file;

    // Use custom file name if provided, otherwise use timestamp
    // Sanitize the file name to remove any invalid characters
    let customName = fileName || `file_${Date.now()}`;
    // Remove any characters that aren't alphanumeric, underscore, or hyphen
    customName = customName.replace(/[^a-zA-Z0-9_-]/g, '_');
    // Ensure it's not empty
    if (!customName || customName.trim() === '') {
      customName = `file_${Date.now()}`;
    }

    // Rename the file with custom name: {countryCode}_Chapter_{number}_{customName}.pdf
    const oldPath = uploadedFile.path;
    const newFilename = `${countryCode}_Chapter_${chapterNumber}_${customName}.pdf`;
    const newPath = oldPath.replace(uploadedFile.filename, newFilename);

    // Use the already imported fs module

    try {
      // Rename the file
      fs.renameSync(oldPath, newPath);
      console.log(
        `Chapter document renamed from ${uploadedFile.filename} to ${newFilename}`
      );

      const documentPath = `Chapters/${countryCode}/${newFilename}`;
      console.log(`Chapter document uploaded: ${documentPath}`);

      // Return success with file info
      res.status(200).json({
        success: true,
        message: "Chapter document uploaded successfully",
        documentPath,
        fileName: newFilename,
        chapterNumber,
        countryCode,
      });
    } catch (renameError) {
      console.error("Error renaming file:", renameError);
      // If rename fails, delete the temporary file
      try {
        fs.unlinkSync(oldPath);
      } catch (deleteError) {
        console.error("Error deleting temporary file:", deleteError);
      }

      res.status(500).json({
        message: "Error processing uploaded file",
        error: renameError.message,
      });
    }
  } catch (err) {
    console.error("Error uploading chapter document:", err);
    res.status(500).json({
      message: "Error uploading chapter document",
      error: err.message,
    });
  }
};
