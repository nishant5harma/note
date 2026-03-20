// src/modules/cold-call/upload/__tests__/dedupe.util.unit.test.ts
import { describe, it, expect } from "@jest/globals";
import { computeColdCallDedupeHash } from "../util/dedupe.util.js";
describe("computeColdCallDedupeHash", () => {
    it("returns null when neither phone nor email is provided", () => {
        expect(computeColdCallDedupeHash({})).toBeNull();
        expect(computeColdCallDedupeHash({ phone: null, email: null })).toBeNull();
    });
    it("normalizes phone numbers before hashing", () => {
        const h1 = computeColdCallDedupeHash({ phone: "98765-43210" });
        const h2 = computeColdCallDedupeHash({ phone: "9876543210" });
        expect(h1).toBeTruthy();
        expect(h1).toEqual(h2);
    });
    it("normalizes email before hashing", () => {
        const h1 = computeColdCallDedupeHash({
            email: "Test@Example.COM ",
        });
        const h2 = computeColdCallDedupeHash({
            email: "test@example.com",
        });
        expect(h1).toEqual(h2);
    });
    it("includes both phone and email when both exist", () => {
        const h1 = computeColdCallDedupeHash({
            phone: "12345",
            email: "a@b.com",
        });
        const h2 = computeColdCallDedupeHash({
            phone: "12345",
            email: "c@d.com",
        });
        expect(h1).not.toEqual(h2);
    });
    it("returns a deterministic 64-char hex string", () => {
        const h = computeColdCallDedupeHash({
            phone: "12345",
        });
        expect(h).toMatch(/^[a-f0-9]{64}$/);
    });
});
//# sourceMappingURL=dedupe.util.unit.test.js.map