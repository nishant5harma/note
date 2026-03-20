/**
 * Reconciliation job:
 * - Find ACTIVE reservations whose expiresAt < now
 * - Acquire lock per reservation resource (unit/listing)
 * - Expire reservation + free inventory
 * - Remove TTL job from Bull + delete ReservationTTLJob (canonical source)
 */
export declare function runReservationReconciliation(limit?: number): Promise<{
    processed: number;
}>;
//# sourceMappingURL=reconciliation.worker.d.ts.map