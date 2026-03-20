import { jest } from "@jest/globals";
interface BullMock {
    add: jest.Mock<(...args: any[]) => Promise<{
        id: string;
    }>>;
    process: any;
    on: any;
    close: any;
}
export declare const mockQueue: BullMock;
export {};
//# sourceMappingURL=bull.mock.d.ts.map