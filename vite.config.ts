import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig(({ command }) => {
  const isProduction = command === 'build';
  
  return {
    plugins: [react()],
    base: isProduction ? "/isen-weather-app-no-rs-sadge/" : "/", // Base path for GitHub Pages in production only
    server: {
      proxy: isProduction ? undefined : {
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
  };
});
