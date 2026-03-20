// /src/tests/common/helpers/prisma-test-helper.ts
import { prisma } from "../../../db/db.js";
/**
 * Reset test DB by truncating all user tables in public schema.
 * WARNING: Only use against dedicated test DB!
 */
export async function resetTestDatabase() {
    try {
        // Ensure we are running in test mode and not production
        if (!process.env.DATABASE_URL || !process.env.NODE_ENV?.includes("test")) {
            throw new Error("Refusing to reset DB when NODE_ENV != test");
        }
        // Query list of tables
        const tables = await prisma.$queryRawUnsafe(`SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename != '_prisma_migrations';`);
        if (!tables || tables.length === 0)
            return;
        const names = tables
            .map((t) => `"public"."${String(t.tablename)}"`)
            .join(", ");
        // disable triggers and truncate
        await prisma.$executeRawUnsafe(`TRUNCATE ${names} RESTART IDENTITY CASCADE;`);
    }
    catch (err) {
        console.error("Failed to reset test database", err);
        throw err;
    }
}
//# sourceMappingURL=prisma-test-helper.js.map