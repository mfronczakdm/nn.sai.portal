import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const file = process.argv[2] || 'batch-updates.json';
const updates = JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8'));
for (const u of updates) {
  console.log(
    JSON.stringify({
      itemId: u.itemId,
      path: u.path,
      siteName: 'mcw',
      language: 'en',
      fields: u.fields,
    })
  );
}