import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [{ find: "@", replacement: "/src" }],
  },
  define: {
    "process.env": {
      REACT_APP_BASED_URL: "http://64.227.17.37:3000",
      // REACT_APP_BASED_URL: "http://localhost:3000",
      isAdmin: true,
      isClient: false,
    },
  },
});
