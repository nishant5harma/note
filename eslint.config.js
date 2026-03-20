import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import path from "node:path";
import { fileURLToPath } from "node:url";

/**
 * ESLint configuration for a standalone Node + TypeScript backend.
 */
const tsconfigRootDir = path.dirname(fileURLToPath(import.meta.url));

export default [
  js.configs.recommended,

  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      globals: { ...globals.node, ...globals.jest },
      parser: tseslint.parser,
      parserOptions: { tsconfigRootDir },
    },
    rules: {
      // This codebase uses `any`/loose patterns in multiple places; keep lint
      // focused on basic correctness rather than enforcing style/strictness.
      "no-undef": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/ban-ts-comment": "off",
      "@typescript-eslint/no-namespace": "off",

      // Core rules that otherwise create lots of noise in the current repo.
      "no-empty": "off",
      "no-unsafe-finally": "off",
      "no-unused-vars": "off",
      "prefer-const": "off",
    },
  },

  { ignores: ["node_modules/", "dist/", "build/", "src/script/"] },
];