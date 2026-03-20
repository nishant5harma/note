// src/modules/cold-call/routing/decorators/__tests__/location.decorator.unit.test.ts
import { describe, it, expect } from "@jest/globals";
import LocationRoutingDecorator from "../location.decorator.js";
import { CONTINUE } from "../base.decorator.js";
describe("LocationRoutingDecorator", () => {
    it("matches exact location", async () => {
        const dec = new LocationRoutingDecorator({
            map: { delhi: "team-D" },
        });
        const res = await dec.apply({
            entry: { payload: { city: "Delhi" } },
        });
        expect(res).toBe("team-D");
    });
    it("matches fuzzy location", async () => {
        const dec = new LocationRoutingDecorator({
            map: { mum: "team-M" },
        });
        const res = await dec.apply({
            entry: { payload: { city: "Mumbai West" } },
        });
        expect(res).toBe("team-M");
    });
    it("returns CONTINUE with meta", async () => {
        const dec = new LocationRoutingDecorator({
            map: {
                delhi: { continue: true, meta: { region: "north" } },
            },
        });
        const ctx = {
            entry: { payload: { city: "Delhi" } },
            meta: {},
        };
        const res = await dec.apply(ctx);
        expect(res).toEqual(CONTINUE());
        expect(ctx.meta).toEqual({ region: "north" });
    });
    it("returns null when no location found", async () => {
        const dec = new LocationRoutingDecorator({ map: {} });
        const res = await dec.apply({
            entry: {},
        });
        expect(res).toBeNull();
    });
});
//# sourceMappingURL=location.decorator.unit.test.js.map