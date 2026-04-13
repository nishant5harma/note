import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
// import helmet from 'helmet';
import cookieParser from "cookie-parser";
import { nonExistingRoutesErrorHandler } from "../../error-handlers/non-existing-route.error-handler.js";
import { jwtErrorHandler } from "../../error-handlers/jwt.error-handler.js";
import { globalErrorHandler } from "../../error-handlers/global.error-handler.js";
import AppRouter from "./app.route.js";
import { initBullBoard } from "../../utils/bullmq-ui.js";
import { bigintJsonReplacer } from "../../utils/json-replacer.util.js";
// /src/app.ts
dotenv.config({ quiet: true });
const app = express();
app.set("json replacer", bigintJsonReplacer);
// app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(cookieParser());
app.use(express.json());
app.use(morgan("dev"));
// API routes mount point
app.use("/api", AppRouter);
initBullBoard(app);
//error-handlers
app.use(nonExistingRoutesErrorHandler);
app.use(jwtErrorHandler);
app.use(globalErrorHandler);
export default app;
//# sourceMappingURL=app.js.map