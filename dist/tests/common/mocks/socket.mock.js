// tests/common/mocks/socket.mock.ts
import { jest } from "@jest/globals";
/* ------------------------------------------- */
/* Explicitly typed mock object                 */
/* ------------------------------------------- */
export const socketMock = {
    getIo: jest.fn(),
    emitToUser: jest.fn(),
    pushToUser: jest.fn(),
    initSocketServer: jest.fn(),
    __resetSocketForTests: jest.fn(),
};
/* ------------------------------------------- */
/* Module mock                                 */
/* ------------------------------------------- */
jest.unstable_mockModule("@/modules/socket/socket.service.js", () => ({
    __esModule: true,
    ...socketMock,
    default: socketMock,
}));
//# sourceMappingURL=socket.mock.js.map