import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/isen-weather-app-no-rs-sadge/", // Base path for GitHub Pages
  server: {
    proxy: {
      "/api": {
        target: "https://freetestapi.com",
        changeOrigin: true,
      },
      "/geo": {
        target: "https://nominatim.openstreetmap.org",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/geo/, ""),
      },
    },
  },
});
