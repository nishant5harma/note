// /src/utils/__tests__/jwt.utils.integration.test.ts
import { signAccessToken, verifyAccessToken, createRefreshTokenForUser, consumeRefreshToken, } from "../jwt.utils.js";
import { prisma } from "../../db/db.js";
import { describe, it, expect } from "@jest/globals";
import { userFactory } from "../../tests/common/factories/index.js";
describe("jwt.utils integration", () => {
    it("signs and verifies an access token", () => {
        const userId = "u1";
        const token = signAccessToken(userId);
        const payload = verifyAccessToken(token);
        expect(payload.sub).toBe(userId);
    });
    it("creates and consumes a refresh token", async () => {
        // 1. Setup: Use factory instead of manual prisma.create
        // This handles password hashing and default fields automatically
        const user = await userFactory.create({
            email: "jwt-test@example.com",
        });
        // 2. Execute
        const rawToken = await createRefreshTokenForUser(user.id);
        const consumedUserId = await consumeRefreshToken(rawToken);
        // 3. Assert
        expect(consumedUserId).toBe(user.id);
        // Verify token is actually deleted from DB after consumption
        const dbToken = await prisma.refreshToken.findUnique({
            where: { id: rawToken },
        });
        expect(dbToken).toBeNull();
    });
    it("returns null when consuming an invalid refresh token", async () => {
        const result = await consumeRefreshToken("non-existent-token");
        expect(result).toBeNull();
    });
});
//# sourceMappingURL=jwt.utils.integration.test.js.map