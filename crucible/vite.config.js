import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Port 3001 so it never collides with the existing AI course app (3000).
export default defineConfig({
  plugins: [react()],
  server: { port: 3001 },
});
