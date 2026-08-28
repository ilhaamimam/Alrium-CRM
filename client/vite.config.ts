import {
  defineConfig,
} from "vite";

import react
  from "@vitejs/plugin-react";


export default defineConfig({
  plugins: [
    react(),
  ],

  /*
   * IMPORTANT:
   *
   * Replace CRM with your actual
   * GitHub repository name.
   *
   * Example repository:
   * github.com/ilhaam/CRM
   *
   * then:
   * base: "/CRM/"
   */
  base: "/Alrium-CRM/",
});