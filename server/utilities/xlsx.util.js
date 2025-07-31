import xlsx from 'xlsx'

function parseFileBuffer(buffer) {
  // Read the workbook from buffer
  const workbook = xlsx.read(buffer, { type: 'buffer' });

  // Get the first sheet name (works for CSV and Excel)
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];

  // Convert to array of objects
  const rows = xlsx.utils.sheet_to_json(worksheet, {
    defval: '' // Set default value for empty cells (optional)
  });

  return rows;
}

export default parseFileBuffer;