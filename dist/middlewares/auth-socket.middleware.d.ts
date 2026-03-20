import type { AuthSocket } from "../types/auth-socket.type.js";
type SocketNextFunction = (err?: Error) => void;
export declare function authSocketMiddleware(socket: AuthSocket, next: SocketNextFunction): Promise<void>;
export {};
//# sourceMappingURL=auth-socket.middleware.d.ts.map