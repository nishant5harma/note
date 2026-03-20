// src/modules/hr/location/__tests__/location.route.integration.test.ts
import request from "supertest";
import express from "express";
import { jest, describe, it, expect, beforeEach, afterEach, } from "@jest/globals";
import AppRouter from "../../../../modules/app/app.route.js";
import { prisma } from "../../../../db/db.js";
import { generateAuthToken, grantPermissions, } from "../../../../tests/common/helpers/auth.helper.js";
jest.mock("@/modules/socket/socket.service.js");
jest.mock("@/modules/socket/util-socket/push.sender.js");
const app = express();
app.use(express.json());
app.use("/api", AppRouter);
describe("HR Location routes (integration)", () => {
    beforeEach(() => {
        jest.spyOn(console, "warn").mockImplementation(() => { });
        jest.spyOn(console, "error").mockImplementation(() => { });
        jest.spyOn(console, "log").mockImplementation(() => { });
    });
    afterEach(() => {
        jest.restoreAllMocks();
    });
    it("POST /location-requests → 201", async () => {
        const requester = await prisma.user.create({
            data: {
                id: "route-req",
                name: "Requester",
                email: "req@test.com",
                passwordHash: "x",
            },
        });
        const target = await prisma.user.create({
            data: {
                id: "route-target",
                name: "Target",
                email: "target@test.com",
                passwordHash: "x",
            },
        });
        await grantPermissions(requester.id, ["location.request", "location.read"]);
        const token = generateAuthToken(requester);
        const res = await request(app)
            .post("/api/hr/location-requests")
            .set("Authorization", `Bearer ${token}`)
            .send({ targetUserId: target.id });
        expect(res.status).toBe(201);
        expect(res.body.requestId).toBeDefined();
    });
    it("POST /:id/respond → target can respond", async () => {
        const requester = await prisma.user.create({
            data: {
                id: "rr",
                name: "R",
                email: "r@test.com",
                passwordHash: "x",
            },
        });
        const target = await prisma.user.create({
            data: {
                id: "tt",
                name: "T",
                email: "t@test.com",
                passwordHash: "x",
            },
        });
        await grantPermissions(requester.id, ["location.request", "location.read"]);
        const token = generateAuthToken(requester);
        const create = await request(app)
            .post("/api/hr/location-requests")
            .set("Authorization", `Bearer ${token}`)
            .send({ targetUserId: target.id });
        const res = await request(app)
            .post(`/api/hr/location-requests/${create.body.requestId}/respond`)
            .set("Authorization", `Bearer ${generateAuthToken(target)}`)
            .send({ latitude: 12, longitude: 77 });
        expect(res.status).toBe(200);
    });
    it("GET /:id/result → read once", async () => {
        const requester = await prisma.user.create({
            data: {
                id: "r1",
                name: "R",
                email: "r1@test.com",
                passwordHash: "x",
            },
        });
        const target = await prisma.user.create({
            data: {
                id: "t1",
                name: "T",
                email: "t1@test.com",
                passwordHash: "x",
            },
        });
        await grantPermissions(requester.id, ["location.request", "location.read"]);
        const token = generateAuthToken(requester);
        const create = await request(app)
            .post("/api/hr/location-requests")
            .set("Authorization", `Bearer ${token}`)
            .send({ targetUserId: target.id });
        await request(app)
            .post(`/api/hr/location-requests/${create.body.requestId}/respond`)
            .set("Authorization", `Bearer ${generateAuthToken(target)}`)
            .send({ latitude: 1, longitude: 2 });
        const first = await request(app)
            .get(`/api/hr/location-requests/${create.body.requestId}/result`)
            .set("Authorization", `Bearer ${token}`);
        expect(first.status).toBe(200);
        expect(first.body.coords.latitude).toBe(1);
        const second = await request(app)
            .get(`/api/hr/location-requests/${create.body.requestId}/result`)
            .set("Authorization", `Bearer ${token}`);
        expect(second.status).toBe(404);
    });
});
//# sourceMappingURL=location.route.integration.test.js.map