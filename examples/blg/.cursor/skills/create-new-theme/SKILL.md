---
name: create-new-theme
description: Create a new visual brand theme for this starter from a website URL, wired into the src/lib/app-theme.ts pattern (<html data-theme> + NEXT_PUBLIC_APP_THEME). Use when the user asks to "create a new theme", "create new theme", or "add a brand theme" from a site URL. Extracts brand colors and fonts from the URL, then registers the theme key across app-theme.ts, the two globals.css files, layout.tsx, and .env.remote.example.
---

Read and follow `docs/ai/skills/create-new-theme.md` in full before proceeding.

This skill turns a website URL into a selectable `data-theme`. It reuses `sitecore-extract-theme`
(and `docs/ai/scripts/site-scraper.mjs`) to pull brand colors and fonts from the URL, then wires
those values into the five files that make a theme work in this app:

1. `src/lib/app-theme.ts` — add the key to `APP_THEMES`
2. `src/assets/styles/globals.css` — `[data-theme='<key>']` color tokens
3. `src/app/globals.css` — `html[data-theme='<key>']` font stacks + heading weight
4. `src/app/layout.tsx` — load fonts via `next/font/google`, add to `fontVariables`
5. `.env.remote.example` — document the new `NEXT_PUBLIC_APP_THEME` option

Never edit `.env.local`; tell the user to set `NEXT_PUBLIC_APP_THEME=<key>` there to activate.
