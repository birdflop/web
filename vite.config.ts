import { partytownVite } from "@builder.io/partytown/utils";
import { qwikCity } from "@builder.io/qwik-city/vite";
import { qwikVite } from "@builder.io/qwik/optimizer";
import { join } from "path";
import { qwikSpeakInline } from "qwik-speak/inline";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { languages } from "./src/speak-config";
import { rewriteRoutes } from "./src/speak-routes";
export default defineConfig(() => {
    return {
        plugins: [
            qwikCity({ rewriteRoutes }),
            qwikVite(),
            tsconfigPaths(),
            qwikSpeakInline({
                basePath: './',
                supportedLangs: Object.keys(languages),
                defaultLang: "en-US",
                assetsPath: "i18n"
            }),
            partytownVite({ dest: join(__dirname, "dist", "~partytown") })
        ],
        dev: {
            headers: {
                "Cache-Control": "public, max-age=0",
            },
        },
        preview: {
            headers: {
                "Cache-Control": "public, max-age=600",
            },
        }
    };
});
