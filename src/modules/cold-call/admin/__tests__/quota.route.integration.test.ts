// src/modules/cold-call/admin/__tests__/quota.route.integration.test.ts
import { describe, it, expect } from "@jest/globals";
import request from "supertest";
import { createTestApp } from "@/tests/common/helpers/create-test-app.js";
import { createAuthContext } from "@/tests/common/helpers/auth-scenario.helper.js";
import { prisma } from "@/db/db.js";
import { teamFactory } from "@/tests/common/factories/index.js";
import { startOfDay } from "date-fns";

describe("Cold Call Admin – Quota", () => {
  describe("POST /coldcall/quota", () => {
    it("creates or updates a team quota", async () => {
      const app = await createTestApp();
      const admin = await createAuthContext(["coldcall.admin"]);
      const team = await teamFactory.create();
      const teamId = team.id!; // 🔑 IMPORTANT

      const res = await request(app)
        .post("/api/coldcall/quota")
        .set("Authorization", `Bearer ${admin.token}`)
        .send({
          teamId,
          period: "daily",
          metric: "conversions",
          target: 10,
        });

      expect(res.status).toBe(200);
      expect(res.body.ok).toBe(true);

      const quota = await prisma.coldCallQuota.findFirst({
        where: {
          teamId,
          period: "daily",
          metric: "conversions",
        },
      });

      expect(quota).toBeTruthy();
      expect(quota!.target).toBe(10);
    });

    it("returns 400 for invalid payload", async () => {
      const app = await createTestApp();
      const admin = await createAuthContext(["coldcall.admin"]);

      const res = await request(app)
        .post("/api/coldcall/quota")
        .set("Authorization", `Bearer ${admin.token}`)
        .send({
          teamId: "",
          period: "invalid",
          metric: "attempts",
          target: -1,
        });

      expect(res.status).toBe(400);
      expect(res.body.ok).toBe(false);
    });
  });

  describe("GET /coldcall/quota/:teamId", () => {
    it("lists quotas for a team", async () => {
      const app = await createTestApp();
      const auth = await createAuthContext(["coldcall.read"]);
      const team = await teamFactory.create();
      const teamId = team.id!; // 🔑

      await prisma.coldCallQuota.createMany({
        data: [
          {
            teamId,
            period: "daily",
            metric: "attempts",
            target: 20,
          },
          {
            teamId,
            period: "daily",
            metric: "conversions",
            target: 5,
          },
        ],
      });

      const res = await request(app)
        .get(`/api/coldcall/quota/${teamId}`)
        .set("Authorization", `Bearer ${auth.token}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(2);
    });
  });

  describe("GET /coldcall/quota/:teamId/progress", () => {
    it("returns daily quota progress", async () => {
      const app = await createTestApp();
      const auth = await createAuthContext(["coldcall.read"]);
      const team = await teamFactory.create();
      const teamId = team.id!; // 🔑

      await prisma.coldCallQuota.create({
        data: {
          teamId,
          period: "daily",
          metric: "conversions",
          target: 10,
        },
      });

      await prisma.coldCallAggregate.create({
        data: {
          key: `team:${teamId}:${startOfDay(new Date())
            .toISOString()
            .slice(0, 10)}`,
          kind: "team",
          entityId: teamId,
          date: startOfDay(new Date()),
          attempts: 20,
          connects: 10,
          conversions: 5,
        },
      });

      const res = await request(app)
        .get(`/api/coldcall/quota/${teamId}/progress`)
        .set("Authorization", `Bearer ${auth.token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.conversions).toBe(5);
      expect(res.body.data.percent).toBe(50);
    });

    it("returns null when no quota exists", async () => {
      const app = await createTestApp();
      const auth = await createAuthContext(["coldcall.read"]);
      const team = await teamFactory.create();
      const teamId = team.id!;

      const res = await request(app)
        .get(`/api/coldcall/quota/${teamId}/progress`)
        .set("Authorization", `Bearer ${auth.token}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toBeNull();
    });
  });
});
