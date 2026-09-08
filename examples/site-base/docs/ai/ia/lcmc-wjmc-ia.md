# LCMC Health — West Jefferson Medical Center microsite (IA)

Source: https://www.lcmchealth.org/west-jefferson-medical-center/
Client key: lcmc-wjmc
Extracted: 2026-09-08
Extracted by: get-site-ia + sitecore-create-ia (full loop)
Max depth: 3
Confidence: high

## Hand-off to sitecore-create-ia
- IA file: `docs/ai/ia/lcmc-wjmc-ia.md`
- Site name: `lcmc`
- Content root: `/sitecore/content/lcmc/lcmc/Home`
- Page template ID: `{D77937AC-BAE4-4EB0-8D7E-69EC09D5BBFC}` (Services Page)
- Folder template ID: _(n/a)_

## Notes
- Live LCMC is **system + hospital microsites**. System L1s (Our Services, Our Locations, Find a Provider, About Us, For Patients) already exist and must stay.
- This spec lists **only new creatable items** under Home for the West Jefferson Medical Center hospital microsite.
- Existing `/Home/Our Locations/West Jefferson Medical Center` is the **hospital location/detail page** — do not replace or move it. The new L1 is a **microsite home** at `/Home/West Jefferson Medical Center`.
- Do not create or edit `/sitecore/content/lcmc/lcmc/Data/Locations` or physician data.
- Services list is the full live `/west-jefferson-medical-center/our-services/` directory (not the truncated search snippet).
- Patients & Visitors / About Us L2s are hubs with paraphrased copy. Individual clinic location **pages** under the microsite are skipped (link out to the existing location page + Data item).
- Item names follow existing LCMC IA: spaces preserved, `&` → `and`, apostrophes/commas stripped.

## Skipped (do not create)

| Item | Why |
|------|-----|
| System Our Services / Locations / Find a Provider | Already exist — leave in place |
| `/Home/Our Locations/West Jefferson Medical Center` | Existing hospital location page — leave |
| Data/Locations and Data/Physicians | Explicitly out of scope |
| Per-clinic location pages (ENT clinic, Cancer Center, Primary Care Algiers, etc.) | Location DATA must not change; microsite Our Locations links to existing hospital page |
| WJMC blog, careers, foundation, medical staff, daisy form, CHNA, renovation | Not needed for ENT demo |
| Google Map / LocationSearch Default | Do not invent maps or change system search |

## Tree (creatable items only)

Home (exists — skip)

- West Jefferson Medical Center
  - Our Services
    - Cancer Center
    - Centro Hispano de Salud
    - Digestive Care
    - Ears Nose and Throat Care
    - Emergency Care
    - Heart and Vascular Care
    - Hyperbaric
    - Imaging Services
    - Orthopedic Care
    - Physical Rehabilitation
    - Primary Care
    - Respiratory Care
    - Sleep Care
    - Surgery
    - Stroke Care
    - The Family Birth Place
    - The Hispanic Health Center
    - Urology
    - Womens Health
    - Wound Care
  - Patients and Visitors
  - About Us
  - Our Locations
  - Contact Us
