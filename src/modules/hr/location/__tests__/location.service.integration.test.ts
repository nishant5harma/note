// src/modules/hr/location/__tests__/location.service.integration.test.ts
import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  jest,
} from "@jest/globals";
import { prisma } from "@/db/db.js";
import { getRedisClient } from "@/db/redis.js";
import { LocationService } from "../location.service.js";

const redis = getRedisClient();

describe("LocationService (integration)", () => {
  beforeEach(() => {
    jest.spyOn(console, "warn").mockImplementation(() => {});
    jest.spyOn(console, "error").mockImplementation(() => {});
    jest.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("creates request", async () => {
    const r = await prisma.user.create({
      data: { id: "a", name: "A", email: "a@test.com", passwordHash: "x" },
    });

    const t = await prisma.user.create({
      data: { id: "b", name: "B", email: "b@test.com", passwordHash: "x" },
    });

    const req = await LocationService.createLocationRequest(r, t.id);
    expect(req.status).toBe("PENDING");
  });

  it("target responds and redis stores coords", async () => {
    const r = await prisma.user.create({
      data: { id: "r", name: "R", email: "r@test.com", passwordHash: "x" },
    });

    const t = await prisma.user.create({
      data: { id: "t", name: "T", email: "t@test.com", passwordHash: "x" },
    });

    const lr = await prisma.locationRequest.create({
      data: {
        requesterId: r.id,
        targetId: t.id,
        status: "PENDING",
        expiresAt: new Date(Date.now() + 60000),
      },
    });

    await LocationService.respondToLocationRequest(t, lr.id, {
      latitude: 10,
      longitude: 20,
    });

    const val = await redis.get(`hr:location:request:${lr.id}`);
    expect(val).toBeTruthy();
  });

  it("rejects non-target responder", async () => {
    const r = await prisma.user.create({
      data: { id: "r2", name: "R2", email: "r2@test.com", passwordHash: "x" },
    });

    const t = await prisma.user.create({
      data: { id: "t2", name: "T2", email: "t2@test.com", passwordHash: "x" },
    });

    const lr = await prisma.locationRequest.create({
      data: {
        requesterId: r.id,
        targetId: t.id,
        status: "PENDING",
        expiresAt: new Date(Date.now() + 60000),
      },
    });

    await expect(
      LocationService.respondToLocationRequest(r, lr.id, {
        latitude: 1,
        longitude: 1,
      })
    ).rejects.toThrow("Only target user");
  });

  it("rejects expired request and marks EXPIRED", async () => {
    const r = await prisma.user.create({
      data: { id: "r3", name: "R3", email: "r3@test.com", passwordHash: "x" },
    });

    const t = await prisma.user.create({
      data: { id: "t3", name: "T3", email: "t3@test.com", passwordHash: "x" },
    });

    const lr = await prisma.locationRequest.create({
      data: {
        requesterId: r.id,
        targetId: t.id,
        status: "PENDING",
        expiresAt: new Date(Date.now() - 1000),
      },
    });

    await expect(
      LocationService.respondToLocationRequest(t, lr.id, {
        latitude: 1,
        longitude: 1,
      })
    ).rejects.toThrow("expired");

    const updated = await prisma.locationRequest.findUnique({
      where: { id: lr.id },
    });

    expect(updated?.status).toBe("EXPIRED");
  });

  it("getLocationRequestResult reads once", async () => {
    const r = await prisma.user.create({
      data: { id: "r4", name: "R4", email: "r4@test.com", passwordHash: "x" },
    });

    const t = await prisma.user.create({
      data: { id: "t4", name: "T4", email: "t4@test.com", passwordHash: "x" },
    });

    const lr = await prisma.locationRequest.create({
      data: {
        requesterId: r.id,
        targetId: t.id,
        status: "FULFILLED",
        expiresAt: new Date(Date.now() + 60000),
      },
    });

    await redis.set(
      `hr:location:request:${lr.id}`,
      JSON.stringify({ latitude: 5, longitude: 6 })
    );

    const first = await LocationService.getLocationRequestResult(r, lr.id);
    expect(first?.latitude).toBe(5);

    const second = await LocationService.getLocationRequestResult(r, lr.id);
    expect(second).toBeNull();
  });

  it("rejects unauthorized result read", async () => {
    const r = await prisma.user.create({
      data: { id: "r5", name: "R5", email: "r5@test.com", passwordHash: "x" },
    });

    const t = await prisma.user.create({
      data: { id: "t5", name: "T5", email: "t5@test.com", passwordHash: "x" },
    });

    const lr = await prisma.locationRequest.create({
      data: {
        requesterId: r.id,
        targetId: t.id,
        status: "FULFILLED",
        expiresAt: new Date(Date.now() + 60000),
      },
    });

    await expect(
      LocationService.getLocationRequestResult(t, lr.id)
    ).rejects.toThrow("Not allowed");
  });
});
