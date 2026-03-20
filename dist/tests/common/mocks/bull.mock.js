// src/tests/common/mocks/bull.mock.ts
import { jest } from "@jest/globals";
export const mockQueue = {
    // Matches your "job123" requirement
    add: jest.fn().mockResolvedValue({ id: "job123" }),
    process: jest.fn(),
    on: jest.fn(),
    close: jest.fn().mockResolvedValue(undefined),
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
//# sourceMappingURL=bull.mock.js.map