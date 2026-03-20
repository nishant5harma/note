// src/modules/cold-call/retry/retry.service.ts
import { prisma } from "@/db/db.js";
import { RETRY_RULES } from "./retry-rules.js";

export async function evaluateRetry(entryId: string) {
  const entry = await prisma.coldCallEntry.findUnique({
    where: { id: entryId },
    include: { attempts: true },
  });

  if (!entry) throw new Error("entry-not-found");

  const attempts = entry.attempts.length;
  const last = entry.attempts[attempts - 1];

  const result = last?.result as keyof typeof RETRY_RULES.DELAYS;

  // If exceeded attempts or final disposition → no retry
  if (!result) return { shouldRetry: false };

  if (attempts >= RETRY_RULES.MAX_ATTEMPTS) {
    return { shouldRetry: false };
  }

  const delay = RETRY_RULES.DELAYS[result] ?? 0;
  if (delay <= 0) {
    return { shouldRetry: false };
  }

  return {
    shouldRetry: true,
    retryAt: new Date(Date.now() + delay),
  };
}
