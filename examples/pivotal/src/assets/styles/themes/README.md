/**
 * Theme packages for site-base (multi-theme rendering host).
 *
 * How it works
 * ------------
 * 1. Sitecore Site definition (template {E46F3AF2-39FA-4866-A157-7017C4B2A40C})
 *    has a field named **Skin**. Value = theme key (e.g. `rockland`).
 * 2. This app maps site → skin in `src/lib/theme/site-skins.ts` (Edge does not
 *    ship custom Site fields in sites.json).
 * 3. `[site]/layout.tsx` sets `<html data-theme="<skin>">`.
 * 4. CSS under this folder overrides design tokens for that theme.
 *
 * File layout
 * -----------
 *   _standard-tokens.css   Checklist of required tokens (comments only)
 *   fonts.css              Typography stacks per theme
 *   <key>.css              Color / brand tokens for that skin
 *   <key>-tokens.css       Optional extended scales for a brand
 *
 * Adding a theme
 * --------------
 * See docs/ai/skills/create-new-theme.md (create-new-theme skill).
 */

/* Theme CSS is imported from src/app/globals.css */
