import { PrismaClient } from "@prisma/client";
/**
 * releaseCapacityForTerminalLeadTx
 * - Runs inside an existing Prisma transaction `tx` to safely decrement capacity.used
 *   for the user previously assigned to the lead when the lead is moved to a terminal state.
 *
 * Usage (example, inside a tx):
 *   await releaseCapacityForTerminalLeadTx(tx, leadId);
 */
export declare function releaseCapacityForTerminalLeadTx(tx: PrismaClient, leadId: string): Promise<void>;
//# sourceMappingURL=release-capacity.d.ts.map