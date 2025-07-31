import xlsx from "xlsx";
import fs from "fs";
import path from "path";

/**
 * Parses an uploaded Excel or CSV file into an array of objects.
 * @param {Object} file - Multer file object (req.file)
 * @returns {Array<Object>} Parsed rows as array of objects
 * @throws {Error} If file is missing or unsupported
 */
export function parseFile(file) {
  if (!file) {
    throw new Error("No file uploaded.");
  }

  const fileExtension = path.extname(file.originalname).toLowerCase();
  let records;

  if (fileExtension === ".csv") {
    const fileContent = fs.readFileSync(file.path, "utf8").replace(/^\uFEFF/, "");
    const rows = fileContent.trim().split("\n");
    const headers = rows.shift().split(",").map((h) => h.trim());

    records = rows.map((row) => {
      const values = row.split(",").map((v) => v.trim());
      return headers.reduce((obj, header, index) => {
        obj[header] = values[index];
        return obj;
      }, {});
    });
  } else if ([".xlsx", ".xls"].includes(fileExtension)) {
    const workbook = xlsx.readFile(file.path);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    records = xlsx.utils.sheet_to_json(sheet, { defval: "" });
  } else {
    fs.unlinkSync(file.path); // clean up file
    throw new Error("Unsupported file type. Please upload Excel or CSV.");
  }
  fs.unlinkSync(file.path);
  return records;
}
