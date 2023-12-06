import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [{ find: "@", replacement: "/src" }],
  },
  define: {
    "process.env": {
      // REACT_APP_BASED_URL: "https://64.227.17.37/api/chatbot",
      REACT_APP_BASED_URL: "http://localhost:3000/api",
      FILES_DATASETS: "FILES_DATASETS",
      LINKS_DATASETS: "LINKS_DATASETS",
      SITEMAPS_DATASETS: "SITEMAPS_DATASETS",
      FAQS_DATASETS: "FAQS_DATASETS",
      kNOWLEGDE_BASE_TAB: "kNOWLEGDE_BASE_TAB",
      TRAIN_TAB: "TRAIN_TAB",
      NO_DATA: "NO_DATA",
      INCORRECT_LINK: "INCORRECT_LINK",
      SUCCESS: "SUCCESS",
    },
  },
});
