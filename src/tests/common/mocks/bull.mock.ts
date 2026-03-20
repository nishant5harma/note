// src/tests/common/mocks/bull.mock.ts
import { jest } from "@jest/globals";

interface BullMock {
  add: jest.Mock<(...args: any[]) => Promise<{ id: string }>>;
  process: any;
  on: any;
  close: any;
}

export const mockQueue: BullMock = {
  // Matches your "job123" requirement
  add: jest.fn<any>().mockResolvedValue({ id: "job123" }),
  process: jest.fn<any>(),
  on: jest.fn<any>(),
  close: jest.fn<any>().mockResolvedValue(undefined),
};

jest.mock("bullmq", () => ({
  Queue: jest.fn().mockImplementation(() => mockQueue),
  Worker: jest.fn().mockImplementation(() => ({
    on: jest.fn(),
    close: jest.fn(),
  })),
  QueueEvents: jest.fn().mockImplementation(() => ({
    on: jest.fn(),
    close: jest.fn(),
  })),
}));
