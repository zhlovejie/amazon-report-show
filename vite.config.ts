import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // 路径别名配置
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@components": path.resolve(__dirname, "./src/components"),
    },
  },
  base:'./',
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          // 将所有第三方依赖打包到 vendor
          if (id.includes('node_modules')) {
            return 'vendor'
          }
          // 或者按需拆分为更细的粒度
          if (id.includes('lodash')) {
            return 'lodash'
          }
          if (id.includes('vue')) {
            return 'vue'
          }
        }
      }
    }
  }
});
