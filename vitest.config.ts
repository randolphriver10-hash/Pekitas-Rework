import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    setupFiles: ["./src/lib/test/setup.ts"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      // "server-only" solo tira un throw cuando el bundler no marca la condición
      // "react-server" (lo hace Next, no Vitest) — para tests unitarios de lógica
      // pura importada desde archivos server-only, lo neutralizamos acá.
      "server-only": path.resolve(__dirname, "./src/lib/test/server-only-stub.ts"),
    },
  },
});
