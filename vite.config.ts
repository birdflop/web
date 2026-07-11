/**
 * This is the base config for vite.
 * When building, the adapter config is used which loads this file and extends it.
 */
import { defineConfig, type UserConfig } from "vite-plus";
import { qwikVite } from "@builder.io/qwik/optimizer";
import { qwikCity } from "@builder.io/qwik-city/vite";
import { qwikSpeakInline } from "qwik-speak/inline";
import { partytownVite } from "@qwik.dev/partytown/utils";
import { join } from "path";
import tailwindcss from "@tailwindcss/vite";
import shikiRehype from '@shikijs/rehype';
import { transformerMetaHighlight, transformerMetaWordHighlight } from '@shikijs/transformers';
import { transformerColorizedBrackets } from '@shikijs/colorized-brackets';
import type { ShikiTransformer } from '@shikijs/types';

import birdflopTheme from './src/theme.json' with { type: 'json' };
import languages from './src/languages.json' with { type: 'json' };
import pkg from "./package.json" with { type: 'json' };

let platform = {};

if (process.env.NODE_ENV === 'development') {
  const { getPlatformProxy } = await import('wrangler');
  platform = await getPlatformProxy();
}

type PkgDep = Record<string, string>;
const { dependencies = {}, devDependencies = {} } = pkg as any as {
  dependencies: PkgDep;
  devDependencies: PkgDep;
  [key: string]: unknown;
};
errorOnDuplicatesPkgDeps(devDependencies, dependencies);

/**
 * Note that Vite normally starts from `index.html` but the qwikCity plugin makes start at `src/entry.ssr.tsx` instead.
 */

