import { Server as HttpServer } from "http";
import { Server as IOServer } from "socket.io";
import type { SocketData } from "../../types/auth-socket.type.js";
declare const _default: {
    initSocketServer: typeof initSocketServer;
    getIo: typeof getIo;
    emitToUser: typeof emitToUser;
    pushToUser: typeof pushToUser;
    __resetSocketForTests: typeof __resetSocketForTests;
};
export default _default;
/**
 * Map userId -> Set of socketIds
 * Used to track online status and handle multi-device sessions
 */
export declare const userSocketMap: Map<string, Set<string>>;
/**
 * Initialize Socket.IO server with the HTTP server instance
 */
export declare function initSocketServer(httpServer: HttpServer): IOServer<any, any, any, SocketData>;
/**
 * Get io instance (after init)
 */
export declare function getIo(): IOServer<any, any, any, SocketData>;
/**
 * Emit an event to a specific user (all connected devices)
 */
export declare function emitToUser(userId: string, event: string, payload: any): Promise<boolean>;
/**
 * pushToUser: Best-effort realtime delivery via socket
 */
export declare function pushToUser(userId: string, payload: any): Promise<boolean>;
export declare function __resetSocketForTests(): void;
//# sourceMappingURL=socket.service.d.ts.map