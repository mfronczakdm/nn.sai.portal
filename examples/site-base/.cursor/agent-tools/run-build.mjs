import { spawnSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const r = spawnSync(process.execPath, ['build-mcw-updates.mjs'], { cwd: dir, encoding: 'utf8' });
process.stdout.write(r.stdout);
process.stderr.write(r.stderr);
process.exit(r.status ?? 1);