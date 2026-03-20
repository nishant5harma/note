// src/modules/inventory/common/__tests__/inventory.audit.integration.test.ts
import { describe, it, expect } from "@jest/globals";
import { prisma } from "@/db/db.js";

/* ------------------------------------------------------------------ */
/* 📦 SUBJECT                                                         */
/* ------------------------------------------------------------------ */
import { inventoryAudit } from "../inventory.audit.js";

/* ------------------------------------------------------------------ */
/* 🧪 TESTS                                                           */
/* ------------------------------------------------------------------ */
describe("Inventory Audit (integration)", () => {
  it("persists an audit record with correct fields", async () => {
    const row = await inventoryAudit(null, "inventory.test", "unit", "unit-1", {
      foo: "bar",
    });

    expect(row.id).toBeDefined();
    expect(row.action).toBe("inventory.test");
    expect(row.resource).toBe("unit");

    const stored = await prisma.inventoryAudit.findUnique({
      where: { id: row.id },
    });

    expect(stored).not.toBeNull();
    expect(stored!.meta).toEqual({ foo: "bar" });
  });
});
