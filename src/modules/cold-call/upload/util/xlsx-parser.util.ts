// /src/modules/cold-call/upload/util/excel-parser.util.ts
import XLSX from "xlsx";

/**
 * parseExcelBuffer
 * - Accepts Buffer | Uint8Array | ArrayBuffer
 * - Supports XLSX, XLS, CSV
 * - Async for large file handling
 * - Safe under strict mode
 */
export async function parseXlsxBuffer(data: Buffer | Uint8Array | ArrayBuffer) {
  // Normalize to buffer for XLSX.read
  let buffer: Buffer;

  if (Buffer.isBuffer(data)) {
    buffer = data;
  } else if (data instanceof Uint8Array) {
    buffer = Buffer.from(data.buffer, data.byteOffset, data.byteLength);
  } else if (data instanceof ArrayBuffer) {
    buffer = Buffer.from(data);
  } else {
    throw new Error("Unsupported buffer type for Excel parsing");
  }

  // Allow event loop to process (non-blocking for large files)
  await new Promise((resolve) => setImmediate(resolve));

  // Read workbook from buffer
  const workbook = XLSX.read(buffer, { type: "buffer", cellDates: true });

  // Pick first sheet
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) return [];

  const sheet = workbook.Sheets[sheetName];
  if (!sheet) return [];

  // Convert to JSON with header row mapping
  const rows = XLSX.utils.sheet_to_json<Record<string, any>>(sheet, {
    header: 1, // raw array of rows (first row is header)
    defval: null, // missing cells become null
    blankrows: false,
  });

  if (rows.length === 0) return [];

  // Find header row (in case first row is empty)
  let headerIndex = 0;
  let header = rows[0] as any[];

  // Try to find a better header row if first row is mostly empty
  if (
    !header ||
    header.filter((v) => v != null && String(v).trim()).length <= 1
  ) {
    for (let i = 0; i < Math.min(5, rows.length); i++) {
      const row = rows[i] as any[];
      if (row && row.filter((v) => v != null && String(v).trim()).length > 1) {
        headerIndex = i;
        header = row;
        break;
      }
    }
  }

  const dataRows = rows.slice(headerIndex + 1);
  const normalizedRows: any[] = [];

  for (let i = 0; i < dataRows.length; i++) {
    const rowArray = dataRows[i] as any[];
    if (!rowArray || rowArray.every((v) => v == null || v === "")) continue;

    const obj: Record<string, any> = {};
    for (let c = 0; c < header.length; c++) {
      const raw = header[c];
      const key =
        raw == null || raw === ""
          ? `col_${c + 1}`
          : String(raw)
              .trim()
              .toLowerCase()
              .replace(/\s+/g, "_")
              .replace(/[^\w_]/g, "") || `col_${c + 1}`;
      obj[key] = rowArray[c] ?? null;
    }

    // Apply normalization
    const normalized: any = {
      __rowNum__: headerIndex + i + 2, // Actual Excel row number
      payload: obj,
    };

    const phoneKeys = [
      "phone",
      "phone_number",
      "mobile",
      "mobile_number",
      "contact",
      "contact_number",
    ];
    const emailKeys = ["email", "email_address", "e-mail", "e_mail"];
    const nameKeys = [
      "name",
      "full_name",
      "fullname",
      "first_name",
      "firstname",
    ];

    // Exact match first
    for (const k of Object.keys(obj)) {
      const low = k.toLowerCase();
      const v = obj[k];
      if (!normalized.phone && phoneKeys.includes(low)) normalized.phone = v;
      if (!normalized.email && emailKeys.includes(low)) normalized.email = v;
      if (!normalized.name && nameKeys.includes(low)) normalized.name = v;
    }

    // Fuzzy fallback if exact match not found
    if (!normalized.phone) {
      for (const k of Object.keys(obj)) {
        const low = k.toLowerCase();
        if (
          low.includes("phone") ||
          low.includes("mobile") ||
          low.includes("contact")
        ) {
          normalized.phone = obj[k];
          break;
        }
      }
    }

    if (!normalized.email) {
      for (const k of Object.keys(obj)) {
        const low = k.toLowerCase();
        if (low.includes("email") || low.includes("mail")) {
          normalized.email = obj[k];
          break;
        }
      }
    }

    if (!normalized.name) {
      for (const k of Object.keys(obj)) {
        const low = k.toLowerCase();
        if (low.includes("name")) {
          normalized.name = obj[k];
          break;
        }
      }
    }

    normalizedRows.push(normalized);
  }

  return normalizedRows;
}
