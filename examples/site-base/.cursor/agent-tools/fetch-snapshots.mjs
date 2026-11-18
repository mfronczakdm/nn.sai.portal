/**
 * Write snapshot JSON files for Marketer get_content_item_by_id responses.
 * Paste full JSON as first argument or pipe to stdin:
 *   node fetch-snapshots.mjs 665e0696-for-patients.snapshot.json < response.json
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const outName = process.argv[2];
if (!outName) {
  console.error('Usage: node fetch-snapshots.mjs <filename> [json-string]');
  process.exit(1);
}

let raw = process.argv[3];
if (!raw) raw = fs.readFileSync(0, 'utf8');
const data = JSON.parse(raw);
fs.writeFileSync(path.join(dir, outName), JSON.stringify(data, null, 2));
console.log('Wrote', outName);