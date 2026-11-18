import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const dir = path.dirname(fileURLToPath(import.meta.url));

// Snapshots captured from Marketer MCP (merged manually per task scope)
const sources = [
  ['for-patients.json', '665e0696-for-patients.snapshot.json'],
  ['our-locations.json', '442f9354-our-locations.snapshot.json'],
  ['urgent-care.json', '2ac3f529-urgent-care.snapshot.json'],
  ['financial-assistance.json', 'bdd734a2-financial.snapshot.json'],
  ['wjmc-root.json', '88244bb5-wjmc.snapshot.json'],
  ['listing-news.json', '9448567f-news.snapshot.json'],
  ['datasource-iconlink.json', 'a9e66ee4-iconlink.snapshot.json'],
  ['datasource-split.json', '03c50765-split.snapshot.json'],
  ['datasource-linkcolumns.json', 'e8cfdf60-linkcolumns.snapshot.json'],
  ['datasource-hero.json', 'bbfa1c82-hero.snapshot.json'],
];

for (const [target, source] of sources) {
  const src = path.join(dir, source);
  if (!fs.existsSync(src)) {
    console.error('MISSING', source);
    continue;
  }
  fs.copyFileSync(src, path.join(dir, target));
  console.log('OK', target);
}