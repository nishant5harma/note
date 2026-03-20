// src/middlewares/__tests__/upload.middleware.local.unit.test.ts
import { jest, describe, it, expect, beforeEach } from "@jest/globals";
import express from "express";
import request from "supertest";

// Mock Supabase to ensure no real network calls are attempted
jest.unstable_mockModule("@supabase/supabase-js", () => ({
  createClient: jest.fn(() => ({
    storage: { from: jest.fn() },
  })),
}));

process.env.NODE_ENV = "local";
const { upload, uploadMulti } = await import("../upload.middleware.js");

describe("upload middleware (Local Mode)", () => {
  const app = express();

  app.post("/single", upload, (req: any, res) =>
    res.json({ url: req.fileUrl })
  );
  app.post("/multi", uploadMulti("images", 3), (req: any, res) =>
    res.json({ urls: req.fileUrls })
  );

  app.use((err: any, req: any, res: any, next: any) => {
    res.status(err.status || 400).json({ error: err.message });
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("uploads image to local disk storage", async () => {
    const res = await request(app)
      .post("/single")
      .attach("image", Buffer.from("fake-data"), "test.png");

    expect(res.status).toBe(200);
    expect(res.body.url).toContain("/uploads/");
  });

  it("uploads multiple images to local disk storage", async () => {
    const res = await request(app)
      .post("/multi")
      .attach("images", Buffer.from("1"), "1.png")
      .attach("images", Buffer.from("2"), "2.png");

    expect(res.status).toBe(200);
    expect(res.body.urls).toHaveLength(2);
  });

  it("rejects non-image files (Validation Check)", async () => {
    const res = await request(app)
      .post("/single")
      .attach("image", Buffer.from("text"), "test.txt");

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Only JPG, PNG, WEBP images allowed");
  });
});
