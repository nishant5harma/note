// src/modules/user/__tests__/user.route.integration.test.ts
import { jest, describe, it, expect, beforeEach } from "@jest/globals";
import request from "supertest";
import express from "express";

// --- 1. Mocks Setup ---

const mockRequirePermission = jest.fn();

jest.unstable_mockModule(
  "@/middlewares/require-premission.middleware.js",
  () => ({
    requirePermission: (resource: string, action: string) => {
      // FIX: Return a middleware that triggers the spy WHEN CALLED (Runtime), not when DEFINED (Boot time).
      return (req: any, res: any, next: any) => {
        // 1. Capture the resource/action that this route was configured with
        mockRequirePermission(resource, action);

        // 2. Mock the Auth User (simulating a logged-in user)
        req.user = { id: "test-admin-id", email: "admin@test.com", roles: [] };

        next();
      };
    },
  })
);

// Mock the Service
jest.unstable_mockModule("../user.service.js", () => ({
  UserService: {
    createUser: jest.fn(),
    listUsers: jest.fn(),
    findUserById: jest.fn(),
  },
  default: {
    createUser: jest.fn(),
    listUsers: jest.fn(),
    findUserById: jest.fn(),
  },
}));

// --- 2. Imports (must be after mocks) ---
const { UserRouter } = await import("../user.route.js");
const { UserService } = await import("../user.service.js");

const mockUserService = UserService as jest.Mocked<typeof UserService>;

const app = express();
app.use(express.json());
app.use("/users", UserRouter);

// --- 3. Tests ---

describe("User Routes (API)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /users", () => {
    it("should enforce 'user.write' permission", async () => {
      mockUserService.createUser.mockResolvedValue({ user: {} as any });

      // The spy will now trigger when this request hits the middleware
      await request(app)
        .post("/users")
        .send({
          name: "Test",
          email: "t@t.com",
          password: "123",
          roleIds: ["123"],
        });

      expect(mockRequirePermission).toHaveBeenCalledWith("user", "write");
    });

    it("should return 400 if validation fails (Zod)", async () => {
      const response = await request(app)
        .post("/users")
        .send({ email: "invalid-email-no-password" });

      expect(response.status).toBe(400);
      // Zod errors are usually returned in a specific structure; check for existence
      expect(response.body.error).toBeDefined();
    });

    it("should return 201 and user data on success", async () => {
      const validData = {
        name: "John Doe",
        email: "john@example.com",
        password: "password123",
        roleIds: ["550e8400-e29b-41d4-a716-446655440000"],
      };

      mockUserService.createUser.mockResolvedValue({
        user: { id: "1", ...validData, roles: [], teamMembers: [] } as any,
      });

      const response = await request(app).post("/users").send(validData);

      expect(response.status).toBe(201);
      expect(response.body.user.email).toBe(validData.email);
      expect(mockUserService.createUser).toHaveBeenCalled();
    });
  });

  describe("GET /users", () => {
    it("should enforce 'user.read' permission", async () => {
      mockUserService.listUsers.mockResolvedValue({ users: [] });

      await request(app).get("/users");

      expect(mockRequirePermission).toHaveBeenCalledWith("user", "read");
    });

    it("should return 200 and list of users", async () => {
      mockUserService.listUsers.mockResolvedValue({
        users: [{ id: "1", name: "User 1", roles: [], teamMembers: [] } as any],
      });

      const response = await request(app).get("/users");

      expect(response.status).toBe(200);
      expect(response.body.users).toHaveLength(1);
    });
  });

  describe("GET /users/:id", () => {
    it("should return 200 when user is found", async () => {
      mockUserService.findUserById.mockResolvedValue({
        user: {
          id: "user-123",
          name: "Test",
          email: "t@t.com",
          roles: [],
          teamMembers: [],
        },
      });

      const response = await request(app).get("/users/user-123");

      expect(response.status).toBe(200);
      expect(response.body.user.id).toBe("user-123");
      expect(mockRequirePermission).toHaveBeenCalledWith("user", "read");
    });

    it("should return 500 (or mapped error) if service throws generic error", async () => {
      mockUserService.findUserById.mockRejectedValue(new Error("DB Error"));

      const response = await request(app).get("/users/user-123");

      // Express default error handler usually returns 500 for unhandled errors
      expect(response.status).toBe(500);
    });
  });
});
