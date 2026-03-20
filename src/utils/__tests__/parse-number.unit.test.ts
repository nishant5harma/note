// /src/utils/__tests__/parse-number.unit.test.ts
import { describe, it, expect } from "@jest/globals";

const { parseNumber } = await import("../parse-number.util.js");

describe("parseNumber", () => {
  it("parses valid numbers", () => {
    expect(parseNumber("10")).toBe(10);
    expect(parseNumber("10.5")).toBe(10.5);
    expect(parseNumber("-5")).toBe(-5);
  });

  it("returns undefined for invalid strings", () => {
    expect(parseNumber("x")).toBeUndefined();
    expect(parseNumber("12abc")).toBeUndefined();
    expect(parseNumber(" ")).toBe(0); // Note: Number(" ") is 0 in JS
  });

  it("returns undefined for non-string types", () => {
    expect(parseNumber(null)).toBeUndefined();
    expect(parseNumber(undefined)).toBeUndefined();
    expect(parseNumber({})).toBeUndefined();
  });
});
