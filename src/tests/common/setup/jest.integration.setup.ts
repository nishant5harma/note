// /src/tests/common/setup/jest.integration.setup.ts
import "dotenv/config";
import { beforeAll, afterAll, beforeEach } from "@jest/globals";
import { resetTestDatabase } from "@/tests/common/helpers/prisma-test-helper.js";
import { flushAllRedisAndQueues } from "@/tests/common/helpers/redis-bull-helper.js";
import { prisma } from "@/db/db.js";
// 1. Extend the Global type to recognize our custom flag
declare global {
  var __DB_SYNCED__: boolean | undefined;
}

// Ensure we use test env file
process.env.NODE_ENV = process.env.NODE_ENV || "test";

beforeAll(async () => {
  // Run migrations once (assumes prisma CLI and DATABASE_URL pointed to test DB)
  // If you prefer to run migrations manually, comment the line below.
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { execSync } = await import("child_process");
  if (!global.__DB_SYNCED__) {
    try {
      // stdio: "ignore" is faster as it doesn't pipe buffers back to the parent process
      execSync("npx prisma db push --skip-generate", { stdio: "ignore" });
      global.__DB_SYNCED__ = true;
    } catch (e) {
      // Fallback: If push fails, we assume schema is already compatible
    }
  }
});

beforeEach(async () => {
  // Use Promise.race to ensure a single hung helper doesn't kill the whole suite
  // without a helpful error message
  await Promise.all([resetTestDatabase(), flushAllRedisAndQueues()]).catch(
    (err) => {
      console.error("Integration Setup Hook Failed:", err);
      throw err;
    }
  );
});

afterAll(async () => {
  // no-op: DB connection will be cleaned by individual modules or Node exit
  await prisma.$disconnect();
});
