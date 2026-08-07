import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["testes/**/*.test.ts"],
    setupFiles: ["testes/preparar.ts"],
    environment: "node"
  }
});
