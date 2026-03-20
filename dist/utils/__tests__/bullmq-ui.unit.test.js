// src/utils/__tests__/bullmq-ui.unit.test.ts
import { jest, describe, it, expect, beforeEach, afterEach, } from "@jest/globals";
import express from "express";
import request from "supertest";
// 1. Mock dependencies using the ESM-compliant unstable_mockModule
jest.unstable_mockModule("@bull-board/api", () => ({
    createBullBoard: jest.fn(),
}));
const mockSetBasePath = jest.fn();
const mockGetRouter = jest.fn().mockImplementation(() => {
    const router = express.Router();
    router.get("/", (req, res) => res.status(200).send("Dashboard Mock"));
    return router;
});
jest.unstable_mockModule("@bull-board/express", () => ({
    ExpressAdapter: jest.fn().mockImplementation(() => ({
        setBasePath: mockSetBasePath,
        getRouter: mockGetRouter,
    })),
}));
jest.unstable_mockModule("@bull-board/api/bullMQAdapter", () => ({
    BullMQAdapter: jest.fn().mockImplementation((q) => ({ queue: q })),
}));
// Mock internal queues to avoid actual Redis/BullMQ instantiation
jest.unstable_mockModule("@/modules/lead/assignment/queue/queue.js", () => ({
    assignmentQueue: { name: "assignment" },
    assignmentCheckQueue: { name: "check" },
    escalationQueue: { name: "escalation" },
    teamAssignmentQueue: { name: "team" },
}));
// 2. Dynamic import the target module AFTER mocking
const { initBullBoard } = await import("../bullmq-ui.js");
describe("initBullBoard", () => {
    let app;
    beforeEach(() => {
        app = express();
        process.env.BULLMQ_UI_ROUTE = "/admin/queues";
        // Ensure token is cleared before each test
        delete process.env.BULLMQ_UI_AUTH_TOKEN;
    });
    afterEach(() => {
        jest.clearAllMocks();
    });
    it("should allow access when no AUTH_TOKEN is configured", async () => {
        initBullBoard(app);
        const response = await request(app).get("/admin/queues/");
        expect(response.status).toBe(200);
        expect(response.text).toBe("Dashboard Mock");
    });
    it("should block access (401) if token is required but missing", async () => {
        process.env.BULLMQ_UI_AUTH_TOKEN = "super-secret";
        initBullBoard(app);
        const response = await request(app).get("/admin/queues");
        expect(response.status).toBe(401);
        expect(response.text).toContain("Unauthorized");
    });
    it("should allow access with correct X-Admin-Token header", async () => {
        const token = "header-secret";
        process.env.BULLMQ_UI_AUTH_TOKEN = token;
        initBullBoard(app);
        const response = await request(app)
            .get("/admin/queues")
            .set("x-admin-token", token);
        expect(response.status).toBe(200);
        expect(response.text).toBe("Dashboard Mock");
    });
    it("should allow access with correct token in query string", async () => {
        const token = "query-secret";
        process.env.BULLMQ_UI_AUTH_TOKEN = token;
        initBullBoard(app);
        const response = await request(app).get(`/admin/queues?token=${token}`);
        expect(response.status).toBe(200);
        expect(response.text).toBe("Dashboard Mock");
    });
});
//# sourceMappingURL=bullmq-ui.unit.test.js.map