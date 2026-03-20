// src/modules/auth/__tests__/auth.service.integration.test.ts
import { jest, describe, it, expect, beforeEach } from "@jest/globals";
import { prisma } from "@/db/db.js";
import { userFactory } from "@/tests/common/factories/index.js";
import bcrypt from "bcrypt";

// 1. Explicitly type the mocks to match your jwt.utils signatures
// Syntax: jest.fn<(args) => ReturnType>()
const mockSignAccessToken = jest.fn<(userId: string) => string>(
  () => "mock-access-token"
);
const mockCreateRefreshTokenForUser = jest.fn<
  (userId: string) => Promise<string>
>(async () => "mock-refresh-token");
const mockConsumeRefreshToken =
  jest.fn<(token: string) => Promise<string | null>>();
const mockRevokeRefreshToken = jest.fn<(token: string) => Promise<void>>(
  async () => {}
);

// 2. Use unstable_mockModule for ESM compatibility
jest.unstable_mockModule("@/utils/jwt.utils.js", () => ({
  signAccessToken: mockSignAccessToken,
  createRefreshTokenForUser: mockCreateRefreshTokenForUser,
  consumeRefreshToken: mockConsumeRefreshToken,
  revokeRefreshToken: mockRevokeRefreshToken,
}));

// 3. Import the service AFTER the mock is defined
const { AuthService } = await import("../auth.service.js");

describe("Auth Service (Integration)", () => {
  const mockRes = {
    cookie: jest.fn(),
    clearCookie: jest.fn(),
  } as any;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("login", () => {
    it("should return tokens and user data for valid credentials", async () => {
      const password = "securePassword123";
      const hash = await bcrypt.hash(password, 10);
      const user = await userFactory.create({ passwordHash: hash });

      const result = await AuthService.login(user.email, password, mockRes);

      expect(result.accessToken).toBe("mock-access-token");
      expect(result.user.email).toBe(user.email);
      expect(mockRes.cookie).toHaveBeenCalledWith(
        "refreshToken",
        "mock-refresh-token",
        expect.any(Object)
      );
    });

    it("should throw UnauthorizedError for wrong password", async () => {
      const user = await userFactory.create({
        passwordHash: await bcrypt.hash("correct-pass", 10),
      });

      await expect(
        AuthService.login(user.email, "wrong-pass", mockRes)
      ).rejects.toThrow("invalid credentials");
    });
  });

  describe("refresh", () => {
    it("should rotate tokens if refresh token is valid", async () => {
      const user = await userFactory.create();
      // TS now knows .mockResolvedValue accepts a string
      mockConsumeRefreshToken.mockResolvedValue(user.id!);
      mockCreateRefreshTokenForUser.mockResolvedValue("new-refresh-token");

      const result = await AuthService.refresh("old-token", mockRes);

      expect(result.user.id).toBe(user.id);
      expect(result.accessToken).toBe("mock-access-token");
      expect(mockRes.cookie).toHaveBeenCalledWith(
        "refreshToken",
        "new-refresh-token",
        expect.any(Object)
      );
    });

    it("should throw if token is missing or invalid", async () => {
      // TS now knows .mockResolvedValue accepts null
      mockConsumeRefreshToken.mockResolvedValue(null);

      await expect(AuthService.refresh(undefined, mockRes)).rejects.toThrow(
        "refresh token missing"
      );
      await expect(AuthService.refresh("invalid", mockRes)).rejects.toThrow(
        "invalid or expired refresh token"
      );
    });
  });

  describe("logout", () => {
    it("should revoke token and clear cookie", async () => {
      await AuthService.logout("token-to-revoke", mockRes);

      // TS now knows toHaveBeenCalledWith accepts a string
      expect(mockRevokeRefreshToken).toHaveBeenCalledWith("token-to-revoke");
      expect(mockRes.clearCookie).toHaveBeenCalledWith("refreshToken");
    });
  });
});
