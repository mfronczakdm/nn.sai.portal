import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const updates = JSON.parse(fs.readFileSync(path.join(dir, 'mcw-updates.json'), 'utf8'));
const out = { ok: [], fail: [] };
for (const u of updates) {
  out.ok.push({ itemId: u.itemId, path: u.path, fieldCount: u.fields.length });
}
fs.writeFileSync(path.join(dir, 'mcw-apply-plan.json'), JSON.stringify(out, null, 2));
console.log(JSON.stringify(updates.map((u) => ({ itemId: u.itemId, path: u.path, fields: u.fields.length }))));