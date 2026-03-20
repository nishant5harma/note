// src/middlewares/hmac.middleware.ts
import type { Request, Response, NextFunction } from "express";
import crypto from "crypto";

/**
 * This middleware:
 * - Expects route to be used with raw(...) ideally, but will also work if body was parsed already.
 * - Reads provider from header x-lead-source (if present) to pick provider secret.
 * - Attaches (req as any).rawBodyString for downstream use.
 * - If the body is an object (already parsed), it uses JSON.stringify(body) as canonical bytes
 *   (warns in logs because canonicalization may differ from provider's original bytes).
 */

function getSecretForProvider(provider: string | undefined) {
  if (!provider) return process.env.WEBHOOK_SECRET_DEFAULT ?? null;
  const key = `WEBHOOK_SECRET_${provider.toUpperCase().replace(/[^A-Z0-9]/g, "_")}`;
  return (
    (process.env as any)[key] ?? process.env.WEBHOOK_SECRET_DEFAULT ?? null
  );
}

function toBufferLike(body: any): {
  buf: Buffer;
  via: "buffer" | "stringify" | "string";
} {
  // 1. Explicitly handle empty/nullish values
  if (body === null || body === undefined) {
    return { buf: Buffer.alloc(0), via: "string" };
  }

  if (Buffer.isBuffer(body)) return { buf: body, via: "buffer" };
  if (typeof body === "string")
    return { buf: Buffer.from(body, "utf8"), via: "string" };

  try {
    const s = JSON.stringify(body);
    return { buf: Buffer.from(s, "utf8"), via: "stringify" };
  } catch {
    return { buf: Buffer.from(String(body), "utf8"), via: "string" };
  }
}

export async function verifyHmacMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    // note: we trust header keys may be mixed-case; pick common names
    const signatureHeader =
      (req.headers["x-signature"] as string) ||
      (req.headers["x-hub-signature-256"] as string) ||
      (req.headers["x-hub-signature"] as string) ||
      "";

    const providerHeader =
      (req.headers["x-lead-source"] as string) ||
      (req.headers["x-source"] as string) ||
      undefined;
    const provider = providerHeader ? String(providerHeader) : undefined;

    const secret = getSecretForProvider(provider);

    // normalize body -> prefer raw Buffer when available, else stringify object/string
    const rawBody = (req as any).body;
    const { buf, via } = toBufferLike(rawBody);

    // Store rawBodyString for controller (utf8)
    (req as any).rawBodyString = buf.toString("utf8");

    if (!secret) {
      console.warn(
        "Webhook signature verification skipped: no secret configured for provider",
        provider
      );
      // still proceed but keep rawBodyString attached
      return next();
    }

    if (!buf || buf.length === 0) {
      return res
        .status(400)
        .json({ error: "Empty body; raw required for signature verification" });
    }

    // compute HMAC-SHA256
    const hmac = crypto.createHmac("sha256", secret);
    hmac.update(buf);
    const computedHex = hmac.digest("hex");
    const computed = `sha256=${computedHex}`;

    // normalize incoming header format
    const incoming = signatureHeader.startsWith("sha256=")
      ? signatureHeader
      : `sha256=${signatureHeader}`;

    // constant-time compare, only if lengths match
    const bufA = Buffer.from(computed);
    const bufB = Buffer.from(incoming || "");
    const ok =
      bufA.length === bufB.length && crypto.timingSafeEqual(bufA, bufB);

    if (!ok) {
      console.warn("Invalid webhook signature", {
        provider,
        incoming,
        computed,
        via,
      });
      return res.status(403).json({ error: "Invalid signature" });
    }

    return next();
  } catch (err) {
    next(err);
  }
}
