# Sitecore create information architecture

Create a Sitecore content tree (information architecture) from a user-supplied hierarchy using the **Sitecore Marketer MCP** server.

Docs: [Sitecore Marketer MCP server](https://doc.sitecore.com/sai/en/users/sitecoreai/sitecore-marketer-mcp-server.html)

## Trigger hints
Use this skill when the user asks to:
- "create IA", "create information architecture", "build the site tree", "create pages from IA"
- create a hierarchy of page/content items under a Sitecore site
- populate a content tree from a markdown tree spec (e.g. `docs/ai/rockland-ia.md`)

## Do not use this skill when
- the user wants to create page **templates** or **components** (use `sitecore-create-page-template`, `sitecore-create-simple-component`, etc.)
- the user wants to add components to an existing page (use page/component skills)
- the user only wants to **analyze** a website's nav without creating items (provide IA as markdown only)

---

## Load first
- `docs/ai/config/project.yaml`
- `docs/ai/manifests/sitecore-manifest.yaml`
- `docs/ai/skills/sitecore-maintain-manifest.md`
- `docs/ai/reference/sitecore-marketer-mcp-reference.md`

---

## Required user inputs

Do **not** start creating items until all required inputs are confirmed. Ask for anything missing.

| Input | Required | Description |
|-------|----------|-------------|
| **Site name** | Yes | Sitecore site name (e.g. `main-website`). Used with `list_sites` to verify the target site exists. |
| **Content root path** | Yes | Full Sitecore item path where the IA tree is rooted (e.g. `/sitecore/content/main/main-website/Home`). All created items are descendants of this path. |
| **IA tree** | Yes | Indented markdown tree **or** path to an IA spec file. Lists only items that will be **created** — no navigation-reference placeholders. |
| **Page template ID** | Yes | Template ID (GUID) for page items. Resolve with `get_page_template_by_id` if the user gives a template name/path instead. |
| **Folder template ID** | If folders exist | Template ID for folder nodes (e.g. `shared`). Required when the tree includes non-page containers. |
| **Default item fields** | Optional | Array of `{ name, value }` applied to every **page** on create. User provides field names and values; validate against template via `get_page_template_by_id`. |
| **Language** | Optional | Language code for create/read operations. Default: `en`. |

### Optional per-node overrides
The user may specify in the IA spec or separately:
- **folder** — node is a folder (uses folder template), not a page
- **templateId** — different page template for this node or subtree
- **fields** — field overrides for a specific node (merged on top of default fields)

If not specified, treat every node as a **page** using the page template ID.

---

## IA tree input format

The tree uses **indentation** for parent/child relationships. Each line is one creatable item.

```markdown
- Home
  - shared
    - Deposit Protection
    - Merchant Services
  - Personal
    - Banking
      - Checking Products
        - Free Checking
  - Locations
```

Rules:
- The root node in the spec (e.g. `Home`) must match the last segment of **content root path**, or be skipped if the content root path already points at that item.
- **Only list items that will exist** in Sitecore. Do not list navigation references to shared items under other sections.
- Put reusable content once under a **`shared`** folder directly under Home (or as the user specifies).
- Item **display name** = the label text. Item **name** (URL segment) = kebab-case derived from the label (e.g. `Free Checking` → `free-checking`).
- Nodes marked `[folder]` or under a `shared` parent use the **folder template** unless the user says otherwise.

Save large specs to `docs/ai/ia/<client>-ia.md` and reference the file path as input.

---

## MCP server

Use the **`user-marketer`** MCP server (Sitecore Marketer MCP).

If tools fail with authentication errors, call `mcp_auth` on that server, then retry.

Primary tools for this skill:

| Tool | Purpose |
|------|---------|
| `list_sites` | Verify site name exists |
| `get_content_item_by_path` | Resolve content root and parent item IDs |
| `get_page_template_by_id` | Validate template and available fields before create |
| `list_avail_insertopts` | Confirm template is allowed under parent before create |
| `create_page` | Create a page item (`templateId`, `parentId`, `name`, `language`, `fields`) |
| `create_content_item` | Create page/folder items — **preferred for field population**; pass `fields` as `[{ name, value }]` |
| `update_fields_on_item` | Apply default or per-node fields after create if needed |
| `get_content_item_by_id` | Verify item after create |
| `search_site` | Check whether a page title already exists (optional dedup) |

See `docs/ai/reference/sitecore-marketer-mcp-reference.md` for field value formats (HTML for rich text, XML for image/link, GUID for references).

---

## Workflow

Copy this checklist and track progress:

```
IA creation progress:
- [ ] Step 0: Confirm required inputs
- [ ] Step 1: Verify MCP + site
- [ ] Step 2: Resolve content root
- [ ] Step 3: Validate templates + default fields
- [ ] Step 4: Parse IA tree
- [ ] Step 5: Create items (depth-first, parent before child)
- [ ] Step 6: Update manifest
- [ ] Step 7: Present summary
```

### Step 0 — Confirm required inputs

Collect and restate:
1. Site name
2. Content root path (full Sitecore path)
3. IA tree (inline or file path)
4. Page template ID (+ folder template ID if needed)
5. Default fields (if any)
6. Language (default `en`)

If the user provides a template **name** instead of GUID, resolve it via MCP before proceeding.

### Step 1 — Verify MCP and site

1. Call `list_sites` and confirm the **site name** matches an entry.
2. If no match, list available sites and ask the user to pick one.

### Step 2 — Resolve content root

1. Call `get_content_item_by_path` with the **content root path**.
2. Record the returned item ID — this is the parent for top-level IA children (or the starting node if creating under it).
3. If the path does not exist, stop and ask the user to create the root or correct the path.

### Step 3 — Validate templates and default fields

1. Call `get_page_template_by_id` with the page template ID. Note available field names.
2. If folder nodes exist, resolve and note the folder template ID.
3. Validate every **default field** name exists on the page template. Drop or flag unknown fields; ask the user if any required field is missing.
4. Format default field values per field type (see MCP reference).

### Step 4 — Parse IA tree

1. Parse the indented markdown tree into an ordered list of nodes: `{ label, depth, parentLabel, itemName, isFolder }`.
2. Derive `itemName` as kebab-case from `label`.
3. Mark `isFolder: true` for:
   - nodes explicitly tagged `[folder]`
   - the `shared` folder (unless user specifies otherwise)
   - any node the user identifies as a folder-only container
4. Build the full Sitecore path for each node: `contentRootPath` + `/` + ancestor segments.
5. Present a **creation plan** (count, depth, shared folder location) and confirm with the user before creating.

### Step 5 — Create items (depth-first)

Process nodes **top to bottom, parent before child**:

For each node:

1. **Resolve parent ID**
   - Parent is the content root item ID (if depth 1) or the previously created child under that parent.
   - Cache created item IDs by full path as you go.

2. **Skip if exists**
   - Call `get_content_item_by_path` with `failOnNotFound: false`.
   - If the item exists, record its ID in the cache and skip create.

3. **Check insert options**
   - Call `list_avail_insertopts` on the parent ID.
   - Confirm the intended template ID is allowed. If not, stop and report — do not force-create.

4. **Create the item**
   - **Page (preferred):** `create_content_item({ templateId, parentId, name: itemName, language, fields })` with `fields` as `[{ name, value }]`.
   - **Page (alternate):** `create_page` — pass `fields` as a single object in the array: `[{ pageTitle: "...", pageShortTitle: "...", ... }]`. Do **not** use `{ name, value }` pairs with `create_page` (API error: "Cannot find a field with the name name").
   - **Folder:** `create_content_item({ templateId: folderTemplateId, parentId, name: itemName, language, fields })`
   - Merge **default fields** + any **per-node field overrides** into the `fields` array.

5. **Verify**
   - Call `get_content_item_by_id` on the returned ID.
   - Record: item ID, full path, template, display name.

6. **On failure**
   - Log the node, error, and parent path.
   - Continue with siblings if safe; stop if parent creation failed (children cannot be created).

**Creation order example** for:
```
Home
  shared
    Deposit Protection
  Personal
    Banking
```
Create: `shared` → `Deposit Protection` → `Personal` → `Banking` (assuming Home already exists at content root).

### Step 6 — Update manifest

Follow `sitecore-maintain-manifest.md`:
- Add an `ia` or `pages` section (or extend `components`) with created item IDs, paths, and status.
- Record content root path, site name, template IDs, and timestamp.

### Step 7 — Present summary

Show the user:
- Total items created vs skipped (already existed)
- Table of created items: display name, item name, full path, item ID
- Any failures or insert-option blocks
- Reminder: shared items live once under `/Home/shared/` (or as specified); wire navigation links separately if needed
- Next steps: publish, add components to pages, configure navigation

---

## Shared content pattern

When the IA spec uses a **`shared`** folder under Home:
- Create `shared` as a **folder** item once.
- Create each shared page **only** under `shared`.
- Do **not** duplicate shared pages under Personal, Small Business, Commercial, etc.
- Navigation in those sections should link to the canonical shared item — that is a separate navigation configuration task, not part of this content tree.

---

## Field defaults

Apply fields in this order (later overrides earlier):
1. Template standard values (implicit — no action needed)
2. User-provided **default item fields** (applied to every page)
3. Per-node **fields** overrides from the IA spec

Example default fields input from user:
```yaml
defaultFields:
  - name: Title
    value: ""          # populated from display name if empty
  - name: NavigationTitle
    value: ""          # populated from display name if empty
```

If `Title` or `NavigationTitle` is empty, set it to the node's display label after create via `update_fields_on_item`.

---

## Verification checklist

- [ ] Site name verified via `list_sites`
- [ ] Content root path resolved via `get_content_item_by_path`
- [ ] Page template validated via `get_page_template_by_id`
- [ ] Default fields validated against template
- [ ] IA tree parsed; creation plan confirmed with user
- [ ] Items created depth-first; parents before children
- [ ] Insert options checked before each create
- [ ] Existing items skipped (not duplicated)
- [ ] Created items verified via `get_content_item_by_id`
- [ ] Manifest updated with item IDs and paths
- [ ] Summary presented to user

---

## Do not

- Do not create items without confirmed site name, content root path, template ID(s), and IA tree.
- Do not guess template IDs or parent item IDs — always resolve via MCP.
- Do not duplicate shared content under multiple sections.
- Do not invent pages not listed in the IA spec.
- Do not claim success for items that were not verified via MCP read-back.
