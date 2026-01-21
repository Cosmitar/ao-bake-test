import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
// @ts-expect-error no declarations
import gltf from "vite-plugin-gltf";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [["babel-plugin-react-compiler"]],
      },
    }),
    gltf(),
  ],
});
