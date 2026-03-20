// src/modules/cold-call/upload/__tests__/upload.routes.integration.test.ts
import { describe, it, expect } from "@jest/globals";
import request from "supertest";
import XLSX from "xlsx";
import { createTestApp } from "@/tests/common/helpers/create-test-app.js";
import { createAuthContext } from "@/tests/common/helpers/auth-scenario.helper.js";

function makeExcel(): Buffer {
  const ws = XLSX.utils.aoa_to_sheet([
    ["Name", "Phone"],
    ["User", "123"],
  ]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
  return XLSX.write(wb, { type: "buffer", bookType: "xlsx" }) as Buffer;
}

describe("POST /api/coldcall/upload", () => {
  it("rejects unauthenticated requests", async () => {
    const app = await createTestApp();
    await request(app).post("/api/coldcall/upload").expect(401);
  });

  it("uploads file and returns batch summary", async () => {
    const { token } = await createAuthContext(["coldcall.upload"]);

    const app = await createTestApp();
    const res = await request(app)
      .post("/api/coldcall/upload")
      .set("Authorization", `Bearer ${token}`)
      .attach("file", makeExcel(), "test.xlsx")
      .expect(201);

    expect(res.body.ok).toBe(true);
    expect(res.body.data).toHaveProperty("batchId");
    expect(res.body.data.total).toBe(1);
  });

  it("fails when file is missing", async () => {
    const { token } = await createAuthContext(["coldcall.upload"]);

    const app = await createTestApp();
    const res = await request(app)
      .post("/api/coldcall/upload")
      .set("Authorization", `Bearer ${token}`)
      .expect(400);

    expect(res.body.error).toContain("file");
  });
});
