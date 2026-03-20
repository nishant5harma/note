// src/middlewares/__tests__/upload.middleware.supabase.unit.test.ts
import { mockSupabase } from "../../tests/common/mocks/supabase.mock.js";
import { jest, describe, it, expect, beforeEach } from "@jest/globals";
import express from "express";
import request from "supertest";
process.env.NODE_ENV = "production";
process.env.SUPABASE_URL = "http://localhost";
process.env.SUPABASE_KEY = "test-key";
process.env.SUPABASE_BUCKET = "images";
const { upload, uploadMulti } = await import("../upload.middleware.js");
describe("upload middleware (Supabase Mode)", () => {
    const app = express();
    app.post("/single", upload, (req, res) => res.json({ url: req.fileUrl }));
    app.post("/multi", uploadMulti("images", 2), (req, res) => res.json({ urls: req.fileUrls }));
    app.use((err, req, res, next) => {
        res.status(err.status || 500).json({ error: err.message });
    });
    beforeEach(() => {
        jest.clearAllMocks();
        // Setup default success state
        mockSupabase.upload.mockResolvedValue({
            data: { path: "test.png" },
            error: null,
        });
        mockSupabase.getPublicUrl.mockReturnValue({
            data: { publicUrl: "https://cdn.com/test.png" },
        });
    });
    it("uploads to Supabase cloud and returns public URL", async () => {
        const res = await request(app)
            .post("/single")
            .attach("image", Buffer.from("data"), "cloud.png");
        expect(res.status).toBe(200);
        expect(res.body.url).toBe("https://cdn.com/test.png");
        expect(mockSupabase.upload).toHaveBeenCalled();
    });
    it("handles multiple files for Supabase", async () => {
        const res = await request(app)
            .post("/multi")
            .attach("images", Buffer.from("1"), "1.png")
            .attach("images", Buffer.from("2"), "2.png");
        expect(res.status).toBe(200);
        expect(res.body.urls).toHaveLength(2);
        expect(mockSupabase.upload).toHaveBeenCalledTimes(2);
    });
    it("returns 500 when the cloud storage upload fails", async () => {
        const consoleSpy = jest
            .spyOn(console, "error")
            .mockImplementation(() => { });
        mockSupabase.upload.mockResolvedValueOnce({
            data: null,
            error: new Error("Cloud Storage Offline"),
        });
        const res = await request(app)
            .post("/single")
            .attach("image", Buffer.from("fail"), "fail.png");
        expect(res.status).toBe(500);
        expect(res.body.error).toBe("Upload failed");
        consoleSpy.mockRestore();
    });
});
//# sourceMappingURL=upload.middleware.supabase.unit.test.js.map