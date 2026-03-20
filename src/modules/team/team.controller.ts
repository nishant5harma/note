import type { Response, NextFunction } from "express";
import TeamService from "./team.service.js";
import {
  createTeamSchema,
  updateTeamSchema,
  assignLeadSchema,
  assignMembersSchema,
  removeMemberSchema,
  bulkRemoveSchema,
  transferRequestSchema,
  joinRequestSchema,
  respondRequestSchema,
} from "./validator/team.validator.js";
import { logAudit } from "@/utils/audit.util.js";
import {
  BadRequestError,
  UnauthorizedError,
} from "@/utils/http-errors.util.js";
import type { AuthRequest } from "@/types/auth-request.js";

// /src/modules/team/team.controller.ts

// Exported TeamController with all handler functions
export const TeamController = {
  createTeam,
  listTeams,
  getTeam,
  updateTeam,
  deleteTeam,
  assignLead,
  listTeamUsers,
  assignMembersHandler,
  bulkAssignHandler,
  removeMemberHandler,
  bulkRemoveHandler,
  transferRequestHandler,
  joinRequestHandler,
  listRequestsHandler,
  respondRequestHandler,
  listTeamMembersHandler,
};

export default TeamController;

// Handler Functions Implementation
async function createTeam(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const parsed = createTeamSchema.parse(req.body);
    // normalize to remove undefined leadId so it matches TeamService type (leadId?: string | null)
    const payload =
      parsed.leadId === undefined
        ? { name: parsed.name }
        : { name: parsed.name, teamLeadId: parsed.leadId };
    const team = await TeamService.createTeam(payload);
    await logAudit({
      userId: req.user?.id ?? null,
      action: "create",
      resource: "team",
      resourceId: team.id,
      payload,
    });
    return res.status(201).json(team);
  } catch (err) {
    next(err);
  }
}

async function listTeams(_req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const teams = await TeamService.listTeams();
    return res.json({ teams });
  } catch (err) {
    next(err);
  }
}

async function getTeam(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    if (!id) {
      throw new BadRequestError("Team ID is required");
    }
    const team = await TeamService.getTeamById(id);
    return res.json(team);
  } catch (err) {
    next(err);
  }
}

async function updateTeam(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    if (!id) {
      throw new BadRequestError("Team ID is required");
    }
    const parsed = updateTeamSchema.parse(req.body);
    const payload: { name?: string; leadId?: string | null } = {};
    if (parsed.name !== undefined) payload.name = parsed.name;
    if (parsed.leadId !== undefined) payload.leadId = parsed.leadId;
    const team = await TeamService.updateTeam(id, payload);
    await logAudit({
      userId: req.user?.id ?? null,
      action: "update",
      resource: "team",
      resourceId: id,
      payload,
    });
    return res.json(team);
  } catch (err) {
    next(err);
  }
}

async function deleteTeam(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    if (!id) {
      throw new BadRequestError("Team ID is required");
    }
    await TeamService.deleteTeam(id);
    await logAudit({
      userId: req.user?.id ?? null,
      action: "delete",
      resource: "team",
      resourceId: id,
    });
    return res.status(204).send();
  } catch (err) {
    next(err);
  }
}

async function assignLead(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const teamId = req.params.id;
    if (!teamId) {
      throw new BadRequestError("Team ID is required");
    }
    const payload = assignLeadSchema.parse(req.body);
    const updated = await TeamService.assignLead(teamId, payload.leadId);
    await logAudit({
      userId: req.user?.id ?? null,
      action: "assignLead",
      resource: "team",
      resourceId: teamId,
      payload,
    });
    return res.json(updated);
  } catch (err) {
    next(err);
  }
}

async function listTeamUsers(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.params;
    if (!id) {
      throw new BadRequestError("Team ID is required");
    }
    const users = await TeamService.listTeamUsers(id);
    return res.json({ users });
  } catch (err) {
    next(err);
  }
}
function actorHasTeamWrite(req: AuthRequest) {
  return (
    req.permissions && req.permissions.has && req.permissions.has("team.write")
  );
}

