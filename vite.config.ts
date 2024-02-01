import { defineConfig } from "vite";
import { qwikVite } from "@builder.io/qwik/optimizer";
import { qwikCity } from "@builder.io/qwik-city/vite";
import { qwikSpeakInline } from 'qwik-speak/inline';
import tsconfigPaths from "vite-tsconfig-paths";
import { languages } from "./src/speak-config";

export default defineConfig(() => {
    return {
        plugins: [
            qwikCity(),
            qwikVite(),
            tsconfigPaths(),
            qwikSpeakInline({
                supportedLangs: Object.keys(languages),
                defaultLang: 'en-US',
                assetsPath: 'i18n'
            }),
        ],
        preview: {
            headers: {
                "Cache-Control": "public, max-age=600",
            },
        },
        optimizeDeps: {
            include: ["@auth/core"]
        }
    };
});
