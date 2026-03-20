// src/modules/cold-call/upload/__tests__/upload.service.integration.test.ts
import { describe, it, expect } from "@jest/globals";
import XLSX from "xlsx";
import { prisma } from "../../../../db/db.js";
import { uploadColdCallService } from "../upload.service.js";
import { userFactory } from "../../../../tests/common/factories/user.factory.js";
import { teamFactory } from "../../../../tests/common/factories/team.factory.js";
function makeExcel(rows) {
    const ws = XLSX.utils.aoa_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    return XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
}
describe("uploadColdCallService", () => {
    it("creates batch and entries", async () => {
        const user = await userFactory.create();
        const buffer = makeExcel([
            ["Name", "Phone"],
            ["A", "111"],
            ["B", "222"],
        ]);
        const result = await uploadColdCallService({
            fileBuffer: buffer,
            uploadedById: user.id,
            dedupePolicy: "keep",
            mode: "manual",
        });
        expect(result.total).toBe(2);
        expect(result.created).toBe(2);
        const batch = await prisma.coldCallBatch.findUnique({
            where: { id: result.batchId },
        });
        expect(batch?.totalCount).toBe(2);
    });
    it("skips duplicates when dedupePolicy = skip", async () => {
        const user = await userFactory.create();
        const buffer = makeExcel([["Phone"], ["123"], ["123"]]);
        const r1 = await uploadColdCallService({
            fileBuffer: buffer,
            uploadedById: user.id,
            dedupePolicy: "keep",
            mode: "manual",
        });
        const r2 = await uploadColdCallService({
            fileBuffer: buffer,
            uploadedById: user.id,
            dedupePolicy: "skip",
            mode: "manual",
        });
        expect(r2.duplicates).toBeGreaterThan(0);
        expect(r2.skipped).toBeGreaterThan(0);
    });
    it("assigns team when mode=manual and teamIds provided", async () => {
        const user = await userFactory.create();
        const team = await teamFactory.create();
        const buffer = makeExcel([["Phone"], ["999"]]);
        const res = await uploadColdCallService({
            fileBuffer: buffer,
            uploadedById: user.id,
            dedupePolicy: "keep",
            mode: "manual",
            teamIds: [team.id],
        });
        const entry = await prisma.coldCallEntry.findFirst({
            where: { batchId: res.batchId },
        });
        expect(entry?.assignedTeamId).toBe(team.id);
    });
});
//# sourceMappingURL=upload.service.integration.test.js.map