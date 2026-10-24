import { defineConfig } from "vite";

export default defineConfig({
  base: process.env.GITHUB_ACTIONS ? "/AI-Powered-Robotic-Hardware-Diagnostics/" : "/",
});
