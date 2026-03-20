// src/modules/team/__tests__/team.service.integration.test.ts
import { describe, it, expect, beforeEach } from "@jest/globals";
import { TeamService } from "../team.service.js";
import { prisma } from "@/db/db.js";
import {
  userFactory,
  teamFactory,
  teamMemberFactory,
} from "@/tests/common/factories/index.js";
import type { AuthUser } from "@/types/auth-request.js";

describe("Team Service (Integration)", () => {
  let adminUser: any;
  let leadUser: any;
  let targetUser: any;
  let team: any;

  beforeEach(async () => {
    adminUser = await userFactory.create();
    leadUser = await userFactory.create();
    targetUser = await userFactory.create();

    // Use a type assertion to bypass the factory interface restriction if teamLeadId exists in DB
    team = await teamFactory.create({
      name: "Engineering Team",
    } as any);

    // Manually link the lead via Service or Prisma to ensure leadId is set
    await TeamService.assignLead(team.id, leadUser.id);

    await teamMemberFactory.create({
      userId: leadUser.id,
      teamId: team.id,
      role: "LEAD",
    });
  });

  describe("Workflow: Member Assignment", () => {
    it("should assign member directly if actor has teamWrite permission", async () => {
      const result = await TeamService.assignMembers(
        team.id,
        [targetUser.id],
        "MEMBER",
        adminUser as AuthUser,
        true
      );

      expect(result.assigned).toHaveLength(1);
      const membership = await prisma.teamMember.findUnique({
        where: { userId_teamId: { userId: targetUser.id, teamId: team.id } },
      });
      expect(membership).toBeDefined();
    });

    it("should create a Request if actor is Team Lead (no teamWrite)", async () => {
      const result = await TeamService.assignMembers(
        team.id,
        [targetUser.id],
        "MEMBER",
        leadUser as AuthUser,
        false
      );

      expect(result.requests).toHaveLength(1);
      expect(result.requests[0].type).toBe("assign");
    });

    it("should skip assignment if user is already a member", async () => {
      // Ensure team.id and targetUser.id are strings
      await teamMemberFactory.create({
        userId: targetUser.id as string,
        teamId: team.id as string,
      });

      const result = await TeamService.assignMembers(
        team.id,
        [targetUser.id],
        "MEMBER",
        adminUser as AuthUser,
        true
      );

      expect(result.skipped).toHaveLength(1);
      expect(result.skipped[0].reason).toContain("already member");
    });
  });

  describe("Workflow: Request Approval & Rejection", () => {
    it("should perform membership change when an HR admin approves a transfer", async () => {
      const teamB = await teamFactory.create({ name: "Product Team" });
      await teamMemberFactory.create({
        userId: targetUser.id as string,
        teamId: team.id as string,
      });

      const request = await TeamService.createTransferRequest(
        team.id,
        targetUser.id,
        teamB.id!,
        leadUser as AuthUser
      );

      const response = (await TeamService.respondToRequest(
        request.id,
        true,
        adminUser as AuthUser
      )) as any;

      const oldMember = await prisma.teamMember.findFirst({
        where: { teamId: team.id, userId: targetUser.id },
      });
      const newMember = await prisma.teamMember.findFirst({
        where: { teamId: teamB.id!, userId: targetUser.id },
      });

      expect(oldMember).toBeNull();
      expect(newMember).toBeDefined();
      // Accessing status through the expected transaction structure
      expect(response.updatedReq.status).toBe("approved");
    });

    it("should mark request as rejected and NOT create membership if denied", async () => {
      const req = await prisma.teamRequest.create({
        data: {
          type: "join",
          requesterId: leadUser.id,
          targetUserId: targetUser.id,
          toTeamId: team.id,
          status: "pending",
        },
      });

      const result = (await TeamService.respondToRequest(
        req.id,
        false,
        adminUser as AuthUser,
        "Not qualified"
      )) as any;

      expect(result.status).toBe("rejected");
      expect(result.note).toBe("Not qualified");
      const membership = await prisma.teamMember.findFirst({
        where: { userId: targetUser.id, teamId: team.id },
      });
      expect(membership).toBeNull();
    });
  });

  describe("Security & Constraints", () => {
    it("should throw UnauthorizedError if a stranger tries to create a join request", async () => {
      const stranger = await userFactory.create();
      await expect(
        TeamService.createJoinRequest(
          team.id,
          targetUser.id,
          stranger as AuthUser
        )
      ).rejects.toThrow(
        "Only team lead or target user can create join request"
      );
    });

    it("should throw error if team still has members during deletion", async () => {
      await expect(TeamService.deleteTeam(team.id)).rejects.toThrow(
        "Team has members; remove members before deleting"
      );
    });

    it("should fail transfer if member is no longer in the source team", async () => {
      const teamB = await teamFactory.create();
      const req = await prisma.teamRequest.create({
        data: {
          type: "transfer",
          requesterId: leadUser.id,
          targetUserId: targetUser.id,
          fromTeamId: team.id,
          toTeamId: teamB.id!,
          status: "pending",
        },
      });

      await expect(
        TeamService.respondToRequest(req.id, true, adminUser as AuthUser)
      ).rejects.toThrow("Member not found in fromTeam");
    });
  });

  describe("listTeamUsers", () => {
    it("should return flattened member data", async () => {
      await teamMemberFactory.create({
        userId: targetUser.id as string,
        teamId: team.id as string,
      });
      const users = await TeamService.listTeamUsers(team.id);

      expect(users.length).toBeGreaterThan(0);
      expect(users.find((u) => u.id === targetUser.id)).toBeDefined();
      expect(users[0]).toHaveProperty("teamRole");
    });
  });
});
