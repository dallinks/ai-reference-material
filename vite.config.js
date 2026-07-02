import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { crucibleStore } from "./server/store-plugin.js";

export default defineConfig({
  plugins: [react(), crucibleStore()],
  server: { port: 3001 },
});
