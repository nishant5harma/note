// jest.system.config.ts
import base from "./jest.unit.config.ts";

export default {
  ...base,
  testMatch: ["**/*.system.test.ts"],
  detectOpenHandles: true,
};
