// src/middlewares/__tests__/auth.middleware.integration.test.ts
import { jest, describe, it, expect, beforeEach } from "@jest/globals";
import { userFactory, roleFactory, permissionFactory, } from "../../tests/common/factories/index.js";
// 1. Mock JWT
jest.unstable_mockModule("@/utils/jwt.utils.js", () => ({
    verifyAccessToken: jest.fn(),
}));
// 2. Dynamic imports
const { requireAuth } = await import("../auth.middleware.js");
const { verifyAccessToken } = await import("../../utils/jwt.utils.js");
const mockedVerify = verifyAccessToken;
describe("requireAuth Integration", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });
    const mockPayload = (sub) => ({
        sub,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600,
    });
    it("attaches user and flattens permissions from multiple roles", async () => {
        // ARRANGE
        const p1 = await permissionFactory.create({ key: "p1" });
        const p2 = await permissionFactory.create({ key: "p2" });
        const role1 = await roleFactory.create({ permissions: [p1] });
        const role2 = await roleFactory.create({ permissions: [p2] });
        const user = await userFactory.create({ roles: [role1, role2] });
        mockedVerify.mockReturnValue(mockPayload(user.id));
        const req = { headers: { authorization: "Bearer valid-token" } };
        const next = jest.fn();
        // ACT
        await requireAuth(req, {}, next);
        // ASSERT
        expect(req.user.id).toBe(user.id);
        expect(req.user.roleIds).toContain(role1.id);
        expect(req.user.roleIds).toContain(role2.id);
        expect(req.permissions.has("p1")).toBe(true);
        expect(req.permissions.has("p2")).toBe(true);
        expect(next).toHaveBeenCalledWith();
    });
    it("calls next with UnauthorizedError if user does not exist in DB", async () => {
        mockedVerify.mockReturnValue(mockPayload("non-existent-uuid"));
        const req = { headers: { authorization: "Bearer valid-token" } };
        const next = jest.fn();
        await requireAuth(req, {}, next);
        expect(next).toHaveBeenCalledWith(expect.objectContaining({ message: "User not found" }));
    });
    it("calls next with UnauthorizedError when token is missing", async () => {
        const req = { headers: {} };
        const next = jest.fn();
        await requireAuth(req, {}, next);
        expect(next).toHaveBeenCalledWith(expect.objectContaining({ status: 401, message: "Missing token" }));
    });
    it("calls next with UnauthorizedError if the token is expired", async () => {
        mockedVerify.mockImplementation(() => {
            throw new Error("jwt expired");
        });
        const req = { headers: { authorization: "Bearer expired-token" } };
        const next = jest.fn();
        await requireAuth(req, {}, next);
        expect(next).toHaveBeenCalledWith(expect.objectContaining({
            status: 401,
            message: "Invalid or expired token",
        }));
    });
});
//# sourceMappingURL=auth.middleware.integration.test.js.map