import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [{ find: "@", replacement: "/src" }],
  },
  define: {
    "process.env": {
      REACT_APP_BASED_URL: "https://157.245.134.162/api/chatbot",
    },
  },
});
