// /src/script/cron/reconciliation.cron.ts
import cron from "node-cron";
import { runReservationReconciliation } from "@/modules/inventory/reservation/worker/reconciliation.worker.js";

/**
 * Cron: run reservation reconciliation every 5 minutes.
 * This ensures orphaned reservations are expired and inventory is freed,
 * even if Bull worker fails or system restarts during a job window.
 *
 * Runs at:
 *   0,5,10,15,20,25,30,35,40,45,50,55 minutes of every hour.
 */

export function startReconciliationCron() {
  console.log("[CRON] Starting Reservation Reconciliation (*/5 * * * *)");

  cron.schedule("*/5 * * * *", async () => {
    try {
      console.log(
        `[CRON] Running reservation reconciliation at ${new Date().toISOString()}`
      );

      const result = await runReservationReconciliation(300);
      // 300 = max items to process per batch (safe value)

      console.log(
        `[CRON] Reconciliation complete. Processed = ${result.processed}`
      );
    } catch (err) {
      console.error("[CRON] Reconciliation error:", err);
    }
  });
}
