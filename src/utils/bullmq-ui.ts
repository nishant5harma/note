import { type Application } from "express";
import { createBullBoard } from "@bull-board/api";
import { ExpressAdapter } from "@bull-board/express";
import { BullMQAdapter } from "@bull-board/api/bullMQAdapter";
import {
  assignmentQueue,
  assignmentCheckQueue,
  escalationQueue,
  teamAssignmentQueue,
} from "@/modules/lead/assignment/queue/queue.js";

export function initBullBoard(app: Application) {
  // Read env vars inside the function so tests can override them
  const UI_ROUTE = process.env.BULLMQ_UI_ROUTE || "/admin/queues";
  const AUTH_TOKEN = process.env.BULLMQ_UI_AUTH_TOKEN || "";

  const serverAdapter = new ExpressAdapter();
  serverAdapter.setBasePath(UI_ROUTE);

  const adapters = [
    new BullMQAdapter(assignmentQueue),
    new BullMQAdapter(assignmentCheckQueue),
    new BullMQAdapter(escalationQueue),
    new BullMQAdapter(teamAssignmentQueue),
  ];

  createBullBoard({
    queues: adapters,
    serverAdapter,
  });

  // Auth Middleware
  app.use(UI_ROUTE, (req, res, next) => {
    if (!AUTH_TOKEN) {
      return next();
    }

    const auth = req.headers["x-admin-token"] || req.query?.token;
    if (!auth || String(auth) !== AUTH_TOKEN) {
      res.status(401).send("Unauthorized - missing admin token");
      return;
    }
    return next();
  });

  app.use(UI_ROUTE, serverAdapter.getRouter());
}
