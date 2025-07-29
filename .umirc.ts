import { defineConfig } from "umi";

export default defineConfig({
  base: process.env.NODE_ENV === 'production' ? '/TravelPlan/' : '/',
  publicPath: process.env.NODE_ENV === 'production' ? '/TravelPlan/' : '/',
  outputPath: 'dist',
  routes: [
    { path: "/", component: "index" },
  ],
  npmClient: 'pnpm',
});
