// src/modules/hr/consent/__tests__/consent.service.integration.test.ts
import { describe, it, expect, beforeEach } from "@jest/globals";
import { userFactory, consentFactory } from "../../../../tests/common/factories/index.js";
import { createConsent, revokeConsent, listConsents, } from "../consent.service.js";
import { ConsentType } from "@prisma/client";
describe("Consent Service - Integration", () => {
    let user;
    beforeEach(async () => {
        user = await userFactory.create();
    });
    describe("revokeConsent()", () => {
        it("should revoke the most recent active consent of a specific type", async () => {
            // Setup using Factory
            await consentFactory.create({
                userId: user.id,
                type: ConsentType.PHOTO,
                grantedAt: new Date(Date.now() - 10000),
            });
            const latest = await consentFactory.create({
                userId: user.id,
                type: ConsentType.PHOTO,
            });
            const result = await revokeConsent({ userId: user.id, type: "PHOTO" });
            expect(result.id).toBe(latest.id);
            expect(result.revokedAt).toBeDefined();
        });
    });
    describe("listConsents()", () => {
        it("should return consents ordered by grantedAt descending", async () => {
            // Setup using Factory
            await consentFactory.create({
                userId: user.id,
                type: ConsentType.LOCATION,
                grantedAt: new Date("2023-01-01"),
            });
            await consentFactory.create({
                userId: user.id,
                type: ConsentType.PHOTO,
                grantedAt: new Date("2024-01-01"),
            });
            const list = await listConsents(user.id);
            expect(list).toHaveLength(2);
            expect(list[0]?.type).toBe("PHOTO"); // Latest first
        });
    });
});
//# sourceMappingURL=consent.service.integration.test.js.map