import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  // Relative asset paths so the build works under a GitHub Pages subpath
  // (https://<user>.github.io/<repo>/). Safe here — navigation is state-based,
  // there is no client-side router.
  base: "./",
  plugins: [react()],
  server: {
    host: true, // expose on LAN so you can open it from a phone / tunnel
    port: 5173,
  },
});
