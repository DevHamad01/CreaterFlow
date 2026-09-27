/**
 * Runs every offline harness in sequence and summarises.
 *
 *   npm test
 *
 * These are the regression checks for markup, contrast, SSR and shared page
 * contracts. They make real network calls only via ai-live-check.mjs, which is
 * deliberately NOT part of this list; run that separately with `npm run check:ai`.
 */
import { spawn } from 'node:child_process';
import fs from 'node:fs';

const DIR = new URL('.', import.meta.url).pathname.replace(/^\//, '').replace(/\/$/, '');
// Harnesses write artifacts to `.agent-logs/...` and read from `src/...`, both
// relative to the repo root, so the child must run from the root.
const ROOT = new URL('../', import.meta.url).pathname.replace(/^\//, '').replace(/\/$/, '');
const EXCLUDE = new Set([
  'dom-shims.mjs',
  'run-all.mjs',
  'doctor.mjs',
  'ai-live-check.mjs',
  // One-off contrast solver, not a regression check.
  'solve-primary-contrast.mjs',
]);

const harnesses = fs
  .readdirSync(DIR)
  .filter((f) => f.endsWith('.mjs') && !EXCLUDE.has(f))
  .sort();

const run = (file) =>
  new Promise((resolve) => {
    const child = spawn(process.execPath, [`${DIR}/${file}`], { cwd: ROOT, stdio: ['ignore', 'pipe', 'pipe'] });
    let out = '';
    child.stdout.on('data', (d) => (out += d));
    child.stderr.on('data', (d) => (out += d));
    child.on('close', (code) => resolve({ code, out }));
  });

const failed = [];
for (const file of harnesses) {
  const { code, out } = await run(file);
  const name = file.replace(/\.mjs$/, '');
  if (code === 0) {
    const last = out.trim().split('\n').filter(Boolean).pop() || '';
    console.log(`PASS  ${name.padEnd(26)} ${last.slice(0, 70)}`);
  } else {
    failed.push(name);
    console.log(`FAIL  ${name}`);
    console.log(out.trim().split('\n').slice(-10).map((l) => `        ${l}`).join('\n'));
  }
}

console.log(`\n${'-'.repeat(60)}`);
console.log(`${harnesses.length - failed.length}/${harnesses.length} harnesses passed.`);
if (failed.length) {
  console.log(`Failed: ${failed.join(', ')}`);
  process.exit(1);
}
