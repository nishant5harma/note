// /src/modules/cold-call/agent/helper-controllers/attempt.controller.ts
import type { Request, Response, NextFunction } from "express";
import { prisma } from "@/db/db.js";
import { scheduleRetry } from "../../queue/retry.queue.js";
import { evaluateRetry } from "../../retry/retry.service.js";

/**
 * POST /coldcall/entries/:id/attempt
 * Body: { result?: string, notes?: string }
 *
 * Logs an attempt; does NOT finalize the entry.
 */
export async function logAttemptHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = (req as any).user?.id;
    const entryId = Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id;
    if (!userId) return res.status(401).json({ error: "unauthenticated" });
    if (!entryId) return res.status(400).json({ error: "entryId required" });

    const payload = req.body ?? {};
    const notes = payload.notes ?? null;
    const result = payload.result ?? null;

    // Create attempt inside a transaction to safely compute attemptNo
    const created = await prisma.$transaction(async (tx) => {
      const max = await tx.coldCallAttempt.aggregate({
        _max: { attemptNo: true },
        where: { entryId },
      });

      const nextAttemptNo = (max._max?.attemptNo ?? 0) + 1;

      return await tx.coldCallAttempt.create({
        data: {
          entryId,
          attemptNo: nextAttemptNo,
          userId,
          result: result ?? null,
          notes: notes ?? null,
        },
      });
    });

    // Keep entry status in_progress and extend TTL slightly (best-effort)
    try {
      await prisma.coldCallEntry.update({
        where: { id: entryId },
        data: {
          status: "in_progress",
          lockExpiresAt: new Date(Date.now() + 2 * 60_000),
        },
      });
    } catch (_) {}

    return res.json({ ok: true, attempt: created });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /coldcall/entries/:id/complete
 */
export async function completeEntryHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const actorId = (req as any).user?.id ?? "system";
    const entryId = Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id;
    const body = req.body ?? {};

    if (!entryId)
      return res.status(400).json({ ok: false, error: "entryId required" });

    const response = body.response;
    const disposition = body.disposition ?? null;
    const summary = body.summary ?? null;
    const leadConversion = body.leadConversion ?? null;

    if (!response)
      return res.status(400).json({ ok: false, error: "response required" });

    // Transactional commit:
    const result = await prisma.$transaction(async (tx) => {
      const entry = await tx.coldCallEntry.findUnique({
        where: { id: entryId },
      });
      if (!entry) throw new Error("entry-not-found");

      // capture lock owner BEFORE modifying entry
      const lockOwner = entry.lockUserId;

      const lockExpired =
        !entry.lockExpiresAt || new Date(entry.lockExpiresAt) < new Date();

      if (
        lockOwner &&
        lockOwner !== actorId &&
        !lockExpired &&
        actorId !== "system"
      ) {
        throw new Error("not-lock-owner");
      }

      // Update entry -> finalize
      const updatedEntry = await tx.coldCallEntry.update({
        where: { id: entryId },
        data: {
          status: "done",
          response,
          disposition,
          summary,
          lockUserId: null,
          lockExpiresAt: null,
        },
      });

      let createdLead: any = null;

      // Create lead if needed
      if (leadConversion?.createLead) {
        const leadData: any = {
          source: "cold_call",
          name: leadConversion?.leadFields?.name ?? entry.name ?? undefined,
          email: leadConversion?.leadFields?.email ?? entry.email ?? undefined,
          phone: leadConversion?.leadFields?.phone ?? entry.phone ?? undefined,
          payload: {
            fromColdCallEntryId: entryId,
            originalPayload: entry.payload,
          },
        };

        createdLead = await tx.lead.create({ data: leadData });

        await tx.coldCallEntry.update({
          where: { id: entryId },
          data: { leadId: createdLead.id },
        });

        // Create follow-up and assign to original lock owner
        if (leadConversion?.createFollowUp) {
          await tx.leadFollowUp.create({
            data: {
              leadId: createdLead.id,
              assignedTo: lockOwner, // FIXED
              dueAt: leadConversion?.followUpDueAt
                ? new Date(String(leadConversion.followUpDueAt))
                : null,
              note:
                leadConversion?.followUpNote ??
                `Follow-up from cold call ${entryId}`,
              status: "pending",
              meta: { createdBy: actorId },
            },
          });
        }
      }

      // Create a final attempt using NEXT attempt number
      const max = await tx.coldCallAttempt.aggregate({
        _max: { attemptNo: true },
        where: { entryId },
      });
      const nextAttemptNo = (max._max?.attemptNo ?? 0) + 1;

      await tx.coldCallAttempt.create({
        data: {
          entryId,
          attemptNo: nextAttemptNo, // FIXED
          userId: actorId === "system" ? null : actorId,
          result: response as any,
          notes: summary ?? null,
        },
      });

      return { updatedEntry, createdLead };
    });

    const { shouldRetry, retryAt } = await evaluateRetry(entryId);
    if (shouldRetry && retryAt) {
      // Mark entry back to pending after TTL is over (worker will pick it)
      await scheduleRetry(entryId, retryAt);
    }

    return res.json({ ok: true, result });
  } catch (err) {
    next(err);
  }
}
