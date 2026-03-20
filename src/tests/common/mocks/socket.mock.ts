// tests/common/mocks/socket.mock.ts
import { jest } from "@jest/globals";

/* ------------------------------------------- */
/* Plain interface (NO jest types)              */
/* ------------------------------------------- */
interface SocketMock {
  getIo: () => any;
  emitToUser: (...args: any[]) => Promise<any> | any;
  pushToUser: (...args: any[]) => Promise<any> | any;
  initSocketServer: (...args: any[]) => void;
  __resetSocketForTests: () => void;
}

/* ------------------------------------------- */
/* Explicitly typed mock object                 */
/* ------------------------------------------- */
export const socketMock: SocketMock = {
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
