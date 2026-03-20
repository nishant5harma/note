// /src/utils/__tests__/http-errors.unit.test.ts
import { describe, it, expect } from "@jest/globals";

// Use dynamic import to maintain singleton class identity in the ESM VM
const {
  HttpError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  InternalServerError,
  ZodValidationError,
} = await import("../http-errors.util.js");

describe("http-errors util", () => {
  it("HttpError stores status + details", () => {
    const err = new HttpError(418, "teapot", { a: 1 });
    expect(err.status).toBe(418);
    expect(err.details).toEqual({ a: 1 });
    expect(err.message).toBe("teapot");
    expect(err instanceof Error).toBe(true);
    expect(err instanceof HttpError).toBe(true);
  });

  it("specific subclasses map to correct status codes", () => {
    expect(new BadRequestError().status).toBe(400);
    expect(new UnauthorizedError().status).toBe(401);
    expect(new ForbiddenError().status).toBe(403);
    expect(new NotFoundError().status).toBe(404);
    expect(new InternalServerError().status).toBe(500);
  });

  it("ZodValidationError exposes errors array and status 400", () => {
    const mockErrors = [{ path: ["email"], message: "Invalid" }];
    const e = new ZodValidationError(mockErrors);
    expect(e.status).toBe(400);
    expect(e.errors).toEqual(mockErrors);
    expect(e instanceof HttpError).toBe(true);
  });
});
