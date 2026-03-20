import { z } from "zod";

// /src/modules/team/validator/team.validator.ts
export const createTeamSchema = z.object({
  name: z.string().min(2),
  leadId: z.string().optional().nullable(),
});

export const updateTeamSchema = z.object({
  name: z.string().min(2).optional(),
  leadId: z.string().optional().nullable(),
});

export const assignLeadSchema = z.object({
  leadId: z.string(),
});

export const assignMembersSchema = z.object({
  userId: z.string().optional(),
  userIds: z.array(z.string()).optional(),
  role: z.enum(["MEMBER", "ASSISTANT_LEAD", "LEAD"]).optional(),
});

export const removeMemberSchema = z.object({
  reason: z.string().min(1).optional().default("Removed by admin"),
});

export const bulkRemoveSchema = z.object({
  userIds: z.array(z.string()).min(1),
  reason: z.string().min(5),
});

export const transferRequestSchema = z.object({
  toTeamId: z.string(),
  note: z.string().optional(),
});

export const joinRequestSchema = z.object({
  targetUserId: z.string(),
  note: z.string().optional(),
});

export const respondRequestSchema = z.object({
  approve: z.boolean(),
  note: z.string().optional(),
});
