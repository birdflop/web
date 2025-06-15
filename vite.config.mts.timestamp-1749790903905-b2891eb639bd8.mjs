// vite.config.mts
import { defineConfig } from "file:///run/media/sab/Data/GitHub/simplymc/node_modules/.pnpm/vite@5.4.14_@types+node@24.0.1_lightningcss@1.30.1/node_modules/vite/dist/node/index.js";
import { qwikVite } from "file:///run/media/sab/Data/GitHub/simplymc/node_modules/.pnpm/@builder.io+qwik@1.14.1_vite@5.4.14_@types+node@24.0.1_lightningcss@1.30.1_/node_modules/@builder.io/qwik/dist/optimizer.mjs";
import { qwikCity } from "file:///run/media/sab/Data/GitHub/simplymc/node_modules/.pnpm/@builder.io+qwik-city@1.14.1_acorn@8.14.0_rollup@4.41.0_typescript@5.8.3_vite@5.4.14_@t_72790b947fbc4a086c7d7b06d087569c/node_modules/@builder.io/qwik-city/lib/vite/index.mjs";
import { qwikSpeakInline } from "file:///run/media/sab/Data/GitHub/simplymc/node_modules/.pnpm/qwik-speak@0.23.0_@builder.io+qwik@1.14.1_vite@5.4.14_@types+node@24.0.1_lightningcss@1.30.1__/node_modules/qwik-speak/inline/index.mjs";
import tsconfigPaths from "file:///run/media/sab/Data/GitHub/simplymc/node_modules/.pnpm/vite-tsconfig-paths@5.1.4_typescript@5.8.3_vite@5.4.14_@types+node@24.0.1_lightningcss@1.30.1_/node_modules/vite-tsconfig-paths/dist/index.js";

// src/speak-config.ts
var languages = {
  "en-US": "English",
  "es-ES": "Espa\xF1ol",
  "ko-KR": "\uD55C\uAD6D\uC5B4",
  "nl-NL": "Nederlands",
  "pt-PT": "Portugu\xEAs",
  "ru-RU": "\u0420\u0443\u0441\u0441\u043A\u0438\u0439",
  "tr-TR": "T\xFCrk\xE7e",
  "zh-CN": "\u4E2D\u6587"
};
var config = {
  defaultLocale: { lang: "en-US" },
  supportedLocales: Object.keys(languages).map((lang) => ({ lang })),
  assets: [
    "animtab",
    "animtexture",
    "flags",
    "nav",
    "rgb"
  ]
};

// vite.config.mts
import { partytownVite } from "file:///run/media/sab/Data/GitHub/simplymc/node_modules/.pnpm/@qwik.dev+partytown@0.11.1/node_modules/@qwik.dev/partytown/utils/index.mjs";
import { join } from "path";
import tailwindcss from "file:///run/media/sab/Data/GitHub/simplymc/node_modules/.pnpm/@tailwindcss+vite@4.1.10_vite@5.4.14_@types+node@24.0.1_lightningcss@1.30.1_/node_modules/@tailwindcss/vite/dist/index.mjs";
import shikiRehype from "file:///run/media/sab/Data/GitHub/simplymc/node_modules/.pnpm/@shikijs+rehype@3.6.0/node_modules/@shikijs/rehype/dist/index.mjs";
import { transformerMetaHighlight, transformerMetaWordHighlight } from "file:///run/media/sab/Data/GitHub/simplymc/node_modules/.pnpm/@shikijs+transformers@3.6.0/node_modules/@shikijs/transformers/dist/index.mjs";
import { transformerColorizedBrackets } from "file:///run/media/sab/Data/GitHub/simplymc/node_modules/.pnpm/@shikijs+colorized-brackets@3.6.0/node_modules/@shikijs/colorized-brackets/dist/index.mjs";

// src/theme.json
var theme_default = {
  colors: {
    "actionBar.toggledBackground": "#545eb6",
    "activityBar.background": "#1a1a2e",
    "activityBar.foreground": "#54daf4",
    "activityBar.inactiveForeground": "#7878a3",
    "activityBarBadge.background": "#54daf4",
    "activityBarBadge.foreground": "#1a1a2e",
    "badge.background": "#545eb6",
    "badge.foreground": "#ffffff",
    "button.background": "#545eb6",
    "button.foreground": "#ffffff",
    "button.hoverBackground": "#6b73c7",
    "checkbox.border": "#54daf4",
    "dropdown.background": "#252542",
    "dropdown.border": "#545eb6",
    "editor.background": "#101828",
    "editor.foreground": "#e0e0e0",
    "editor.inactiveSelectionBackground": "#3a3d5c",
    "editor.lineHighlightBackground": "#1f2940",
    "editor.selectionBackground": "#545eb644",
    "editor.selectionHighlightBackground": "#54daf426",
    "editorCursor.foreground": "#54daf4",
    "editorIndentGuide.activeBackground1": "#54daf4",
    "editorIndentGuide.background1": "#3a3d5c",
    "editorLineNumber.activeForeground": "#54daf4",
    "editorLineNumber.foreground": "#7878a3",
    "editorWidget.background": "#1a1a2e",
    "editorWidget.border": "#545eb6",
    focusBorder: "#54daf4",
    "input.background": "#252542",
    "input.border": "#545eb6",
    "input.foreground": "#e0e0e0",
    "input.placeholderForeground": "#7878a3",
    "list.activeSelectionBackground": "#545eb6",
    "list.activeSelectionForeground": "#ffffff",
    "list.activeSelectionIconForeground": "#ffffff",
    "list.dropBackground": "#545eb633",
    "list.focusBackground": "#545eb666",
    "list.highlightForeground": "#54daf4",
    "list.hoverBackground": "#3a3d5c",
    "list.inactiveSelectionBackground": "#3a3d5c",
    "menu.background": "#1a1a2e",
    "menu.border": "#545eb6",
    "menu.foreground": "#e0e0e0",
    "menu.selectionBackground": "#545eb6",
    "menu.selectionForeground": "#ffffff",
    "menu.separatorBackground": "#3a3d5c",
    "minimap.selectionHighlight": "#54daf466",
    "panel.background": "#101828",
    "panel.border": "#3a3d5c",
    "panelTitle.activeBorder": "#54daf4",
    "panelTitle.activeForeground": "#54daf4",
    "panelTitle.inactiveForeground": "#7878a3",
    "peekView.border": "#545eb6",
    "peekViewEditor.background": "#1a1a2e",
    "peekViewEditor.matchHighlightBackground": "#54daf444",
    "peekViewResult.background": "#252542",
    "peekViewResult.matchHighlightBackground": "#54daf444",
    "peekViewTitle.background": "#252542",
    "pickerGroup.border": "#545eb6",
    "pickerGroup.foreground": "#54daf4",
    "ports.iconRunningProcessForeground": "#54daf4",
    "progressBar.background": "#54daf4",
    "scrollbar.shadow": "#00000066",
    "scrollbarSlider.activeBackground": "#54daf466",
    "scrollbarSlider.background": "#545eb633",
    "scrollbarSlider.hoverBackground": "#545eb655",
    "selection.background": "#54daf444",
    "settings.headerForeground": "#54daf4",
    "settings.modifiedItemIndicator": "#54daf4",
    "sideBar.background": "#1a1a2e",
    "sideBar.border": "#252542",
    "sideBar.foreground": "#d0d0d0",
    "sideBarSectionHeader.background": "#252542",
    "sideBarSectionHeader.border": "#3a3d5c",
    "sideBarSectionHeader.foreground": "#54daf4",
    "sideBarTitle.foreground": "#54daf4",
    "statusBar.background": "#545eb6",
    "statusBar.foreground": "#ffffff",
    "statusBar.noFolderBackground": "#1a1a2e",
    "statusBarItem.activeBackground": "#6b73c7",
    "statusBarItem.hoverBackground": "#6b73c7",
    "statusBarItem.remoteBackground": "#54daf4",
    "statusBarItem.remoteForeground": "#101828",
    "tab.activeBackground": "#101828",
    "tab.activeBorder": "#54daf4",
    "tab.activeForeground": "#ffffff",
    "tab.activeModifiedBorder": "#54daf4",
    "tab.border": "#252542",
    "tab.inactiveBackground": "#1a1a2e",
    "tab.inactiveForeground": "#a0a0a0",
    "tab.inactiveModifiedBorder": "#54daf466",
    "tab.lastPinnedBorder": "#545eb6",
    "tab.selectedBackground": "#252542",
    "tab.selectedForeground": "#ffffff",
    "terminal.ansiBlack": "#1a1a2e",
    "terminal.ansiBlue": "#545eb6",
    "terminal.ansiBrightBlack": "#3a3d5c",
    "terminal.ansiBrightBlue": "#7b84d8",
    "terminal.ansiBrightCyan": "#7de6fc",
    "terminal.ansiBrightGreen": "#7dfcb8",
    "terminal.ansiBrightMagenta": "#d87bfc",
    "terminal.ansiBrightRed": "#fc7b7b",
    "terminal.ansiBrightWhite": "#ffffff",
    "terminal.ansiBrightYellow": "#fceb7b",
    "terminal.ansiCyan": "#54daf4",
    "terminal.ansiGreen": "#54f4a4",
    "terminal.ansiMagenta": "#b654f4",
    "terminal.ansiRed": "#f45454",
    "terminal.ansiWhite": "#e0e0e0",
    "terminal.ansiYellow": "#f4da54",
    "terminal.background": "#101828",
    "terminal.foreground": "#e0e0e0",
    "terminal.inactiveSelectionBackground": "#3a3d5c",
    "textLink.activeForeground": "#7de6fc",
    "textLink.foreground": "#54daf4",
    "titleBar.activeBackground": "#1a1a2e",
    "titleBar.activeForeground": "#e0e0e0",
    "titleBar.border": "#252542",
    "titleBar.inactiveBackground": "#1a1a2e",
    "titleBar.inactiveForeground": "#a0a0a0",
    "widget.border": "#545eb6",
    "widget.shadow": "#00000066"
  },
  displayName: "Birdflop",
  name: "birdflop",
  semanticHighlighting: true,
  semanticTokenColors: {
    customLiteral: "#f4da54",
    newOperator: "#d87bfc",
    numberLiteral: "#7dfcb8",
    stringLiteral: "#fc9b7b"
  },
  tokenColors: [
    {
      scope: [
        "meta.embedded",
        "source.groovy.embedded",
        "string meta.image.inline.markdown",
        "variable.legacy.builtin.python"
      ],
      settings: {
        foreground: "#e0e0e0"
      }
    },
    {
      scope: "emphasis",
      settings: {
        fontStyle: "italic"
      }
    },
    {
      scope: "strong",
      settings: {
        fontStyle: "bold"
      }
    },
    {
      scope: "header",
      settings: {
        foreground: "#54daf4"
      }
    },
    {
      scope: "comment",
      settings: {
        foreground: "#7878a3",
        fontStyle: "italic"
      }
    },
    {
      scope: "constant.language",
      settings: {
        foreground: "#545eb6"
      }
    },
    {
      scope: [
        "constant.numeric",
        "variable.other.enummember",
        "keyword.operator.plus.exponent",
        "keyword.operator.minus.exponent"
      ],
      settings: {
        foreground: "#7dfcb8"
      }
    },
    {
      scope: "constant.regexp",
      settings: {
        foreground: "#b654f4"
      }
    },
    {
      scope: "entity.name.tag",
      settings: {
        foreground: "#545eb6"
      }
    },
    {
      scope: [
        "entity.name.tag.css",
        "entity.name.tag.less"
      ],
      settings: {
        foreground: "#f4da54"
      }
    },
    {
      scope: "entity.other.attribute-name",
      settings: {
        foreground: "#54daf4"
      }
    },
    {
      scope: [
        "entity.other.attribute-name.class.css",
        "source.css entity.other.attribute-name.class",
        "entity.other.attribute-name.id.css",
        "entity.other.attribute-name.parent-selector.css",
        "entity.other.attribute-name.parent.less",
        "source.css entity.other.attribute-name.pseudo-class",
        "entity.other.attribute-name.pseudo-element.css",
        "source.css.less entity.other.attribute-name.id",
        "entity.other.attribute-name.scss"
      ],
      settings: {
        foreground: "#f4da54"
      }
    },
    {
      scope: "invalid",
      settings: {
        foreground: "#f45454"
      }
    },
    {
      scope: "markup.underline",
      settings: {
        fontStyle: "underline"
      }
    },
    {
      scope: "markup.bold",
      settings: {
        fontStyle: "bold",
        foreground: "#545eb6"
      }
    },
    {
      scope: "markup.heading",
      settings: {
        fontStyle: "bold",
        foreground: "#54daf4"
      }
    },
    {
      scope: "markup.italic",
      settings: {
        fontStyle: "italic"
      }
    },
    {
      scope: "markup.strikethrough",
      settings: {
        fontStyle: "strikethrough"
      }
    },
    {
      scope: "markup.inserted",
      settings: {
        foreground: "#7dfcb8"
      }
    },
    {
      scope: "markup.deleted",
      settings: {
        foreground: "#fc9b7b"
      }
    },
    {
      scope: "markup.changed",
      settings: {
        foreground: "#545eb6"
      }
    },
    {
      scope: "punctuation.definition.quote.begin.markdown",
      settings: {
        foreground: "#7878a3"
      }
    },
    {
      scope: "punctuation.definition.list.begin.markdown",
      settings: {
        foreground: "#54daf4"
      }
    },
    {
      scope: "markup.inline.raw",
      settings: {
        foreground: "#fc9b7b"
      }
    },
    {
      scope: "punctuation.definition.tag",
      settings: {
        foreground: "#808080"
      }
    },
    {
      scope: [
        "meta.preprocessor",
        "entity.name.function.preprocessor"
      ],
      settings: {
        foreground: "#545eb6"
      }
    },
    {
      scope: "meta.preprocessor.string",
      settings: {
        foreground: "#fc9b7b"
      }
    },
    {
      scope: "meta.preprocessor.numeric",
      settings: {
        foreground: "#7dfcb8"
      }
    },
    {
      scope: "meta.structure.dictionary.key.python",
      settings: {
        foreground: "#54daf4"
      }
    },
    {
      scope: "meta.diff.header",
      settings: {
        foreground: "#545eb6"
      }
    },
    {
      scope: "storage",
      settings: {
        foreground: "#545eb6"
      }
    },
    {
      scope: "storage.type",
      settings: {
        foreground: "#545eb6"
      }
    },
    {
      scope: [
        "storage.modifier",
        "keyword.operator.noexcept"
      ],
      settings: {
        foreground: "#545eb6"
      }
    },
    {
      scope: [
        "string",
        "meta.embedded.assembly"
      ],
      settings: {
        foreground: "#fc9b7b"
      }
    },
    {
      scope: "string.tag",
      settings: {
        foreground: "#fc9b7b"
      }
    },
    {
      scope: "string.value",
      settings: {
        foreground: "#fc9b7b"
      }
    },
    {
      scope: "string.regexp",
      settings: {
        foreground: "#f45454"
      }
    },
    {
      scope: [
        "punctuation.definition.template-expression.begin",
        "punctuation.definition.template-expression.end",
        "punctuation.section.embedded"
      ],
      settings: {
        foreground: "#545eb6"
      }
    },
    {
      scope: [
        "meta.template.expression"
      ],
      settings: {
        foreground: "#e0e0e0"
      }
    },
    {
      scope: [
        "support.type.vendored.property-name",
        "support.type.property-name",
        "source.css variable",
        "source.coffee.embedded"
      ],
      settings: {
        foreground: "#54daf4"
      }
    },
    {
      scope: "keyword",
      settings: {
        foreground: "#545eb6"
      }
    },
    {
      scope: "keyword.control",
      settings: {
        foreground: "#545eb6"
      }
    },
    {
      scope: "keyword.operator",
      settings: {
        foreground: "#e0e0e0"
      }
    },
    {
      scope: [
        "keyword.operator.new",
        "keyword.operator.expression",
        "keyword.operator.cast",
        "keyword.operator.sizeof",
        "keyword.operator.alignof",
        "keyword.operator.typeid",
        "keyword.operator.alignas",
        "keyword.operator.instanceof",
        "keyword.operator.logical.python",
        "keyword.operator.wordlike"
      ],
      settings: {
        foreground: "#545eb6"
      }
    },
    {
      scope: "keyword.other.unit",
      settings: {
        foreground: "#7dfcb8"
      }
    },
    {
      scope: [
        "punctuation.section.embedded.begin.php",
        "punctuation.section.embedded.end.php"
      ],
      settings: {
        foreground: "#545eb6"
      }
    },
    {
      scope: "support.function.git-rebase",
      settings: {
        foreground: "#54daf4"
      }
    },
    {
      scope: "constant.sha.git-rebase",
      settings: {
        foreground: "#7dfcb8"
      }
    },
    {
      scope: [
        "storage.modifier.import.java",
        "variable.language.wildcard.java",
        "storage.modifier.package.java"
      ],
      settings: {
        foreground: "#e0e0e0"
      }
    },
    {
      scope: "variable.language",
      settings: {
        foreground: "#545eb6"
      }
    },
    {
      scope: [
        "entity.name.function",
        "support.function",
        "support.constant.handlebars",
        "source.powershell variable.other.member",
        "entity.name.operator.custom-literal"
      ],
      settings: {
        foreground: "#f4da54"
      }
    },
    {
      scope: [
        "support.class",
        "support.type",
        "entity.name.type",
        "entity.name.namespace",
        "entity.other.attribute",
        "entity.name.scope-resolution",
        "entity.name.class",
        "storage.type.numeric.go",
        "storage.type.byte.go",
        "storage.type.boolean.go",
        "storage.type.string.go",
        "storage.type.uintptr.go",
        "storage.type.error.go",
        "storage.type.rune.go",
        "storage.type.cs",
        "storage.type.generic.cs",
        "storage.type.modifier.cs",
        "storage.type.variable.cs",
        "storage.type.annotation.java",
        "storage.type.generic.java",
        "storage.type.java",
        "storage.type.object.array.java",
        "storage.type.primitive.array.java",
        "storage.type.primitive.java",
        "storage.type.token.java",
        "storage.type.groovy",
        "storage.type.annotation.groovy",
        "storage.type.parameters.groovy",
        "storage.type.generic.groovy",
        "storage.type.object.array.groovy",
        "storage.type.primitive.array.groovy",
        "storage.type.primitive.groovy"
      ],
      settings: {
        foreground: "#54daf4"
      }
    },
    {
      scope: [
        "meta.type.cast.expr",
        "meta.type.new.expr",
        "support.constant.math",
        "support.constant.dom",
        "support.constant.json",
        "entity.other.inherited-class",
        "punctuation.separator.namespace.ruby"
      ],
      settings: {
        foreground: "#54daf4"
      }
    },
    {
      scope: [
        "keyword.control",
        "source.cpp keyword.operator.new",
        "keyword.operator.delete",
        "keyword.other.using",
        "keyword.other.directive.using",
        "keyword.other.operator",
        "entity.name.operator"
      ],
      settings: {
        foreground: "#d87bfc"
      }
    },
    {
      scope: [
        "variable",
        "meta.definition.variable.name",
        "support.variable",
        "entity.name.variable",
        "constant.other.placeholder"
      ],
      settings: {
        foreground: "#7de6fc"
      }
    },
    {
      scope: [
        "variable.other.constant",
        "variable.other.enummember"
      ],
      settings: {
        foreground: "#54daf4"
      }
    },
    {
      scope: [
        "meta.object-literal.key"
      ],
      settings: {
        foreground: "#7de6fc"
      }
    },
    {
      scope: [
        "support.constant.property-value",
        "support.constant.font-name",
        "support.constant.media-type",
        "support.constant.media",
        "constant.other.color.rgb-value",
        "constant.other.rgb-value",
        "support.constant.color"
      ],
      settings: {
        foreground: "#fc9b7b"
      }
    },
    {
      scope: [
        "punctuation.definition.group.regexp",
        "punctuation.definition.group.assertion.regexp",
        "punctuation.definition.character-class.regexp",
        "punctuation.character.set.begin.regexp",
        "punctuation.character.set.end.regexp",
        "keyword.operator.negation.regexp",
        "support.other.parenthesis.regexp"
      ],
      settings: {
        foreground: "#fc9b7b"
      }
    },
    {
      scope: [
        "constant.character.character-class.regexp",
        "constant.other.character-class.set.regexp",
        "constant.other.character-class.regexp",
        "constant.character.set.regexp"
      ],
      settings: {
        foreground: "#f45454"
      }
    },
    {
      scope: [
        "keyword.operator.or.regexp",
        "keyword.control.anchor.regexp"
      ],
      settings: {
        foreground: "#f4da54"
      }
    },
    {
      scope: "keyword.operator.quantifier.regexp",
      settings: {
        foreground: "#f4da54"
      }
    },
    {
      scope: [
        "constant.character",
        "constant.other.option"
      ],
      settings: {
        foreground: "#545eb6"
      }
    },
    {
      scope: "constant.character.escape",
      settings: {
        foreground: "#f4da54"
      }
    },
    {
      scope: "entity.name.label",
      settings: {
        foreground: "#c8c8c8"
      }
    }
  ],
  type: "dark"
};

