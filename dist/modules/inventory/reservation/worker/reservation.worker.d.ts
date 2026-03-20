import { Queue } from "bullmq";
export declare const reservationExpirationQueue: Queue<any, any, string, any, any, string>;
/**
 * Enqueue expiration for reservationId at given expiresAt Date
 * Also persist a ReservationTTLJob row as the canonical source of jobId.
 * Returns jobId (string).
 */
export declare function enqueueReservationExpiration(reservationId: string, expiresAt: Date): Promise<string>;
/**
 * Worker: process expiration
 * - if reservation still active and expiresAt <= now => mark EXPIRED and free unit/listing
 */
export declare function startReservationWorker(): void;
//# sourceMappingURL=reservation.worker.d.ts.map