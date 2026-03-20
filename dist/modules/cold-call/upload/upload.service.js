// /src/modules/cold-call/upload/upload.service.ts
import { prisma } from "../../../db/db.js";
import { Prisma } from "@prisma/client";
import { parseXlsxBuffer } from "./util/xlsx-parser.util.js";
import { computeColdCallDedupeHash } from "./util/dedupe.util.js";
/**
 * helper - normalize phone for storage
 * store digits-only (no spaces, punctuation). We intentionally do NOT attempt to add
 * or guess country code. Keep stored form as canonical digits to simplify searching/comparisons.
 */
function normalizePhoneForStorage(p) {
    if (!p)
        return null;
    const digits = String(p).replace(/[^\d]/g, "");
    return digits === "" ? null : digits;
}
/**
 * Input DTO
 */
export async function uploadColdCallService(input) {
    const rows = await parseXlsxBuffer(input.fileBuffer);
    if (!rows || rows.length === 0) {
        throw new Error("No rows found in the uploaded file");
    }
    // Normalize: compute dedupeHash for every row and map minimal fields
    const normalized = rows.map((r, idx) => {
        const phone = (r.phone ??
            r.mobile ??
            r.contact ??
            r["phone number"] ??
            "");
        const email = (r.email ?? r.mail ?? "");
        const name = (r.name ?? r.fullname ?? r["full name"] ?? "");
        const dedupeHash = computeColdCallDedupeHash({
            phone: phone ?? null,
            email: email ?? null,
        });
        return {
            rowIndex: r.__rowNum__ ?? idx + 1,
            phone: phone ? String(phone).trim() : null,
            email: email ? String(email).trim().toLowerCase() : null,
            name: name ? String(name).trim() : null,
            payload: r,
            dedupeHash,
        };
    });
    // Build set of hashes (filter nulls) and query existing (global) entries to detect duplicates
    const dedupeSet = Array.from(new Set(normalized
        .map((r) => r.dedupeHash)
        .filter((s) => typeof s === "string" && s.length > 0)));
    // Transaction: create batch, then entries (createMany in chunks)
    return prisma.$transaction(async (tx) => {
        const batch = await tx.coldCallBatch.create({
            data: {
                uploadedById: input.uploadedById,
                originalName: input.originalName ?? null,
                mode: input.mode,
                routingConfig: input.routingConfig ?? Prisma.JsonNull,
                dedupePolicy: input.dedupePolicy,
                teamConfig: input.teamIds
                    ? { selectedTeamIds: input.teamIds }
                    : Prisma.JsonNull,
                totalCount: rows.length,
            },
        });
        // fetch existing dedupeHashes from DB (existing ColdCallEntry)
        const existingEntries = dedupeSet.length
            ? await tx.coldCallEntry.findMany({
                where: { dedupeHash: { in: dedupeSet } },
                select: { dedupeHash: true },
            })
            : [];
        const existingSet = new Set(existingEntries.map((e) => e.dedupeHash));
        let createdCount = 0;
        let duplicateCount = 0;
        let skippedCount = 0;
        // Prepare records for createMany (Prisma createMany accepts array)
        const toInsert = [];
        for (const r of normalized) {
            const alreadyExists = !!(r.dedupeHash && existingSet.has(r.dedupeHash));
            if (alreadyExists)
                duplicateCount++;
            if (alreadyExists && input.dedupePolicy === "skip") {
                skippedCount++;
                continue;
            }
            // If keep: we still insert duplicates as normal (status pending)
            // optionally you could mark meta flag payload.__duplicate = true if you want to track
            const assignedTeamId = input.mode === "manual" &&
                Array.isArray(input.teamIds) &&
                input.teamIds.length > 0
                ? input.teamIds[0]
                : null;
            toInsert.push({
                batchId: batch.id,
                rowIndex: r.rowIndex,
                phone: normalizePhoneForStorage(r.phone) ?? null,
                email: r.email ?? null,
                name: r.name ?? null,
                payload: r.payload ?? Prisma.JsonNull,
                dedupeHash: r.dedupeHash ?? null,
                assignedTeamId,
                status: "pending",
            });
            createdCount++;
        }
        // Bulk insert in chunks (to avoid too-large single queries)
        const CHUNK = 500;
        for (let i = 0; i < toInsert.length; i += CHUNK) {
            const chunk = toInsert.slice(i, i + CHUNK);
            await tx.coldCallEntry.createMany({
                data: chunk,
                skipDuplicates: false,
            });
        }
        // Update batch summary
        await tx.coldCallBatch.update({
            where: { id: batch.id },
            data: {
                createdCount,
                duplicateCount,
                skippedCount,
            },
        });
        // TODO: log upload metrics (file size, rows parsed) for analytics. Implement in Phase 3.
        // (left as TODO per request)
        // Return a small preview (first 10 entries) for uploader verification
        const preview = await tx.coldCallEntry.findMany({
            where: { batchId: batch.id },
            orderBy: { createdAt: "asc" },
            take: 10,
        });
        return {
            batchId: batch.id,
            total: rows.length,
            created: createdCount,
            duplicates: duplicateCount,
            skipped: skippedCount,
            preview,
        };
    });
}
//# sourceMappingURL=upload.service.js.map