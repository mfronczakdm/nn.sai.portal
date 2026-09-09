# LCMC Health Hospital Kiosk

Touch-screen lobby kiosk for **LCMC Health**. Next.js App Router app that reads physicians, locations, and services from **Sitecore Experience Edge GraphQL** — not the Sitecore Content SDK / layout service / placeholders.

The kiosk uses the official LCMC Health logo in `public/branding/lcmc-health-logo.png`. Tailwind navy/teal values are still a placeholder palette until Brandfolder tokens are confirmed.

## Run locally

```bash
cd examples/lcmc-kiosk
cp .env.local.example .env.local
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Mock Sitecore data is on by default (`USE_MOCK_DATA=true` in the example env, and the API layer also defaults to mock when the flag is unset).

| Script | Purpose |
| --- | --- |
| `npm run dev` | Next.js dev server |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint |
| `npm run type-check` | `tsc --noEmit` |
| `npm run format:check` | Prettier check |
| `npm run codegen` | Generate TypeScript types from `lib/sitecore/queries` |

## Environment variables

Copy `.env.local.example` to `.env.local` (never commit `.env.local`).

| Variable | Server-only | Purpose |
| --- | --- | --- |
| `SITECORE_GRAPHQL_ENDPOINT` | yes | Experience Edge GraphQL URL, e.g. `https://edge.sitecorecloud.io/api/graphql/v1` |
| `SITECORE_API_KEY` | yes | Edge API key sent as the `sc_apikey` header. Never use a `NEXT_PUBLIC_` prefix. |
| `SITECORE_SITE_NAME` | yes | XM Cloud site name (`lcmc`) |
| `USE_MOCK_DATA` | yes | `true` (default) uses JSON fixtures. `false` calls live GraphQL. |

## Swap mock data for live Sitecore

1. Put a real endpoint and API key in `.env.local`.
2. Set `USE_MOCK_DATA=false`.
3. Restart `npm run dev`.
4. Confirm the typed fetch functions in `lib/sitecore/api/index.ts` still parse (zod will throw a `SitecoreValidationError` if field shapes drifted).

If live GraphQL fails, the kiosk shows a staff-assistance message instead of a stack trace.

## Content tree (verified)

All kiosk queries are rooted at these paths — not a site-wide search:

| Constant | Path | Template folder |
| --- | --- | --- |
| `PHYSICIANS_ROOT_PATH` | `/sitecore/content/lcmc/lcmc/Data/Physicians` | LCMC Physician Folder |
| `LOCATIONS_ROOT_PATH` | `/sitecore/content/lcmc/lcmc/Data/Locations` | LCMC Hospital Location Folder |
| `DEPARTMENTS_ROOT_PATH` | `/sitecore/content/lcmc/lcmc/Data/Services` | LCMC Service Folder |

### Departments folder does not exist

There is **no** `/sitecore/content/lcmc/lcmc/Data/Departments`. Kiosk routes `/departments` and `/departments/[slug]` query **LCMC Service** items. Physician-to-department grouping uses:

1. `Physician.Specialty` mapped to a service slug in `lib/sitecore/specialty-map.ts`
2. Overlap between `ServingLocations` and the service's `OfferedAtLocations`

That mapping is a kiosk convenience, not a Sitecore reference field. If you later add a real Departments folder or a `departmentRef` on Physician, point `DEPARTMENTS_ROOT_PATH` at the new folder and drop the specialty map.

## Sitecore field names (current vs. original brief)

Queries use the **live** LCMC template fields (confirmed 2026-09-09). Comments at the top of `lib/sitecore/queries/fragments.graphql` list them.

| Brief assumption | Actual field |
| --- | --- |
| Physician.name / title | `PhysicianFullName`, `Credentials` |
| specialty | `Specialty` (single-line text, not a Specialty item) |
| departmentRef | **missing** — use Services + specialty map |
| locationRef | `ServingLocations` (multilist) |
| photo | **missing** — kiosk shows initials |
| bio | `PhysicianBio` |
| acceptingNewPatients | **missing** — UI hides the badge |
| languagesSpoken | **missing** — UI hides the row |
| phone | `PhysicianPhone` |
| Department.name / description | `ServiceTitle`, `ServiceShortDescription`, `ServiceDetail` |
| Department.floor / wing / icon | **missing** |
| Location.name / building / floor / directions | `LocationTitle`, address fields, `ParkingInfo`, `VisitorInfo` |

Reconcile any new fields against the templates before go-live. Do not add guessed GraphQL field names to live queries; Edge will fail the request.

## Architecture

- Server Components and `lib/sitecore/*` own every GraphQL call (`server-only`).
- `graphql-request` + path-based `item(path:)` queries.
- zod validates the Edge payload at the API boundary.
- `graphql-codegen` types come from the local schema subset in `lib/sitecore/schema.graphql` plus the `.graphql` documents. Introspect the real endpoint later if you want a fuller schema.
- Idle reset (`useIdleRedirect`, 90s) returns to `/` on every screen except home. Search state lives in client components, so it clears on that navigation.
- On-screen keyboard is a custom QWERTY overlay. A hardware kiosk keyboard still types into the same inputs.

## Routes

- `/` attract / home
- `/physicians` directory with search + specialty chips
- `/physicians/[slug]` physician detail
- `/departments` service directory
- `/departments/[slug]` service detail, locations, related physicians
- `/wayfinding` hospital visitor / parking overview
