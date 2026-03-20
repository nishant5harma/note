import { prisma } from "../../db/db.js";
import { BadRequestError, NotFoundError, UnauthorizedError, } from "../../utils/http-errors.util.js";
// src/modules/team/team.service.ts
// Exported TeamService object
export const TeamService = {
    createTeam,
    getTeamById,
    listTeams,
    updateTeam,
    deleteTeam,
    assignLead,
    listTeamUsers,
    assignMembers,
    bulkAssignMembers,
    removeMember,
    bulkRemoveMembers,
    createTransferRequest,
    createJoinRequest,
    listRequests,
    respondToRequest,
    listTeamMembers,
};
export default TeamService;
// Service Function Implementations
async function createTeam(payload) {
    if (payload.teamLeadId) {
        const user = await prisma.user.findUnique({
            where: { id: payload.teamLeadId },
        });
        if (!user)
            throw new BadRequestError("Lead user not found");
    }
    const team = await prisma.team.create({
        data: { name: payload.name, teamLeadId: payload.teamLeadId ?? null },
    });
    return team;
}
async function getTeamById(id) {
    const team = await prisma.team.findUnique({
        where: { id },
        include: {
            members: {
                include: { user: { include: { roles: { include: { role: true } } } } },
            },
        },
    });
    if (!team)
        throw new NotFoundError("Team not found");
    return team;
}
async function listTeams() {
    return prisma.team.findMany({
        orderBy: { createdAt: "desc" },
        include: { members: { take: 5, include: { user: true } } },
    });
}
async function updateTeam(id, patch) {
    if (patch.leadId) {
        const user = await prisma.user.findUnique({ where: { id: patch.leadId } });
        if (!user)
            throw new BadRequestError("Lead user not found");
    }
    const data = {};
    if (patch.name !== undefined)
        data.name = patch.name;
    if (patch.leadId !== undefined)
        data.leadId = patch.leadId;
    const team = await prisma.team.update({
        where: { id },
        data,
    });
    return team;
}
async function deleteTeam(id) {
    const assigned = await prisma.teamMember.findFirst({ where: { teamId: id } });
    if (assigned)
        throw new BadRequestError("Team has members; remove members before deleting");
    return prisma.team.delete({ where: { id } });
}
async function assignLead(teamId, teamLeadId) {
    const team = await prisma.team.findUnique({ where: { id: teamId } });
    if (!team)
        throw new NotFoundError("Team not found");
    const user = await prisma.user.findUnique({ where: { id: teamLeadId } });
    if (!user)
        throw new BadRequestError("Lead user not found");
    const updated = await prisma.team.update({
        where: { id: teamId },
        data: { teamLeadId },
    });
    return updated;
}
async function listTeamUsers(teamId) {
    const teamMembers = await prisma.teamMember.findMany({
        where: { teamId },
        include: {
            user: {
                include: {
                    roles: { include: { role: true } },
                },
            },
        },
    });
    // Flatten out the data so callers don’t have to deal with the join structure
    return teamMembers.map((tm) => ({
        id: tm.user.id,
        name: tm.user.name,
        email: tm.user.email,
        roles: tm.user.roles.map((r) => r.role),
        teamRole: tm.role, // from TeamMember.role (e.g. MEMBER, LEAD)
        joinedAt: tm.joinedAt,
    }));
}
/**
 * helper to check if caller is a lead for a team
 */
async function isTeamLead(teamId, userId) {
    const tm = await prisma.teamMember.findFirst({
        where: { teamId, userId, role: "LEAD" },
    });
    return !!tm;
}
/**
 * Assign one or multiple members to a team.
 * If caller has teamWrite=true they perform direct assignment.
 * If caller is team lead they create TeamRequest(s) (pending) which HR must approve.
 */
