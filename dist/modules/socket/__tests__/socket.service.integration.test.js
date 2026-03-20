// src/modules/socket/__tests__/socket.service.integration.test.ts
import { describe, it, expect, beforeEach, afterEach, jest, } from "@jest/globals";
import { userFactory } from "../../../tests/common/factories/index.js";
import { SocketHarness } from "../../../tests/common/harnesses/socket.harness.js";
/* -------------------------------------------------------------------------- */
/* ESM MOCKS (FIRST)                                                          */
/* -------------------------------------------------------------------------- */
jest.unstable_mockModule("@/utils/jwt.utils.js", () => ({
    verifyAccessToken: (token) => {
        if (token === "valid-token")
            return { sub: "user-1" };
        throw new Error("Invalid token");
    },
}));
const { userSocketMap, emitToUser, pushToUser } = await import("../socket.service.js");
/* -------------------------------------------------------------------------- */
/* Tests                                                                      */
/* -------------------------------------------------------------------------- */
describe("SocketService – integration", () => {
    let harness;
    beforeEach(async () => {
        // Suppress logs during socket operations
        jest.spyOn(console, "log").mockImplementation(() => { });
        jest.spyOn(console, "warn").mockImplementation(() => { });
        harness = new SocketHarness();
        await harness.start();
        // Use factory for user creation
        await userFactory.create({ id: "user-1" });
    });
    afterEach(async () => {
        await harness.stop();
        jest.restoreAllMocks();
    });
    it("rejects unauthenticated socket connection", async () => {
        await expect(harness.createClient("invalid-token")).rejects.toBeTruthy();
    });
    it("allows authenticated socket and registers user", async () => {
        const socket = await harness.createClient("valid-token");
        const ack = await harness.register(socket);
        expect(ack.status).toBe("ok");
        expect(ack.userId).toBe("user-1");
        expect(userSocketMap.get("user-1")?.size).toBe(1);
    });
    it("ignores client-supplied userId if it contradicts JWT (Security)", async () => {
        const socket = await harness.createClient("valid-token");
        const ack = await harness.register(socket, { userId: "malicious-user" });
        expect(ack.userId).toBe("user-1");
        expect(userSocketMap.has("malicious-user")).toBe(false);
    });
    it("supports multiple sockets per user", async () => {
        const [s1, s2] = await Promise.all([
            harness.createClient(),
            harness.createClient(),
        ]);
        await Promise.all([harness.register(s1), harness.register(s2)]);
        expect(userSocketMap.get("user-1")?.size).toBe(2);
    });
    it("emitToUser delivers events to connected user", async () => {
        const socket = await harness.createClient();
        await harness.register(socket);
        const received = new Promise((resolve) => socket.on("custom:event", resolve));
        const ok = await emitToUser("user-1", "custom:event", { hello: true });
        expect(ok).toBe(true);
        expect(await received).toEqual({ hello: true });
    });
    it("pushToUser emits push event", async () => {
        const socket = await harness.createClient();
        await harness.register(socket);
        const received = new Promise((resolve) => socket.on("push", resolve));
        await pushToUser("user-1", { msg: "hi" });
        expect(await received).toEqual({ msg: "hi" });
    });
    it("returns false when emitting to offline user", async () => {
        const ok = await emitToUser("user-1", "x", {});
        expect(ok).toBe(false);
    });
    it("cleans up userSocketMap on disconnect", async () => {
        const socket = await harness.createClient();
        await harness.register(socket);
        const socketId = socket.id;
        socket.disconnect();
        // Check cleanup with a small retry loop
        let cleaned = false;
        for (let i = 0; i < 20; i++) {
            const set = userSocketMap.get("user-1");
            if (!set || !set.has(socketId)) {
                cleaned = true;
                break;
            }
            await new Promise((r) => setTimeout(r, 50));
        }
        expect(cleaned).toBe(true);
    });
});
//# sourceMappingURL=socket.service.integration.test.js.map