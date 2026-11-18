import fs from 'fs';
import path from 'path';
import { collectFieldUpdates, walkNodes } from './mcw-rebrand-transform.mjs';

const roots = [
  { file: '665e0696-for-patients.snapshot.json', westJeffersonOnly: false, skipRoot: true },
  { file: 'bdd734a2-financial.snapshot.json', westJeffersonOnly: false, skipRoot: false },
  { file: '442f9354-our-locations.snapshot.json', westJeffersonOnly: false, skipRoot: true },
  { file: '2ac3f529-urgent-care.snapshot.json', westJeffersonOnly: false, skipRoot: false },
  { file: '88244bb5-wjmc.snapshot.json', westJeffersonOnly: true, skipRoot: false },
  { file: 'wjmc-our-services.json', westJeffersonOnly: true, skipRoot: false },
  { file: '9448567f-news.snapshot.json', westJeffersonOnly: false, skipRoot: false },
  { file: 'a9e66ee4-iconlink.snapshot.json', westJeffersonOnly: false, skipRoot: false },
  { file: '03c50765-split.snapshot.json', westJeffersonOnly: false, skipRoot: false },
  { file: 'e8cfdf60-linkcolumns.snapshot.json', westJeffersonOnly: false, skipRoot: false },
  { file: 'bbfa1c82-hero.snapshot.json', westJeffersonOnly: false, skipRoot: false },
];

const dir = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1'));

const seen = new Map();

for (const { file, westJeffersonOnly, skipRoot } of roots) {
  const full = path.join(dir, file);
  if (!fs.existsSync(full)) {
    console.warn('Skipping missing', file);
    continue;
  }
  const root = JSON.parse(fs.readFileSync(full, 'utf8'));
  const items = walkNodes(root);
  if (skipRoot && items[0]?.itemId === root.itemId) items.shift();
  for (const item of items) {
    if (!item.fields || Object.keys(item.fields).length === 0) continue;
    const updates = collectFieldUpdates(item.fields, { westJeffersonOnly });
    if (updates.length === 0) continue;
    seen.set(item.itemId, {
      itemId: item.itemId,
      path: item.path,
      westJeffersonOnly,
      fields: updates,
    });
  }
}

const out = [...seen.values()];
fs.writeFileSync(path.join(dir, 'mcw-updates.json'), JSON.stringify(out, null, 2));
console.log(`Prepared ${out.length} item updates`);