async function assignMembers(teamId, userIds, role = "MEMBER", actor, actorHasTeamWrite = false) {
    // validate team exists
    const team = await prisma.team.findUnique({ where: { id: teamId } });
    if (!team)
        throw new NotFoundError("Team not found");
    const results = {
        assigned: [],
        skipped: [],
        requests: [],
    };
    for (const uid of userIds) {
        const user = await prisma.user.findUnique({ where: { id: uid } });
        if (!user) {
            results.skipped.push({ userId: uid, reason: "user not found" });
            continue;
        }
        const exists = await prisma.teamMember
            .findUnique({
            where: { userId_teamId: { userId: uid, teamId } },
        })
            .catch(() => null);
        if (exists) {
            results.skipped.push({ userId: uid, reason: "already member of team" });
            continue;
        }
        if (actorHasTeamWrite) {
            // direct assignment
            const tm = await prisma.teamMember.create({
                data: {
                    userId: uid,
                    teamId,
                    role,
                    meta: { assignedBy: actor?.id ?? null },
                },
            });
            results.assigned.push(tm);
            // AUDIT: direct assignment by HR/manager
            // AUDIT: logTeamAction({ userId: actor?.id, action: 'team.assign', resource: 'team', resourceId: teamId, payload: { targetUserId: uid, role } })
        }
        else {
            // caller must be team lead to request
            if (!(await isTeamLead(teamId, actor.id))) {
                results.skipped.push({
                    userId: uid,
                    reason: "permission denied: not team lead or hr",
                });
                continue;
            }
            // create TeamRequest of type 'assign'
            const req = await prisma.teamRequest.create({
                data: {
                    type: "assign",
                    requesterId: actor.id,
                    targetUserId: uid,
                    toTeamId: teamId,
                    note: `Requested assign to team by ${actor.id}`,
                },
            });
            results.requests.push(req);
            // AUDIT: team lead request created
            // AUDIT: logTeamAction({ userId: actor?.id, action: 'team.request.assign', resource: 'team', resourceId: teamId, payload: { requestId: req.id, targetUserId: uid } })
        }
    }
    return results;
}
async function bulkAssignMembers(teamId, userIds, role = "MEMBER", actor, actorHasTeamWrite = false) {
    return assignMembers(teamId, userIds, role, actor, actorHasTeamWrite);
}
/**
 * Remove a member. If actorHasTeamWrite -> direct removal.
 * If actor is team lead -> create a remove request (pending).
 */
async function removeMember(teamId, memberUserId, reason, actor, actorHasTeamWrite = false) {
    // validate team/member exists
    const tm = await prisma.teamMember.findUnique({
        where: { userId_teamId: { userId: memberUserId, teamId } },
    });
    if (!tm)
        throw new NotFoundError("Team member not found");
    if (actorHasTeamWrite) {
        // direct remove
        await prisma.teamMember.delete({
            where: { userId_teamId: { userId: memberUserId, teamId } },
        });
        // AUDIT: direct remove by HR
        // AUDIT: logTeamAction({ userId: actor?.id, action: 'team.remove', resource: 'team', resourceId: teamId, payload: { targetUserId: memberUserId, reason } })
        return { removed: true };
    }
    else {
        // actor must be lead of this team to request removal
        if (!(await isTeamLead(teamId, actor.id))) {
            throw new UnauthorizedError("Not allowed to remove member");
        }
        const req = await prisma.teamRequest.create({
            data: {
                type: "remove",
                requesterId: actor.id,
                targetUserId: memberUserId,
                fromTeamId: teamId,
                note: reason,
            },
        });
        // AUDIT: removal request created (team lead)
        // AUDIT: logTeamAction({ userId: actor?.id, action: 'team.request.remove', resource: 'team', resourceId: teamId, payload: { requestId: req.id, targetUserId: memberUserId, reason } })
        return { request: req };
    }
}
async function bulkRemoveMembers(teamId, userIds, reason, actor, actorHasTeamWrite = false) {
    const removed = [];
    const requests = [];
    const failed = [];
    for (const uid of userIds) {
        try {
            const res = await removeMember(teamId, uid, reason, actor, actorHasTeamWrite);
            if (res.removed)
                removed.push(uid);
            else if (res.request)
                requests.push(res.request);
        }
        catch (err) {
            failed.push({ userId: uid, reason: err.message ?? "error" });
        }
    }
    return { removed, requests, failed };
}
/**
 * Create transfer request (team lead requests transfer of member to another team)
 */
