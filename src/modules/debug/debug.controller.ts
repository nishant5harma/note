// src/modules/debug/debug.controller.ts
import type { Request, Response, NextFunction } from "express";
import {
  sendLocationFetchSignal,
  sendPushToUser,
} from "../socket/util-socket/push.sender.js";

export async function pushTestHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { userId, type } = req.body;
    if (!userId) return res.status(400).json({ error: "userId required" });

    if (type === "fetch") {
      const r = await sendLocationFetchSignal(
        userId,
        req.body.requestId ?? "test-req"
      );
      return res.json({ ok: true, result: r });
    }

    const r = await sendPushToUser(userId, {
      type: "DEBUG_PUSH",
      payload: req.body.payload ?? {},
    });
    return res.json({ ok: true, result: r });
  } catch (err) {
    next(err);
  }
}
