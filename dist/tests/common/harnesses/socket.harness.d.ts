import { Server as HttpServer } from "http";
import { Socket as ClientSocket } from "socket.io-client";
export declare class SocketHarness {
    httpServer: HttpServer;
    port: number;
    private clients;
    private service;
    constructor();
    start(): Promise<void>;
    stop(): Promise<void>;
    createClient(token?: string): Promise<ClientSocket>;
    register(socket: ClientSocket, payload?: any): Promise<any>;
}
//# sourceMappingURL=socket.harness.d.ts.map