/**
 * Runs the dev pipeline with NODE_OPTIONS cleared for child processes so parallel
 * Next + Sitecore CLI workers do not fight over inspector ports (9229 / 9230).
 *
 * If `npm run dev` still prints "Starting inspector ... failed" at the top, that comes
 * from npm itself when your terminal injects NODE_OPTIONS=--inspect (JavaScript Debug
 * Terminal, Cursor auto-attach, or a Windows user env var). Use a normal terminal,
 * remove NODE_OPTIONS for the session (`Remove-Item Env:NODE_OPTIONS` in PowerShell),
 * or start the dev pipeline directly (no npm wrapper):
 *   node --no-inspect ./scripts/run-dev.cjs
 */
const { spawnSync } = require('child_process');
const path = require('path');

const root = path.join(__dirname, '..');
const npmRunAll = path.join(root, 'node_modules/npm-run-all2/bin/npm-run-all/index.js');

const env = {
  ...process.env,
  NODE_ENV: 'development',
  NODE_OPTIONS: '',
};

const args = [
  npmRunAll,
  '--serial',
  'sitecore-tools:generate-map',
  'sitecore-tools:build',
  '--parallel',
  'next:dev',
  'sitecore-tools:generate-map:watch',
];

const result = spawnSync(process.execPath, ['--no-inspect', ...args], {
  cwd: root,
  env,
  stdio: 'inherit',
});

process.exit(result.status === null ? 1 : result.status);
