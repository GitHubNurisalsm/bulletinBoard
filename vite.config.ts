import { defineConfig } from "vite";

// Без @vitejs/plugin-react: JSX компилирует встроенный в Vite транспайлер (не Babel).
// base "./" — относительные пути, чтобы сайт работал на https://<user>.github.io/<repo>/
export default defineConfig({
  base: "./",
});
