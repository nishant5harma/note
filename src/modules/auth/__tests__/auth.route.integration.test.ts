// src/modules/auth/__tests__/auth.route.integration.test.ts
import { jest, describe, it, expect, beforeEach } from "@jest/globals";
import request from "supertest";
import express from "express";
import cookieParser from "cookie-parser";

// 1. Setup Mocks with proper typing to avoid 'never' errors
const mockAuthService = {
  login: jest.fn<any>(),
  refresh: jest.fn<any>(),
  logout: jest.fn<any>(),
  getCurrentUser: jest.fn<any>(),
};

jest.unstable_mockModule("../auth.service.js", () => ({
  AuthService: mockAuthService,
  default: mockAuthService,
}));

jest.unstable_mockModule("@/middlewares/auth.middleware.js", () => ({
  requireAuth: (req: any, res: any, next: any) => {
    req.user = { id: "user-123" };
    next();
  },
}));

const { AuthRouter } = await import("../auth.routes.js");

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use("/auth", AuthRouter);

describe("Auth Routes (API)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /auth/login", () => {
    it("should return 200 on successful login", async () => {
      mockAuthService.login.mockResolvedValue({
        accessToken: "at",
        user: { id: "1", name: "Test" },
      });

      const response = await request(app)
        .post("/auth/login")
        .send({ email: "test@test.com", password: "password123" });

      expect(response.status).toBe(200);
      expect(response.body.accessToken).toBe("at");
    });

    it("should return 400 for invalid email format", async () => {
      const response = await request(app)
        .post("/auth/login")
        .send({ email: "not-an-email", password: "123" });

      expect(response.status).toBe(400);
    });
  });

  describe("POST /auth/refresh", () => {
    it("should pick up refresh token from cookies", async () => {
      mockAuthService.refresh.mockResolvedValue({ accessToken: "new-at" });

      const response = await request(app)
        .post("/auth/refresh")
        .set("Cookie", ["refreshToken=existing-token"]);

      expect(response.status).toBe(200);
      expect(mockAuthService.refresh).toHaveBeenCalledWith(
        "existing-token",
        expect.any(Object)
      );
    });
  });

  describe("GET /auth/me", () => {
    it("should return current user data", async () => {
      mockAuthService.getCurrentUser.mockResolvedValue({
        user: { id: "user-123", email: "me@test.com" },
      });

      const response = await request(app).get("/auth/me");

      expect(response.status).toBe(200);
      expect(response.body.user.id).toBe("user-123");
    });
  });

  describe("POST /auth/logout", () => {
    it("should call logout and return ok", async () => {
      mockAuthService.logout.mockResolvedValue({ ok: true });

      const response = await request(app)
        .post("/auth/logout")
        .send({ refreshToken: "manual-token" });

      expect(response.status).toBe(200);
      expect(response.body.ok).toBe(true);
    });
  });
});
