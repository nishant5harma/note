import { jest, describe, it, expect, beforeEach } from "@jest/globals";
import { zodErrorHandler } from "../zod.error-handler.js";
import type { Request, Response, NextFunction } from "express";

const { z } = await import("zod");

describe("zodErrorHandler Middleware", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    // Re-initialize mocks before every test to clear call history
    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis() as any,
      json: jest.fn().mockReturnThis() as any,
    };
    mockNext = jest.fn() as unknown as NextFunction;
  });

  it("should return 400 and treeified errors if error is instance of z.ZodError", () => {
    // 1. Create a real Zod error
    const schema = z.object({ name: z.string().min(5) });
    const result = schema.safeParse({ name: "abc" });

    if (result.success) throw new Error("Schema should have failed");
    const zodError = result.error;

    // 2. Call the middleware
    zodErrorHandler(
      zodError,
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    // 3. Assertions
    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: false,
      message: "Validation Error",
      errors: expect.any(Object),
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it("should call next(err) if the error is NOT a ZodError", () => {
    const randomError = new Error("Something else went wrong");

    zodErrorHandler(
      randomError,
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(mockNext).toHaveBeenCalledWith(randomError);
    expect(mockResponse.status).not.toHaveBeenCalled();
    expect(mockResponse.json).not.toHaveBeenCalled();
  });
});
