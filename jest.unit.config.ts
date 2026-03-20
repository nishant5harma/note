// jest.unit.config.ts
import type { Config } from "jest";

const config: Config = {
  // --- Core ---
  preset: "ts-jest/presets/default-esm",
  testEnvironment: "node",

  // NodeNext + ESM
  extensionsToTreatAsEsm: [".ts"],
  transform: {
    "^.+\\.ts$": [
      "ts-jest",
      {
        useESM: true,
        tsconfig: "tsconfig.json",
      },
    ],
  },

  // Tests colocated anywhere in src/
  testMatch: ["**/*.unit.test.ts"],

  // Path aliases
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },

  // Global test setup
  setupFilesAfterEnv: ["<rootDir>/src/tests/common/setup/jest.unit.setup.ts"],

  // Mock behavior
  clearMocks: true,
  restoreMocks: true,

  // Ignore build output
  testPathIgnorePatterns: ["/node_modules/", "/dist/", "/build/"],

  // pnpm + ESM stability
  resolver: "ts-jest-resolver",

  // timeout
  testTimeout: 60000,
  forceExit: true,
  detectOpenHandles: true,
};

export default config;
