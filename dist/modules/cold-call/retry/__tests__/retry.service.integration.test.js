// src/modules/cold-call/retry/__tests__/retry.service.integration.test.ts
import { describe, it, expect } from "@jest/globals";
import { prisma } from "../../../../db/db.js";
import { evaluateRetry } from "../retry.service.js";
import { userFactory } from "../../../../tests/common/factories/user.factory.js";
describe("evaluateRetry", () => {
    it("throws when entry does not exist", async () => {
        await expect(evaluateRetry("non-existent-id")).rejects.toThrow("entry-not-found");
    });
    it("returns shouldRetry=false when entry has no attempts", async () => {
        const user = await userFactory.create();
        const batch = await prisma.coldCallBatch.create({
            data: { uploadedById: user.id },
        });
        const entry = await prisma.coldCallEntry.create({
            data: {
                batchId: batch.id,
                rowIndex: 1,
            },
        });
        const res = await evaluateRetry(entry.id);
        expect(res).toEqual({ shouldRetry: false });
    });
    it("returns shouldRetry=false when max attempts reached", async () => {
        const user = await userFactory.create();
        const batch = await prisma.coldCallBatch.create({
            data: { uploadedById: user.id },
        });
        const entry = await prisma.coldCallEntry.create({
            data: {
                batchId: batch.id,
                rowIndex: 1,
            },
        });
        await prisma.coldCallAttempt.createMany({
            data: [
                { entryId: entry.id, result: "no_answer" },
                { entryId: entry.id, result: "no_answer" },
                { entryId: entry.id, result: "busy" },
            ],
        });
        const res = await evaluateRetry(entry.id);
        expect(res).toEqual({ shouldRetry: false });
    });
    it("returns shouldRetry=false when last result has zero delay", async () => {
        const user = await userFactory.create();
        const batch = await prisma.coldCallBatch.create({
            data: { uploadedById: user.id },
        });
        const entry = await prisma.coldCallEntry.create({
            data: {
                batchId: batch.id,
                rowIndex: 1,
            },
        });
        await prisma.coldCallAttempt.create({
            data: {
                entryId: entry.id,
                result: "wrong_number",
            },
        });
        const res = await evaluateRetry(entry.id);
        expect(res).toEqual({ shouldRetry: false });
    });
    it("returns shouldRetry=true with retryAt when delay is positive", async () => {
        const user = await userFactory.create();
        const batch = await prisma.coldCallBatch.create({
            data: { uploadedById: user.id },
        });
        const entry = await prisma.coldCallEntry.create({
            data: {
                batchId: batch.id,
                rowIndex: 1,
            },
        });
        await prisma.coldCallAttempt.create({
            data: {
                entryId: entry.id,
                result: "busy", // 5 min delay
            },
        });
        const before = Date.now();
        const res = await evaluateRetry(entry.id);
        const after = Date.now();
        expect(res.shouldRetry).toBe(true);
        expect(res.retryAt).toBeInstanceOf(Date);
        const diff = res.retryAt.getTime() - before;
        expect(diff).toBeGreaterThanOrEqual(5 * 60 * 1000);
        expect(diff).toBeLessThanOrEqual(5 * 60 * 1000 + (after - before) + 50);
    });
    it("returns shouldRetry=false when last attempt has null result", async () => {
        const user = await userFactory.create();
        const batch = await prisma.coldCallBatch.create({
            data: { uploadedById: user.id },
        });
        const entry = await prisma.coldCallEntry.create({
            data: {
                batchId: batch.id,
                rowIndex: 1,
            },
        });
        await prisma.coldCallAttempt.create({
            data: {
                entryId: entry.id,
                result: null, // valid state
            },
        });
        const res = await evaluateRetry(entry.id);
        expect(res).toEqual({ shouldRetry: false });
    });
});
//# sourceMappingURL=retry.service.integration.test.js.map