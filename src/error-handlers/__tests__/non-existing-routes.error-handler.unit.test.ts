// src/error-handlers/__tests__/non-existing-routes.error-handler.unit.test.ts
import { jest, describe, it, expect } from "@jest/globals";
import type { Request, Response, NextFunction } from "express";

// Dynamic import the handler
const { nonExistingRoutesErrorHandler } = await import(
  "../non-existing-route.error-handler.js"
);

describe("nonExistingRoutesErrorHandler", () => {
  it("forwards a NotFoundError with the correct properties to next()", () => {
    const next = jest.fn();

    nonExistingRoutesErrorHandler(
      {} as Request,
      {} as Response,
      next as unknown as NextFunction
    );

    // 1. Verify next was called with an object matching properties
    // We use objectContaining because of the ESM class identity issue (instanceof check failure)
    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 404,
        message: expect.stringContaining("Not Found"),
      })
    );

    // 2. Double check the specific message content
    const errorArg = (next as jest.Mock).mock.calls[0]?.[0] as any;
    expect(errorArg.message).toBe(
      "Not Found: The route you requested does not exist."
    );
  });
});
