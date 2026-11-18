import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { collectFieldUpdates, walkNodes } from './mcw-rebrand-transform.mjs';

const dir = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const wj = args.includes('--wj');
const files = args.filter((a) => !a.startsWith('--'));

const updates = [];
for (const file of files) {
  const full = path.join(dir, file);
  const root = JSON.parse(fs.readFileSync(full, 'utf8'));
  for (const item of walkNodes(root)) {
    if (!item.fields || !Object.keys(item.fields).length) continue;
    const fields = collectFieldUpdates(item.fields, {
      westJeffersonOnly: wj || item.path?.includes('West Jefferson Medical Center'),
    });
    if (fields.length) updates.push({ itemId: item.itemId, path: item.path, fields });
  }
}
fs.writeFileSync(path.join(dir, 'batch-updates.json'), JSON.stringify(updates, null, 2));
console.log(`batch ${updates.length} items`);