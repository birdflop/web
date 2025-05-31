import { defineConfig } from "vite";
import { qwikVite } from "@builder.io/qwik/optimizer";
import { qwikCity } from "@builder.io/qwik-city/vite";
import { qwikSpeakInline } from "qwik-speak/inline";
import tsconfigPaths from "vite-tsconfig-paths";
import { languages } from "./src/speak-config";
import { partytownVite } from "@qwik.dev/partytown/utils";
import { join } from "path";
import tailwindcss from "@tailwindcss/vite";
import shikiRehype from '@shikijs/rehype';
import { transformerMetaHighlight, transformerMetaWordHighlight } from '@shikijs/transformers';
import { transformerColorizedBrackets } from '@shikijs/colorized-brackets';
import type { ShikiTransformer } from '@shikijs/types';
import birdflopTheme from './src/theme.json'
function transformerShowEmptyLines(): ShikiTransformer {
  return {
    line(node) {
      if (node.children.length === 0) {
        node.children = [{ type: 'text', value: ' ' }];
        return node;
      }
    },
  };
}

function transformerMetaShowTitle(): ShikiTransformer {
  return {
    root(node) {
      const meta = this.options.meta?.__raw;
      if (!meta) {
        return;
      }
      const titleMatch = meta.match(/title="([^"]*)"/);
      if (!titleMatch) {
        return;
      }
      const title = titleMatch[1] ?? '';
      if (title.length > 0) {
        node.children.unshift({
          type: 'element',
          tagName: 'div',
          properties: {
            class: 'shiki-title',
          },
          children: [{ type: 'text', value: title }],
        });
      }
      meta.replace(titleMatch[0], '');
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [
      qwikCity({
        mdxPlugins: {
          rehypeSyntaxHighlight: false,
          remarkGfm: true,
          rehypeAutolinkHeadings: true,
        },
        mdx: {
          rehypePlugins: [
            [
              shikiRehype,
              {
                theme: birdflopTheme,
                transformers: [
                  transformerMetaHighlight(),
                  transformerMetaWordHighlight(),
                  transformerColorizedBrackets(),
                  transformerShowEmptyLines(),
                  transformerMetaShowTitle(),
                ],
              },
            ],
          ],
        },
      }),
      qwikVite(),
      tsconfigPaths(),
      qwikSpeakInline({
        basePath: './',
        supportedLangs: Object.keys(languages),
        defaultLang: "en-US",
        assetsPath: "i18n"
      }),
      partytownVite({ dest: join(__dirname, "dist", "~partytown") }),
      tailwindcss(),
    ],
    preview: {
      headers: {
        "Cache-Control": "public, max-age=600",
      },
    },
    ssr: {
      external: [
        '@prisma/client/edge',
        '@auth/prisma-adapter',
      ],
    },
    optimizeDeps: {
      include: [
        'yaml',
        'gifuct-js',
        'three/examples/jsm/loaders/OBJLoader',
        'three/examples/jsm/controls/OrbitControls',
        'three',
        '@auth/prisma-adapter',
        'chart.js',
        '@prisma/client/edge',
        '@prisma/extension-accelerate',
        '@qwik.dev/partytown/integration'
      ],
    },
  };
});
