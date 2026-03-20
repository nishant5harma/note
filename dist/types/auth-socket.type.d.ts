import type { Socket } from "socket.io";
import type { AuthUser } from "../types/auth-request.js";
/**
 * Data stored on the socket instance (server-side only)
 */
export interface SocketData {
    userId: string;
    permissions: Set<string>;
}
/**
 * Custom Socket type with Auth specifics
 * We pass 'any' to the first three generics (events)
 * but strictly define the 4th (SocketData)
 */
export interface AuthSocket extends Socket<any, any, any, SocketData> {
    user?: AuthUser;
    permissions?: Set<string>;
}
//# sourceMappingURL=auth-socket.type.d.ts.map