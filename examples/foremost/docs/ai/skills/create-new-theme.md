# Create new theme

Create a new visual brand theme for this starter from a website URL, wired into the
`src/lib/app-theme.ts` pattern (`<html data-theme="…">` + `NEXT_PUBLIC_APP_THEME`).

This skill takes a **website URL**, extracts the brand's colors and fonts, and registers a
new theme key across the five files that make a theme work in this app. The result is a theme
you can activate by setting `NEXT_PUBLIC_APP_THEME=<key>`.

## Trigger hints
Use this skill when the user asks to:
- "create a new theme" / "create new theme" from a site
- "add a brand theme" for a client URL
- turn a website's look into a selectable `data-theme`

## Relationship to `sitecore-extract-theme`
`sitecore-extract-theme` produces a **theme YAML** (`docs/ai/themes/<client>.theme.yaml`) — the
brand analysis. This skill **consumes** those extracted values and writes the **actual code
wiring** so the theme becomes selectable at runtime. Run extraction first, then wire it in.

---

## The theme model (read before editing)

A theme in this starter is a single key (e.g. `bcbst`, `dwyeromega`, `builderfs`) selected via
`NEXT_PUBLIC_APP_THEME` and applied as `<html data-theme="<key>">` in `src/app/layout.tsx`.
That key drives:

- **Color tokens** — `--color-*` CSS variables in `src/assets/styles/globals.css`
- **Font stacks + heading weight** — `--font-*` variables in `src/app/globals.css`
- **Fonts loaded** — `next/font/google` declarations in `src/app/layout.tsx`

`bcbst` is the default/fallback (base tokens live in the `@theme` block; it also has a small
override block). Every other theme is a `[data-theme='<key>']` block that overrides the tokens.

### The five files a theme touches

| # | File | What to add |
|---|------|-------------|
| 1 | `src/lib/app-theme.ts` | Add `'<key>'` to the `APP_THEMES` tuple |
| 2 | `src/assets/styles/globals.css` | Add a `[data-theme='<key>'] { … }` color-token block (+ optional `.bg-primary` fix) |
| 3 | `src/app/globals.css` | Add `html[data-theme='<key>'] { … }` font stacks + `--font-weight-heading` |
| 4 | `src/app/layout.tsx` | Load the Google font(s) via `next/font/google` and add to `fontVariables` |
| 5 | `.env.remote.example` | Add `<key>` to the documented `NEXT_PUBLIC_APP_THEME` options |

Do **not** edit `.env.local` (safety rule). Instead, tell the user to set
`NEXT_PUBLIC_APP_THEME=<key>` there to activate.

---

## Workflow

Copy this checklist and track progress:

```
Theme creation progress:
- [ ] Step 1: Extract brand values from the URL
- [ ] Step 2: Choose the theme key
- [ ] Step 3: Register the key (app-theme.ts)
- [ ] Step 4: Add color tokens (assets/styles/globals.css)
- [ ] Step 5: Add font stacks (app/globals.css)
- [ ] Step 6: Load fonts (layout.tsx)
- [ ] Step 7: Document the option (.env.remote.example)
- [ ] Step 8: Verify build/lint and present to user
```

### Step 1 — Extract brand values from the URL

Follow the `sitecore-extract-theme` skill (`docs/ai/skills/sitecore-extract-theme.md`) to run
the Playwright scraper and produce a theme YAML:

```bash
node docs/ai/scripts/site-scraper.mjs --url <CLIENT_URL> --output docs/ai/themes/<client-kebab>
```

From that output (`extracted-styles.json`, `meta.json`, screenshots, or the resulting
`docs/ai/themes/<client-kebab>.theme.yaml`) collect:

- **Colors** (as hex): primary, primary-foreground, accent, accent-foreground, background,
  foreground, secondary, muted/border, and any dark header/footer color.
- **Fonts**: a heading family and a body family. Prefer Google Fonts names (they must be
  loadable via `next/font/google`). If the site uses a proprietary font, pick the closest
  Google Fonts substitute and note the substitution.

If the scraper fails, fall back to screenshot + web-search analysis as described in
`sitecore-extract-theme`, and set lower confidence.

### Step 2 — Choose the theme key

The key must be lowercase, no spaces, matching the existing style (`bcbst`, `dwyeromega`,
`builderfs`). Derive it from the client/brand name or domain (e.g. `acme.com` → `acme`,
"Rockland Trust" → `rocklandtrust`). Confirm it does not already exist in `APP_THEMES`.

### Step 3 — Register the key (`src/lib/app-theme.ts`)

Add the key to the `APP_THEMES` tuple. This keeps the `AppTheme` type and `resolveAppTheme()`
validation in sync automatically.

```ts
export const APP_THEMES = ['bcbst', 'dwyeromega', 'builderfs', '<key>'] as const;
```

Do not change the default (`'bcbst'`) unless the user asks.

### Step 4 — Add color tokens (`src/assets/styles/globals.css`)

Add a new palette block after the existing ones. For **extensive official brand systems** (semantic tokens, color scales, dark mode), prefer a dedicated file:

```
src/assets/styles/themes/<key>-tokens.css   ← scoped to [data-theme='<key>'] (+ .dark overrides)
```

Import it from `src/app/globals.css` and keep a small **legacy bridge block** in `src/assets/styles/globals.css` for portal tokens (`--color-card`, `--color-border`, `--color-light`, etc.) that existing components expect.

For simpler themes, inline tokens in `globals.css` as below. Copy the full token set from an existing theme (e.g. `dwyeromega`) and replace the values.

