// /src/utils/__tests__/omit-undefined.unit.test.ts
import { describe, it, expect } from "@jest/globals";
const { omitUndefined } = await import("../omit-undefined.util.js");
describe("omitUndefined", () => {
    it("removes undefined only", () => {
        const out = omitUndefined({ a: 1, b: undefined, c: false });
        expect(out).toEqual({ a: 1, c: false });
    });
    it("should return an empty object when all values are undefined", () => {
        const out = omitUndefined({ x: undefined, y: undefined });
        expect(out).toEqual({});
    });
    it("should not remove null or false values", () => {
        const out = omitUndefined({ a: null, b: false, c: 0 });
        expect(out).toEqual({ a: null, b: false, c: 0 });
    });
});
//# sourceMappingURL=omit-undefined.unit.test.js.map