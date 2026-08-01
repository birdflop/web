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

# Code Architecture & Reuse

- **Leverage Existing Code:** Before writing new utilities, hooks, or components, inspect the codebase to see if equivalent functionality or abstractions already exist. Avoid duplicating logic or reinventing helper functions.
- **Maintain Layout & Styling Consistency:** Ensure new pages or modified views align with the visual design, structure, and spacing of existing routes. Match container widths, padding conventions, dark/light color schemes, and structural layout patterns (e.g., page headers, sidebars, navigation).
- **Qwik Best Practices:** 
  - Adhere to Qwik's fine-grained reactivity and serialization rules (proper use of `$(...)`, `useSignal`, `useStore`, and route loaders/actions).
  - Keep route handlers concise by delegating presentation logic to dedicated components and business logic to modular utility files.

# UI Components and Styling

This project uses UI components and styling from `@luminescent/ui-qwik` and `@luminescent/ui`. When designing or updating elements (like custom color inputs or other control widgets), prefer importing and utilizing existing components from `@luminescent/ui-qwik` (such as `ColorPicker`, `Label`, `SelectMenu`, `NumberInput`) to maintain design consistency and reuse established interactive patterns.

Docs are online at https://ui.luminescent.dev and the source code is at https://github.com/LuminescentDev/ui/tree/qwik-v2/packages/ui-qwik

# Anti-Patterns to Avoid (AI Pitfalls)

- **Do NOT use React state patterns:** Avoid `useState`, `useEffect`, or direct DOM manipulation. Use Qwik signals (`useSignal`, `useStore`), tasks (`useTask$`), and properly wrap event handlers with the `$` suffix (e.g., `onClick$`). Ensure closures passed across dollar boundaries are serializable.
- **Do NOT build raw UI inputs:** Avoid creating custom Tailwind `<input>` or `<select>` controls from scratch. Always import and use established components from `@luminescent/ui-qwik`.
- **Do NOT use standard PM commands:** Never run or suggest `npm run`, `npx`, or standard `pnpm` scripts directly when a `vp` command exists (e.g., use `vp check` instead of `npm run check`).
- **Respect Domain Text & Image Components:** Pay attention to specialized text processing (e.g., MOTD newline parsing, color code formatting) and use existing image processing wrappers (e.g., Vite imagetools JSX components) rather than raw `<img>` tags.
