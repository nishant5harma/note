// src/modules/cold-call/routing/decorators/__tests__/budget.decorator.unit.test.ts
import { describe, it, expect } from "@jest/globals";
import BudgetRoutingDecorator from "../budget.decorator.js";
import { CONTINUE } from "../base.decorator.js";
describe("BudgetRoutingDecorator", () => {
    it("routes based on numeric budget in payload", async () => {
        const dec = new BudgetRoutingDecorator({
            ranges: [{ min: 50, max: 100, teamId: "team-A" }],
        });
        const res = await dec.apply({
            entry: { payload: { budget: "75" } },
            batch: {},
            availableTeams: [],
        });
        expect(res).toBe("team-A");
    });
    it("returns CONTINUE and merges meta", async () => {
        const dec = new BudgetRoutingDecorator({
            ranges: [{ min: 10, continue: true, meta: { tier: "low" } }],
        });
        const ctx = {
            entry: { payload: { budget: 20 } },
            batch: {},
            availableTeams: [],
            meta: {},
        };
        const res = await dec.apply(ctx);
        expect(res).toEqual(CONTINUE());
        expect(ctx.meta).toEqual({ tier: "low" });
    });
    it("respects requirePrevious flag", async () => {
        const dec = new BudgetRoutingDecorator({
            ranges: [{ min: 0, teamId: "X", requirePrevious: true }],
        });
        const res = await dec.apply({
            entry: { payload: { budget: 10 } },
            batch: {},
            availableTeams: [],
            previousContinue: false,
        });
        expect(res).toBeNull();
    });
    it("returns null when no budget found", async () => {
        const dec = new BudgetRoutingDecorator({
            ranges: [{ min: 0, teamId: "X" }],
        });
        const res = await dec.apply({
            entry: {},
            batch: {},
            availableTeams: [],
        });
        expect(res).toBeNull();
    });
});
//# sourceMappingURL=budget.decorator.unit.test.js.map