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

    const res = await runDecorators(
      { entry: {}, batch: {}, availableTeams: [] } as any,
      [dec1 as any, dec2 as any]
    );

    expect(res).toBe("team-Z");
  });

  it("returns null when no decorator decides", async () => {
    const dec = {
      kind: "x",
      apply: async () => null,
    };

    const res = await runDecorators(
      { entry: {}, batch: {}, availableTeams: [] } as any,
      [dec as any]
    );

    expect(res).toBeNull();
  });

  it("propagates meta across decorators", async () => {
    const dec1 = {
      kind: "x",
      apply: async (ctx: any) => {
        ctx.meta = { a: 1 };
        return CONTINUE();
      },
    };

    const dec2 = {
      kind: "y",
      apply: async (ctx: any) => {
        expect(ctx.meta).toEqual({ a: 1 });
        return "team-A";
      },
    };

    const res = await runDecorators(
      { entry: {}, batch: {}, availableTeams: [], meta: {} } as any,
      [dec1 as any, dec2 as any]
    );

    expect(res).toBe("team-A");
  });
});
