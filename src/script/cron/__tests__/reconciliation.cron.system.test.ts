// src/script/cron/__tests__/reconciliation.cron.system.test.ts
import {
  jest,
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
} from "@jest/globals";

// 1. Mock the worker using the alias path used in the source file
const mockRunReconciliation =
  jest.fn<(limit: number) => Promise<{ processed: number }>>();

jest.unstable_mockModule(
  "@/modules/inventory/reservation/worker/reconciliation.worker.js",
  () => ({
    runReservationReconciliation: mockRunReconciliation,
    __esModule: true,
  })
);

// 2. Mock node-cron (ensuring the default export is handled for ESM)
const mockSchedule =
  jest.fn<(expression: string, func: () => Promise<void>) => any>();

jest.unstable_mockModule("node-cron", () => ({
  default: { schedule: mockSchedule },
  __esModule: true,
}));

// 3. Import after mocks are registered
// Adjusting the relative path based on the directory structure
const { startReconciliationCron } = await import("../reconciliation.cron.js");

describe("reconciliation cron (system)", () => {
  let logSpy: any;
  let errorSpy: any;

  beforeEach(() => {
    jest.clearAllMocks();
    // Silence console logs and errors for a cleaner test output
    logSpy = jest.spyOn(console, "log").mockImplementation(() => {});
    errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    logSpy.mockRestore();
    errorSpy.mockRestore();
  });

  it("registers cron job with the correct frequency", async () => {
    startReconciliationCron();
    expect(mockSchedule).toHaveBeenCalledWith(
      "*/5 * * * *",
      expect.any(Function)
    );
  });

  it("executes the reconciliation worker when the cron triggers", async () => {
    startReconciliationCron();

    // Extract the anonymous async function passed to cron.schedule
    const cronTask = (mockSchedule as jest.Mock).mock.calls[0]?.[1] as any;
    if (typeof cronTask !== "function") throw new Error("Task not found");

    mockRunReconciliation.mockResolvedValue({ processed: 10 });

    await cronTask();

    expect(mockRunReconciliation).toHaveBeenCalledWith(300);
    expect(logSpy).toHaveBeenCalledWith(
      expect.stringContaining("Reconciliation complete")
    );
  });

  it("gracefully handles worker errors", async () => {
    startReconciliationCron();

    const cronTask = (mockSchedule as jest.Mock).mock.calls[0]?.[1] as any;
    if (typeof cronTask !== "function") throw new Error("Task not found");

    mockRunReconciliation.mockRejectedValue(new Error("DB Connection Fail"));

    // Ensure the catch block in the source file works and doesn't re-throw
    await expect(cronTask()).resolves.not.toThrow();

    expect(errorSpy).toHaveBeenCalledWith(
      expect.stringContaining("[CRON] Reconciliation error:"),
      expect.any(Error)
    );
  });
});
