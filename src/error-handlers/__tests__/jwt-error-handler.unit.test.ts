// /src/error-handlers/__tests__/global.error-handler.unit.test.ts
import { jest, describe, it, expect } from "@jest/globals";
import type { Request, Response, NextFunction } from "express";

// Dynamic import the handler
const { jwtErrorHandler } = await import("../jwt.error-handler.js");

function mockRes() {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  } as any;
}

describe("jwtErrorHandler", () => {
  it("handles TokenExpiredError", () => {
    const err = { name: "TokenExpiredError" } as Error;
    const res = mockRes();

    jwtErrorHandler(
      err,
      {} as Request,
      res as Response,
      jest.fn() as NextFunction
    );

    expect(res.status).toHaveBeenCalledWith(401);
  });

  it("passes through unknown errors", () => {
    const next = jest.fn();
    jwtErrorHandler(
      new Error("x"),
      {} as Request,
      {} as Response,
      next as unknown as NextFunction
    );
    expect(next).toHaveBeenCalled();
  });

  it("handles JsonWebTokenError", () => {
    const err = { name: "JsonWebTokenError" } as Error;
    const res = mockRes();
    jwtErrorHandler(err, {} as any, res as any, jest.fn());

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "Invalid token" });
  });

  it("handles NotBeforeError", () => {
    const err = { name: "NotBeforeError" } as Error;
    const res = mockRes();
    jwtErrorHandler(err, {} as any, res as any, jest.fn());

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "Token not active yet" });
  });
});
