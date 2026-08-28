import {
  defineConfig,
} from "vite";

import react
  from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [
    react(),
  ],

  // Netlify serves the site from the domain root,
  // so base must be "/" (the default). Only set a
  // subpath base if deploying under e.g. GitHub Pages.
  base: "/",
});