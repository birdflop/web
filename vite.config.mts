import { defineConfig } from "vite";
import { qwikVite } from "@builder.io/qwik/optimizer";
import { qwikCity } from "@builder.io/qwik-city/vite";
import { imagetools } from "vite-imagetools";
import tsconfigPaths from "vite-tsconfig-paths";
export default defineConfig(() => {
    return {
        plugins: [
            qwikCity(),
            qwikVite(),
            tsconfigPaths(),
            imagetools(),
        ],
        preview: {
            headers: {
                "Cache-Control": "public, max-age=600",
            },
        }
    };
});
