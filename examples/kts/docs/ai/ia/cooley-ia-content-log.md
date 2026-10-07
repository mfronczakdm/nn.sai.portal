# Cooley IA content population log

Date: 2026-08-14  
Scope: All Services Page items under `/sitecore/content/Cooley/cooley/Home` except Home, Data, Speakers, Video.

## Result

- **Updated (MCP success):** 130
- **Failed:** 0 observed (every `update_fields_on_item` call returned the item)
- **Skipped:** Home, Data, Speakers, Video (out of scope)

## Fields sent on every page

| Field | Type | MCP echo |
| --- | --- | --- |
| `pageTitle` | single-line | not echoed |
| `pageHeaderTitle` | single-line | not echoed |
| `pageShortTitle` | single-line | not echoed |
| `pageSubtitle` | single-line | not echoed |
| `pageSummary` | multi-line | not echoed |
| `Detail` | rich text HTML | **echoed** |
| `image` | image XML | **echoed** |
| `pageThumbnail` | image XML | not echoed |
| `metadataAuthor` | single-line | not echoed |
| `metadataTitle` | single-line | not echoed |
| `metadataDescription` | multi-line | not echoed |
| `metadataKeywords` | single-line | not echoed |
| `ogTitle` | single-line | not echoed |
| `ogDescription` | single-line | not echoed |
| `ogImage` | image XML | not echoed |

`get_content_item_by_id` / `updatedFields` only return `Detail` and `image`. SEO and title fields were included in every payload; confirm in Content Editor.

Not set (droplink / checkbox): `Page Design`, `ChangeFrequency`, `Priority`, `noFollow`, `noIndex`.

## Image approach

Unsplash `images.unsplash.com` URLs with `w=1600`, topic-aligned (offices, labs, city skylines, courtrooms). XML:

```xml
<image mediaid="" src="https://images.unsplash.com/photo-...?auto=format&fit=crop&w=1600&q=80" alt="..." />
```

Same URL used for `image`, `pageThumbnail`, and `ogImage` where sent. No Content Hub DAM `dam-id`.

## Gaps

1. Verify `pageTitle` / SEO / OG in Content Editor (MCP does not echo those fields).
2. Unsplash `mediaid=""` may not render in all XM Cloud image components; DAM upload would be more durable.
3. `www.cooley.com/practices` returned 404 to the fetch tool; copy is paraphrased Cooley voice from known practice/industry positioning, not page-scraped HTML.
4. News hubs describe content types; they are not live article feeds.
5. No invented league-table rankings.
