# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev      # start dev server at localhost:3000
npm run build    # production build
npm run lint     # run ESLint
```

No test runner is configured yet.

## Stack

- **Next.js 16.2.1** with App Router (`src/app/`)
- **React 19.2.4**
- **TypeScript**
- **Tailwind CSS v4** (configured via `@tailwindcss/postcss` in `postcss.config.mjs` — no `tailwind.config` file)
- **ESLint 9** flat config (`eslint.config.mjs`)

## Architecture

The app uses the Next.js App Router. All routes live under `src/app/`. The root layout (`src/app/layout.tsx`) sets up Geist fonts via `next/font/google` and applies base Tailwind classes. Pages are React Server Components by default.

Tailwind CSS v4 does not require a config file — utility classes are available globally. Dark mode uses the `dark:` variant with system preference.
