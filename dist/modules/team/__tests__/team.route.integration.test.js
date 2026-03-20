// src/modules/team/__tests__/team.route.integration.test.ts
import { jest, describe, it, expect, beforeEach, afterEach, } from "@jest/globals";
import request from "supertest";
import express from "express";
import { globalErrorHandler } from "../../../error-handlers/global.error-handler.js";
import { zodErrorHandler } from "../../../error-handlers/zod.error-handler.js";
const mockTeamService = {
    createTeam: jest.fn(),
    listTeams: jest.fn(),
    getTeamById: jest.fn(),
    updateTeam: jest.fn(),
    deleteTeam: jest.fn(),
    assignMembers: jest.fn(),
    respondToRequest: jest.fn(),
    listTeamMembers: jest.fn(),
};
const mockAudit = { logAudit: jest.fn() };
jest.unstable_mockModule("../team.service.js", () => ({
    TeamService: mockTeamService,
    default: mockTeamService,
}));
jest.unstable_mockModule("@/utils/audit.util.js", () => mockAudit);
jest.unstable_mockModule("@/middlewares/require-premission.middleware.js", () => ({
    requirePermission: () => (req, res, next) => next(),
}));
const { TeamRouter } = await import("../team.route.js");
const app = express();
app.use(express.json());
app.use((req, _res, next) => {
    req.user = { id: "admin-1" };
    req.permissions = { has: (p) => true };
    next();
});
app.use("/teams", TeamRouter);
app.use(zodErrorHandler);
app.use(globalErrorHandler);
describe("Team Routes (API)", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(console, "error").mockImplementation(() => { });
    });
    afterEach(() => {
        jest.restoreAllMocks();
    });
    describe("POST /teams", () => {
        it("should create team and log audit trail", async () => {
            const payload = { name: "Alpha", leadId: "user-123" };
            mockTeamService.createTeam.mockResolvedValue({ id: "t1", ...payload });
            const res = await request(app).post("/teams").send(payload);
            expect(res.status).toBe(201);
            expect(mockAudit.logAudit).toHaveBeenCalledWith(expect.objectContaining({ action: "create", resource: "team" }));
        });
        it("should return 400 if name is too short", async () => {
            const res = await request(app).post("/teams").send({ name: "A" });
            expect(res.status).toBe(400);
        });
    });
    describe("PATCH /teams/:id", () => {
        it("should successfully update team and audit the action", async () => {
            mockTeamService.updateTeam.mockResolvedValue({
                id: "t1",
                name: "Updated",
            });
            const res = await request(app)
                .patch("/teams/t1")
                .send({ name: "Updated" });
            expect(res.status).toBe(200);
            expect(mockAudit.logAudit).toHaveBeenCalledWith(expect.objectContaining({ action: "update", resourceId: "t1" }));
        });
    });
    describe("POST /teams/:teamId/members", () => {
        it("should allow bulk assignment", async () => {
            mockTeamService.assignMembers.mockResolvedValue({
                assigned: ["u1"],
                skipped: [],
                requests: [],
            });
            const res = await request(app)
                .post("/teams/t1/members")
                .send({ userIds: ["u1"] });
            expect(res.status).toBe(200);
        });
        it("should return 400 if userIds are empty", async () => {
            const res = await request(app)
                .post("/teams/t1/members")
                .send({ userIds: [] });
            expect(res.status).toBe(400);
        });
    });
    describe("POST /teams/requests/:requestId/respond", () => {
        it("should approve a request successfully", async () => {
            mockTeamService.respondToRequest.mockResolvedValue({
                id: "req-1",
                status: "approved",
            });
            const res = await request(app)
                .post("/teams/requests/req-1/respond")
                .send({ approve: true });
            expect(res.status).toBe(200);
            expect(res.body.status).toBe("approved");
        });
    });
});
//# sourceMappingURL=team.route.integration.test.js.map