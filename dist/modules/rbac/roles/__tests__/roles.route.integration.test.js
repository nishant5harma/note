// src/modules/rbac/roles/__tests__/roles.route.integration.test.ts
import { jest, describe, it, expect, beforeEach } from "@jest/globals";
import request from "supertest";
import express from "express";
const mockRoleService = {
    createRole: jest.fn(),
    listRoles: jest.fn(),
    getRoleById: jest.fn(),
    updateRole: jest.fn(),
    deleteRole: jest.fn(),
    assignPermission: jest.fn(),
    removePermission: jest.fn(),
    getRolePermissions: jest.fn(),
    assignRoleToUser: jest.fn(),
    removeRoleFromUser: jest.fn(),
};
jest.unstable_mockModule("../roles.service.js", () => ({
    RoleService: mockRoleService,
    default: mockRoleService,
}));
jest.unstable_mockModule("@/middlewares/require-premission.middleware.js", () => ({
    requirePermission: () => (req, res, next) => next(),
}));
const { RolesRouter } = await import("../roles.route.js");
const app = express();
app.use(express.json());
app.use("/roles", RolesRouter);
describe("Role Routes (API)", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });
    describe("POST /roles", () => {
        it("should return 201 on valid input", async () => {
            mockRoleService.createRole.mockResolvedValue({ id: "r1", name: "Admin" });
            const res = await request(app).post("/roles").send({ name: "Admin" });
            expect(res.status).toBe(201);
        });
        it("should return 400 on validation error (name too short)", async () => {
            const res = await request(app).post("/roles").send({ name: "A" });
            expect(res.status).toBe(400);
        });
    });
    describe("PUT /roles/:id", () => {
        it("should return 200 on successful update", async () => {
            mockRoleService.updateRole.mockResolvedValue({
                id: "r1",
                name: "New Name",
            });
            const res = await request(app)
                .put("/roles/r1")
                .send({ name: "New Name" });
            expect(res.status).toBe(200);
        });
        it("should return 400 if validation fails on update", async () => {
            const res = await request(app).put("/roles/r1").send({ name: "A" });
            expect(res.status).toBe(400);
        });
    });
    describe("GET /roles/:id/permissions", () => {
        it("should return permission list", async () => {
            mockRoleService.getRolePermissions.mockResolvedValue([
                { permission: { key: "test:perm" } },
            ]);
            const res = await request(app).get("/roles/r1/permissions");
            expect(res.status).toBe(200);
            expect(res.body[0].permission.key).toBe("test:perm");
        });
    });
    describe("POST /roles/assign-to-user", () => {
        it("should call service with correct params", async () => {
            mockRoleService.assignRoleToUser.mockResolvedValue({
                userId: "u1",
                roleId: "r1",
            });
            const res = await request(app)
                .post("/roles/assign-to-user")
                .send({ userId: "u1", roleId: "r1" });
            expect(res.status).toBe(201);
            expect(mockRoleService.assignRoleToUser).toHaveBeenCalledWith("u1", "r1");
        });
    });
    describe("DELETE /roles/user/:userId/role/:roleId", () => {
        it("should return 200 on success", async () => {
            mockRoleService.removeRoleFromUser.mockResolvedValue({
                userId: "u1",
                roleId: "r1",
            });
            const res = await request(app).delete("/roles/user/u1/role/r1");
            expect(res.status).toBe(200);
        });
        it("should return 404 if one of the params is missing in URL path", async () => {
            // Testing missing roleId in the URL structure
            const res = await request(app).delete("/roles/user/user-1/role/");
            expect(res.status).toBe(404);
        });
    });
});
//# sourceMappingURL=roles.route.integration.test.js.map