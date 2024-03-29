import { defineConfig } from "vite";
import { svelte, vitePreprocess } from "@sveltejs/vite-plugin-svelte";

export default defineConfig({
    base: "./",
    build: {
        target: "esnext"
    },
    plugins: [
        svelte({
            preprocess: vitePreprocess({})
        })
    ]
});
