import fs from 'fs';
import { collectFieldUpdates } from './mcw-rebrand-transform.mjs';

const itemPath = process.argv[2];
const wj = process.argv[3] === 'wj';
const item = JSON.parse(fs.readFileSync(itemPath, 'utf8'));
const fields = collectFieldUpdates(item.fields, { westJeffersonOnly: wj });
const out = { itemId: item.itemId, path: item.path, fields };
console.log(JSON.stringify(out));
process.exit(fields.length ? 0 : 2);