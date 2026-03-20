// src/modules/socket/__tests__/push.sender.integration.test.ts
import {
  describe,
  it,
  expect,
  beforeEach,
  jest,
  afterEach,
} from "@jest/globals";
import { userFactory, deviceFactory } from "@/tests/common/factories/index.js";
import { prisma } from "@/db/db.js";

/* -------------------------------------------------------------------------- */
/* ENVIRONMENT & MOCKS                                                        */
/* -------------------------------------------------------------------------- */

process.env.VAPID_PUBLIC_KEY = "test-public-key";
process.env.VAPID_PRIVATE_KEY = "test-private-key";
process.env.VAPID_SUBJECT = "mailto:test@test.dev";
process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON = JSON.stringify({
  project_id: "test-project",
  private_key: "test-key",
  client_email: "test@test.com",
});

const sendFcmMock = jest.fn(async () => "msg-id");
const sendWebPushMock = jest.fn(async () => ({}));

jest.unstable_mockModule("@/modules/socket/socket.service.js", () => ({
  getIo: () => ({ to: () => ({ emit: jest.fn() }) }),
}));

jest.unstable_mockModule("firebase-admin", () => ({
  default: {
    initializeApp: jest.fn(),
    credential: { cert: jest.fn() },
    messaging: () => ({ send: sendFcmMock }),
  },
}));

jest.unstable_mockModule("web-push", () => ({
  default: { setVapidDetails: jest.fn(), sendNotification: sendWebPushMock },
}));

// Critical: Import after mocks
const { sendPushToUser, sendLocationFetchSignal } = await import(
  "../util-socket/push.sender.js"
);

/* -------------------------------------------------------------------------- */
/* Tests                                                                      */
/* -------------------------------------------------------------------------- */

describe("push.sender – integration", () => {
  const userId = "user-1";

  beforeEach(async () => {
    // Suppress logs for expected error cases (Firebase/WebPush failures)
    jest.spyOn(console, "log").mockImplementation(() => {});
    jest.spyOn(console, "warn").mockImplementation(() => {});

    await prisma.device.deleteMany();
    await prisma.user.deleteMany();

    // Use factory for the test user
    await userFactory.create({ id: userId });

    sendFcmMock.mockClear();
    sendWebPushMock.mockClear();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("returns empty result when user has no devices", async () => {
    const res = await sendPushToUser(userId, { type: "TEST" });
    expect(res.count).toBe(0);
    expect(res.devices).toEqual([]);
  });

  it("sends WebPush using JSON token", async () => {
    await deviceFactory.create({
      userId,
      platform: "web",
      pushToken: JSON.stringify({
        endpoint: "https://example.com",
        keys: { p256dh: "a", auth: "b" },
      }),
    });

    const res = await sendPushToUser(userId, { hello: "web" });

    expect(res.devices[0]!.ok).toBe(true);
    expect(sendWebPushMock).toHaveBeenCalled();
  });

  it("uses WebPush subscription from meta fallback", async () => {
    await deviceFactory.create({
      userId,
      platform: "web",
      pushToken: null,
      meta: {
        push: {
          subscription: {
            endpoint: "https://example.com",
            keys: { p256dh: "a", auth: "b" },
          },
        },
      },
    });

    const res = await sendPushToUser(userId, { msg: "meta" });
    expect(res.devices[0]!.ok).toBe(true);
    expect(sendWebPushMock).toHaveBeenCalled();
  });

  it("sends FCM to mobile device", async () => {
    await deviceFactory.create({
      userId,
      platform: "android",
      pushToken: "fcm-token",
    });

    const res = await sendPushToUser(userId, { msg: "mobile" });
    expect(res.devices[0]!.ok).toBe(true);
    expect(sendFcmMock).toHaveBeenCalled();
  });

  it("handles mixed web + mobile devices", async () => {
    await deviceFactory.create({
      userId,
      platform: "web",
      meta: {
        subscription: {
          endpoint: "https://example.com",
          keys: { p256dh: "a", auth: "b" },
        },
      },
    });

    await deviceFactory.create({
      userId,
      platform: "ios",
      pushToken: "ios-token",
    });

    const res = await sendPushToUser(userId, { msg: "mixed" });
    expect(res.devices.length).toBe(2);
    expect(res.devices.every((d) => d.ok)).toBe(true);
    expect(sendWebPushMock).toHaveBeenCalled();
    expect(sendFcmMock).toHaveBeenCalled();
  });

  it("marks device as failed when WebPush throws", async () => {
    sendWebPushMock.mockRejectedValueOnce(new Error("push failed"));

    await deviceFactory.create({
      userId,
      platform: "web",
      meta: {
        subscription: {
          endpoint: "https://example.com",
          keys: { p256dh: "a", auth: "b" },
        },
      },
    });

    const res = await sendPushToUser(userId, { fail: true });
    expect(res.devices[0]!.ok).toBe(false);
  });

  it("continues sending to other devices if one provider fails", async () => {
    await deviceFactory.create({
      userId,
      platform: "android",
      pushToken: "bad-token",
    });
    await deviceFactory.create({
      userId,
      platform: "ios",
      pushToken: "good-token",
    });

    sendFcmMock
      .mockRejectedValueOnce(new Error("FCM Down"))
      .mockResolvedValueOnce("msg-success");

    const res = await sendPushToUser(userId, { msg: "resilience test" });

    expect(res.devices[0]!.ok).toBe(false);
    expect(res.devices[1]!.ok).toBe(true);
    expect(sendFcmMock).toHaveBeenCalledTimes(2);
  });

  it("sendLocationFetchSignal emits and falls back to push", async () => {
    await deviceFactory.create({
      userId,
      platform: "android",
      pushToken: "fcm-token",
    });

    const res = await sendLocationFetchSignal(userId, "req-123");
    expect(res.devices[0]!.ok).toBe(true);
    expect(sendFcmMock).toHaveBeenCalled();
  });
});