```css
[data-theme='<key>'] {
  --background-image-gradient: linear-gradient(180deg, <accent> 0%, <primary> 100%);
  --background-image-gradient-secondary: linear-gradient(90deg, <secondary> 0%, <primary> 50%, <accent> 100%);
  --color-background: #ffffff;
  --color-foreground: <foreground>;
  --color-card: #ffffff;
  --color-card-foreground: <foreground>;
  --color-popover: #ffffff;
  --color-popover-foreground: <foreground>;
  --color-primary: <primary>;
  --color-primary-foreground: <primary-foreground>;
  --color-primary-hover: <primary-darkened>;
  --color-secondary: <secondary>;
  --color-secondary-foreground: <foreground>;
  --color-secondary-hover: <secondary-darkened>;
  --color-muted: <muted>;
  --color-muted-foreground: <muted-foreground>;
  --color-accent: <accent>;
  --color-accent-foreground: <accent-foreground>;
  --color-destructive: #dc2626;
  --color-destructive-hover: #b91c1c;
  --color-destructive-foreground: #ffffff;
  --color-border: <border>;
  --color-input: <border>;
  --color-ring: <primary>;
  --color-tertiary-foreground: <foreground>;
  --color-tertiary-hover: <secondary-darkened>;
  --color-tertiary: <secondary>;
  --color-dark-foreground: <foreground>;
  --color-dark-hover: <secondary-darkened>;
  --color-dark: <secondary>;
  --color-light: <light>;
  --color-light-hover: <secondary>;
  --color-light-foreground: <foreground>;
  --color-overlay: rgb(<primary-rgb> / 0.45);
}
```

If the primary color is dark (used on footers/hero bands), add the heading-contrast fix so
headings stay legible on `bg-primary` surfaces:

```css
[data-theme='<key>'] .bg-primary {
  color: var(--color-primary-foreground);
}
```

**Hover colors**: darken the base color ~10–15% (do not guess wildly — a slightly darker shade
of the same hue). **`*-rgb`** for the overlay is the primary color expressed as space-separated
RGB (e.g. `#2a2b67` → `42 43 103`).

### Step 5 — Add font stacks (`src/app/globals.css`)

Add an unlayered `html[data-theme='<key>']` block that sets the three font variables and heading
weight. The variable names (`--font-<x>`) must match the `next/font` variables you create in
Step 6.

```css
html[data-theme='<key>'] {
  --font-body: var(--font-<body-var>), '<Body Font>', ui-sans-serif, system-ui, sans-serif;
  --font-heading: var(--font-<heading-var>), '<Heading Font>', ui-sans-serif, system-ui, sans-serif;
  --font-accent: var(--font-<heading-var>), '<Heading Font>', ui-sans-serif, system-ui, sans-serif;
  --font-weight-heading: 700;
}
```

Only add extra rules (letter-spacing, custom `.btn.btn-primary` styling) if the brand clearly
calls for it — see the `builderfs` block for an example. Keep it minimal otherwise.

### Step 6 — Load the fonts (`src/app/layout.tsx`)

For each new Google font, add a `next/font/google` import and declaration, then append its
`.variable` to the `fontVariables` array. Reuse a font already declared if the brand matches
one (e.g. `Inter`, `Open Sans`) instead of adding a duplicate.

```ts
import { <HeadingFont>, <BodyFont> } from 'next/font/google';

const <bodyVar> = <BodyFont>({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-<body-var>',
  weight: ['400', '600', '700'],
  display: 'swap',
});

const <headingVar> = <HeadingFont>({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-<heading-var>',
  weight: ['500', '600', '700'],
  display: 'swap',
});

const fontVariables = [
  inter.variable,
  sourceSans3.variable,
  barlowCondensed.variable,
  openSans.variable,
  robotoCondensed.variable,
  <bodyVar>.variable,
  <headingVar>.variable,
].join(' ');
```

The `next/font/google` import name must be the exact package export (underscores for spaces,
e.g. `Open_Sans`, `Roboto_Condensed`). Include only weights the theme uses.

### Step 7 — Document the option (`.env.remote.example`)

Update the options comment so the new key is discoverable:

```
# Visual brand theme (CSS variables on <html data-theme>). Options: bcbst | dwyeromega | builderfs | <key>
# NEXT_PUBLIC_APP_THEME=bcbst
```

### Step 8 — Verify and present

1. Run lint/type-check and a build from the starter directory:
   ```bash
   npm run lint
   npm run build
   ```
   A bad `next/font/google` name (font/weight that does not exist) fails the build — fix it here.
2. Tell the user to set `NEXT_PUBLIC_APP_THEME=<key>` in `.env.local` and restart `npm run dev`
   to see it. (Never edit `.env.local` yourself.)
3. Present a summary: the key, the color palette (primary/accent/foreground + backgrounds), the
   heading/body fonts (and any substitution), and any low-confidence values. Ask the user to
   confirm before considering the theme done.

---

## Verification checklist

- [ ] Key added to `APP_THEMES` in `src/lib/app-theme.ts`
- [ ] Full `[data-theme='<key>']` color block added in `src/assets/styles/globals.css` (all tokens set)
- [ ] `.bg-primary` heading-contrast fix added if primary is dark
- [ ] `html[data-theme='<key>']` font block added in `src/app/globals.css`
- [ ] `--font-*` variable names match between `app/globals.css` and `layout.tsx`
- [ ] Fonts declared with valid `next/font/google` names/weights and added to `fontVariables`
- [ ] `.env.remote.example` options comment updated
- [ ] `npm run lint` and `npm run build` pass
- [ ] User told to set `NEXT_PUBLIC_APP_THEME=<key>` in `.env.local`
- [ ] Palette + fonts presented and confirmed

## Do not

- Do not edit `.env.local` or any `.env.*.local`.
- Do not change the default theme unless asked.
- Do not leave a theme's token set partially defined.
- Do not add a proprietary font that `next/font/google` cannot load — substitute and note it.
