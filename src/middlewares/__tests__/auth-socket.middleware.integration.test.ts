// src/middlewares/__tests__/auth-socket.middleware.integration.test.ts
import { jest, describe, it, expect, beforeEach } from "@jest/globals";
import {
  userFactory,
  roleFactory,
  permissionFactory,
} from "@/tests/common/factories/index.js";

// 1. Mock the JWT utility
jest.unstable_mockModule("@/utils/jwt.utils.js", () => ({
  verifyAccessToken: jest.fn(),
}));

// 2. Dynamic imports
const { authSocketMiddleware } = await import("../auth-socket.middleware.js");
const { verifyAccessToken } = await import("@/utils/jwt.utils.js");

const mockedVerify = verifyAccessToken as jest.MockedFunction<
  typeof verifyAccessToken
>;

describe("authSocketMiddleware Integration", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockPayload = (sub: string) => ({
    sub,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600,
  });

  it("successfully authenticates and flattens permissions into socket.data", async () => {
    // ARRANGE
    const perm = await permissionFactory.create({ key: "socket.access" });
    const role = await roleFactory.create({ permissions: [perm] });
    const user = await userFactory.create({ roles: [role] });

    mockedVerify.mockReturnValue(mockPayload(user.id!));

    const mockSocket = {
      handshake: {
        auth: { token: "valid-jwt" },
        headers: {},
      },
      data: {}, // New code uses socket.data directly
      user: {},
      permissions: new Set<string>(),
    } as any;

    const next = jest.fn();

    // ACT
    await authSocketMiddleware(mockSocket, next);

    // ASSERT
    expect(next).toHaveBeenCalledWith();
    expect(mockSocket.user.id).toBe(user.id);
    expect(mockSocket.data.userId).toBe(user.id);
    expect(mockSocket.data.permissions.has("socket.access")).toBe(true);
    expect(mockSocket.permissions.has("socket.access")).toBe(true);
  });

  it("wraps non-Error objects in the catch block", async () => {
    // ARRANGE
    // Simulate a failure before JWT verification to trigger the catch block
    const mockSocket = null as any; // This will throw an error in the try block
    const next = jest.fn();

    // ACT
    await authSocketMiddleware(mockSocket, next);

    // ASSERT
    // Verify it called next with an actual Error object per the new logic:
    // next(err instanceof Error ? err : new Error(String(err)));
    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });

  it("calls next with UnauthorizedError on invalid token", async () => {
    mockedVerify.mockImplementation(() => {
      throw new Error("JWT Error");
    });

    const mockSocket = {
      handshake: {
        auth: { token: "invalid" },
        headers: {},
      },
      data: {},
    } as any;

    const next = jest.fn();

    await authSocketMiddleware(mockSocket, next);

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Invalid or expired token",
      })
    );
  });

  it("calls next with UnauthorizedError when user is missing in database", async () => {
    mockedVerify.mockReturnValue(mockPayload("non-existent-id"));

    const mockSocket = {
      handshake: { auth: { token: "valid-token" } },
      data: {},
    } as any;

    const next = jest.fn();

    await authSocketMiddleware(mockSocket, next);

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "User not found",
      })
    );
  });

  it("authenticates via authorization header fallback", async () => {
    const user = await userFactory.create({ name: "Fallback User" });
    mockedVerify.mockReturnValue(mockPayload(user.id!));

    const mockSocket = {
      handshake: {
        auth: {}, // token missing here
        headers: { authorization: "Bearer fallback-token" },
      },
      data: {},
    } as any;

    const next = jest.fn();

    await authSocketMiddleware(mockSocket, next);

    expect(next).toHaveBeenCalledWith();
    expect(mockSocket.data.userId).toBe(user.id);
  });
});
