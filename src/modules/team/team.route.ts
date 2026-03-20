import { Router } from "express";
import { TeamController } from "./team.controller.js";
import { requirePermission } from "@/middlewares/require-premission.middleware.js";

// /src/modules/team/team.route.ts
export const TeamRouter: Router = Router();

// Team CRUD
TeamRouter.post(
  "/",
  requirePermission("team", "write"),
  TeamController.createTeam
);
TeamRouter.get(
  "/",
  requirePermission("team", "read"),
  TeamController.listTeams
);
TeamRouter.get(
  "/:id",
  requirePermission("team", "read"),
  TeamController.getTeam
);
TeamRouter.patch(
  "/:id",
  requirePermission("team", "write"),
  TeamController.updateTeam
);
TeamRouter.delete(
  "/:id",
  requirePermission("team", "write"),
  TeamController.deleteTeam
);

TeamRouter.get(
  "/:id/users",
  requirePermission("team", "read"),
  TeamController.listTeamUsers
);

// Lead management
TeamRouter.post(
  "/:id/assign-lead",
  requirePermission("team", "assignLead"),
  TeamController.assignLead
);

// Members: assign (single/bulk). Team leads can create requests; HR can assign directly (controller/service enforces)
TeamRouter.post(
  "/:teamId/members",
  requirePermission("team", "write"),
  TeamController.assignMembersHandler
);
TeamRouter.post(
  "/:teamId/members/bulk",
  requirePermission("team", "write"),
  TeamController.bulkAssignHandler
);

// Members: remove (single/bulk)
TeamRouter.delete(
  "/:teamId/members/:memberId",
  requirePermission("team", "write"),
  TeamController.removeMemberHandler
);
TeamRouter.post(
  "/:teamId/members/bulk-remove",
  requirePermission("team", "write"),
  TeamController.bulkRemoveHandler
);

// Members list
TeamRouter.get(
  "/:teamId/members",
  requirePermission("team", "read"),
  TeamController.listTeamMembersHandler
);

// Requests (transfer/join)
TeamRouter.post(
  "/:teamId/members/:memberId/transfer-request",
  requirePermission("team", "read"),
  TeamController.transferRequestHandler
);
TeamRouter.post(
  "/:teamId/join-request",
  requirePermission("team", "read"),
  TeamController.joinRequestHandler
);

// Requests admin (approve/reject)
TeamRouter.get(
  "/requests",
  requirePermission("team", "read"),
  TeamController.listRequestsHandler
);
TeamRouter.post(
  "/requests/:requestId/respond",
  requirePermission("team", "write"),
  TeamController.respondRequestHandler
);

export default TeamRouter;
