// src/index.ts
import "./utils/bigint-json-serialize.js";
import http from "http";
import app from "./modules/app/app.js";
import { initSocketServer } from "./modules/socket/socket.service.js";
const PORT = Number(process.env.PORT ?? 4000);
const HOST = process.env.HOST ?? "0.0.0.0";
// create http server from express app
const server = http.createServer(app);
// initialize socket.io server
initSocketServer(server);
server.listen(PORT, HOST, () => {
    console.log(`Server listening on http://${HOST}:${PORT}`);
});
//# sourceMappingURL=index.js.map