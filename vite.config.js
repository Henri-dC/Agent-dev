// vite.config.js (APRÈS correction)
import { fileURLToPath, URL } from "node:url"; // Import pour gérer les chemins
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  base: "/preview/",
  plugins: [vue()],
  // --- AJOUTER CETTE SECTION ---
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  // -----------------------------
});
