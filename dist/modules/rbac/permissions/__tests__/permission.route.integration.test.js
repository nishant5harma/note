// src/modules/rbac/permissions/__tests__/permission.route.integration.test.ts
import { jest, describe, it, expect, beforeEach } from "@jest/globals";
import request from "supertest";
import express from "express";
// 1. Mocks
const mockPermissionService = {
    createPermission: jest.fn(),
    listPermissions: jest.fn(),
    getPermissionById: jest.fn(),
    updatePermission: jest.fn(),
    deletePermission: jest.fn(),
};
jest.unstable_mockModule("../permissions.service.js", () => ({
    PermissionService: mockPermissionService,
    default: mockPermissionService,
}));
// Mock middleware to simulate a user with proper permissions
jest.unstable_mockModule("@/middlewares/require-premission.middleware.js", () => ({
    requirePermission: () => (req, res, next) => next(),
}));
const { PermissionRouter } = await import("../permissions.route.js");
const app = express();
app.use(express.json());
app.use("/permissions", PermissionRouter);
describe("Permission Routes (API)", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });
    describe("POST /permissions", () => {
        it("should return 201 on successful creation", async () => {
            const payload = { key: "valid:key", module: "test" };
            mockPermissionService.createPermission.mockResolvedValue({
                id: "1",
                ...payload,
            });
            const res = await request(app).post("/permissions").send(payload);
            expect(res.status).toBe(201);
            expect(res.body.key).toBe("valid:key");
        });
        it("should return 400 if key is too short", async () => {
            const res = await request(app).post("/permissions").send({ key: "ab" });
            expect(res.status).toBe(400);
        });
    });
    describe("PUT /permissions/:id", () => {
        it("should return 400 if the Zod schema fails for updates", async () => {
            const res = await request(app).put("/permissions/123").send({ key: "a" }); // Too short
            expect(res.status).toBe(400);
        });
    });
    describe("GET /permissions/:id", () => {
        it("should return 200 for existing permission", async () => {
            mockPermissionService.getPermissionById.mockResolvedValue({
                id: "123",
                key: "test",
            });
            const res = await request(app).get("/permissions/123");
            expect(res.status).toBe(200);
            expect(res.body.id).toBe("123");
        });
        it("should return 404 if permission does not exist", async () => {
            mockPermissionService.getPermissionById.mockResolvedValue(null);
            const res = await request(app).get("/permissions/999");
            expect(res.status).toBe(404);
        });
    });
    describe("DELETE /permissions/:id", () => {
        it("should return 204 on successful deletion", async () => {
            mockPermissionService.deletePermission.mockResolvedValue({});
            const res = await request(app).delete("/permissions/123");
            expect(res.status).toBe(204);
        });
    });
});
//# sourceMappingURL=permission.route.integration.test.js.map