// vite.config.mts
var __vite_injected_original_dirname = "/run/media/sab/Data/GitHub/simplymc";
function transformerShowEmptyLines() {
  return {
    line(node) {
      if (node.children.length === 0) {
        node.children = [{ type: "text", value: " " }];
        return node;
      }
    }
  };
}
function transformerMetaShowTitle() {
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
      const title = titleMatch[1] ?? "";
      if (title.length > 0) {
        node.children.unshift({
          type: "element",
          tagName: "div",
          properties: {
            class: "shiki-title"
          },
          children: [{ type: "text", value: title }]
        });
      }
      meta.replace(titleMatch[0], "");
    }
  };
}
var vite_config_default = defineConfig(() => {
  return {
    plugins: [
      qwikCity({
        mdxPlugins: {
          rehypeSyntaxHighlight: false,
          remarkGfm: true,
          rehypeAutolinkHeadings: true
        },
        mdx: {
          rehypePlugins: [
            [
              shikiRehype,
              {
                theme: theme_default,
                transformers: [
                  transformerMetaHighlight(),
                  transformerMetaWordHighlight(),
                  transformerColorizedBrackets(),
                  transformerShowEmptyLines(),
                  transformerMetaShowTitle()
                ]
              }
            ]
          ]
        }
      }),
      qwikVite(),
      tsconfigPaths(),
      qwikSpeakInline({
        basePath: "./",
        supportedLangs: Object.keys(languages),
        defaultLang: "en-US",
        assetsPath: "i18n"
      }),
      partytownVite({ dest: join(__vite_injected_original_dirname, "dist", "~partytown") }),
      tailwindcss()
    ],
    preview: {
      headers: {
        "Cache-Control": "public, max-age=600"
      }
    },
    ssr: {
      external: [
        "@prisma/client/edge",
        "@auth/prisma-adapter"
      ]
    },
    optimizeDeps: {
      include: [
        "yaml",
        "gifuct-js",
        "three/examples/jsm/loaders/OBJLoader",
        "three/examples/jsm/controls/OrbitControls",
        "three",
        "@auth/prisma-adapter",
        "chart.js",
        "@prisma/client/edge",
        "@prisma/extension-accelerate",
        "@qwik.dev/partytown/integration"
      ]
    }
  };
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcubXRzIiwgInNyYy9zcGVhay1jb25maWcudHMiLCAic3JjL3RoZW1lLmpzb24iXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvcnVuL21lZGlhL3NhYi9EYXRhL0dpdEh1Yi9zaW1wbHltY1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL3J1bi9tZWRpYS9zYWIvRGF0YS9HaXRIdWIvc2ltcGx5bWMvdml0ZS5jb25maWcubXRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9ydW4vbWVkaWEvc2FiL0RhdGEvR2l0SHViL3NpbXBseW1jL3ZpdGUuY29uZmlnLm10c1wiO2ltcG9ydCB7IGRlZmluZUNvbmZpZyB9IGZyb20gXCJ2aXRlXCI7XG5pbXBvcnQgeyBxd2lrVml0ZSB9IGZyb20gXCJAYnVpbGRlci5pby9xd2lrL29wdGltaXplclwiO1xuaW1wb3J0IHsgcXdpa0NpdHkgfSBmcm9tIFwiQGJ1aWxkZXIuaW8vcXdpay1jaXR5L3ZpdGVcIjtcbmltcG9ydCB7IHF3aWtTcGVha0lubGluZSB9IGZyb20gXCJxd2lrLXNwZWFrL2lubGluZVwiO1xuaW1wb3J0IHRzY29uZmlnUGF0aHMgZnJvbSBcInZpdGUtdHNjb25maWctcGF0aHNcIjtcbmltcG9ydCB7IGxhbmd1YWdlcyB9IGZyb20gXCIuL3NyYy9zcGVhay1jb25maWdcIjtcbmltcG9ydCB7IHBhcnR5dG93blZpdGUgfSBmcm9tIFwiQHF3aWsuZGV2L3BhcnR5dG93bi91dGlsc1wiO1xuaW1wb3J0IHsgam9pbiB9IGZyb20gXCJwYXRoXCI7XG5pbXBvcnQgdGFpbHdpbmRjc3MgZnJvbSBcIkB0YWlsd2luZGNzcy92aXRlXCI7XG5pbXBvcnQgc2hpa2lSZWh5cGUgZnJvbSAnQHNoaWtpanMvcmVoeXBlJztcbmltcG9ydCB7IHRyYW5zZm9ybWVyTWV0YUhpZ2hsaWdodCwgdHJhbnNmb3JtZXJNZXRhV29yZEhpZ2hsaWdodCB9IGZyb20gJ0BzaGlraWpzL3RyYW5zZm9ybWVycyc7XG5pbXBvcnQgeyB0cmFuc2Zvcm1lckNvbG9yaXplZEJyYWNrZXRzIH0gZnJvbSAnQHNoaWtpanMvY29sb3JpemVkLWJyYWNrZXRzJztcbmltcG9ydCB0eXBlIHsgU2hpa2lUcmFuc2Zvcm1lciB9IGZyb20gJ0BzaGlraWpzL3R5cGVzJztcbmltcG9ydCBiaXJkZmxvcFRoZW1lIGZyb20gJy4vc3JjL3RoZW1lLmpzb24nXG5mdW5jdGlvbiB0cmFuc2Zvcm1lclNob3dFbXB0eUxpbmVzKCk6IFNoaWtpVHJhbnNmb3JtZXIge1xuICByZXR1cm4ge1xuICAgIGxpbmUobm9kZSkge1xuICAgICAgaWYgKG5vZGUuY2hpbGRyZW4ubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIG5vZGUuY2hpbGRyZW4gPSBbeyB0eXBlOiAndGV4dCcsIHZhbHVlOiAnICcgfV07XG4gICAgICAgIHJldHVybiBub2RlO1xuICAgICAgfVxuICAgIH0sXG4gIH07XG59XG5cbmZ1bmN0aW9uIHRyYW5zZm9ybWVyTWV0YVNob3dUaXRsZSgpOiBTaGlraVRyYW5zZm9ybWVyIHtcbiAgcmV0dXJuIHtcbiAgICByb290KG5vZGUpIHtcbiAgICAgIGNvbnN0IG1ldGEgPSB0aGlzLm9wdGlvbnMubWV0YT8uX19yYXc7XG4gICAgICBpZiAoIW1ldGEpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgY29uc3QgdGl0bGVNYXRjaCA9IG1ldGEubWF0Y2goL3RpdGxlPVwiKFteXCJdKilcIi8pO1xuICAgICAgaWYgKCF0aXRsZU1hdGNoKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGNvbnN0IHRpdGxlID0gdGl0bGVNYXRjaFsxXSA/PyAnJztcbiAgICAgIGlmICh0aXRsZS5sZW5ndGggPiAwKSB7XG4gICAgICAgIG5vZGUuY2hpbGRyZW4udW5zaGlmdCh7XG4gICAgICAgICAgdHlwZTogJ2VsZW1lbnQnLFxuICAgICAgICAgIHRhZ05hbWU6ICdkaXYnLFxuICAgICAgICAgIHByb3BlcnRpZXM6IHtcbiAgICAgICAgICAgIGNsYXNzOiAnc2hpa2ktdGl0bGUnLFxuICAgICAgICAgIH0sXG4gICAgICAgICAgY2hpbGRyZW46IFt7IHR5cGU6ICd0ZXh0JywgdmFsdWU6IHRpdGxlIH1dLFxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICAgIG1ldGEucmVwbGFjZSh0aXRsZU1hdGNoWzBdLCAnJyk7XG4gICAgfSxcbiAgfTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKCgpID0+IHtcbiAgcmV0dXJuIHtcbiAgICBwbHVnaW5zOiBbXG4gICAgICBxd2lrQ2l0eSh7XG4gICAgICAgIG1keFBsdWdpbnM6IHtcbiAgICAgICAgICByZWh5cGVTeW50YXhIaWdobGlnaHQ6IGZhbHNlLFxuICAgICAgICAgIHJlbWFya0dmbTogdHJ1ZSxcbiAgICAgICAgICByZWh5cGVBdXRvbGlua0hlYWRpbmdzOiB0cnVlLFxuICAgICAgICB9LFxuICAgICAgICBtZHg6IHtcbiAgICAgICAgICByZWh5cGVQbHVnaW5zOiBbXG4gICAgICAgICAgICBbXG4gICAgICAgICAgICAgIHNoaWtpUmVoeXBlLFxuICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgdGhlbWU6IGJpcmRmbG9wVGhlbWUsXG4gICAgICAgICAgICAgICAgdHJhbnNmb3JtZXJzOiBbXG4gICAgICAgICAgICAgICAgICB0cmFuc2Zvcm1lck1ldGFIaWdobGlnaHQoKSxcbiAgICAgICAgICAgICAgICAgIHRyYW5zZm9ybWVyTWV0YVdvcmRIaWdobGlnaHQoKSxcbiAgICAgICAgICAgICAgICAgIHRyYW5zZm9ybWVyQ29sb3JpemVkQnJhY2tldHMoKSxcbiAgICAgICAgICAgICAgICAgIHRyYW5zZm9ybWVyU2hvd0VtcHR5TGluZXMoKSxcbiAgICAgICAgICAgICAgICAgIHRyYW5zZm9ybWVyTWV0YVNob3dUaXRsZSgpLFxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBdLFxuICAgICAgICAgIF0sXG4gICAgICAgIH0sXG4gICAgICB9KSxcbiAgICAgIHF3aWtWaXRlKCksXG4gICAgICB0c2NvbmZpZ1BhdGhzKCksXG4gICAgICBxd2lrU3BlYWtJbmxpbmUoe1xuICAgICAgICBiYXNlUGF0aDogJy4vJyxcbiAgICAgICAgc3VwcG9ydGVkTGFuZ3M6IE9iamVjdC5rZXlzKGxhbmd1YWdlcyksXG4gICAgICAgIGRlZmF1bHRMYW5nOiBcImVuLVVTXCIsXG4gICAgICAgIGFzc2V0c1BhdGg6IFwiaTE4blwiXG4gICAgICB9KSxcbiAgICAgIHBhcnR5dG93blZpdGUoeyBkZXN0OiBqb2luKF9fZGlybmFtZSwgXCJkaXN0XCIsIFwifnBhcnR5dG93blwiKSB9KSxcbiAgICAgIHRhaWx3aW5kY3NzKCksXG4gICAgXSxcbiAgICBwcmV2aWV3OiB7XG4gICAgICBoZWFkZXJzOiB7XG4gICAgICAgIFwiQ2FjaGUtQ29udHJvbFwiOiBcInB1YmxpYywgbWF4LWFnZT02MDBcIixcbiAgICAgIH0sXG4gICAgfSxcbiAgICBzc3I6IHtcbiAgICAgIGV4dGVybmFsOiBbXG4gICAgICAgICdAcHJpc21hL2NsaWVudC9lZGdlJyxcbiAgICAgICAgJ0BhdXRoL3ByaXNtYS1hZGFwdGVyJyxcbiAgICAgIF0sXG4gICAgfSxcbiAgICBvcHRpbWl6ZURlcHM6IHtcbiAgICAgIGluY2x1ZGU6IFtcbiAgICAgICAgJ3lhbWwnLFxuICAgICAgICAnZ2lmdWN0LWpzJyxcbiAgICAgICAgJ3RocmVlL2V4YW1wbGVzL2pzbS9sb2FkZXJzL09CSkxvYWRlcicsXG4gICAgICAgICd0aHJlZS9leGFtcGxlcy9qc20vY29udHJvbHMvT3JiaXRDb250cm9scycsXG4gICAgICAgICd0aHJlZScsXG4gICAgICAgICdAYXV0aC9wcmlzbWEtYWRhcHRlcicsXG4gICAgICAgICdjaGFydC5qcycsXG4gICAgICAgICdAcHJpc21hL2NsaWVudC9lZGdlJyxcbiAgICAgICAgJ0BwcmlzbWEvZXh0ZW5zaW9uLWFjY2VsZXJhdGUnLFxuICAgICAgICAnQHF3aWsuZGV2L3BhcnR5dG93bi9pbnRlZ3JhdGlvbidcbiAgICAgIF0sXG4gICAgfSxcbiAgfTtcbn0pO1xuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvcnVuL21lZGlhL3NhYi9EYXRhL0dpdEh1Yi9zaW1wbHltYy9zcmNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9ydW4vbWVkaWEvc2FiL0RhdGEvR2l0SHViL3NpbXBseW1jL3NyYy9zcGVhay1jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL3J1bi9tZWRpYS9zYWIvRGF0YS9HaXRIdWIvc2ltcGx5bWMvc3JjL3NwZWFrLWNvbmZpZy50c1wiO2ltcG9ydCB0eXBlIHsgU3BlYWtDb25maWcgfSBmcm9tICdxd2lrLXNwZWFrJztcbmV4cG9ydCBjb25zdCBsYW5ndWFnZXMgPSB7XG4gICdlbi1VUyc6ICdFbmdsaXNoJyxcbiAgJ2VzLUVTJzogJ0VzcGFcdTAwRjFvbCcsXG4gICdrby1LUic6ICdcdUQ1NUNcdUFENkRcdUM1QjQnLFxuICAnbmwtTkwnOiAnTmVkZXJsYW5kcycsXG4gICdwdC1QVCc6ICdQb3J0dWd1XHUwMEVBcycsXG4gICdydS1SVSc6ICdcdTA0MjBcdTA0NDNcdTA0NDFcdTA0NDFcdTA0M0FcdTA0MzhcdTA0MzknLFxuICAndHItVFInOiAnVFx1MDBGQ3JrXHUwMEU3ZScsXG4gICd6aC1DTic6ICdcdTRFMkRcdTY1ODcnLFxufTtcblxuZXhwb3J0IGNvbnN0IGNvbmZpZzogU3BlYWtDb25maWcgPSB7XG4gIGRlZmF1bHRMb2NhbGU6IHsgbGFuZzogJ2VuLVVTJyB9LFxuICBzdXBwb3J0ZWRMb2NhbGVzOiBPYmplY3Qua2V5cyhsYW5ndWFnZXMpLm1hcCgobGFuZykgPT4gKHsgbGFuZyB9KSksXG4gIGFzc2V0czogW1xuICAgICdhbmltdGFiJyxcbiAgICAnYW5pbXRleHR1cmUnLFxuICAgICdmbGFncycsXG4gICAgJ25hdicsXG4gICAgJ3JnYicsXG4gIF0sXG59OyIsICJ7XG4gIFwiY29sb3JzXCI6IHtcbiAgICBcImFjdGlvbkJhci50b2dnbGVkQmFja2dyb3VuZFwiOiBcIiM1NDVlYjZcIixcbiAgICBcImFjdGl2aXR5QmFyLmJhY2tncm91bmRcIjogXCIjMWExYTJlXCIsXG4gICAgXCJhY3Rpdml0eUJhci5mb3JlZ3JvdW5kXCI6IFwiIzU0ZGFmNFwiLFxuICAgIFwiYWN0aXZpdHlCYXIuaW5hY3RpdmVGb3JlZ3JvdW5kXCI6IFwiIzc4NzhhM1wiLFxuICAgIFwiYWN0aXZpdHlCYXJCYWRnZS5iYWNrZ3JvdW5kXCI6IFwiIzU0ZGFmNFwiLFxuICAgIFwiYWN0aXZpdHlCYXJCYWRnZS5mb3JlZ3JvdW5kXCI6IFwiIzFhMWEyZVwiLFxuICAgIFwiYmFkZ2UuYmFja2dyb3VuZFwiOiBcIiM1NDVlYjZcIixcbiAgICBcImJhZGdlLmZvcmVncm91bmRcIjogXCIjZmZmZmZmXCIsXG4gICAgXCJidXR0b24uYmFja2dyb3VuZFwiOiBcIiM1NDVlYjZcIixcbiAgICBcImJ1dHRvbi5mb3JlZ3JvdW5kXCI6IFwiI2ZmZmZmZlwiLFxuICAgIFwiYnV0dG9uLmhvdmVyQmFja2dyb3VuZFwiOiBcIiM2YjczYzdcIixcbiAgICBcImNoZWNrYm94LmJvcmRlclwiOiBcIiM1NGRhZjRcIixcbiAgICBcImRyb3Bkb3duLmJhY2tncm91bmRcIjogXCIjMjUyNTQyXCIsXG4gICAgXCJkcm9wZG93bi5ib3JkZXJcIjogXCIjNTQ1ZWI2XCIsXG4gICAgXCJlZGl0b3IuYmFja2dyb3VuZFwiOiBcIiMxMDE4MjhcIixcbiAgICBcImVkaXRvci5mb3JlZ3JvdW5kXCI6IFwiI2UwZTBlMFwiLFxuICAgIFwiZWRpdG9yLmluYWN0aXZlU2VsZWN0aW9uQmFja2dyb3VuZFwiOiBcIiMzYTNkNWNcIixcbiAgICBcImVkaXRvci5saW5lSGlnaGxpZ2h0QmFja2dyb3VuZFwiOiBcIiMxZjI5NDBcIixcbiAgICBcImVkaXRvci5zZWxlY3Rpb25CYWNrZ3JvdW5kXCI6IFwiIzU0NWViNjQ0XCIsXG4gICAgXCJlZGl0b3Iuc2VsZWN0aW9uSGlnaGxpZ2h0QmFja2dyb3VuZFwiOiBcIiM1NGRhZjQyNlwiLFxuICAgIFwiZWRpdG9yQ3Vyc29yLmZvcmVncm91bmRcIjogXCIjNTRkYWY0XCIsXG4gICAgXCJlZGl0b3JJbmRlbnRHdWlkZS5hY3RpdmVCYWNrZ3JvdW5kMVwiOiBcIiM1NGRhZjRcIixcbiAgICBcImVkaXRvckluZGVudEd1aWRlLmJhY2tncm91bmQxXCI6IFwiIzNhM2Q1Y1wiLFxuICAgIFwiZWRpdG9yTGluZU51bWJlci5hY3RpdmVGb3JlZ3JvdW5kXCI6IFwiIzU0ZGFmNFwiLFxuICAgIFwiZWRpdG9yTGluZU51bWJlci5mb3JlZ3JvdW5kXCI6IFwiIzc4NzhhM1wiLFxuICAgIFwiZWRpdG9yV2lkZ2V0LmJhY2tncm91bmRcIjogXCIjMWExYTJlXCIsXG4gICAgXCJlZGl0b3JXaWRnZXQuYm9yZGVyXCI6IFwiIzU0NWViNlwiLFxuICAgIFwiZm9jdXNCb3JkZXJcIjogXCIjNTRkYWY0XCIsXG4gICAgXCJpbnB1dC5iYWNrZ3JvdW5kXCI6IFwiIzI1MjU0MlwiLFxuICAgIFwiaW5wdXQuYm9yZGVyXCI6IFwiIzU0NWViNlwiLFxuICAgIFwiaW5wdXQuZm9yZWdyb3VuZFwiOiBcIiNlMGUwZTBcIixcbiAgICBcImlucHV0LnBsYWNlaG9sZGVyRm9yZWdyb3VuZFwiOiBcIiM3ODc4YTNcIixcbiAgICBcImxpc3QuYWN0aXZlU2VsZWN0aW9uQmFja2dyb3VuZFwiOiBcIiM1NDVlYjZcIixcbiAgICBcImxpc3QuYWN0aXZlU2VsZWN0aW9uRm9yZWdyb3VuZFwiOiBcIiNmZmZmZmZcIixcbiAgICBcImxpc3QuYWN0aXZlU2VsZWN0aW9uSWNvbkZvcmVncm91bmRcIjogXCIjZmZmZmZmXCIsXG4gICAgXCJsaXN0LmRyb3BCYWNrZ3JvdW5kXCI6IFwiIzU0NWViNjMzXCIsXG4gICAgXCJsaXN0LmZvY3VzQmFja2dyb3VuZFwiOiBcIiM1NDVlYjY2NlwiLFxuICAgIFwibGlzdC5oaWdobGlnaHRGb3JlZ3JvdW5kXCI6IFwiIzU0ZGFmNFwiLFxuICAgIFwibGlzdC5ob3ZlckJhY2tncm91bmRcIjogXCIjM2EzZDVjXCIsXG4gICAgXCJsaXN0LmluYWN0aXZlU2VsZWN0aW9uQmFja2dyb3VuZFwiOiBcIiMzYTNkNWNcIixcbiAgICBcIm1lbnUuYmFja2dyb3VuZFwiOiBcIiMxYTFhMmVcIixcbiAgICBcIm1lbnUuYm9yZGVyXCI6IFwiIzU0NWViNlwiLFxuICAgIFwibWVudS5mb3JlZ3JvdW5kXCI6IFwiI2UwZTBlMFwiLFxuICAgIFwibWVudS5zZWxlY3Rpb25CYWNrZ3JvdW5kXCI6IFwiIzU0NWViNlwiLFxuICAgIFwibWVudS5zZWxlY3Rpb25Gb3JlZ3JvdW5kXCI6IFwiI2ZmZmZmZlwiLFxuICAgIFwibWVudS5zZXBhcmF0b3JCYWNrZ3JvdW5kXCI6IFwiIzNhM2Q1Y1wiLFxuICAgIFwibWluaW1hcC5zZWxlY3Rpb25IaWdobGlnaHRcIjogXCIjNTRkYWY0NjZcIixcbiAgICBcInBhbmVsLmJhY2tncm91bmRcIjogXCIjMTAxODI4XCIsXG4gICAgXCJwYW5lbC5ib3JkZXJcIjogXCIjM2EzZDVjXCIsXG4gICAgXCJwYW5lbFRpdGxlLmFjdGl2ZUJvcmRlclwiOiBcIiM1NGRhZjRcIixcbiAgICBcInBhbmVsVGl0bGUuYWN0aXZlRm9yZWdyb3VuZFwiOiBcIiM1NGRhZjRcIixcbiAgICBcInBhbmVsVGl0bGUuaW5hY3RpdmVGb3JlZ3JvdW5kXCI6IFwiIzc4NzhhM1wiLFxuICAgIFwicGVla1ZpZXcuYm9yZGVyXCI6IFwiIzU0NWViNlwiLFxuICAgIFwicGVla1ZpZXdFZGl0b3IuYmFja2dyb3VuZFwiOiBcIiMxYTFhMmVcIixcbiAgICBcInBlZWtWaWV3RWRpdG9yLm1hdGNoSGlnaGxpZ2h0QmFja2dyb3VuZFwiOiBcIiM1NGRhZjQ0NFwiLFxuICAgIFwicGVla1ZpZXdSZXN1bHQuYmFja2dyb3VuZFwiOiBcIiMyNTI1NDJcIixcbiAgICBcInBlZWtWaWV3UmVzdWx0Lm1hdGNoSGlnaGxpZ2h0QmFja2dyb3VuZFwiOiBcIiM1NGRhZjQ0NFwiLFxuICAgIFwicGVla1ZpZXdUaXRsZS5iYWNrZ3JvdW5kXCI6IFwiIzI1MjU0MlwiLFxuICAgIFwicGlja2VyR3JvdXAuYm9yZGVyXCI6IFwiIzU0NWViNlwiLFxuICAgIFwicGlja2VyR3JvdXAuZm9yZWdyb3VuZFwiOiBcIiM1NGRhZjRcIixcbiAgICBcInBvcnRzLmljb25SdW5uaW5nUHJvY2Vzc0ZvcmVncm91bmRcIjogXCIjNTRkYWY0XCIsXG4gICAgXCJwcm9ncmVzc0Jhci5iYWNrZ3JvdW5kXCI6IFwiIzU0ZGFmNFwiLFxuICAgIFwic2Nyb2xsYmFyLnNoYWRvd1wiOiBcIiMwMDAwMDA2NlwiLFxuICAgIFwic2Nyb2xsYmFyU2xpZGVyLmFjdGl2ZUJhY2tncm91bmRcIjogXCIjNTRkYWY0NjZcIixcbiAgICBcInNjcm9sbGJhclNsaWRlci5iYWNrZ3JvdW5kXCI6IFwiIzU0NWViNjMzXCIsXG4gICAgXCJzY3JvbGxiYXJTbGlkZXIuaG92ZXJCYWNrZ3JvdW5kXCI6IFwiIzU0NWViNjU1XCIsXG4gICAgXCJzZWxlY3Rpb24uYmFja2dyb3VuZFwiOiBcIiM1NGRhZjQ0NFwiLFxuICAgIFwic2V0dGluZ3MuaGVhZGVyRm9yZWdyb3VuZFwiOiBcIiM1NGRhZjRcIixcbiAgICBcInNldHRpbmdzLm1vZGlmaWVkSXRlbUluZGljYXRvclwiOiBcIiM1NGRhZjRcIixcbiAgICBcInNpZGVCYXIuYmFja2dyb3VuZFwiOiBcIiMxYTFhMmVcIixcbiAgICBcInNpZGVCYXIuYm9yZGVyXCI6IFwiIzI1MjU0MlwiLFxuICAgIFwic2lkZUJhci5mb3JlZ3JvdW5kXCI6IFwiI2QwZDBkMFwiLFxuICAgIFwic2lkZUJhclNlY3Rpb25IZWFkZXIuYmFja2dyb3VuZFwiOiBcIiMyNTI1NDJcIixcbiAgICBcInNpZGVCYXJTZWN0aW9uSGVhZGVyLmJvcmRlclwiOiBcIiMzYTNkNWNcIixcbiAgICBcInNpZGVCYXJTZWN0aW9uSGVhZGVyLmZvcmVncm91bmRcIjogXCIjNTRkYWY0XCIsXG4gICAgXCJzaWRlQmFyVGl0bGUuZm9yZWdyb3VuZFwiOiBcIiM1NGRhZjRcIixcbiAgICBcInN0YXR1c0Jhci5iYWNrZ3JvdW5kXCI6IFwiIzU0NWViNlwiLFxuICAgIFwic3RhdHVzQmFyLmZvcmVncm91bmRcIjogXCIjZmZmZmZmXCIsXG4gICAgXCJzdGF0dXNCYXIubm9Gb2xkZXJCYWNrZ3JvdW5kXCI6IFwiIzFhMWEyZVwiLFxuICAgIFwic3RhdHVzQmFySXRlbS5hY3RpdmVCYWNrZ3JvdW5kXCI6IFwiIzZiNzNjN1wiLFxuICAgIFwic3RhdHVzQmFySXRlbS5ob3ZlckJhY2tncm91bmRcIjogXCIjNmI3M2M3XCIsXG4gICAgXCJzdGF0dXNCYXJJdGVtLnJlbW90ZUJhY2tncm91bmRcIjogXCIjNTRkYWY0XCIsXG4gICAgXCJzdGF0dXNCYXJJdGVtLnJlbW90ZUZvcmVncm91bmRcIjogXCIjMTAxODI4XCIsXG4gICAgXCJ0YWIuYWN0aXZlQmFja2dyb3VuZFwiOiBcIiMxMDE4MjhcIixcbiAgICBcInRhYi5hY3RpdmVCb3JkZXJcIjogXCIjNTRkYWY0XCIsXG4gICAgXCJ0YWIuYWN0aXZlRm9yZWdyb3VuZFwiOiBcIiNmZmZmZmZcIixcbiAgICBcInRhYi5hY3RpdmVNb2RpZmllZEJvcmRlclwiOiBcIiM1NGRhZjRcIixcbiAgICBcInRhYi5ib3JkZXJcIjogXCIjMjUyNTQyXCIsXG4gICAgXCJ0YWIuaW5hY3RpdmVCYWNrZ3JvdW5kXCI6IFwiIzFhMWEyZVwiLFxuICAgIFwidGFiLmluYWN0aXZlRm9yZWdyb3VuZFwiOiBcIiNhMGEwYTBcIixcbiAgICBcInRhYi5pbmFjdGl2ZU1vZGlmaWVkQm9yZGVyXCI6IFwiIzU0ZGFmNDY2XCIsXG4gICAgXCJ0YWIubGFzdFBpbm5lZEJvcmRlclwiOiBcIiM1NDVlYjZcIixcbiAgICBcInRhYi5zZWxlY3RlZEJhY2tncm91bmRcIjogXCIjMjUyNTQyXCIsXG4gICAgXCJ0YWIuc2VsZWN0ZWRGb3JlZ3JvdW5kXCI6IFwiI2ZmZmZmZlwiLFxuICAgIFwidGVybWluYWwuYW5zaUJsYWNrXCI6IFwiIzFhMWEyZVwiLFxuICAgIFwidGVybWluYWwuYW5zaUJsdWVcIjogXCIjNTQ1ZWI2XCIsXG4gICAgXCJ0ZXJtaW5hbC5hbnNpQnJpZ2h0QmxhY2tcIjogXCIjM2EzZDVjXCIsXG4gICAgXCJ0ZXJtaW5hbC5hbnNpQnJpZ2h0Qmx1ZVwiOiBcIiM3Yjg0ZDhcIixcbiAgICBcInRlcm1pbmFsLmFuc2lCcmlnaHRDeWFuXCI6IFwiIzdkZTZmY1wiLFxuICAgIFwidGVybWluYWwuYW5zaUJyaWdodEdyZWVuXCI6IFwiIzdkZmNiOFwiLFxuICAgIFwidGVybWluYWwuYW5zaUJyaWdodE1hZ2VudGFcIjogXCIjZDg3YmZjXCIsXG4gICAgXCJ0ZXJtaW5hbC5hbnNpQnJpZ2h0UmVkXCI6IFwiI2ZjN2I3YlwiLFxuICAgIFwidGVybWluYWwuYW5zaUJyaWdodFdoaXRlXCI6IFwiI2ZmZmZmZlwiLFxuICAgIFwidGVybWluYWwuYW5zaUJyaWdodFllbGxvd1wiOiBcIiNmY2ViN2JcIixcbiAgICBcInRlcm1pbmFsLmFuc2lDeWFuXCI6IFwiIzU0ZGFmNFwiLFxuICAgIFwidGVybWluYWwuYW5zaUdyZWVuXCI6IFwiIzU0ZjRhNFwiLFxuICAgIFwidGVybWluYWwuYW5zaU1hZ2VudGFcIjogXCIjYjY1NGY0XCIsXG4gICAgXCJ0ZXJtaW5hbC5hbnNpUmVkXCI6IFwiI2Y0NTQ1NFwiLFxuICAgIFwidGVybWluYWwuYW5zaVdoaXRlXCI6IFwiI2UwZTBlMFwiLFxuICAgIFwidGVybWluYWwuYW5zaVllbGxvd1wiOiBcIiNmNGRhNTRcIixcbiAgICBcInRlcm1pbmFsLmJhY2tncm91bmRcIjogXCIjMTAxODI4XCIsXG4gICAgXCJ0ZXJtaW5hbC5mb3JlZ3JvdW5kXCI6IFwiI2UwZTBlMFwiLFxuICAgIFwidGVybWluYWwuaW5hY3RpdmVTZWxlY3Rpb25CYWNrZ3JvdW5kXCI6IFwiIzNhM2Q1Y1wiLFxuICAgIFwidGV4dExpbmsuYWN0aXZlRm9yZWdyb3VuZFwiOiBcIiM3ZGU2ZmNcIixcbiAgICBcInRleHRMaW5rLmZvcmVncm91bmRcIjogXCIjNTRkYWY0XCIsXG4gICAgXCJ0aXRsZUJhci5hY3RpdmVCYWNrZ3JvdW5kXCI6IFwiIzFhMWEyZVwiLFxuICAgIFwidGl0bGVCYXIuYWN0aXZlRm9yZWdyb3VuZFwiOiBcIiNlMGUwZTBcIixcbiAgICBcInRpdGxlQmFyLmJvcmRlclwiOiBcIiMyNTI1NDJcIixcbiAgICBcInRpdGxlQmFyLmluYWN0aXZlQmFja2dyb3VuZFwiOiBcIiMxYTFhMmVcIixcbiAgICBcInRpdGxlQmFyLmluYWN0aXZlRm9yZWdyb3VuZFwiOiBcIiNhMGEwYTBcIixcbiAgICBcIndpZGdldC5ib3JkZXJcIjogXCIjNTQ1ZWI2XCIsXG4gICAgXCJ3aWRnZXQuc2hhZG93XCI6IFwiIzAwMDAwMDY2XCJcbiAgfSxcbiAgXCJkaXNwbGF5TmFtZVwiOiBcIkJpcmRmbG9wXCIsXG4gIFwibmFtZVwiOiBcImJpcmRmbG9wXCIsXG4gIFwic2VtYW50aWNIaWdobGlnaHRpbmdcIjogdHJ1ZSxcbiAgXCJzZW1hbnRpY1Rva2VuQ29sb3JzXCI6IHtcbiAgICBcImN1c3RvbUxpdGVyYWxcIjogXCIjZjRkYTU0XCIsXG4gICAgXCJuZXdPcGVyYXRvclwiOiBcIiNkODdiZmNcIixcbiAgICBcIm51bWJlckxpdGVyYWxcIjogXCIjN2RmY2I4XCIsXG4gICAgXCJzdHJpbmdMaXRlcmFsXCI6IFwiI2ZjOWI3YlwiXG4gIH0sXG4gIFwidG9rZW5Db2xvcnNcIjogW1xuICAgIHtcbiAgICAgIFwic2NvcGVcIjogW1xuICAgICAgICBcIm1ldGEuZW1iZWRkZWRcIixcbiAgICAgICAgXCJzb3VyY2UuZ3Jvb3Z5LmVtYmVkZGVkXCIsXG4gICAgICAgIFwic3RyaW5nIG1ldGEuaW1hZ2UuaW5saW5lLm1hcmtkb3duXCIsXG4gICAgICAgIFwidmFyaWFibGUubGVnYWN5LmJ1aWx0aW4ucHl0aG9uXCJcbiAgICAgIF0sXG4gICAgICBcInNldHRpbmdzXCI6IHtcbiAgICAgICAgXCJmb3JlZ3JvdW5kXCI6IFwiI2UwZTBlMFwiXG4gICAgICB9XG4gICAgfSxcbiAgICB7XG4gICAgICBcInNjb3BlXCI6IFwiZW1waGFzaXNcIixcbiAgICAgIFwic2V0dGluZ3NcIjoge1xuICAgICAgICBcImZvbnRTdHlsZVwiOiBcIml0YWxpY1wiXG4gICAgICB9XG4gICAgfSxcbiAgICB7XG4gICAgICBcInNjb3BlXCI6IFwic3Ryb25nXCIsXG4gICAgICBcInNldHRpbmdzXCI6IHtcbiAgICAgICAgXCJmb250U3R5bGVcIjogXCJib2xkXCJcbiAgICAgIH1cbiAgICB9LFxuICAgIHtcbiAgICAgIFwic2NvcGVcIjogXCJoZWFkZXJcIixcbiAgICAgIFwic2V0dGluZ3NcIjoge1xuICAgICAgICBcImZvcmVncm91bmRcIjogXCIjNTRkYWY0XCJcbiAgICAgIH1cbiAgICB9LFxuICAgIHtcbiAgICAgIFwic2NvcGVcIjogXCJjb21tZW50XCIsXG4gICAgICBcInNldHRpbmdzXCI6IHtcbiAgICAgICAgXCJmb3JlZ3JvdW5kXCI6IFwiIzc4NzhhM1wiLFxuICAgICAgICBcImZvbnRTdHlsZVwiOiBcIml0YWxpY1wiXG4gICAgICB9XG4gICAgfSxcbiAgICB7XG4gICAgICBcInNjb3BlXCI6IFwiY29uc3RhbnQubGFuZ3VhZ2VcIixcbiAgICAgIFwic2V0dGluZ3NcIjoge1xuICAgICAgICBcImZvcmVncm91bmRcIjogXCIjNTQ1ZWI2XCJcbiAgICAgIH1cbiAgICB9LFxuICAgIHtcbiAgICAgIFwic2NvcGVcIjogW1xuICAgICAgICBcImNvbnN0YW50Lm51bWVyaWNcIixcbiAgICAgICAgXCJ2YXJpYWJsZS5vdGhlci5lbnVtbWVtYmVyXCIsXG4gICAgICAgIFwia2V5d29yZC5vcGVyYXRvci5wbHVzLmV4cG9uZW50XCIsXG4gICAgICAgIFwia2V5d29yZC5vcGVyYXRvci5taW51cy5leHBvbmVudFwiXG4gICAgICBdLFxuICAgICAgXCJzZXR0aW5nc1wiOiB7XG4gICAgICAgIFwiZm9yZWdyb3VuZFwiOiBcIiM3ZGZjYjhcIlxuICAgICAgfVxuICAgIH0sXG4gICAge1xuICAgICAgXCJzY29wZVwiOiBcImNvbnN0YW50LnJlZ2V4cFwiLFxuICAgICAgXCJzZXR0aW5nc1wiOiB7XG4gICAgICAgIFwiZm9yZWdyb3VuZFwiOiBcIiNiNjU0ZjRcIlxuICAgICAgfVxuICAgIH0sXG4gICAge1xuICAgICAgXCJzY29wZVwiOiBcImVudGl0eS5uYW1lLnRhZ1wiLFxuICAgICAgXCJzZXR0aW5nc1wiOiB7XG4gICAgICAgIFwiZm9yZWdyb3VuZFwiOiBcIiM1NDVlYjZcIlxuICAgICAgfVxuICAgIH0sXG4gICAge1xuICAgICAgXCJzY29wZVwiOiBbXG4gICAgICAgIFwiZW50aXR5Lm5hbWUudGFnLmNzc1wiLFxuICAgICAgICBcImVudGl0eS5uYW1lLnRhZy5sZXNzXCJcbiAgICAgIF0sXG4gICAgICBcInNldHRpbmdzXCI6IHtcbiAgICAgICAgXCJmb3JlZ3JvdW5kXCI6IFwiI2Y0ZGE1NFwiXG4gICAgICB9XG4gICAgfSxcbiAgICB7XG4gICAgICBcInNjb3BlXCI6IFwiZW50aXR5Lm90aGVyLmF0dHJpYnV0ZS1uYW1lXCIsXG4gICAgICBcInNldHRpbmdzXCI6IHtcbiAgICAgICAgXCJmb3JlZ3JvdW5kXCI6IFwiIzU0ZGFmNFwiXG4gICAgICB9XG4gICAgfSxcbiAgICB7XG4gICAgICBcInNjb3BlXCI6IFtcbiAgICAgICAgXCJlbnRpdHkub3RoZXIuYXR0cmlidXRlLW5hbWUuY2xhc3MuY3NzXCIsXG4gICAgICAgIFwic291cmNlLmNzcyBlbnRpdHkub3RoZXIuYXR0cmlidXRlLW5hbWUuY2xhc3NcIixcbiAgICAgICAgXCJlbnRpdHkub3RoZXIuYXR0cmlidXRlLW5hbWUuaWQuY3NzXCIsXG4gICAgICAgIFwiZW50aXR5Lm90aGVyLmF0dHJpYnV0ZS1uYW1lLnBhcmVudC1zZWxlY3Rvci5jc3NcIixcbiAgICAgICAgXCJlbnRpdHkub3RoZXIuYXR0cmlidXRlLW5hbWUucGFyZW50Lmxlc3NcIixcbiAgICAgICAgXCJzb3VyY2UuY3NzIGVudGl0eS5vdGhlci5hdHRyaWJ1dGUtbmFtZS5wc2V1ZG8tY2xhc3NcIixcbiAgICAgICAgXCJlbnRpdHkub3RoZXIuYXR0cmlidXRlLW5hbWUucHNldWRvLWVsZW1lbnQuY3NzXCIsXG4gICAgICAgIFwic291cmNlLmNzcy5sZXNzIGVudGl0eS5vdGhlci5hdHRyaWJ1dGUtbmFtZS5pZFwiLFxuICAgICAgICBcImVudGl0eS5vdGhlci5hdHRyaWJ1dGUtbmFtZS5zY3NzXCJcbiAgICAgIF0sXG4gICAgICBcInNldHRpbmdzXCI6IHtcbiAgICAgICAgXCJmb3JlZ3JvdW5kXCI6IFwiI2Y0ZGE1NFwiXG4gICAgICB9XG4gICAgfSxcbiAgICB7XG4gICAgICBcInNjb3BlXCI6IFwiaW52YWxpZFwiLFxuICAgICAgXCJzZXR0aW5nc1wiOiB7XG4gICAgICAgIFwiZm9yZWdyb3VuZFwiOiBcIiNmNDU0NTRcIlxuICAgICAgfVxuICAgIH0sXG4gICAge1xuICAgICAgXCJzY29wZVwiOiBcIm1hcmt1cC51bmRlcmxpbmVcIixcbiAgICAgIFwic2V0dGluZ3NcIjoge1xuICAgICAgICBcImZvbnRTdHlsZVwiOiBcInVuZGVybGluZVwiXG4gICAgICB9XG4gICAgfSxcbiAgICB7XG4gICAgICBcInNjb3BlXCI6IFwibWFya3VwLmJvbGRcIixcbiAgICAgIFwic2V0dGluZ3NcIjoge1xuICAgICAgICBcImZvbnRTdHlsZVwiOiBcImJvbGRcIixcbiAgICAgICAgXCJmb3JlZ3JvdW5kXCI6IFwiIzU0NWViNlwiXG4gICAgICB9XG4gICAgfSxcbiAgICB7XG4gICAgICBcInNjb3BlXCI6IFwibWFya3VwLmhlYWRpbmdcIixcbiAgICAgIFwic2V0dGluZ3NcIjoge1xuICAgICAgICBcImZvbnRTdHlsZVwiOiBcImJvbGRcIixcbiAgICAgICAgXCJmb3JlZ3JvdW5kXCI6IFwiIzU0ZGFmNFwiXG4gICAgICB9XG4gICAgfSxcbiAgICB7XG4gICAgICBcInNjb3BlXCI6IFwibWFya3VwLml0YWxpY1wiLFxuICAgICAgXCJzZXR0aW5nc1wiOiB7XG4gICAgICAgIFwiZm9udFN0eWxlXCI6IFwiaXRhbGljXCJcbiAgICAgIH1cbiAgICB9LFxuICAgIHtcbiAgICAgIFwic2NvcGVcIjogXCJtYXJrdXAuc3RyaWtldGhyb3VnaFwiLFxuICAgICAgXCJzZXR0aW5nc1wiOiB7XG4gICAgICAgIFwiZm9udFN0eWxlXCI6IFwic3RyaWtldGhyb3VnaFwiXG4gICAgICB9XG4gICAgfSxcbiAgICB7XG4gICAgICBcInNjb3BlXCI6IFwibWFya3VwLmluc2VydGVkXCIsXG4gICAgICBcInNldHRpbmdzXCI6IHtcbiAgICAgICAgXCJmb3JlZ3JvdW5kXCI6IFwiIzdkZmNiOFwiXG4gICAgICB9XG4gICAgfSxcbiAgICB7XG4gICAgICBcInNjb3BlXCI6IFwibWFya3VwLmRlbGV0ZWRcIixcbiAgICAgIFwic2V0dGluZ3NcIjoge1xuICAgICAgICBcImZvcmVncm91bmRcIjogXCIjZmM5YjdiXCJcbiAgICAgIH1cbiAgICB9LFxuICAgIHtcbiAgICAgIFwic2NvcGVcIjogXCJtYXJrdXAuY2hhbmdlZFwiLFxuICAgICAgXCJzZXR0aW5nc1wiOiB7XG4gICAgICAgIFwiZm9yZWdyb3VuZFwiOiBcIiM1NDVlYjZcIlxuICAgICAgfVxuICAgIH0sXG4gICAge1xuICAgICAgXCJzY29wZVwiOiBcInB1bmN0dWF0aW9uLmRlZmluaXRpb24ucXVvdGUuYmVnaW4ubWFya2Rvd25cIixcbiAgICAgIFwic2V0dGluZ3NcIjoge1xuICAgICAgICBcImZvcmVncm91bmRcIjogXCIjNzg3OGEzXCJcbiAgICAgIH1cbiAgICB9LFxuICAgIHtcbiAgICAgIFwic2NvcGVcIjogXCJwdW5jdHVhdGlvbi5kZWZpbml0aW9uLmxpc3QuYmVnaW4ubWFya2Rvd25cIixcbiAgICAgIFwic2V0dGluZ3NcIjoge1xuICAgICAgICBcImZvcmVncm91bmRcIjogXCIjNTRkYWY0XCJcbiAgICAgIH1cbiAgICB9LFxuICAgIHtcbiAgICAgIFwic2NvcGVcIjogXCJtYXJrdXAuaW5saW5lLnJhd1wiLFxuICAgICAgXCJzZXR0aW5nc1wiOiB7XG4gICAgICAgIFwiZm9yZWdyb3VuZFwiOiBcIiNmYzliN2JcIlxuICAgICAgfVxuICAgIH0sXG4gICAge1xuICAgICAgXCJzY29wZVwiOiBcInB1bmN0dWF0aW9uLmRlZmluaXRpb24udGFnXCIsXG4gICAgICBcInNldHRpbmdzXCI6IHtcbiAgICAgICAgXCJmb3JlZ3JvdW5kXCI6IFwiIzgwODA4MFwiXG4gICAgICB9XG4gICAgfSxcbiAgICB7XG4gICAgICBcInNjb3BlXCI6IFtcbiAgICAgICAgXCJtZXRhLnByZXByb2Nlc3NvclwiLFxuICAgICAgICBcImVudGl0eS5uYW1lLmZ1bmN0aW9uLnByZXByb2Nlc3NvclwiXG4gICAgICBdLFxuICAgICAgXCJzZXR0aW5nc1wiOiB7XG4gICAgICAgIFwiZm9yZWdyb3VuZFwiOiBcIiM1NDVlYjZcIlxuICAgICAgfVxuICAgIH0sXG4gICAge1xuICAgICAgXCJzY29wZVwiOiBcIm1ldGEucHJlcHJvY2Vzc29yLnN0cmluZ1wiLFxuICAgICAgXCJzZXR0aW5nc1wiOiB7XG4gICAgICAgIFwiZm9yZWdyb3VuZFwiOiBcIiNmYzliN2JcIlxuICAgICAgfVxuICAgIH0sXG4gICAge1xuICAgICAgXCJzY29wZVwiOiBcIm1ldGEucHJlcHJvY2Vzc29yLm51bWVyaWNcIixcbiAgICAgIFwic2V0dGluZ3NcIjoge1xuICAgICAgICBcImZvcmVncm91bmRcIjogXCIjN2RmY2I4XCJcbiAgICAgIH1cbiAgICB9LFxuICAgIHtcbiAgICAgIFwic2NvcGVcIjogXCJtZXRhLnN0cnVjdHVyZS5kaWN0aW9uYXJ5LmtleS5weXRob25cIixcbiAgICAgIFwic2V0dGluZ3NcIjoge1xuICAgICAgICBcImZvcmVncm91bmRcIjogXCIjNTRkYWY0XCJcbiAgICAgIH1cbiAgICB9LFxuICAgIHtcbiAgICAgIFwic2NvcGVcIjogXCJtZXRhLmRpZmYuaGVhZGVyXCIsXG4gICAgICBcInNldHRpbmdzXCI6IHtcbiAgICAgICAgXCJmb3JlZ3JvdW5kXCI6IFwiIzU0NWViNlwiXG4gICAgICB9XG4gICAgfSxcbiAgICB7XG4gICAgICBcInNjb3BlXCI6IFwic3RvcmFnZVwiLFxuICAgICAgXCJzZXR0aW5nc1wiOiB7XG4gICAgICAgIFwiZm9yZWdyb3VuZFwiOiBcIiM1NDVlYjZcIlxuICAgICAgfVxuICAgIH0sXG4gICAge1xuICAgICAgXCJzY29wZVwiOiBcInN0b3JhZ2UudHlwZVwiLFxuICAgICAgXCJzZXR0aW5nc1wiOiB7XG4gICAgICAgIFwiZm9yZWdyb3VuZFwiOiBcIiM1NDVlYjZcIlxuICAgICAgfVxuICAgIH0sXG4gICAge1xuICAgICAgXCJzY29wZVwiOiBbXG4gICAgICAgIFwic3RvcmFnZS5tb2RpZmllclwiLFxuICAgICAgICBcImtleXdvcmQub3BlcmF0b3Iubm9leGNlcHRcIlxuICAgICAgXSxcbiAgICAgIFwic2V0dGluZ3NcIjoge1xuICAgICAgICBcImZvcmVncm91bmRcIjogXCIjNTQ1ZWI2XCJcbiAgICAgIH1cbiAgICB9LFxuICAgIHtcbiAgICAgIFwic2NvcGVcIjogW1xuICAgICAgICBcInN0cmluZ1wiLFxuICAgICAgICBcIm1ldGEuZW1iZWRkZWQuYXNzZW1ibHlcIlxuICAgICAgXSxcbiAgICAgIFwic2V0dGluZ3NcIjoge1xuICAgICAgICBcImZvcmVncm91bmRcIjogXCIjZmM5YjdiXCJcbiAgICAgIH1cbiAgICB9LFxuICAgIHtcbiAgICAgIFwic2NvcGVcIjogXCJzdHJpbmcudGFnXCIsXG4gICAgICBcInNldHRpbmdzXCI6IHtcbiAgICAgICAgXCJmb3JlZ3JvdW5kXCI6IFwiI2ZjOWI3YlwiXG4gICAgICB9XG4gICAgfSxcbiAgICB7XG4gICAgICBcInNjb3BlXCI6IFwic3RyaW5nLnZhbHVlXCIsXG4gICAgICBcInNldHRpbmdzXCI6IHtcbiAgICAgICAgXCJmb3JlZ3JvdW5kXCI6IFwiI2ZjOWI3YlwiXG4gICAgICB9XG4gICAgfSxcbiAgICB7XG4gICAgICBcInNjb3BlXCI6IFwic3RyaW5nLnJlZ2V4cFwiLFxuICAgICAgXCJzZXR0aW5nc1wiOiB7XG4gICAgICAgIFwiZm9yZWdyb3VuZFwiOiBcIiNmNDU0NTRcIlxuICAgICAgfVxuICAgIH0sXG4gICAge1xuICAgICAgXCJzY29wZVwiOiBbXG4gICAgICAgIFwicHVuY3R1YXRpb24uZGVmaW5pdGlvbi50ZW1wbGF0ZS1leHByZXNzaW9uLmJlZ2luXCIsXG4gICAgICAgIFwicHVuY3R1YXRpb24uZGVmaW5pdGlvbi50ZW1wbGF0ZS1leHByZXNzaW9uLmVuZFwiLFxuICAgICAgICBcInB1bmN0dWF0aW9uLnNlY3Rpb24uZW1iZWRkZWRcIlxuICAgICAgXSxcbiAgICAgIFwic2V0dGluZ3NcIjoge1xuICAgICAgICBcImZvcmVncm91bmRcIjogXCIjNTQ1ZWI2XCJcbiAgICAgIH1cbiAgICB9LFxuICAgIHtcbiAgICAgIFwic2NvcGVcIjogW1xuICAgICAgICBcIm1ldGEudGVtcGxhdGUuZXhwcmVzc2lvblwiXG4gICAgICBdLFxuICAgICAgXCJzZXR0aW5nc1wiOiB7XG4gICAgICAgIFwiZm9yZWdyb3VuZFwiOiBcIiNlMGUwZTBcIlxuICAgICAgfVxuICAgIH0sXG4gICAge1xuICAgICAgXCJzY29wZVwiOiBbXG4gICAgICAgIFwic3VwcG9ydC50eXBlLnZlbmRvcmVkLnByb3BlcnR5LW5hbWVcIixcbiAgICAgICAgXCJzdXBwb3J0LnR5cGUucHJvcGVydHktbmFtZVwiLFxuICAgICAgICBcInNvdXJjZS5jc3MgdmFyaWFibGVcIixcbiAgICAgICAgXCJzb3VyY2UuY29mZmVlLmVtYmVkZGVkXCJcbiAgICAgIF0sXG4gICAgICBcInNldHRpbmdzXCI6IHtcbiAgICAgICAgXCJmb3JlZ3JvdW5kXCI6IFwiIzU0ZGFmNFwiXG4gICAgICB9XG4gICAgfSxcbiAgICB7XG4gICAgICBcInNjb3BlXCI6IFwia2V5d29yZFwiLFxuICAgICAgXCJzZXR0aW5nc1wiOiB7XG4gICAgICAgIFwiZm9yZWdyb3VuZFwiOiBcIiM1NDVlYjZcIlxuICAgICAgfVxuICAgIH0sXG4gICAge1xuICAgICAgXCJzY29wZVwiOiBcImtleXdvcmQuY29udHJvbFwiLFxuICAgICAgXCJzZXR0aW5nc1wiOiB7XG4gICAgICAgIFwiZm9yZWdyb3VuZFwiOiBcIiM1NDVlYjZcIlxuICAgICAgfVxuICAgIH0sXG4gICAge1xuICAgICAgXCJzY29wZVwiOiBcImtleXdvcmQub3BlcmF0b3JcIixcbiAgICAgIFwic2V0dGluZ3NcIjoge1xuICAgICAgICBcImZvcmVncm91bmRcIjogXCIjZTBlMGUwXCJcbiAgICAgIH1cbiAgICB9LFxuICAgIHtcbiAgICAgIFwic2NvcGVcIjogW1xuICAgICAgICBcImtleXdvcmQub3BlcmF0b3IubmV3XCIsXG4gICAgICAgIFwia2V5d29yZC5vcGVyYXRvci5leHByZXNzaW9uXCIsXG4gICAgICAgIFwia2V5d29yZC5vcGVyYXRvci5jYXN0XCIsXG4gICAgICAgIFwia2V5d29yZC5vcGVyYXRvci5zaXplb2ZcIixcbiAgICAgICAgXCJrZXl3b3JkLm9wZXJhdG9yLmFsaWdub2ZcIixcbiAgICAgICAgXCJrZXl3b3JkLm9wZXJhdG9yLnR5cGVpZFwiLFxuICAgICAgICBcImtleXdvcmQub3BlcmF0b3IuYWxpZ25hc1wiLFxuICAgICAgICBcImtleXdvcmQub3BlcmF0b3IuaW5zdGFuY2VvZlwiLFxuICAgICAgICBcImtleXdvcmQub3BlcmF0b3IubG9naWNhbC5weXRob25cIixcbiAgICAgICAgXCJrZXl3b3JkLm9wZXJhdG9yLndvcmRsaWtlXCJcbiAgICAgIF0sXG4gICAgICBcInNldHRpbmdzXCI6IHtcbiAgICAgICAgXCJmb3JlZ3JvdW5kXCI6IFwiIzU0NWViNlwiXG4gICAgICB9XG4gICAgfSxcbiAgICB7XG4gICAgICBcInNjb3BlXCI6IFwia2V5d29yZC5vdGhlci51bml0XCIsXG4gICAgICBcInNldHRpbmdzXCI6IHtcbiAgICAgICAgXCJmb3JlZ3JvdW5kXCI6IFwiIzdkZmNiOFwiXG4gICAgICB9XG4gICAgfSxcbiAgICB7XG4gICAgICBcInNjb3BlXCI6IFtcbiAgICAgICAgXCJwdW5jdHVhdGlvbi5zZWN0aW9uLmVtYmVkZGVkLmJlZ2luLnBocFwiLFxuICAgICAgICBcInB1bmN0dWF0aW9uLnNlY3Rpb24uZW1iZWRkZWQuZW5kLnBocFwiXG4gICAgICBdLFxuICAgICAgXCJzZXR0aW5nc1wiOiB7XG4gICAgICAgIFwiZm9yZWdyb3VuZFwiOiBcIiM1NDVlYjZcIlxuICAgICAgfVxuICAgIH0sXG4gICAge1xuICAgICAgXCJzY29wZVwiOiBcInN1cHBvcnQuZnVuY3Rpb24uZ2l0LXJlYmFzZVwiLFxuICAgICAgXCJzZXR0aW5nc1wiOiB7XG4gICAgICAgIFwiZm9yZWdyb3VuZFwiOiBcIiM1NGRhZjRcIlxuICAgICAgfVxuICAgIH0sXG4gICAge1xuICAgICAgXCJzY29wZVwiOiBcImNvbnN0YW50LnNoYS5naXQtcmViYXNlXCIsXG4gICAgICBcInNldHRpbmdzXCI6IHtcbiAgICAgICAgXCJmb3JlZ3JvdW5kXCI6IFwiIzdkZmNiOFwiXG4gICAgICB9XG4gICAgfSxcbiAgICB7XG4gICAgICBcInNjb3BlXCI6IFtcbiAgICAgICAgXCJzdG9yYWdlLm1vZGlmaWVyLmltcG9ydC5qYXZhXCIsXG4gICAgICAgIFwidmFyaWFibGUubGFuZ3VhZ2Uud2lsZGNhcmQuamF2YVwiLFxuICAgICAgICBcInN0b3JhZ2UubW9kaWZpZXIucGFja2FnZS5qYXZhXCJcbiAgICAgIF0sXG4gICAgICBcInNldHRpbmdzXCI6IHtcbiAgICAgICAgXCJmb3JlZ3JvdW5kXCI6IFwiI2UwZTBlMFwiXG4gICAgICB9XG4gICAgfSxcbiAgICB7XG4gICAgICBcInNjb3BlXCI6IFwidmFyaWFibGUubGFuZ3VhZ2VcIixcbiAgICAgIFwic2V0dGluZ3NcIjoge1xuICAgICAgICBcImZvcmVncm91bmRcIjogXCIjNTQ1ZWI2XCJcbiAgICAgIH1cbiAgICB9LFxuICAgIHtcbiAgICAgIFwic2NvcGVcIjogW1xuICAgICAgICBcImVudGl0eS5uYW1lLmZ1bmN0aW9uXCIsXG4gICAgICAgIFwic3VwcG9ydC5mdW5jdGlvblwiLFxuICAgICAgICBcInN1cHBvcnQuY29uc3RhbnQuaGFuZGxlYmFyc1wiLFxuICAgICAgICBcInNvdXJjZS5wb3dlcnNoZWxsIHZhcmlhYmxlLm90aGVyLm1lbWJlclwiLFxuICAgICAgICBcImVudGl0eS5uYW1lLm9wZXJhdG9yLmN1c3RvbS1saXRlcmFsXCJcbiAgICAgIF0sXG4gICAgICBcInNldHRpbmdzXCI6IHtcbiAgICAgICAgXCJmb3JlZ3JvdW5kXCI6IFwiI2Y0ZGE1NFwiXG4gICAgICB9XG4gICAgfSxcbiAgICB7XG4gICAgICBcInNjb3BlXCI6IFtcbiAgICAgICAgXCJzdXBwb3J0LmNsYXNzXCIsXG4gICAgICAgIFwic3VwcG9ydC50eXBlXCIsXG4gICAgICAgIFwiZW50aXR5Lm5hbWUudHlwZVwiLFxuICAgICAgICBcImVudGl0eS5uYW1lLm5hbWVzcGFjZVwiLFxuICAgICAgICBcImVudGl0eS5vdGhlci5hdHRyaWJ1dGVcIixcbiAgICAgICAgXCJlbnRpdHkubmFtZS5zY29wZS1yZXNvbHV0aW9uXCIsXG4gICAgICAgIFwiZW50aXR5Lm5hbWUuY2xhc3NcIixcbiAgICAgICAgXCJzdG9yYWdlLnR5cGUubnVtZXJpYy5nb1wiLFxuICAgICAgICBcInN0b3JhZ2UudHlwZS5ieXRlLmdvXCIsXG4gICAgICAgIFwic3RvcmFnZS50eXBlLmJvb2xlYW4uZ29cIixcbiAgICAgICAgXCJzdG9yYWdlLnR5cGUuc3RyaW5nLmdvXCIsXG4gICAgICAgIFwic3RvcmFnZS50eXBlLnVpbnRwdHIuZ29cIixcbiAgICAgICAgXCJzdG9yYWdlLnR5cGUuZXJyb3IuZ29cIixcbiAgICAgICAgXCJzdG9yYWdlLnR5cGUucnVuZS5nb1wiLFxuICAgICAgICBcInN0b3JhZ2UudHlwZS5jc1wiLFxuICAgICAgICBcInN0b3JhZ2UudHlwZS5nZW5lcmljLmNzXCIsXG4gICAgICAgIFwic3RvcmFnZS50eXBlLm1vZGlmaWVyLmNzXCIsXG4gICAgICAgIFwic3RvcmFnZS50eXBlLnZhcmlhYmxlLmNzXCIsXG4gICAgICAgIFwic3RvcmFnZS50eXBlLmFubm90YXRpb24uamF2YVwiLFxuICAgICAgICBcInN0b3JhZ2UudHlwZS5nZW5lcmljLmphdmFcIixcbiAgICAgICAgXCJzdG9yYWdlLnR5cGUuamF2YVwiLFxuICAgICAgICBcInN0b3JhZ2UudHlwZS5vYmplY3QuYXJyYXkuamF2YVwiLFxuICAgICAgICBcInN0b3JhZ2UudHlwZS5wcmltaXRpdmUuYXJyYXkuamF2YVwiLFxuICAgICAgICBcInN0b3JhZ2UudHlwZS5wcmltaXRpdmUuamF2YVwiLFxuICAgICAgICBcInN0b3JhZ2UudHlwZS50b2tlbi5qYXZhXCIsXG4gICAgICAgIFwic3RvcmFnZS50eXBlLmdyb292eVwiLFxuICAgICAgICBcInN0b3JhZ2UudHlwZS5hbm5vdGF0aW9uLmdyb292eVwiLFxuICAgICAgICBcInN0b3JhZ2UudHlwZS5wYXJhbWV0ZXJzLmdyb292eVwiLFxuICAgICAgICBcInN0b3JhZ2UudHlwZS5nZW5lcmljLmdyb292eVwiLFxuICAgICAgICBcInN0b3JhZ2UudHlwZS5vYmplY3QuYXJyYXkuZ3Jvb3Z5XCIsXG4gICAgICAgIFwic3RvcmFnZS50eXBlLnByaW1pdGl2ZS5hcnJheS5ncm9vdnlcIixcbiAgICAgICAgXCJzdG9yYWdlLnR5cGUucHJpbWl0aXZlLmdyb292eVwiXG4gICAgICBdLFxuICAgICAgXCJzZXR0aW5nc1wiOiB7XG4gICAgICAgIFwiZm9yZWdyb3VuZFwiOiBcIiM1NGRhZjRcIlxuICAgICAgfVxuICAgIH0sXG4gICAge1xuICAgICAgXCJzY29wZVwiOiBbXG4gICAgICAgIFwibWV0YS50eXBlLmNhc3QuZXhwclwiLFxuICAgICAgICBcIm1ldGEudHlwZS5uZXcuZXhwclwiLFxuICAgICAgICBcInN1cHBvcnQuY29uc3RhbnQubWF0aFwiLFxuICAgICAgICBcInN1cHBvcnQuY29uc3RhbnQuZG9tXCIsXG4gICAgICAgIFwic3VwcG9ydC5jb25zdGFudC5qc29uXCIsXG4gICAgICAgIFwiZW50aXR5Lm90aGVyLmluaGVyaXRlZC1jbGFzc1wiLFxuICAgICAgICBcInB1bmN0dWF0aW9uLnNlcGFyYXRvci5uYW1lc3BhY2UucnVieVwiXG4gICAgICBdLFxuICAgICAgXCJzZXR0aW5nc1wiOiB7XG4gICAgICAgIFwiZm9yZWdyb3VuZFwiOiBcIiM1NGRhZjRcIlxuICAgICAgfVxuICAgIH0sXG4gICAge1xuICAgICAgXCJzY29wZVwiOiBbXG4gICAgICAgIFwia2V5d29yZC5jb250cm9sXCIsXG4gICAgICAgIFwic291cmNlLmNwcCBrZXl3b3JkLm9wZXJhdG9yLm5ld1wiLFxuICAgICAgICBcImtleXdvcmQub3BlcmF0b3IuZGVsZXRlXCIsXG4gICAgICAgIFwia2V5d29yZC5vdGhlci51c2luZ1wiLFxuICAgICAgICBcImtleXdvcmQub3RoZXIuZGlyZWN0aXZlLnVzaW5nXCIsXG4gICAgICAgIFwia2V5d29yZC5vdGhlci5vcGVyYXRvclwiLFxuICAgICAgICBcImVudGl0eS5uYW1lLm9wZXJhdG9yXCJcbiAgICAgIF0sXG4gICAgICBcInNldHRpbmdzXCI6IHtcbiAgICAgICAgXCJmb3JlZ3JvdW5kXCI6IFwiI2Q4N2JmY1wiXG4gICAgICB9XG4gICAgfSxcbiAgICB7XG4gICAgICBcInNjb3BlXCI6IFtcbiAgICAgICAgXCJ2YXJpYWJsZVwiLFxuICAgICAgICBcIm1ldGEuZGVmaW5pdGlvbi52YXJpYWJsZS5uYW1lXCIsXG4gICAgICAgIFwic3VwcG9ydC52YXJpYWJsZVwiLFxuICAgICAgICBcImVudGl0eS5uYW1lLnZhcmlhYmxlXCIsXG4gICAgICAgIFwiY29uc3RhbnQub3RoZXIucGxhY2Vob2xkZXJcIlxuICAgICAgXSxcbiAgICAgIFwic2V0dGluZ3NcIjoge1xuICAgICAgICBcImZvcmVncm91bmRcIjogXCIjN2RlNmZjXCJcbiAgICAgIH1cbiAgICB9LFxuICAgIHtcbiAgICAgIFwic2NvcGVcIjogW1xuICAgICAgICBcInZhcmlhYmxlLm90aGVyLmNvbnN0YW50XCIsXG4gICAgICAgIFwidmFyaWFibGUub3RoZXIuZW51bW1lbWJlclwiXG4gICAgICBdLFxuICAgICAgXCJzZXR0aW5nc1wiOiB7XG4gICAgICAgIFwiZm9yZWdyb3VuZFwiOiBcIiM1NGRhZjRcIlxuICAgICAgfVxuICAgIH0sXG4gICAge1xuICAgICAgXCJzY29wZVwiOiBbXG4gICAgICAgIFwibWV0YS5vYmplY3QtbGl0ZXJhbC5rZXlcIlxuICAgICAgXSxcbiAgICAgIFwic2V0dGluZ3NcIjoge1xuICAgICAgICBcImZvcmVncm91bmRcIjogXCIjN2RlNmZjXCJcbiAgICAgIH1cbiAgICB9LFxuICAgIHtcbiAgICAgIFwic2NvcGVcIjogW1xuICAgICAgICBcInN1cHBvcnQuY29uc3RhbnQucHJvcGVydHktdmFsdWVcIixcbiAgICAgICAgXCJzdXBwb3J0LmNvbnN0YW50LmZvbnQtbmFtZVwiLFxuICAgICAgICBcInN1cHBvcnQuY29uc3RhbnQubWVkaWEtdHlwZVwiLFxuICAgICAgICBcInN1cHBvcnQuY29uc3RhbnQubWVkaWFcIixcbiAgICAgICAgXCJjb25zdGFudC5vdGhlci5jb2xvci5yZ2ItdmFsdWVcIixcbiAgICAgICAgXCJjb25zdGFudC5vdGhlci5yZ2ItdmFsdWVcIixcbiAgICAgICAgXCJzdXBwb3J0LmNvbnN0YW50LmNvbG9yXCJcbiAgICAgIF0sXG4gICAgICBcInNldHRpbmdzXCI6IHtcbiAgICAgICAgXCJmb3JlZ3JvdW5kXCI6IFwiI2ZjOWI3YlwiXG4gICAgICB9XG4gICAgfSxcbiAgICB7XG4gICAgICBcInNjb3BlXCI6IFtcbiAgICAgICAgXCJwdW5jdHVhdGlvbi5kZWZpbml0aW9uLmdyb3VwLnJlZ2V4cFwiLFxuICAgICAgICBcInB1bmN0dWF0aW9uLmRlZmluaXRpb24uZ3JvdXAuYXNzZXJ0aW9uLnJlZ2V4cFwiLFxuICAgICAgICBcInB1bmN0dWF0aW9uLmRlZmluaXRpb24uY2hhcmFjdGVyLWNsYXNzLnJlZ2V4cFwiLFxuICAgICAgICBcInB1bmN0dWF0aW9uLmNoYXJhY3Rlci5zZXQuYmVnaW4ucmVnZXhwXCIsXG4gICAgICAgIFwicHVuY3R1YXRpb24uY2hhcmFjdGVyLnNldC5lbmQucmVnZXhwXCIsXG4gICAgICAgIFwia2V5d29yZC5vcGVyYXRvci5uZWdhdGlvbi5yZWdleHBcIixcbiAgICAgICAgXCJzdXBwb3J0Lm90aGVyLnBhcmVudGhlc2lzLnJlZ2V4cFwiXG4gICAgICBdLFxuICAgICAgXCJzZXR0aW5nc1wiOiB7XG4gICAgICAgIFwiZm9yZWdyb3VuZFwiOiBcIiNmYzliN2JcIlxuICAgICAgfVxuICAgIH0sXG4gICAge1xuICAgICAgXCJzY29wZVwiOiBbXG4gICAgICAgIFwiY29uc3RhbnQuY2hhcmFjdGVyLmNoYXJhY3Rlci1jbGFzcy5yZWdleHBcIixcbiAgICAgICAgXCJjb25zdGFudC5vdGhlci5jaGFyYWN0ZXItY2xhc3Muc2V0LnJlZ2V4cFwiLFxuICAgICAgICBcImNvbnN0YW50Lm90aGVyLmNoYXJhY3Rlci1jbGFzcy5yZWdleHBcIixcbiAgICAgICAgXCJjb25zdGFudC5jaGFyYWN0ZXIuc2V0LnJlZ2V4cFwiXG4gICAgICBdLFxuICAgICAgXCJzZXR0aW5nc1wiOiB7XG4gICAgICAgIFwiZm9yZWdyb3VuZFwiOiBcIiNmNDU0NTRcIlxuICAgICAgfVxuICAgIH0sXG4gICAge1xuICAgICAgXCJzY29wZVwiOiBbXG4gICAgICAgIFwia2V5d29yZC5vcGVyYXRvci5vci5yZWdleHBcIixcbiAgICAgICAgXCJrZXl3b3JkLmNvbnRyb2wuYW5jaG9yLnJlZ2V4cFwiXG4gICAgICBdLFxuICAgICAgXCJzZXR0aW5nc1wiOiB7XG4gICAgICAgIFwiZm9yZWdyb3VuZFwiOiBcIiNmNGRhNTRcIlxuICAgICAgfVxuICAgIH0sXG4gICAge1xuICAgICAgXCJzY29wZVwiOiBcImtleXdvcmQub3BlcmF0b3IucXVhbnRpZmllci5yZWdleHBcIixcbiAgICAgIFwic2V0dGluZ3NcIjoge1xuICAgICAgICBcImZvcmVncm91bmRcIjogXCIjZjRkYTU0XCJcbiAgICAgIH1cbiAgICB9LFxuICAgIHtcbiAgICAgIFwic2NvcGVcIjogW1xuICAgICAgICBcImNvbnN0YW50LmNoYXJhY3RlclwiLFxuICAgICAgICBcImNvbnN0YW50Lm90aGVyLm9wdGlvblwiXG4gICAgICBdLFxuICAgICAgXCJzZXR0aW5nc1wiOiB7XG4gICAgICAgIFwiZm9yZWdyb3VuZFwiOiBcIiM1NDVlYjZcIlxuICAgICAgfVxuICAgIH0sXG4gICAge1xuICAgICAgXCJzY29wZVwiOiBcImNvbnN0YW50LmNoYXJhY3Rlci5lc2NhcGVcIixcbiAgICAgIFwic2V0dGluZ3NcIjoge1xuICAgICAgICBcImZvcmVncm91bmRcIjogXCIjZjRkYTU0XCJcbiAgICAgIH1cbiAgICB9LFxuICAgIHtcbiAgICAgIFwic2NvcGVcIjogXCJlbnRpdHkubmFtZS5sYWJlbFwiLFxuICAgICAgXCJzZXR0aW5nc1wiOiB7XG4gICAgICAgIFwiZm9yZWdyb3VuZFwiOiBcIiNjOGM4YzhcIlxuICAgICAgfVxuICAgIH1cbiAgXSxcbiAgXCJ0eXBlXCI6IFwiZGFya1wiXG59Il0sCiAgIm1hcHBpbmdzIjogIjtBQUE2UixTQUFTLG9CQUFvQjtBQUMxVCxTQUFTLGdCQUFnQjtBQUN6QixTQUFTLGdCQUFnQjtBQUN6QixTQUFTLHVCQUF1QjtBQUNoQyxPQUFPLG1CQUFtQjs7O0FDSG5CLElBQU0sWUFBWTtBQUFBLEVBQ3ZCLFNBQVM7QUFBQSxFQUNULFNBQVM7QUFBQSxFQUNULFNBQVM7QUFBQSxFQUNULFNBQVM7QUFBQSxFQUNULFNBQVM7QUFBQSxFQUNULFNBQVM7QUFBQSxFQUNULFNBQVM7QUFBQSxFQUNULFNBQVM7QUFDWDtBQUVPLElBQU0sU0FBc0I7QUFBQSxFQUNqQyxlQUFlLEVBQUUsTUFBTSxRQUFRO0FBQUEsRUFDL0Isa0JBQWtCLE9BQU8sS0FBSyxTQUFTLEVBQUUsSUFBSSxDQUFDLFVBQVUsRUFBRSxLQUFLLEVBQUU7QUFBQSxFQUNqRSxRQUFRO0FBQUEsSUFDTjtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxFQUNGO0FBQ0Y7OztBRGhCQSxTQUFTLHFCQUFxQjtBQUM5QixTQUFTLFlBQVk7QUFDckIsT0FBTyxpQkFBaUI7QUFDeEIsT0FBTyxpQkFBaUI7QUFDeEIsU0FBUywwQkFBMEIsb0NBQW9DO0FBQ3ZFLFNBQVMsb0NBQW9DOzs7QUVYN0M7QUFBQSxFQUNFLFFBQVU7QUFBQSxJQUNSLCtCQUErQjtBQUFBLElBQy9CLDBCQUEwQjtBQUFBLElBQzFCLDBCQUEwQjtBQUFBLElBQzFCLGtDQUFrQztBQUFBLElBQ2xDLCtCQUErQjtBQUFBLElBQy9CLCtCQUErQjtBQUFBLElBQy9CLG9CQUFvQjtBQUFBLElBQ3BCLG9CQUFvQjtBQUFBLElBQ3BCLHFCQUFxQjtBQUFBLElBQ3JCLHFCQUFxQjtBQUFBLElBQ3JCLDBCQUEwQjtBQUFBLElBQzFCLG1CQUFtQjtBQUFBLElBQ25CLHVCQUF1QjtBQUFBLElBQ3ZCLG1CQUFtQjtBQUFBLElBQ25CLHFCQUFxQjtBQUFBLElBQ3JCLHFCQUFxQjtBQUFBLElBQ3JCLHNDQUFzQztBQUFBLElBQ3RDLGtDQUFrQztBQUFBLElBQ2xDLDhCQUE4QjtBQUFBLElBQzlCLHVDQUF1QztBQUFBLElBQ3ZDLDJCQUEyQjtBQUFBLElBQzNCLHVDQUF1QztBQUFBLElBQ3ZDLGlDQUFpQztBQUFBLElBQ2pDLHFDQUFxQztBQUFBLElBQ3JDLCtCQUErQjtBQUFBLElBQy9CLDJCQUEyQjtBQUFBLElBQzNCLHVCQUF1QjtBQUFBLElBQ3ZCLGFBQWU7QUFBQSxJQUNmLG9CQUFvQjtBQUFBLElBQ3BCLGdCQUFnQjtBQUFBLElBQ2hCLG9CQUFvQjtBQUFBLElBQ3BCLCtCQUErQjtBQUFBLElBQy9CLGtDQUFrQztBQUFBLElBQ2xDLGtDQUFrQztBQUFBLElBQ2xDLHNDQUFzQztBQUFBLElBQ3RDLHVCQUF1QjtBQUFBLElBQ3ZCLHdCQUF3QjtBQUFBLElBQ3hCLDRCQUE0QjtBQUFBLElBQzVCLHdCQUF3QjtBQUFBLElBQ3hCLG9DQUFvQztBQUFBLElBQ3BDLG1CQUFtQjtBQUFBLElBQ25CLGVBQWU7QUFBQSxJQUNmLG1CQUFtQjtBQUFBLElBQ25CLDRCQUE0QjtBQUFBLElBQzVCLDRCQUE0QjtBQUFBLElBQzVCLDRCQUE0QjtBQUFBLElBQzVCLDhCQUE4QjtBQUFBLElBQzlCLG9CQUFvQjtBQUFBLElBQ3BCLGdCQUFnQjtBQUFBLElBQ2hCLDJCQUEyQjtBQUFBLElBQzNCLCtCQUErQjtBQUFBLElBQy9CLGlDQUFpQztBQUFBLElBQ2pDLG1CQUFtQjtBQUFBLElBQ25CLDZCQUE2QjtBQUFBLElBQzdCLDJDQUEyQztBQUFBLElBQzNDLDZCQUE2QjtBQUFBLElBQzdCLDJDQUEyQztBQUFBLElBQzNDLDRCQUE0QjtBQUFBLElBQzVCLHNCQUFzQjtBQUFBLElBQ3RCLDBCQUEwQjtBQUFBLElBQzFCLHNDQUFzQztBQUFBLElBQ3RDLDBCQUEwQjtBQUFBLElBQzFCLG9CQUFvQjtBQUFBLElBQ3BCLG9DQUFvQztBQUFBLElBQ3BDLDhCQUE4QjtBQUFBLElBQzlCLG1DQUFtQztBQUFBLElBQ25DLHdCQUF3QjtBQUFBLElBQ3hCLDZCQUE2QjtBQUFBLElBQzdCLGtDQUFrQztBQUFBLElBQ2xDLHNCQUFzQjtBQUFBLElBQ3RCLGtCQUFrQjtBQUFBLElBQ2xCLHNCQUFzQjtBQUFBLElBQ3RCLG1DQUFtQztBQUFBLElBQ25DLCtCQUErQjtBQUFBLElBQy9CLG1DQUFtQztBQUFBLElBQ25DLDJCQUEyQjtBQUFBLElBQzNCLHdCQUF3QjtBQUFBLElBQ3hCLHdCQUF3QjtBQUFBLElBQ3hCLGdDQUFnQztB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LFlBQWM7QUFBQSxNQUNoQjtBQUFBLElBQ0Y7QUFBQSxJQUNBO0FBQUEsTUFDRSxPQUFTO0FBQUEsTUFDVCxVQUFZO0FBQUEsUUFDVixZQUFjO0FBQUEsTUFDaEI7QUFBQSxJQUNGO0FBQUEsSUFDQTtBQUFBLE1BQ0UsT0FBUztBQUFBLE1BQ1QsVUFBWTtBQUFBLFFBQ1YsWUFBYztBQUFBLE1BQ2hCO0FBQUEsSUFDRjtBQUFBLElBQ0E7QUFBQSxNQUNFLE9BQVM7QUFBQSxNQUNULFVBQVk7QUFBQSxRQUNWLFlBQWM7QUFBQSxNQUNoQjtBQUFBLElBQ0Y7QUFBQSxJQUNBO0FBQUEsTUFDRSxPQUFTO0FBQUEsTUFDVCxVQUFZO0FBQUEsUUFDVixZQUFjO0FBQUEsTUFDaEI7QUFBQSxJQUNGO0FBQUEsSUFDQTtBQUFBLE1BQ0UsT0FBUztBQUFBLE1BQ1QsVUFBWTtBQUFBLFFBQ1YsWUFBYztBQUFBLE1BQ2hCO0FBQUEsSUFDRjtBQUFBLElBQ0E7QUFBQSxNQUNFLE9BQVM7QUFBQSxRQUNQO0FBQUEsUUFDQTtBQUFBLE1BQ0Y7QUFBQSxNQUNBLFVBQVk7QUFBQSxRQUNWLFlBQWM7QUFBQSxNQUNoQjtBQUFBLElBQ0Y7QUFBQSxJQUNBO0FBQUEsTUFDRSxPQUFTO0FBQUEsTUFDVCxVQUFZO0FBQUEsUUFDVixZQUFjO0FBQUEsTUFDaEI7QUFBQSxJQUNGO0FBQUEsSUFDQTtBQUFBLE1BQ0UsT0FBUztBQUFBLE1BQ1QsVUFBWTtBQUFBLFFBQ1YsWUFBYztBQUFBLE1BQ2hCO0FBQUEsSUFDRjtBQUFBLElBQ0E7QUFBQSxNQUNFLE9BQVM7QUFBQSxNQUNULFVBQVk7QUFBQSxRQUNWLFlBQWM7QUFBQSxNQUNoQjtBQUFBLElBQ0Y7QUFBQSxJQUNBO0FBQUEsTUFDRSxPQUFTO0FBQUEsTUFDVCxVQUFZO0FBQUEsUUFDVixZQUFjO0FBQUEsTUFDaEI7QUFBQSxJQUNGO0FBQUEsSUFDQTtBQUFBLE1BQ0UsT0FBUztBQUFBLE1BQ1QsVUFBWTtBQUFBLFFBQ1YsWUFBYztBQUFBLE1BQ2hCO0FBQUEsSUFDRjtBQUFBLElBQ0E7QUFBQSxNQUNFLE9BQVM7QUFBQSxNQUNULFVBQVk7QUFBQSxRQUNWLFlBQWM7QUFBQSxNQUNoQjtBQUFBLElBQ0Y7QUFBQSxJQUNBO0FBQUEsTUFDRSxPQUFTO0FBQUEsUUFDUDtBQUFBLFFBQ0E7QUFBQSxNQUNGO0FBQUEsTUFDQSxVQUFZO0FBQUEsUUFDVixZQUFjO0FBQUEsTUFDaEI7QUFBQSxJQUNGO0FBQUEsSUFDQTtBQUFBLE1BQ0UsT0FBUztBQUFBLFFBQ1A7QUFBQSxRQUNBO0FBQUEsTUFDRjtBQUFBLE1BQ0EsVUFBWTtBQUFBLFFBQ1YsWUFBYztBQUFBLE1BQ2hCO0FBQUEsSUFDRjtBQUFBLElBQ0E7QUFBQSxNQUNFLE9BQVM7QUFBQSxNQUNULFVBQVk7QUFBQSxRQUNWLFlBQWM7QUFBQSxNQUNoQjtBQUFBLElBQ0Y7QUFBQSxJQUNBO0FBQUEsTUFDRSxPQUFTO0FBQUEsTUFDVCxVQUFZO0FBQUEsUUFDVixZQUFjO0FBQUEsTUFDaEI7QUFBQSxJQUNGO0FBQUEsSUFDQTtBQUFBLE1BQ0UsT0FBUztBQUFBLE1BQ1QsVUFBWTtBQUFBLFFBQ1YsWUFBYztBQUFBLE1BQ2hCO0FBQUEsSUFDRjtBQUFBLElBQ0E7QUFBQSxNQUNFLE9BQVM7QUFBQSxRQUNQO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxNQUNGO0FBQUEsTUFDQSxVQUFZO0FBQUEsUUFDVixZQUFjO0FBQUEsTUFDaEI7QUFBQSxJQUNGO0FBQUEsSUFDQTtBQUFBLE1BQ0UsT0FBUztBQUFBLFFBQ1A7QUFBQSxNQUNGO0FBQUEsTUFDQSxVQUFZO0FBQUEsUUFDVixZQUFjO0FBQUEsTUFDaEI7QUFBQSxJQUNGO0FBQUEsSUFDQTtBQUFBLE1BQ0UsT0FBUztBQUFBLFFBQ1A7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxNQUNGO0FBQUEsTUFDQSxVQUFZO0FBQUEsUUFDVixZQUFjO0FBQUEsTUFDaEI7QUFBQSxJQUNGO0FBQUEsSUFDQTtBQUFBLE1BQ0UsT0FBUztBQUFBLE1BQ1QsVUFBWTtBQUFBLFFBQ1YsWUFBYztBQUFBLE1BQ2hCO0FBQUEsSUFDRjtBQUFBLElBQ0E7QUFBQSxNQUNFLE9BQVM7QUFBQSxNQUNULFVBQVk7QUFBQSxRQUNWLFlBQWM7QUFBQSxNQUNoQjtBQUFBLElBQ0Y7QUFBQSxJQUNBO0FBQUEsTUFDRSxPQUFTO0FBQUEsTUFDVCxVQUFZO0FBQUEsUUFDVixZQUFjO0FBQUEsTUFDaEI7QUFBQSxJQUNGO0FBQUEsSUFDQTtBQUFBLE1BQ0UsT0FBUztBQUFBLFFBQ1A7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxNQUNGO0FBQUEsTUFDQSxVQUFZO0FBQUEsUUFDVixZQUFjO0FBQUEsTUFDaEI7QUFBQSxJQUNGO0FBQUEsSUFDQTtBQUFBLE1BQ0UsT0FBUztBQUFBLE1BQ1QsVUFBWTtBQUFBLFFBQ1YsWUFBYztBQUFBLE1BQ2hCO0FBQUEsSUFDRjtBQUFBLElBQ0E7QUFBQSxNQUNFLE9BQVM7QUFBQSxRQUNQO0FBQUEsUUFDQTtBQUFBLE1BQ0Y7QUFBQSxNQUNBLFVBQVk7QUFBQSxRQUNWLFlBQWM7QUFBQSxNQUNoQjtBQUFBLElBQ0Y7QUFBQSxJQUNBO0FBQUEsTUFDRSxPQUFTO0FBQUEsTUFDVCxVQUFZO0FBQUEsUUFDVixZQUFjO0FBQUEsTUFDaEI7QUFBQSxJQUNGO0FBQUEsSUFDQTtBQUFBLE1BQ0UsT0FBUztBQUFBLE1BQ1QsVUFBWTtBQUFBLFFBQ1YsWUFBYztBQUFBLE1BQ2hCO0FBQUEsSUFDRjtBQUFBLElBQ0E7QUFBQSxNQUNFLE9BQVM7QUFBQSxRQUNQO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxNQUNGO0FBQUEsTUFDQSxVQUFZO0FBQUEsUUFDVixZQUFjO0FBQUEsTUFDaEI7QUFBQSxJQUNGO0FBQUEsSUFDQTtBQUFBLE1BQ0UsT0FBUztBQUFBLE1BQ1QsVUFBWTtBQUFBLFFBQ1YsWUFBYztBQUFBLE1BQ2hCO0FBQUEsSUFDRjtBQUFBLElBQ0E7QUFBQSxNQUNFLE9BQVM7QUFBQSxRQUNQO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLE1BQ0Y7QUFBQSxNQUNBLFVBQVk7QUFBQSxRQUNWLFlBQWM7QUFBQSxNQUNoQjtBQUFBLElBQ0Y7QUFBQSxJQUNBO0FBQUEsTUFDRSxPQUFTO0FBQUEsUUFDUDtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxNQUNGO0FBQUEsTUFDQSxVQUFZO0FBQUEsUUFDVixZQUFjO0FBQUEsTUFDaEI7QUFBQSxJQUNGO0FBQUEsSUFDQTtBQUFBLE1BQ0UsT0FBUztBQUFBLFFBQ1A7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxNQUNGO0FBQUEsTUFDQSxVQUFZO0FBQUEsUUFDVixZQUFjO0FBQUEsTUFDaEI7QUFBQSxJQUNGO0FBQUEsSUFDQTtBQUFBLE1BQ0UsT0FBUztBQUFBLFFBQ1A7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxNQUNGO0FBQUEsTUFDQSxVQUFZO0FBQUEsUUFDVixZQUFjO0FBQUEsTUFDaEI7QUFBQSxJQUNGO0FBQUEsSUFDQTtBQUFBLE1BQ0UsT0FBUztBQUFBLFFBQ1A7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsTUFDRjtBQUFBLE1BQ0EsVUFBWTtBQUFBLFFBQ1YsWUFBYztBQUFBLE1BQ2hCO0FBQUEsSUFDRjtBQUFBLElBQ0E7QUFBQSxNQUNFLE9BQVM7QUFBQSxRQUNQO0FBQUEsUUFDQTtBQUFBLE1BQ0Y7QUFBQSxNQUNBLFVBQVk7QUFBQSxRQUNWLFlBQWM7QUFBQSxNQUNoQjtBQUFBLElBQ0Y7QUFBQSxJQUNBO0FBQUEsTUFDRSxPQUFTO0FBQUEsUUFDUDtBQUFBLE1BQ0Y7QUFBQSxNQUNBLFVBQVk7QUFBQSxRQUNWLFlBQWM7QUFBQSxNQUNoQjtBQUFBLElBQ0Y7QUFBQSxJQUNBO0FBQUEsTUFDRSxPQUFTO0FBQUEsUUFDUDtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLE1BQ0Y7QUFBQSxNQUNBLFVBQVk7QUFBQSxRQUNWLFlBQWM7QUFBQSxNQUNoQjtBQUFBLElBQ0Y7QUFBQSxJQUNBO0FBQUEsTUFDRSxPQUFTO0FBQUEsUUFDUDtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLE1BQ0Y7QUFBQSxNQUNBLFVBQVk7QUFBQSxRQUNWLFlBQWM7QUFBQSxNQUNoQjtBQUFBLElBQ0Y7QUFBQSxJQUNBO0FBQUEsTUFDRSxPQUFTO0FBQUEsUUFDUDtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLE1BQ0Y7QUFBQSxNQUNBLFVBQVk7QUFBQSxRQUNWLFlBQWM7QUFBQSxNQUNoQjtBQUFBLElBQ0Y7QUFBQSxJQUNBO0FBQUEsTUFDRSxPQUFTO0FBQUEsUUFDUDtBQUFBLFFBQ0E7QUFBQSxNQUNGO0FBQUEsTUFDQSxVQUFZO0FBQUEsUUFDVixZQUFjO0FBQUEsTUFDaEI7QUFBQSxJQUNGO0FBQUEsSUFDQTtBQUFBLE1BQ0UsT0FBUztBQUFBLE1BQ1QsVUFBWTtBQUFBLFFBQ1YsWUFBYztBQUFBLE1BQ2hCO0FBQUEsSUFDRjtB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
