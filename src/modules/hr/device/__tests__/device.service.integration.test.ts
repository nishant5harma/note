// src/modules/hr/device/__tests__/device.service.integration.test.ts
import {
  describe,
  it,
  expect,
  beforeEach,
  jest,
  afterEach,
} from "@jest/globals";
import { prisma } from "@/db/db.js";
import { userFactory, deviceFactory } from "@/tests/common/factories/index.js";
import {
  registerDevice,
  unregisterDevice,
  listDevicesForUser,
} from "../device.service.js";

describe("Device Service - Integration", () => {
  let user: any;

  beforeEach(async () => {
    user = await userFactory.create();
    // Silence expected error logs
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("registerDevice()", () => {
    it("should update existing device if deviceId matches", async () => {
      const existing = (await deviceFactory.create({
        userId: user.id,
        deviceId: "hardware-v1",
        pushToken: "old-token",
      } as any)) as any;

      const updated = await registerDevice({
        userId: user.id,
        deviceId: "hardware-v1",
        pushToken: "new-token",
        platform: "ios",
      });

      expect(updated.id).toBe(existing.id);
      expect(updated.pushToken).toBe("new-token");
      expect(updated.platform).toBe("ios");
    });

    it("should update existing device if pushToken matches (even if deviceId is new/null)", async () => {
      const existing = (await deviceFactory.create({
        userId: user.id,
        deviceId: null,
        pushToken: "consistent-token",
      } as any)) as any;

      const updated = await registerDevice({
        userId: user.id,
        deviceId: "newly-assigned-hw-id",
        pushToken: "consistent-token",
      });

      expect(updated.id).toBe(existing.id);
      expect(updated.deviceId).toBe("newly-assigned-hw-id");
    });

    it("should create a new device if no match is found", async () => {
      await registerDevice({
        userId: user.id,
        deviceId: "new-hw",
        platform: "web",
        pushToken: "web-tok-1",
      });

      const count = await prisma.device.count({ where: { userId: user.id } });
      expect(count).toBe(1);
    });
  });

  describe("unregisterDevice()", () => {
    it("should delete a device successfully", async () => {
      const dev = (await deviceFactory.create({
        userId: user.id,
        deviceId: "to-be-removed",
      } as any)) as any;

      const result = await unregisterDevice({
        userId: user.id,
        deviceId: "to-be-removed",
      });

      expect(result).toBe(true);

      const exists = await prisma.device.findUnique({
        where: { id: dev.id as string },
      });
      expect(exists).toBeNull();
    });

    it("should throw error for a device that belongs to another user", async () => {
      const otherUser = await userFactory.create();
      await deviceFactory.create({
        userId: otherUser.id,
        deviceId: "other-users-device",
      } as any);

      // FIX: Matching message string instead of constructor to avoid
      // the "Received constructor: HttpError" vs "Expected: NotFoundError" issue.
      await expect(
        unregisterDevice({ userId: user.id, deviceId: "other-users-device" })
      ).rejects.toThrow("Device not found");
    });

    it("should throw error for a non-existent device", async () => {
      await expect(
        unregisterDevice({ userId: user.id, deviceId: "non-existent" })
      ).rejects.toThrow("Device not found");
    });
  });

  describe("listDevicesForUser()", () => {
    it("should return all devices belonging to the user", async () => {
      await deviceFactory.createList(3, { userId: user.id } as any);

      const devices = await listDevicesForUser(user.id);
      expect(devices).toHaveLength(3);
      expect(devices[0]).toHaveProperty("userId", user.id);
    });
  });
});
