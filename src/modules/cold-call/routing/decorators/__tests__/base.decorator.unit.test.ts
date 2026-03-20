// src/modules/cold-call/routing/decorators/__tests__/base.decorator.unit.test.ts
import { describe, it, expect } from "@jest/globals";
import { CONTINUE } from "../base.decorator.js";

describe("base decorator utilities", () => {
  it("CONTINUE returns a JSON-safe continue token", () => {
    const token = CONTINUE();

    expect(token).toEqual({ __continue: true });
    expect("__continue" in token).toBe(true);
  });

  it("CONTINUE returns a new object each time", () => {
    const a = CONTINUE();
    const b = CONTINUE();

    expect(a).not.toBe(b); // no shared reference
    expect(a).toEqual(b);
  });
});
