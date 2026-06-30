---
name: APTEKA HMS frontend architecture
description: shadcn/ui setup, path aliases, and tailwind config decisions
---

## Rule
- shadcn/ui components are manually created in `frontend/src/components/ui/` (no shadcn CLI used — Replit environment doesn't support it).
- Radix-UI packages installed via `npm install --save` directly (not via `code_execution installLanguagePackages` which doesn't update package.json).
- Path alias `@/` maps to `frontend/src/` — configured in both `vite.config.ts` (resolve.alias) and `tsconfig.json` (paths).
- `tailwindcss-animate` must be listed in `tailwind.config.js` plugins array for shadcn animations to work.
- CSS variables for theming live in `frontend/src/index.css` under `@layer base { :root { ... } }`.
- Primary green: `#0F8B4C`, Blue: `#0B6CFB`, Background: `#F8FAFC`.

**Why:** Decisions made during full professional refactor of APTEKA HMS.

**How to apply:** When adding new UI components, place them in `frontend/src/components/ui/` and follow the existing cva + forwardRef pattern.
