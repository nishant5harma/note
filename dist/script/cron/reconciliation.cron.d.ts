/**
 * Cron: run reservation reconciliation every 5 minutes.
 * This ensures orphaned reservations are expired and inventory is freed,
 * even if Bull worker fails or system restarts during a job window.
 *
 * Runs at:
 *   0,5,10,15,20,25,30,35,40,45,50,55 minutes of every hour.
 */
export declare function startReconciliationCron(): void;
//# sourceMappingURL=reconciliation.cron.d.ts.map