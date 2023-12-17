import { defineConfig } from "vite";
import { qwikVite } from "@builder.io/qwik/optimizer";
import { qwikCity } from "@builder.io/qwik-city/vite";
import { qwikSpeakInline } from 'qwik-speak/inline';
import tsconfigPaths from "vite-tsconfig-paths";
export default defineConfig(() => {
    return {
        plugins: [
            qwikCity(),
            qwikVite(),
            tsconfigPaths(),
            qwikSpeakInline({
                supportedLangs: ['en-US', 'es-ES', 'nl-NL', "pt-PT"],
                defaultLang: 'en-US',
                assetsPath: 'i18n'
            }),
        ],
        preview: {
            headers: {
                "Cache-Control": "public, max-age=600",
            },
        }
    };
});
