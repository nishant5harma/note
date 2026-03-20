// src/error-handlers/__tests__/global.error-handler.unit.test.ts
import { jest, describe, it, expect, beforeEach, afterEach, } from "@jest/globals";
// Dynamic import the handler to ensure it works in ESM
const { globalErrorHandler } = await import("../global.error-handler.js");
function mockRes() {
    return {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
    };
}
describe("globalErrorHandler", () => {
    let consoleSpy;
    beforeEach(() => {
        // Suppress console.error output and capture calls
        consoleSpy = jest.spyOn(console, "error").mockImplementation(() => { });
    });
    afterEach(() => {
        // Restore the original console.error behavior
        consoleSpy.mockRestore();
    });
    it("uses provided status/message/details", () => {
        const err = { status: 400, message: "Bad", details: { a: 1 } };
        const res = mockRes();
        globalErrorHandler(err, {}, res, jest.fn());
        // Verify status and response
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: "Bad",
            details: { a: 1 },
        });
        // Verify that the error was actually logged
        expect(consoleSpy).toHaveBeenCalledWith("Global Error:", err);
    });
    it("defaults to 500 if no status", () => {
        const res = mockRes();
        const error = new Error("boom");
        globalErrorHandler(error, {}, res, jest.fn());
        expect(res.status).toHaveBeenCalledWith(500);
        expect(consoleSpy).toHaveBeenCalledWith("Global Error:", error);
    });
    it("defaults to 'Internal server error' if error object has no message", () => {
        const res = mockRes();
        const emptyErr = {}; // No status, no message
        globalErrorHandler(emptyErr, {}, res, jest.fn());
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            message: "Internal server error",
        }));
    });
});
//# sourceMappingURL=global.error-handler.unit.test.js.map