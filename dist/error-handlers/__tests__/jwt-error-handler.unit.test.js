// /src/error-handlers/__tests__/global.error-handler.unit.test.ts
import { jest, describe, it, expect } from "@jest/globals";
// Dynamic import the handler
const { jwtErrorHandler } = await import("../jwt.error-handler.js");
function mockRes() {
    return {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
    };
}
describe("jwtErrorHandler", () => {
    it("handles TokenExpiredError", () => {
        const err = { name: "TokenExpiredError" };
        const res = mockRes();
        jwtErrorHandler(err, {}, res, jest.fn());
        expect(res.status).toHaveBeenCalledWith(401);
    });
    it("passes through unknown errors", () => {
        const next = jest.fn();
        jwtErrorHandler(new Error("x"), {}, {}, next);
        expect(next).toHaveBeenCalled();
    });
    it("handles JsonWebTokenError", () => {
        const err = { name: "JsonWebTokenError" };
        const res = mockRes();
        jwtErrorHandler(err, {}, res, jest.fn());
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ error: "Invalid token" });
    });
    it("handles NotBeforeError", () => {
        const err = { name: "NotBeforeError" };
        const res = mockRes();
        jwtErrorHandler(err, {}, res, jest.fn());
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ error: "Token not active yet" });
    });
});
//# sourceMappingURL=jwt-error-handler.unit.test.js.map