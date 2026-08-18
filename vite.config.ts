import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { cmsApiPlugin } from "./cms/vitePlugin.ts";

export default defineConfig({
  plugins: [react(), tailwindcss(), cmsApiPlugin(process.cwd())],
});
