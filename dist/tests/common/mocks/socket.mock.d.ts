interface SocketMock {
    getIo: () => any;
    emitToUser: (...args: any[]) => Promise<any> | any;
    pushToUser: (...args: any[]) => Promise<any> | any;
    initSocketServer: (...args: any[]) => void;
    __resetSocketForTests: () => void;
}
export declare const socketMock: SocketMock;
export {};
//# sourceMappingURL=socket.mock.d.ts.map