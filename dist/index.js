// src/index.ts
import http from "http";
import app from "./modules/app/app.js";
import { initSocketServer } from "./modules/socket/socket.service.js";
const PORT = process.env.PORT ?? 4000;
// create http server from express app
const server = http.createServer(app);
// initialize socket.io server
initSocketServer(server);
server.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`);
});
//# sourceMappingURL=index.js.map