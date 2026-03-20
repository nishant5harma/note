// src/modules/socket/socket.service.ts
import { Server as HttpServer } from "http";
import { Server as IOServer } from "socket.io";
import { authSocketMiddleware } from "@/middlewares/auth-socket.middleware.js";
import type { AuthSocket, SocketData } from "@/types/auth-socket.type.js";

// Exported SocketService object
export default {
  initSocketServer,
  getIo,
  emitToUser,
  pushToUser,
  __resetSocketForTests,
};

// Exported SocketService functions Implementations

// Typed IO server instance
let io: IOServer<any, any, any, SocketData> | null = null;

/**
 * Map userId -> Set of socketIds
 * Used to track online status and handle multi-device sessions
 */
export const userSocketMap = new Map<string, Set<string>>();

/**
 * Initialize Socket.IO server with the HTTP server instance
 */
export function initSocketServer(httpServer: HttpServer) {
  if (io) return io;

  io = new IOServer(httpServer, {
    cors: {
      origin: true,
      credentials: true,
    },
  });

  // Attach auth middleware with explicit type casting for Socket.io's middleware signature
  io.use((socket, next) => authSocketMiddleware(socket as AuthSocket, next));

  io.on("connection", (socket: AuthSocket) => {
    console.log("socket connected", socket.id);

    // expect client to emit "register" with { userId } after authenticating
    socket.on(
      "register",
      (
        payload: { userId?: string } | string | undefined,
        callback: Function
      ) => {
        try {
          /**
           * Determine userId securely:
           * 1) Use identity from authSocketMiddleware (socket.data or socket.user)
           * 2) Fallback to client-sent payload only if no auth identity exists
           */
          const authUserId = socket.data.userId || socket.user?.id;
          let suppliedUserId: string | undefined;

          if (typeof payload === "string") {
            suppliedUserId = payload;
          } else if (payload && typeof payload === "object") {
            suppliedUserId = payload.userId;
          }

          let userId: string | undefined;

          if (authUserId) {
            userId = authUserId;
            if (suppliedUserId && suppliedUserId !== authUserId) {
              console.warn(
                `socket.register: client supplied userId (${suppliedUserId}) different from authenticated user (${authUserId}) — ignoring supplied value.`
              );
            }
          } else {
            userId = suppliedUserId;
          }

          if (!userId) {
            console.warn(
              "socket.register: no userId available (auth or payload)"
            );
            return;
          }

          // Join a room named after userId: allows io.to(userId).emit(...) to hit all devices
          socket.join(userId);

          // Store identity in socket.data (typesafe)
          socket.data.userId = userId;

          // Update the global tracking map
          let set = userSocketMap.get(userId);
          if (!set) {
            set = new Set<string>();
            userSocketMap.set(userId, set);
          }
          set.add(socket.id);

          console.log(`socket.register user=${userId} socket=${socket.id}`);
          // At the very end of the try block, call the acknowledgment
          if (typeof callback === "function") {
            callback({ status: "ok", userId });
          }
        } catch (err) {
          console.warn("socket register error", err);
          if (typeof callback === "function") callback({ status: "error" });
        }
      }
    );

    socket.on("disconnect", (reason: string) => {
      try {
        const uid = socket.data.userId;
        if (uid && userSocketMap.has(uid)) {
          const set = userSocketMap.get(uid)!;
          set.delete(socket.id);
          if (set.size === 0) userSocketMap.delete(uid);
        }

        // Cleanup room membership
        if (uid) {
          socket.leave(uid);
        }
        console.log("socket disconnected", socket.id, "reason:", reason);
      } catch (err) {
        console.warn("socket disconnect cleanup error", err);
      }
    });

    socket.on("presence.ping", () => {
      try {
        // Placeholder for presence/last-seen logic in Redis/DB
        // const uid = socket.data.userId;
      } catch (err) {
        // ignore
      }
    });
  });

  return io;
}

/**
 * Get io instance (after init)
 */
export function getIo() {
  if (!io) {
    throw new Error(
      "Socket.IO not initialized. Call initSocketServer(server)."
    );
  }
  return io;
}

/**
 * Emit an event to a specific user (all connected devices)
 */
export async function emitToUser(userId: string, event: string, payload: any) {
  if (!io) {
    console.warn("emitToUser: socket.io not initialized");
    return false;
  }

  try {
    // Check if user is actually online via our map
    const socketIds = userSocketMap.get(userId);
    if (!socketIds || socketIds.size === 0) {
      return false; // User offline
    }

    // Room-based emit: Socket.IO handles the internal per-socket delivery
    io.to(userId).emit(event, payload);
    return true;
  } catch (err) {
    console.warn("emitToUser error:", err);
    return false;
  }
}

/**
 * pushToUser: Best-effort realtime delivery via socket
 */
export async function pushToUser(userId: string, payload: any) {
  try {
    const ok = await emitToUser(userId, "push", payload);
    if (!ok) {
      console.log(
        `pushToUser: user ${userId} not connected; consider push.sender.ts fallback`
      );
      return false;
    }
    return true;
  } catch (err) {
    console.warn("pushToUser error:", err);
    return false;
  }
}

// TEST ONLY — do not use in app code
export function __resetSocketForTests() {
  if (io) {
    io.removeAllListeners();
    io.close();
    io = null;
  }
  userSocketMap.clear();
}
