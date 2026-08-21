// Every target in package.json's `exports` map has to exist in the build.
//
// The subpath entries are easy to get wrong: vite flattens the JS bundles to
// dist/<entry>.js, but vite-plugin-dts mirrors the source tree, so the types
// for src/entries/model.ts land at dist/entries/model.d.ts. A types path that
// points at a file the build never emits fails silently — the runtime import
// resolves, and only consumers running tsc ever see it.
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const { exports: map } = require(path.join(root, 'package.json'));

const targets = [];

const collect = (value, trail) => {
  if (typeof value === 'string') return targets.push([trail, value]);
  for (const [key, nested] of Object.entries(value)) collect(nested, `${trail}.${key}`);
};

for (const [key, value] of Object.entries(map)) {
  // Wildcard subpaths (./assets/*) name a directory, not a file.
  if (key.includes('*')) continue;
  collect(value, key);
}

const missing = targets.filter(([, target]) => !fs.existsSync(path.join(root, target)));

if (missing.length) {
  console.error('package.json "exports" points at files the build did not emit:\n');
  for (const [trail, target] of missing) console.error(`  ${trail} -> ${target}`);
  console.error('\nFix the exports map, or the build so it emits these paths.');
  process.exit(1);
}

console.log(`verify-exports: ${targets.length} export targets present`);
