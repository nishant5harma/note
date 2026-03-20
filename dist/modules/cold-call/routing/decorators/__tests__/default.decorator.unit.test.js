// src/modules/cold-call/routing/decorators/__tests__/default.decorator.unit.test.ts
import { describe, it, expect } from "@jest/globals";
import DefaultEvenSplitDecorator from "../default.decorator.js";
describe("DefaultEvenSplitDecorator", () => {
    it("always returns null (no routing decision)", async () => {
        const dec = new DefaultEvenSplitDecorator();
        const res = await dec.apply({
            entry: {},
            batch: {},
            availableTeams: ["A", "B"],
            assignedTeamId: null,
        });
        expect(res).toBeNull();
    });
    it("does not mutate routing context", async () => {
        const dec = new DefaultEvenSplitDecorator();
        const ctx = {
            entry: {},
            batch: {},
            availableTeams: ["A"],
            meta: { x: 1 },
        };
        await dec.apply(ctx);
        expect(ctx).toEqual({
            entry: {},
            batch: {},
            availableTeams: ["A"],
            meta: { x: 1 },
        });
    });
});
//# sourceMappingURL=default.decorator.unit.test.js.map