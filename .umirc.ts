import { defineConfig } from "umi";

export default defineConfig({
  base: '/TravelPlan/',
  publicPath: '/TravelPlan/',
  outputPath: 'dist',
  exportStatic: {},
  routes: [
    { path: "/", component: "index" },
  ],
  npmClient: 'pnpm',
});
