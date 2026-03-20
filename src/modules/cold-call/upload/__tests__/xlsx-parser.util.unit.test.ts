// src/modules/cold-call/upload/__tests__/xlsx-parser.util.unit.test.ts
import { describe, it, expect } from "@jest/globals";
import XLSX from "xlsx";
import { parseXlsxBuffer } from "../util/xlsx-parser.util.js";

function makeWorkbook(rows: any[][]): Buffer {
  const ws = XLSX.utils.aoa_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
  return XLSX.write(wb, { type: "buffer", bookType: "xlsx" }) as Buffer;
}

describe("parseXlsxBuffer", () => {
  it("returns empty array for empty sheet", async () => {
    const buf = makeWorkbook([]);
    const rows = await parseXlsxBuffer(buf);
    expect(rows).toEqual([]);
  });

  it("parses rows and normalizes phone/email/name", async () => {
    const buf = makeWorkbook([
      ["Name", "Phone Number", "Email"],
      ["John Doe", "+91 99999 88888", "JOHN@EXAMPLE.COM"],
    ]);

    const rows = await parseXlsxBuffer(buf);

    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      name: "John Doe",
      phone: "+91 99999 88888",
      email: "JOHN@EXAMPLE.COM",
    });
    expect(rows[0].__rowNum__).toBe(2);
  });

  it("handles missing headers by generating col_* keys", async () => {
    const buf = makeWorkbook([
      ["", "", ""],
      ["Name", "Phone", "Email"],
      ["Alice", "12345", "a@b.com"],
    ]);

    const rows = await parseXlsxBuffer(buf);
    expect(rows).toHaveLength(1);
    expect(rows[0].payload).toEqual({
      name: "Alice",
      phone: "12345",
      email: "a@b.com",
    });
  });

  it("skips fully empty rows", async () => {
    const buf = makeWorkbook([
      ["Name", "Phone"],
      ["Bob", "123"],
      [null, null],
    ]);

    const rows = await parseXlsxBuffer(buf);
    expect(rows).toHaveLength(1);
  });
});
