import { defineConfig } from "vitest/config";
import { resolve } from "node:path";

/**
 * Vitest configuration.
 *
 * Domain/unit tests run in the Node environment; the few tests that need a DOM
 * (infrastructure adapters touching localStorage, or future component tests)
 * are co-located and opt into jsdom via a `// @vitest-environment jsdom`
 * pragma at the top of the file.
 */
export default defineConfig({
  resolve: {
    alias: {
      "@": resolve(__dirname),
    },
  },
  test: {
    environment: "node",
    globals: true,
    include: ["lib/game/**/*.test.ts", "tests/**/*.test.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: ["lib/game/domain/**/*.ts"],
      exclude: ["**/*.test.ts", "**/types.ts"],
    },
  },
});
