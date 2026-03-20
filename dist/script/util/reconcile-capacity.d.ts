/**
 * Rebuilds UserCapacity.used counts based on current open leads.
 *
 * Usage:
 *   node -r ts-node/register scripts/reconcile-capacity.ts
 *
 * This script is a reconciliation CLI that should be run manually or via cron
 * if you suspect capacity.used drift. It upserts userCapacity rows where missing.
 */
export {};
//# sourceMappingURL=reconcile-capacity.d.ts.map