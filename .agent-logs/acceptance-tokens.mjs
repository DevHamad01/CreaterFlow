/**
 * Token acceptance for the flat-surface policy.
 *
 * The phase rule is: the Home hero H1 is the only gradient in the product.
 * Checking that with a plain `grep` is unreliable, because the codebase
 * documents these decisions in comments that necessarily name the classes
 * they removed — a line-based filter either misses those continuation lines
 * or misses real code. So this strips whole comment blocks first, then asserts
 * against what is actually shipped.
 *
 * Run: node .agent-logs/acceptance-tokens.mjs
 */
import fs from 'node:fs';
import path from 'node:path';

const SRC = 'D:/nanoo/CreaterFlow/src';
const ALLOW = {
  // The one sanctioned gradient: the Home hero H1 span.
  'Home.jsx': 1,
};

// Token definitions in index.css necessarily name the gradient, because that is
// where it is implemented. The definitions are not usages.
const TOKEN_DEFS = new Set(['index.css']);

const FUNCTIONAL = new Set(['skeleton.jsx']);

const walk = (dir) =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    return e.isDirectory() ? walk(p) : /\.(jsx?|css)$/.test(e.name) ? [p] : [];
  });

// Remove /* */ and // comments so the assertions only see shipped code.
const stripComments = (src) =>
  src
    .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '))
    .replace(/(^|[^:'"\\])\/\/[^\n]*/g, (m, p1) => p1 + ' '.repeat(m.length - p1.length));

const BRAND = /bg-brand-gradient|bg-brand-radial|from-primary\s+to-iris/g;
const TEXT_GRADIENT = /text-gradient/g;
const ANY_GRADIENT = /bg-gradient-to-/g;

const files = walk(SRC);
const hits = [];
for (const file of files) {
  const name = path.basename(file);
  const code = stripComments(fs.readFileSync(file, 'utf8'));
  for (const [label, re] of [
    ['brand-gradient', BRAND],
    ['text-gradient', TEXT_GRADIENT],
    ['bg-gradient-to-', ANY_GRADIENT],
  ]) {
    const lines = code.split('\n');
    lines.forEach((line, i) => {
      line.replace(re, () => {
        hits.push({ name, label, line: i + 1, text: line.trim() });
      });
    });
  }
}

const problems = [];
for (const hit of hits) {
  if (TOKEN_DEFS.has(hit.name)) continue;
  if (FUNCTIONAL.has(hit.name)) {
    if (hit.label !== 'bg-gradient-to-') {
      problems.push(`${hit.name}:${hit.line} functional file must only use bg-gradient-to- (${hit.label})`);
    }
    continue;
  }
  if (hit.label === 'text-gradient' && ALLOW[hit.name]) {
    ALLOW[hit.name] -= 1;
    continue;
  }
  problems.push(`${hit.name}:${hit.line}  ${hit.label}  ${hit.text}`);
}

for (const [name, budget] of Object.entries(ALLOW)) {
  if (budget !== 0) {
    problems.push(`${name}: expected ${budget} sanctioned text-gradient span(s), but the budget was not fully consumed`);
  }
}

console.log(`scanned ${files.length} files under ${SRC}`);
console.log(`allowed: Home hero H1 text-gradient (1), skeleton shimmer bg-gradient-to- (functional)\n`);
if (problems.length === 0) {
  console.log('ACCEPTANCE PASS: the only gradients in src are the Home hero H1 and the skeleton shimmer.');
  process.exit(0);
}
console.log(`ACCEPTANCE FAIL (${problems.length}):`);
for (const p of problems) console.log(`  ${p}`);
process.exit(1);
