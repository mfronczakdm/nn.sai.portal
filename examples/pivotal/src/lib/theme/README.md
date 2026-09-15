# Theme resolution (`src/lib/theme`)

Multi-theme support for the shared **site-base** rendering host.

## Mental model

| Sitecore | Code | CSS |
|----------|------|-----|
| Site definition field **Skin** | `site-skins.ts` + `resolveTheme({ site })` | `[data-theme='skin']` |

Experience Edge does not expose custom Site fields in `sites.json`, so
`site-skins.ts` mirrors the Skin values authors set in Sitecore.

## Add a theme

Follow the **create-new-theme** skill (`docs/ai/skills/create-new-theme.md`).

## Key files

- `themes.ts` — registered Skin keys
- `standard-tokens.ts` — required CSS variables
- `site-skins.ts` — site name → Skin
- `resolve-theme.ts` — resolution order
- `src/assets/styles/themes/` — CSS packages + README
