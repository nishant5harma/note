import { nodeConfig } from "@repo/eslint-config/node.config.js";  // Extend from the Node base config

/**
 * ESLint configuration for the Node package.
 *
 * @type {import("eslint").Linter.Config[]}
 */
const nodePackageConfig = [
  ...nodeConfig,  // Extend the Node base config
];

export default nodePackageConfig;