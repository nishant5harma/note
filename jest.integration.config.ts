// jest.integration.config.ts
import base from "./jest.unit.config.ts";

export default {
  ...base,
  setupFilesAfterEnv: [
    "<rootDir>/src/tests/common/setup/jest.integration.setup.ts",
  ],
  testMatch: ["**/*.integration.test.ts"],
};
