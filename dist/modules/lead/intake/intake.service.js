// src/modules/lead/intake/intake.service.ts
import { prisma } from "../../../db/db.js";
import { computeDedupeHash, tryAcquireRedisGuard, releaseRedisGuard, } from "./util/intake.util.js";
import { logAudit } from "../../../utils/audit.util.js";
import { applyProviderMapper } from "./provider-mappers/index.mapper.js";
import { enqueueAssignmentCheckJob, enqueueAssignmentJob, } from "../assignment/queue/queue.js";
/**
 * Map raw event into normalized shape depending on provider.
 * Always return a NormalizedEvent (no undefined fields).
 */
function normalizeEvent(provider, raw) {
    const mapped = provider ? applyProviderMapper(provider, raw) : null;
    if (mapped) {
        return {
            provider: mapped.provider ?? provider ?? "unknown",
            externalId: mapped.externalId ?? null,
            email: mapped.email ?? null,
            phone: mapped.phone ?? null,
            name: mapped.name ?? null,
            payload: mapped.payload ?? raw,
        };
    }
    // fallback: minimal normalized shape
    return {
        provider: provider ?? "unknown",
        externalId: raw?.id ?? raw?.externalId ?? null,
        email: raw?.email ?? null,
        phone: raw?.phone ?? null,
        name: raw?.name ?? null,
        payload: raw,
    };
}
/**
 * Placeholder for enqueuing assignment check job (assignment module implements real queue).
 */
async function enqueueAssignment(leadId, assignmentId) {
    await enqueueAssignmentJob(leadId, assignmentId);
    console.log("Enqueued assignment immediately", { leadId, assignmentId });
}
/**
 * Main intake handler:
 * - parse raw body (JSON or empty)
 * - normalize provider from headers or body
 * - compute dedupeHash
 * - use a Redis guard to avoid concurrent intake for same dedupe/externalId
 * - persist webhook event (audit)
 * - link to existing lead if found
 * - otherwise create lead and initial assignment row inside a transaction
 */
export async function handleWebhook(rawBodyString, headersIn) {
    // parse body safely
    let parsed;
    try {
        parsed = rawBodyString ? JSON.parse(rawBodyString) : {};
    }
    catch {
        parsed = {};
    }
    // Normalize headers to lowercase-keyed object for resilient lookup
    const headers = {};
    for (const k of Object.keys(headersIn || {})) {
        headers[k.toLowerCase()] = headersIn[k];
    }
    const providerHeader = headers["x-lead-source"] ?? headers["x-source"] ?? parsed.provider ?? null;
    // If provider isn't explicit, infer Facebook/Meta webhooks:
    // - Meta sends x-hub-signature-256 / x-hub-signature
    // - Lead Ads payload commonly has entry[].changes[].value.leadgen_id
    const inferredProvider = !providerHeader &&
        (headers["x-hub-signature-256"] ||
            headers["x-hub-signature"] ||
            parsed?.entry?.[0]?.changes?.[0]?.value?.leadgen_id)
        ? "facebook"
        : null;
    const provider = (providerHeader ?? inferredProvider)
        ? String(providerHeader ?? inferredProvider).toLowerCase()
        : undefined;
    const normalized = normalizeEvent(provider, parsed);
    const dedupeHash = computeDedupeHash({
        phone: normalized.phone ?? null,
        email: normalized.email ?? null,
        source: normalized.provider ?? null,
        externalId: normalized.externalId ?? null,
    });
    const idempotencyKey = headers["x-idempotency-key"] ?? headers["x-idempotency"] ?? null;
    const guardKey = `lead:intake:guard:${dedupeHash}${idempotencyKey ? ":" + idempotencyKey : ""}`;
    const acquired = await tryAcquireRedisGuard(guardKey, 20_000);
    if (!acquired) {
        // Another worker likely handling the same dedupeHash+idempotency -> store event and return
        const event = await prisma.leadWebhookEvent.create({
            data: {
                provider: normalized.provider ?? provider ?? "unknown",
                externalId: normalized.externalId ?? null,
                payload: normalized.payload ?? parsed,
                rawBody: rawBodyString,
                headers: headersIn ?? {},
                dedupeHash,
            },
        });
        return { ok: true, note: "processing in-flight", eventId: event.id };
    }
    try {
        // Try to find existing lead by externalId first, then dedupeHash
        let existingLead = null;
        if (normalized.externalId) {
            existingLead = await prisma.lead.findFirst({
                where: { externalId: normalized.externalId },
            });
        }
        if (!existingLead) {
            existingLead = await prisma.lead.findFirst({
                where: { dedupeHash },
            });
        }
        // persist webhook audit/event row
        const webhookEvent = await prisma.leadWebhookEvent.create({
            data: {
                provider: normalized.provider ?? provider ?? "unknown",
                externalId: normalized.externalId ?? null,
                payload: normalized.payload ?? parsed,
                rawBody: rawBodyString,
                headers: headersIn ?? {},
                dedupeHash,
                leadId: existingLead?.id ?? null,
            },
        });
        if (existingLead) {
            await logAudit({
                userId: null,
                action: "webhook.link",
                resource: "lead",
                resourceId: existingLead.id,
                payload: { webhookEventId: webhookEvent.id },
            });
            return {
                ok: true,
                leadId: existingLead.id,
                webhookEventId: webhookEvent.id,
                note: "linked",
            };
        }
        // Create lead + initial assignment in a transaction, then enqueue assignment check job
        const created = await prisma.$transaction(async (tx) => {
            const lead = await tx.lead.create({
                data: {
                    externalId: normalized.externalId ?? null,
                    dedupeHash,
                    source: normalized.provider ?? provider ?? null,
                    name: normalized.name ?? null,
                    email: normalized.email ?? null,
                    phone: normalized.phone ?? null,
                    payload: normalized.payload ?? parsed,
                },
            });
            const assignment = await tx.leadAssignment.create({
                data: {
                    leadId: lead.id,
                    assignedTo: null,
                    assignedBy: "system",
                    method: "auto",
                    attempt: 0,
                },
            });
            await tx.leadWebhookEvent.update({
                where: { id: webhookEvent.id },
                data: { leadId: lead.id },
            });
            return { lead, assignment };
        });
        // enqueue check for assignment (delayed worker) -> placeholder until assignment module is implemented
        await enqueueAssignment(created.lead.id, created.assignment.id);
        await logAudit({
            userId: null,
            action: "lead.create",
            resource: "lead",
            resourceId: created.lead.id,
            payload: { source: normalized.provider, webhookEventId: webhookEvent.id },
        });
        return {
            ok: true,
            leadId: created.lead.id,
            webhookEventId: webhookEvent.id,
            note: "created",
        };
    }
    finally {
        // Release guard (best-effort)
        try {
            await releaseRedisGuard(guardKey);
        }
        catch {
            // ignore
        }
    }
}
//# sourceMappingURL=intake.service.js.map