async function createTransferRequest(fromTeamId, memberUserId, toTeamId, actor) {
    // validate membership
    const tm = await prisma.teamMember.findUnique({
        where: { userId_teamId: { userId: memberUserId, teamId: fromTeamId } },
    });
    if (!tm)
        throw new NotFoundError("Team member not found");
    // actor must be lead of fromTeam
    if (!(await isTeamLead(fromTeamId, actor.id))) {
        throw new UnauthorizedError("Only team lead can request transfer");
    }
    const req = await prisma.teamRequest.create({
        data: {
            type: "transfer",
            requesterId: actor.id,
            targetUserId: memberUserId,
            fromTeamId,
            toTeamId,
            note: `Transfer requested by ${actor.id}`,
        },
    });
    // AUDIT: transfer request created
    // AUDIT: logTeamAction({ userId: actor?.id, action: 'team.request.transfer', resource: 'team', resourceId: fromTeamId, payload: { requestId: req.id, targetUserId: memberUserId, toTeamId } })
    return req;
}
/**
 * Create join request (team lead or user requests a teamless user be added)
 */
async function createJoinRequest(teamId, targetUserId, actor) {
    const user = await prisma.user.findUnique({ where: { id: targetUserId } });
    if (!user)
        throw new NotFoundError("Target user not found");
    // if user already member of the team, short-circuit
    const exists = await prisma.teamMember
        .findUnique({
        where: { userId_teamId: { userId: targetUserId, teamId } },
    })
        .catch(() => null);
    if (exists)
        throw new BadRequestError("User already a member of the team");
    // if actor is team lead for this team -> allowed to request
    const isLead = await isTeamLead(teamId, actor.id);
    const isSelf = actor.id === targetUserId;
    if (!isLead && !isSelf) {
        throw new UnauthorizedError("Only team lead or target user can create join request");
    }
    const req = await prisma.teamRequest.create({
        data: {
            type: "join",
            requesterId: actor.id,
            targetUserId,
            toTeamId: teamId,
            status: "pending",
            note: `Join requested by ${actor.id}`,
        },
    });
    // AUDIT: join request created
    // AUDIT: logTeamAction({ userId: actor?.id, action: 'team.request.join', resource: 'team', resourceId: teamId, payload: { requestId: req.id, targetUserId } })
    return req;
}
/**
 * List pending requests (optionally filter)
 */
async function listRequests(filter) {
    const where = {};
    if (filter?.status)
        where.status = filter.status;
    if (filter?.type)
        where.type = filter.type;
    return prisma.teamRequest.findMany({
        where,
        orderBy: { createdAt: "desc" },
    });
}
/**
 * Approve/reject a TeamRequest. Approver must have teamWrite permission (HR/manager).
 * On approval: perform assignment/removal/transfer/join as appropriate inside a transaction.
 */
