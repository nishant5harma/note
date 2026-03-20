// src/modules/cold-call/routing/__tests__/routing-engine.unit.test.ts
import { describe, it, expect } from "@jest/globals";
import { runDecorators } from "../routing-engine.js";
import { CONTINUE } from "../decorators/base.decorator.js";
describe("routing-engine", () => {
    it("respects CONTINUE and later decorator decision", async () => {
        const dec1 = {
            kind: "x",
            apply: async () => CONTINUE(),
        };
        const dec2 = {
            kind: "y",
            apply: async () => "team-Z",
        };
        const res = await runDecorators({ entry: {}, batch: {}, availableTeams: [] }, [dec1, dec2]);
        expect(res).toBe("team-Z");
    });
    it("returns null when no decorator decides", async () => {
        const dec = {
            kind: "x",
            apply: async () => null,
        };
        const res = await runDecorators({ entry: {}, batch: {}, availableTeams: [] }, [dec]);
        expect(res).toBeNull();
    });
    it("propagates meta across decorators", async () => {
        const dec1 = {
            kind: "x",
            apply: async (ctx) => {
                ctx.meta = { a: 1 };
                return CONTINUE();
            },
        };
        const dec2 = {
            kind: "y",
            apply: async (ctx) => {
                expect(ctx.meta).toEqual({ a: 1 });
                return "team-A";
            },
        };
        const res = await runDecorators({ entry: {}, batch: {}, availableTeams: [], meta: {} }, [dec1, dec2]);
        expect(res).toBe("team-A");
    });
});
//# sourceMappingURL=routing-engine.unit.test.js.map