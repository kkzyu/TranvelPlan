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
  proxy: {
    '/api/llm': {
      target: 'https://dashscope.aliyuncs.com',
      changeOrigin: true,
      secure: false,
      pathRewrite: { '^/api/llm': '/api/v1/services/aigc/text-generation' },
    },
  },
});