async function respondToRequest(requestId, approve, actor, note) {
    const req = await prisma.teamRequest.findUnique({ where: { id: requestId } });
    if (!req)
        throw new NotFoundError("Request not found");
    if (req.status !== "pending")
        throw new BadRequestError("Request already processed");
    if (!approve) {
        const updated = await prisma.teamRequest.update({
            where: { id: requestId },
            data: {
                status: "rejected",
                respondedBy: actor?.id ?? null,
                respondedAt: new Date(),
                note: note ?? req.note,
            },
        });
        // AUDIT: request rejected
        // AUDIT: logTeamAction({ userId: actor?.id, action: 'team.request.reject', resource: 'team', resourceId: req.toTeamId ?? req.fromTeamId, payload: { requestId, targetUserId: req.targetUserId, note } })
        return updated;
    }
    // APPROVE
    if (req.type === "assign") {
        // create TeamMember
        const tm = await prisma.teamMember.create({
            data: {
                userId: req.targetUserId,
                teamId: req.toTeamId,
                role: "MEMBER",
                meta: { assignedBy: actor?.id ?? null },
            },
        });
        const updated = await prisma.teamRequest.update({
            where: { id: requestId },
            data: {
                status: "approved",
                respondedBy: actor?.id ?? null,
                respondedAt: new Date(),
            },
        });
        // AUDIT: assignment approved & performed
        // AUDIT: logTeamAction({ userId: actor?.id, action: 'team.request.approve.assign', resource: 'team', resourceId: req.toTeamId, payload: { requestId, targetUserId: req.targetUserId } })
        return { request: updated, teamMember: tm };
    }
    if (req.type === "remove") {
        // delete TeamMember
        await prisma.teamMember.delete({
            where: {
                userId_teamId: { userId: req.targetUserId, teamId: req.fromTeamId },
            },
        });
        const updated = await prisma.teamRequest.update({
            where: { id: requestId },
            data: {
                status: "approved",
                respondedBy: actor?.id ?? null,
                respondedAt: new Date(),
            },
        });
        // AUDIT: removal approved & performed
        // AUDIT: logTeamAction({ userId: actor?.id, action: 'team.request.approve.remove', resource: 'team', resourceId: req.fromTeamId, payload: { requestId, targetUserId: req.targetUserId } })
        return { request: updated };
    }
    if (req.type === "transfer") {
        // transaction: delete old membership, create new membership
        const result = await prisma.$transaction(async (tx) => {
            // ensure old membership exists
            const old = await tx.teamMember.findUnique({
                where: {
                    userId_teamId: { userId: req.targetUserId, teamId: req.fromTeamId },
                },
            });
            if (!old)
                throw new NotFoundError("Member not found in fromTeam");
            // delete old
            await tx.teamMember.delete({
                where: {
                    userId_teamId: { userId: req.targetUserId, teamId: req.fromTeamId },
                },
            });
            // create new
            const created = await tx.teamMember.create({
                data: {
                    userId: req.targetUserId,
                    teamId: req.toTeamId,
                    role: "MEMBER",
                    meta: { transferredBy: actor?.id ?? null },
                },
            });
            // mark request approved
            const updatedReq = await tx.teamRequest.update({
                where: { id: requestId },
                data: {
                    status: "approved",
                    respondedBy: actor?.id ?? null,
                    respondedAt: new Date(),
                },
            });
            return { updatedReq, created };
        });
        // AUDIT: transfer approved & performed
        // AUDIT: logTeamAction({ userId: actor?.id, action: 'team.request.approve.transfer', resource: 'team', resourceId: req.toTeamId, payload: { requestId, targetUserId: req.targetUserId } })
        return result;
    }
    if (req.type === "join") {
        // create TeamMember
        const tm = await prisma.teamMember.create({
            data: {
                userId: req.targetUserId,
                teamId: req.toTeamId,
                role: "MEMBER",
                meta: { joinedBy: actor?.id ?? null },
            },
        });
        const updated = await prisma.teamRequest.update({
            where: { id: requestId },
            data: {
                status: "approved",
                respondedBy: actor?.id ?? null,
                respondedAt: new Date(),
            },
        });
        // AUDIT: join approved & performed
        // AUDIT: logTeamAction({ userId: actor?.id, action: 'team.request.approve.join', resource: 'team', resourceId: req.toTeamId, payload: { requestId, targetUserId: req.targetUserId } })
        return { request: updated, teamMember: tm };
    }
    throw new BadRequestError("Unknown request type");
}
/**
 * list members using TeamMember join table with user info
 */
async function listTeamMembers(teamId, opts) {
    const rows = await prisma.teamMember.findMany({
        where: { teamId },
        include: { user: { include: { roles: { include: { role: true } } } } },
        orderBy: { createdAt: "desc" },
        take: opts?.limit ?? 100,
        skip: opts?.offset ?? 0,
    });
    return rows;
}
//# sourceMappingURL=team.service.js.map