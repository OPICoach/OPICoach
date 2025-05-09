import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173, // 원하는 포트 번호로 변경
    strictPort: true, // 해당 포트를 사용 중이면 에러 발생 (자동 증가 방지)
    mimeTypes: {
      "text/javascript": ["js", "jsx"],
    },
  },
});
