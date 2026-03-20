/**
 * Claim the next available ColdCallEntry for the user.
 *
 * Uses Postgres row-level locking via a raw SELECT ... FOR UPDATE SKIP LOCKED
 * inside a transaction to avoid races.
 *
 * Returns the claimed entry (after setting lockUserId, lockExpiresAt, status).
 *
 * NOTE: We build a safe SQL using parameter replacement for teamIds array.
 */
export declare function claimNextColdCallEntry(userId: string, teamIds: string[], lockMs?: number): Promise<{
    id: string;
    createdAt: Date;
    name: string | null;
    email: string | null;
    phone: string | null;
    updatedAt: Date;
    payload: import("@prisma/client/runtime/library").JsonValue | null;
    status: import("@prisma/client").$Enums.ColdCallEntryStatus;
    leadId: string | null;
    dedupeHash: string | null;
    priority: number;
    assignedTeamId: string | null;
    disposition: import("@prisma/client").$Enums.ColdCallDisposition | null;
    batchId: string;
    rowIndex: number | null;
    lockUserId: string | null;
    lockExpiresAt: Date | null;
    response: import("@prisma/client").$Enums.ColdCallResponse | null;
    summary: string | null;
}>;
/**
 * Refresh lock TTL for an entry (only owner allowed).
 */
export declare function refreshLock(entryId: string, userId: string, addMs?: number): Promise<{
    id: string;
    createdAt: Date;
    name: string | null;
    email: string | null;
    phone: string | null;
    updatedAt: Date;
    payload: import("@prisma/client/runtime/library").JsonValue | null;
    status: import("@prisma/client").$Enums.ColdCallEntryStatus;
    leadId: string | null;
    dedupeHash: string | null;
    priority: number;
    assignedTeamId: string | null;
    disposition: import("@prisma/client").$Enums.ColdCallDisposition | null;
    batchId: string;
    rowIndex: number | null;
    lockUserId: string | null;
    lockExpiresAt: Date | null;
    response: import("@prisma/client").$Enums.ColdCallResponse | null;
    summary: string | null;
}>;
/**
 * Release lock (clear lockUserId and lockExpiresAt).
 * Optionally set status -> pending (unless forceDone === true).
 */
export declare function releaseLock(entryId: string, userId: string, makePending?: boolean): Promise<{
    id: string;
    createdAt: Date;
    name: string | null;
    email: string | null;
    phone: string | null;
    updatedAt: Date;
    payload: import("@prisma/client/runtime/library").JsonValue | null;
    status: import("@prisma/client").$Enums.ColdCallEntryStatus;
    leadId: string | null;
    dedupeHash: string | null;
    priority: number;
    assignedTeamId: string | null;
    disposition: import("@prisma/client").$Enums.ColdCallDisposition | null;
    batchId: string;
    rowIndex: number | null;
    lockUserId: string | null;
    lockExpiresAt: Date | null;
    response: import("@prisma/client").$Enums.ColdCallResponse | null;
    summary: string | null;
}>;
//# sourceMappingURL=pull.service.d.ts.map