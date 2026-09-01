# Pulse multi-site packs

Pulse is a shared assistant (UI + `/api/pulse/ask` + retrieve + answer templates) with **per-site packs** keyed by the same site names as themes/skins (`quanex`, `era`, `amesburytruth`, `pillsburylaw`, `amkor`, …).

## How it works

1. `Layout` passes `page.siteName` into `PulseAssistant`.
2. The widget sends `siteName` on `POST /api/pulse/ask`.
3. The API loads the pack via `getPulsePack(siteName)` and retrieves under that site’s Home root on **Experience Edge** (same published content as the live site).
4. Optional demo intents boost answers by listing Sitecore item IDs; title/url/excerpt hydrate from Edge at ask-time.

**Sitecore Search is not required** for Quanex / ERA / AmesburyTruth. Search runs only when `isSitecoreSearchConfigured()` is true (optional legacy path).

## Add Pulse to a new demo site

1. **Create a pack file** under `src/lib/pulse-packs/` (copy `quanex.ts` as a template):
   - `siteName`, `brandName`
   - `homePath` + `homeRootId` from the IA / manifest
   - `typeLabels` for the vertical (Product / Capability / Resource — not Lawyer)
   - `starterPrompts` (3–5) aligned to real IA
   - `intents[]` with `matchAny` token groups + `citationItemIds` from the Home tree
   - `enableStatePersona: false` unless you need Progressive-style FL/NC weighting
2. **Register** the pack in `src/lib/pulse-packs/index.ts` (`PULSE_SITE_PACKS`).
3. **Publish** the site Home tree to Experience Edge. Unpublished items will not appear in Pulse (same as the live front end).
4. Confirm the site is listed in `src/lib/theme/site-skins.ts` if it has a brand skin.
5. Do **not** edit core `pulse-retrieve.ts` / `pulse-answer.ts` for site-specific copy — keep that in the pack.

## Content source rules

| Source | When used |
|--------|-----------|
| Experience Edge GraphQL (Home-scoped) | **Default / required** for all packs |
| Intent citation ID hydration | When a pack intent matches |
| Sitecore Search (`NEXT_PUBLIC_SEARCH_*`) | **Optional** only if Search is configured |

Quanex, ERA, AmesburyTruth, and Amkor share one XM Cloud Edge Context ID from env (`SITECORE_EDGE_CONTEXT_ID` / `SITECORE_EDGE_CONTEXT_ID_LIVE`). Packs only scope Home path/root within that tenant — do not invent per-brand Edge context IDs.

On the shared editing host, `PulseAssistant` resolves the pack from the URL `[site]` segment first (same helper as SearchResults), then Sitecore `page.siteName`. Amkor citations live under `/sitecore/content/amkor/amkor/Home` (`{BB13BF5A-B102-4FE8-B410-63E3DA7AA448}`) and include packaging, test/Arizona, and careers/talent pages.

## Follow-ups

- Full LLM provider integration
- Moving packs into Sitecore CMS items (authorable intents) — not required for demos today
