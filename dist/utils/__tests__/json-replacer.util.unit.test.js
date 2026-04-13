import { describe, it, expect } from "@jest/globals";
import { bigintJsonReplacer } from "../json-replacer.util.js";
describe("bigintJsonReplacer", () => {
    it("stringifies bigint values for JSON.stringify", () => {
        const s = JSON.stringify({ price: BigInt(99), n: 1 }, bigintJsonReplacer);
        expect(s).toBe('{"price":"99","n":1}');
    });
});
//# sourceMappingURL=json-replacer.util.unit.test.js.map