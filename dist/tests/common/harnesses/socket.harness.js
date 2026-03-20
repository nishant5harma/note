// src/tests/common/harnesses/socket.harness.ts
import { createServer, Server as HttpServer } from "http";
import { io as ClientIO, Socket as ClientSocket } from "socket.io-client";
export class SocketHarness {
    httpServer;
    port = 0;
    clients = [];
    service; // We will load this dynamically
    constructor() {
        this.httpServer = createServer();
    }
    async start() {
        // CRITICAL: Dynamic import to ensure mocks applied in the test file are active
        const { default: socketService } = await import("../../../modules/socket/socket.service.js");
        this.service = socketService;
        this.service.initSocketServer(this.httpServer);
        return new Promise((resolve) => {
            this.httpServer.listen(0, () => {
                this.port = this.httpServer.address().port;
                resolve();
            });
        });
    }
    async stop() {
        this.clients.forEach((c) => c.connected && c.disconnect());
        if (this.service) {
            this.service.__resetSocketForTests();
        }
        return new Promise((res) => this.httpServer.close(() => res()));
    }
    async createClient(token = "valid-token") {
        const socket = ClientIO(`http://localhost:${this.port}`, {
            transports: ["websocket"],
            reconnection: false,
            auth: { token },
        });
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                socket.close();
                reject(new Error("Socket timeout"));
            }, 3000);
            socket.once("connect", () => {
                clearTimeout(timeout);
                this.clients.push(socket);
                resolve(socket);
            });
            socket.once("connect_error", (err) => {
                clearTimeout(timeout);
                socket.close();
                reject(err);
            });
        });
    }
    async register(socket, payload = {}) {
        return new Promise((resolve) => socket.emit("register", payload, resolve));
    }
}
//# sourceMappingURL=socket.harness.js.map