export default defineConfig(({ command, mode }): UserConfig => {
  return {
    staged: {
      "*": "vp check --fix"
    },
    lint: {
      "plugins": [
        "oxc",
        "typescript",
        "unicorn",
        "react"
      ],
      "jsPlugins": [
        "eslint-plugin-qwik"
      ],
      "categories": {
        "correctness": "warn"
      },
      "options": {
        "typeAware": true,
        "typeCheck": true
      },
      "env": {
        "builtin": true,
        "browser": true,
        "es2024": true,
        "node": true,
        "serviceworker": true
      },
      "ignorePatterns": [
        "**/*.log",
        "**/.DS_Store",
        "**/*.",
        ".vscode/settings.json",
        "**/.history",
        "**/.yarn",
        "**/bazel-*",
        "**/bazel-bin",
        "**/bazel-out",
        "**/bazel-qwik",
        "**/bazel-testlogs",
        "**/dist",
        "**/dist-dev",
        "**/lib",
        "**/lib-types",
        "**/etc",
        "**/external",
        "**/node_modules",
        "**/temp",
        "**/tsc-out",
        "**/tsdoc-metadata.json",
        "**/target",
        "**/output",
        "**/rollup.config.js",
        "**/build",
        "**/.cache",
        "**/.vscode",
        "**/.rollup.cache",
        "**/tsconfig.tsbuildinfo",
        "**/vite.config.ts",
        "**/*.spec.tsx",
        "**/*.spec.ts",
        "**/.netlify",
        "**/pnpm-lock.yaml",
        "**/package-lock.json",
        "**/yarn.lock",
        "**/server",
        "eslint.config.js"
      ],
      "rules": {
        "constructor-super": "error",
        "for-direction": "error",
        "getter-return": "error",
        "no-async-promise-executor": "error",
        "no-case-declarations": "error",
        "no-class-assign": "error",
        "no-compare-neg-zero": "error",
        "no-cond-assign": "error",
        "no-const-assign": "error",
        "no-constant-binary-expression": "error",
        "no-constant-condition": "error",
        "no-control-regex": "error",
        "no-debugger": "error",
        "no-delete-var": "error",
        "no-dupe-class-members": "error",
        "no-dupe-else-if": "error",
        "no-dupe-keys": "error",
        "no-duplicate-case": "error",
        "no-empty": "error",
        "no-empty-character-class": "error",
        "no-empty-pattern": "error",
        "no-empty-static-block": "error",
        "no-ex-assign": "error",
        "no-extra-boolean-cast": "error",
        "no-fallthrough": "error",
        "no-func-assign": "error",
        "no-global-assign": "error",
        "no-import-assign": "error",
        "no-invalid-regexp": "error",
        "no-irregular-whitespace": "error",
        "no-loss-of-precision": "error",
        "no-misleading-character-class": "error",
        "no-new-native-nonconstructor": "error",
        "no-nonoctal-decimal-escape": "error",
        "no-obj-calls": "error",
        "no-prototype-builtins": "error",
        "no-redeclare": "error",
        "no-regex-spaces": "error",
        "no-self-assign": "error",
        "no-setter-return": "error",
        "no-shadow-restricted-names": "error",
        "no-sparse-arrays": "error",
        "no-this-before-super": "error",
        "no-unassigned-vars": "error",
        "no-undef": "error",
        "no-unexpected-multiline": "error",
        "no-unreachable": "error",
        "no-unsafe-finally": "error",
        "no-unsafe-negation": "error",
        "no-unsafe-optional-chaining": "error",
        "no-unused-labels": "error",
        "no-unused-private-class-members": "error",
        "no-unused-vars": "error",
        "no-useless-backreference": "error",
        "no-useless-catch": "error",
        "no-useless-escape": "error",
        "no-with": "error",
        "preserve-caught-error": "error",
        "require-yield": "error",
        "use-isnan": "error",
        "valid-typeof": "error",
        "@typescript-eslint/await-thenable": "error",
        "@typescript-eslint/ban-ts-comment": "error",
        "no-array-constructor": "error",
        "@typescript-eslint/no-array-delete": "error",
        "@typescript-eslint/no-base-to-string": "error",
        "@typescript-eslint/no-duplicate-enum-values": "error",
        "@typescript-eslint/no-duplicate-type-constituents": "error",
        "@typescript-eslint/no-empty-object-type": "error",
        "@typescript-eslint/no-explicit-any": "error",
        "@typescript-eslint/no-extra-non-null-assertion": "error",
        "@typescript-eslint/no-floating-promises": "error",
        "@typescript-eslint/no-for-in-array": "error",
        "@typescript-eslint/no-implied-eval": "error",
        "@typescript-eslint/no-misused-new": "error",
        "@typescript-eslint/no-misused-promises": "error",
        "@typescript-eslint/no-namespace": "error",
        "@typescript-eslint/no-non-null-asserted-optional-chain": "error",
        "@typescript-eslint/no-redundant-type-constituents": "error",
        "@typescript-eslint/no-require-imports": "error",
        "@typescript-eslint/no-this-alias": "error",
        "@typescript-eslint/no-unnecessary-type-assertion": "error",
        "@typescript-eslint/no-unnecessary-type-constraint": "error",
        "@typescript-eslint/no-unsafe-argument": "error",
        "@typescript-eslint/no-unsafe-assignment": "error",
        "@typescript-eslint/no-unsafe-call": "error",
        "@typescript-eslint/no-unsafe-declaration-merging": "error",
        "@typescript-eslint/no-unsafe-enum-comparison": "error",
        "@typescript-eslint/no-unsafe-function-type": "error",
        "@typescript-eslint/no-unsafe-member-access": "error",
        "@typescript-eslint/no-unsafe-return": "error",
        "@typescript-eslint/no-unsafe-unary-minus": "error",
        "no-unused-expressions": "error",
        "@typescript-eslint/no-wrapper-object-types": "error",
        "@typescript-eslint/only-throw-error": "error",
        "@typescript-eslint/prefer-as-const": "error",
        "@typescript-eslint/prefer-namespace-keyword": "error",
        "@typescript-eslint/prefer-promise-reject-errors": "error",
        "@typescript-eslint/require-await": "error",
        "@typescript-eslint/restrict-plus-operands": "error",
        "@typescript-eslint/restrict-template-expressions": "error",
        "@typescript-eslint/triple-slash-reference": "error",
        "@typescript-eslint/unbound-method": "error",
        "qwik/valid-lexical-scope": "error",
        "qwik/use-method-usage": "error",
        "qwik/no-react-props": "error",
        "qwik/loader-location": "warn",
        "qwik/prefer-classlist": "warn",
        "qwik/jsx-no-script-url": "warn",
        "qwik/jsx-key": "warn",
        "qwik/unused-server": "error",
        "qwik/jsx-img": "warn",
        "qwik/jsx-a": "warn",
        "qwik/no-use-visible-task": "warn",
        "qwik/no-async-prevent-default": "warn"
      },
      "overrides": [
        {
          "files": [
            "**/*.ts",
            "**/*.tsx",
            "**/*.mts",
            "**/*.cts"
          ],
          "rules": {
            "constructor-super": "off",
            "getter-return": "off",
            "no-class-assign": "off",
            "no-const-assign": "off",
            "no-dupe-class-members": "off",
            "no-dupe-keys": "off",
            "no-func-assign": "off",
            "no-import-assign": "off",
            "no-new-native-nonconstructor": "off",
            "no-obj-calls": "off",
            "no-redeclare": "off",
            "no-setter-return": "off",
            "no-this-before-super": "off",
            "no-undef": "off",
            "no-unreachable": "off",
            "no-unsafe-negation": "off",
            "no-var": "error",
            "no-with": "off",
            "prefer-const": "error",
            "prefer-rest-params": "error",
            "prefer-spread": "error"
          }
        }
      ]
    },
    fmt: {
      "sortTailwindcss": {},
      "printWidth": 80,
      "sortPackageJson": false,
      "ignorePatterns": [
        "**/*.log",
        "**/.DS_Store",
        "*.",
        ".vscode/settings.json",
        ".history",
        ".yarn",
        "bazel-*",
        "bazel-bin",
        "bazel-out",
        "bazel-qwik",
        "bazel-testlogs",
        "dist",
        "dist-dev",
        "lib",
        "lib-types",
        "etc",
        "external",
        "node_modules",
        "temp",
        "tsc-out",
        "tsdoc-metadata.json",
        "target",
        "output",
        "rollup.config.js",
        "build",
        ".cache",
        ".vscode",
        ".rollup.cache",
        "tsconfig.tsbuildinfo",
        "vite.config.ts",
        "*.spec.tsx",
        "*.spec.ts",
        ".netlify",
        "pnpm-lock.yaml",
        "package-lock.json",
        "yarn.lock",
        "server"
      ]
    },
    resolve: {
      tsconfigPaths: true,
    },
    plugins: [
      qwikCity({
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
    
    build: {
      rollupOptions: {
        output: {
          // Sanitize chunk filenames to prevent relative path substitutions
          chunkFileNames: (chunkInfo) => {
            let name = chunkInfo.name;
            
            // If the chunk name contains node_modules or relative paths, clean it up
            if (name.includes('node_modules') || name.includes('..')) {
              // Strip out path separators, dots, and node_modules to make it a safe flat string
              name = name
                .replace(/[^a-zA-Z0-9-_]/g, '-') // Replace symbols with dashes
                .replace(/-+/g, '-')             // Collapse duplicate dashes
                .replace(/^-|-$/g, '');          // Trim leading/trailing dashes
            }
            
            return `assets/${name}-[hash].js`;
          },
          // Apply the same treatment to entry files just in case
          entryFileNames: (chunkInfo) => {
            let name = chunkInfo.name;
            if (name.includes('node_modules') || name.includes('..')) {
              name = name.replace(/[^a-zA-Z0-9-_]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
            }
            return `assets/${name}-[hash].js`;
          }
        }
      }
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
  }
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
  // [PLUGIN_ERROR]: Invalid module "@qwik-city-plan" is not a valid package
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