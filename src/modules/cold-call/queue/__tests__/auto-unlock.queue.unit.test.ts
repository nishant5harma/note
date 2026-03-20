// src/modules/cold-call/queue/__tests__/auto-unlock.queue.unit.test.ts
import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  jest,
} from "@jest/globals";
import { mockQueue } from "@/tests/common/mocks/bull.mock.js";

describe("cold-call auto-unlock queue", () => {
  beforeEach(() => {
    jest.spyOn(console, "error").mockImplementation(() => {}); // Silence error logs
    jest.spyOn(console, "warn").mockImplementation(() => {}); // Silence warn logs
    jest.spyOn(console, "log").mockImplementation(() => {}); // Silence log messages
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("schedules a repeating auto-unlock job on import", async () => {
    // Reset mock call history
    mockQueue.add.mockClear();

    // IMPORTANT: dynamic import (side-effect module)
    await import("../auto-unlock.queue.js");

    expect(mockQueue.add).toHaveBeenCalledTimes(1);
    const call = mockQueue.add.mock.calls[0]! as [
      string,
      any,
      Record<string, any>,
    ];
    const [jobName, payload, options] = call;

    expect(jobName).toBe("auto-unlock-task");
    expect(payload).toEqual({});
    expect(options).toMatchObject({
      repeat: {
        every: 60_000,
      },
    });
  });
});