export async function assignMembersHandler(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const { teamId } = req.params;
    if (!teamId) {
      throw new BadRequestError("Team ID is required");
    }
    const parsed = assignMembersSchema.parse(req.body);
    const actor = req.user;
    const actorHasWrite = actorHasTeamWrite(req);
    const userIds = parsed.userIds
      ? parsed.userIds
      : parsed.userId
        ? [parsed.userId]
        : [];
    if (userIds.length === 0)
      throw new BadRequestError("userId or userIds required");
    const result = await TeamService.assignMembers(
      teamId,
      userIds,
      parsed.role ?? "MEMBER",
      actor,
      actorHasWrite
    );
    return res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function bulkAssignHandler(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const { teamId } = req.params;
    if (!teamId) {
      throw new BadRequestError("Team ID is required");
    }
    const parsed = assignMembersSchema.parse(req.body);
    const actor = req.user;
    const actorHasWrite = actorHasTeamWrite(req);
    const userIds = parsed.userIds ?? (parsed.userId ? [parsed.userId] : []);
    if (!userIds || userIds.length === 0)
      throw new BadRequestError("userIds required");
    const result = await TeamService.bulkAssignMembers(
      teamId,
      userIds,
      parsed.role ?? "MEMBER",
      actor,
      actorHasWrite
    );
    return res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function removeMemberHandler(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const { teamId, memberId } = req.params;
    if (!teamId || !memberId) {
      throw new BadRequestError("Team ID and Member ID are required");
    }
    const parsed = removeMemberSchema.parse(req.body);
    const actor = req.user;
    const actorHasWrite = actorHasTeamWrite(req);
    const result = await TeamService.removeMember(
      teamId,
      memberId,
      parsed.reason,
      actor,
      actorHasWrite
    );
    return res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function bulkRemoveHandler(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const { teamId } = req.params;
    if (!teamId) {
      throw new BadRequestError("Team ID is required");
    }
    const parsed = bulkRemoveSchema.parse(req.body);
    const actor = req.user;
    const actorHasWrite = actorHasTeamWrite(req);
    const result = await TeamService.bulkRemoveMembers(
      teamId,
      parsed.userIds,
      parsed.reason,
      actor,
      actorHasWrite
    );
    return res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function transferRequestHandler(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const { teamId, memberId } = req.params;
    if (!teamId || !memberId) {
      throw new BadRequestError("Team ID and Member ID are required");
    }
    const parsed = transferRequestSchema.parse(req.body);
    const actor = req.user;
    const reqRow = await TeamService.createTransferRequest(
      teamId,
      memberId,
      parsed.toTeamId,
      actor
    );
    return res.status(201).json(reqRow);
  } catch (err) {
    next(err);
  }
}

export async function joinRequestHandler(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const { teamId } = req.params;
    if (!req.user) {
      throw new UnauthorizedError();
    }
    if (!teamId) {
      throw new BadRequestError("Team ID is required");
    }
    const parsed = joinRequestSchema.parse(req.body);
    const actor = req.user;
    const reqRow = await TeamService.createJoinRequest(
      teamId,
      parsed.targetUserId,
      actor
    );
    return res.status(201).json(reqRow);
  } catch (err) {
    next(err);
  }
}

export async function listRequestsHandler(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const q: { status?: string; type?: string } = {};
    if (req.query.status) q.status = req.query.status as string;
    if (req.query.type) q.type = req.query.type as string;
    const rows = await TeamService.listRequests(q);
    return res.json({ count: rows.length, rows });
  } catch (err) {
    next(err);
  }
}

export async function respondRequestHandler(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const { requestId } = req.params;
    if (!requestId) {
      throw new BadRequestError("Request ID is required");
    }
    const parsed = respondRequestSchema.parse(req.body);
    const actor = req.user;
    // ensure actor has approval permission: we check req.permissions in controller level
    const result = await TeamService.respondToRequest(
      requestId,
      parsed.approve,
      actor,
      parsed.note
    );
    return res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function listTeamMembersHandler(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const { teamId } = req.params;
    if (!teamId) {
      throw new BadRequestError("Team ID is required");
    }
    const rows = await TeamService.listTeamMembers(teamId, { limit: 200 });
    return res.json({ count: rows.length, rows });
  } catch (err) {
    next(err);
  }
}
