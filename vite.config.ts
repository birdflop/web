/**
 * This is the base config for vite.
 * When building, the adapter config is used which loads this file and extends it.
 */
import { defineConfig } from "vite-plus";
import { qwikVite } from "@qwik.dev/core/optimizer";
import { qwikRouter } from "@qwik.dev/router/vite";
import { qwikSpeakInline } from "qwik-speak/inline";
import { partytownVite } from "@qwik.dev/partytown/utils";
import { join } from "path";
import tailwindcss from "@tailwindcss/vite";
import shikiRehype from '@shikijs/rehype';
import { transformerMetaHighlight, transformerMetaWordHighlight } from '@shikijs/transformers';
import { transformerColorizedBrackets } from '@shikijs/colorized-brackets';
import type { ShikiTransformer } from '@shikijs/types';
import { lint, fmt } from './vite.lint';

import birdflopTheme from './src/theme.json' with { type: 'json' };
import languages from './src/languages.json' with { type: 'json' };
import pkg from "./package.json" with { type: 'json' };

let platform = {};

if (
  process.env.NODE_ENV === 'development' &&
  process.argv.some(arg =>
    arg === 'dev' ||
    arg === 'serve' ||
    arg === 'start' ||
    arg === 'vite' ||
    arg.endsWith('/vite') ||
    arg.endsWith('\\vite') ||
    arg.endsWith('vite.js')
  )
) {
  const { getPlatformProxy } = await import('wrangler');
  platform = await getPlatformProxy();
}

type PkgDep = Record<string, string>;
const { dependencies = {}, devDependencies = {} } = pkg as unknown as {
  dependencies: PkgDep;
  devDependencies: PkgDep;
  [key: string]: unknown;
};
errorOnDuplicatesPkgDeps(devDependencies, dependencies);

const qwikDeps = [
  'lucide-icons-qwik',
  'simple-icons-qwik',
  '@luminescent/ui-qwik',
  '@luminescent/icons-qwik',
]

/**
 * Note that Vite normally starts from `index.html` but the qwikCity plugin makes start at `src/entry.ssr.tsx` instead.
 */
export default defineConfig({
  staged: {
    "*": "vp check --fix"
  },
  lint, fmt,
  resolve: {
    tsconfigPaths: true,
  },
  plugins: [
    qwikRouter({
      platform,
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
    tailwindcss(),
    qwikSpeakInline({
      basePath: './',
      supportedLangs: Object.keys(languages),
      defaultLang: "en-US",
      assetsPath: "i18n"
    }),
    partytownVite({ dest: join(__dirname, "dist", "~partytown") }),
  ],
  // This tells Vite which dependencies to pre-build in dev mode.
  optimizeDeps: {
    // Put problematic deps that break bundling here, mostly those with binaries.
    // For example ['better-sqlite3'] if you use that in server functions.
    exclude: [],
    include: [
      'yaml',
      'gifuct-js',
      'three/examples/jsm/loaders/OBJLoader.js',
      'three/examples/jsm/controls/OrbitControls.js',
      'three/examples/jsm/loaders/GLTFLoader.js',
      'three',
      '@auth/drizzle-adapter',
      'drizzle-orm/sqlite-core',
      'drizzle-orm/sql/sql',
      'chart.js',
      '@qwik.dev/partytown/integration',
      'drizzle-orm',
    ],
  },

  // All Qwik libraries should be bundled in the server build.
  ssr: {
    noExternal: qwikDeps,
  },
  /**
   * This is an advanced setting. It improves the bundling of your server code. To use it, make sure you understand when your consumed packages are dependencies or dev dependencies. (otherwise things will break in production)
   */
  // ssr:
  //   command === "build" && mode === "production"
  //     ? {
  //         // All dev dependencies should be bundled in the server build
  //         noExternal: Object.keys(devDependencies),
  //         // Anything marked as a dependency will not be bundled
  //         // These should only be production binary deps (including deps of deps), CLI deps, and their module graph
  //         // If a dep-of-dep needs to be external, add it here
  //         // For example, if something uses `bcrypt` but you don't have it as a dep, you can write
  //         // external: [...Object.keys(dependencies), 'bcrypt']
  //         external: Object.keys(dependencies),
  //       }
  //     : undefined,

  server: {
    headers: {
      // Don't cache the server response in dev mode
      "Cache-Control": "public, max-age=0",
    },
  },
  preview: {
    headers: {
      // Do cache the server response in preview (non-adapter production build)
      "Cache-Control": "public, max-age=600",
    },
  },
});


// *** utils ***

/**
 * Function to identify duplicate dependencies and throw an error
 * @param {Object} devDependencies - List of development dependencies
 * @param {Object} dependencies - List of production dependencies
 */
function errorOnDuplicatesPkgDeps(
  devDependencies: PkgDep,
  dependencies: PkgDep,
) {
  let msg = "";
  // Create an array 'duplicateDeps' by filtering devDependencies.
  // If a dependency also exists in dependencies, it is considered a duplicate.
  const duplicateDeps = Object.keys(devDependencies).filter(
    (dep) => dependencies[dep],
  );

  // include any known qwik packages
  const qwikPkg = Object.keys(dependencies).filter((value) =>
    /qwik/i.test(value),
  );

  // any errors for missing "qwik-city-plan"
  // [PLUGIN_ERROR]: Invalid module "@qwik-router-config" is not a valid package
  msg = `Move qwik packages ${qwikPkg.join(", ")} to devDependencies`;

  if (qwikPkg.length > 0) {
    throw new Error(msg);
  }

  // Format the error message with the duplicates list.
  // The `join` function is used to represent the elements of the 'duplicateDeps' array as a comma-separated string.
  msg = `
    Warning: The dependency "${duplicateDeps.join(", ")}" is listed in both "devDependencies" and "dependencies".
    Please move the duplicated dependencies to "devDependencies" only and remove it from "dependencies"
  `;

  // Throw an error with the constructed message.
  if (duplicateDeps.length > 0) {
    throw new Error(msg);
  }
}

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