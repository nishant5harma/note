// tests/common/helpers/create-test-app.ts
import express from "express";
import { bigintJsonReplacer } from "@/utils/json-replacer.util.js";

export async function createTestApp(): Promise<express.Express> {
  const { default: AppRouter } = await import("@/modules/app/app.route.js");

  const app = express();
  app.set("json replacer", bigintJsonReplacer);
  app.use(express.json());
  app.use("/api", AppRouter);

  return app;
}
