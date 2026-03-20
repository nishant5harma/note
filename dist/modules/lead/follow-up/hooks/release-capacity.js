// src/modules/lead/followup/hooks/capacity-release.hook.ts
// TODO: Wire this when Lead Follow-Up / Lead status transition logic is implemented.
// This helper MUST be executed inside the same Prisma transaction that transitions
// the lead to a terminal state (WON, LOST, UNQUALIFIED) to avoid races.
/**
 * releaseCapacityForTerminalLeadTx
 * - Runs inside an existing Prisma transaction `tx` to safely decrement capacity.used
 *   for the user previously assigned to the lead when the lead is moved to a terminal state.
 *
 * Usage (example, inside a tx):
 *   await releaseCapacityForTerminalLeadTx(tx, leadId);
 */
export async function releaseCapacityForTerminalLeadTx(tx, leadId) {
    const lead = await tx.lead.findUnique({
        where: { id: leadId },
        select: { assignedToId: true, status: true },
    });
    if (!lead?.assignedToId)
        return;
    // Terminal states - adjust if your app uses different enum names.
    if (!["WON", "LOST", "UNQUALIFIED"].includes(lead.status))
        return;
    // Decrement used if greater than 0
    await tx.userCapacity.updateMany({
        where: {
            userId: lead.assignedToId,
            used: { gt: 0 },
        },
        data: {
            used: { decrement: 1 },
        },
    });
    // TODO: audit + TODO: prometheus
}
//# sourceMappingURL=release-capacity.js.map