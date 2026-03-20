// src/tests/common/setup/jest.unit.setup.ts
import "dotenv/config";
import { beforeAll } from "@jest/globals";
process.env.NODE_ENV = process.env.NODE_ENV || "test";
beforeAll(() => {
    // No DB, no Redis, no Bull
});
//# sourceMappingURL=jest.unit.setup.js.map