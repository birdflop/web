<!--VITE PLUS START-->

# Using Vite+, the Unified Toolchain for the Web

This project is using Vite+, a unified toolchain built on top of Vite, Rolldown, Vitest, tsdown, Oxlint, Oxfmt, and Vite Task. Vite+ wraps runtime management, package management, and frontend tooling in a single global CLI called `vp`. Vite+ is distinct from Vite, and it invokes Vite through `vp dev` and `vp build`. Run `vp help` to print a list of commands and `vp <command> --help` for information about a specific command.

Docs are local at `node_modules/vite-plus/docs` or online at https://viteplus.dev/guide/.

## Review Checklist

- [ ] Run `vp install` after pulling remote changes and before getting started.
- [ ] Run `vp check` and `vp test` to format, lint, type check and test changes.
- [ ] Check if there are `vite.config.ts` tasks or `package.json` scripts necessary for validation, run via `vp run <script>`.
- [ ] If setup, runtime, or package-manager behavior looks wrong, run `vp env doctor` and include its output when asking for help.

<!--VITE PLUS END-->

# UI Components and Styling

This project uses UI components and styling from `@luminescent/ui-qwik` and `@luminescent/ui`. When designing or updating elements (like custom color inputs or other control widgets), prefer importing and utilizing existing components from `@luminescent/ui-qwik` (such as `ColorPicker`, `Label`, `SelectMenu`, `NumberInput`) to maintain design consistency and reuse established interactive patterns.

Docs are online at https://qwik-v2.ui-9xn.pages.dev/docs/ and the source code is at https://github.com/LuminescentDev/ui/tree/qwik-v2/packages/ui-qwik
