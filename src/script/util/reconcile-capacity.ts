// scripts/reconcile-capacity.ts
/**
 * Rebuilds UserCapacity.used counts based on current open leads.
 *
 * Usage:
 *   node -r ts-node/register scripts/reconcile-capacity.ts
 *
 * This script is a reconciliation CLI that should be run manually or via cron
 * if you suspect capacity.used drift. It upserts userCapacity rows where missing.
 */

import { prisma } from "@/db/db.js";

async function main() {
  console.log("Starting capacity reconciliation...");
  const users = await prisma.user.findMany({ select: { id: true } });

  for (const u of users) {
    const openCount = await prisma.lead.count({
      where: {
        assignedToId: u.id,
        // treat these as non-terminal; adjust statuses as per your business logic
        status: {
          notIn: ["WON", "LOST", "UNASSIGNED_ESCALATED", "UNQUALIFIED"],
        },
      },
    });

    await prisma.userCapacity.upsert({
      where: { userId: u.id },
      update: { used: openCount },
      create: {
        userId: u.id,
        used: openCount,
        maxOpen: parseInt(process.env.DEFAULT_USER_MAX_OPEN ?? "10", 10),
      },
    });
  }

  console.log("Capacity reconciliation complete.");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Reconcile failed", err);
    process.exit(1);
  });
