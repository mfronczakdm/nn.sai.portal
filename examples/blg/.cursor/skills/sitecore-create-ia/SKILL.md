---
name: sitecore-create-ia
description: Create a Sitecore content tree (information architecture) from a user-supplied hierarchy using the Sitecore Marketer MCP. Use when the user asks to create IA, build a site tree, or create pages from an indented markdown tree spec. Requires site name, full content root item path, page template ID, optional folder template ID, optional default item fields, and the IA tree (inline or file path).
---

Read and follow `docs/ai/skills/sitecore-create-ia.md` in full before proceeding.

Uses the **Sitecore Marketer MCP** (`user-marketer` server). Docs: https://doc.sitecore.com/sai/en/users/sitecoreai/sitecore-marketer-mcp-server.html

**Required user inputs before creating items:**
1. **Site name** — e.g. `main-website` (verified via `list_sites`)
2. **Content root path** — full Sitecore path, e.g. `/sitecore/content/main/main-website/Home`
3. **IA tree** — indented markdown listing only creatable items, or path to an IA spec file
4. **Page template ID** — GUID for page items (`get_page_template_by_id` to validate)
5. **Folder template ID** — if the tree includes folder nodes (e.g. `shared`)
6. **Default item fields** — optional `{ name, value }[]` applied to every page on create

Also read: `docs/ai/config/project.yaml`, `docs/ai/manifests/sitecore-manifest.yaml`, `docs/ai/reference/sitecore-marketer-mcp-reference.md`, `docs/ai/skills/sitecore-maintain-manifest.md`.

Primary MCP tools: `list_sites`, `get_content_item_by_path`, `get_page_template_by_id`, `list_avail_insertopts`, `create_page`, `create_content_item`, `update_fields_on_item`, `get_content_item_by_id`.
