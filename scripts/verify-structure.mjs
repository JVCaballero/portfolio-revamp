import { access } from 'node:fs/promises';

const requiredPaths = [
  'reference/newsstand-original',
  'src/components',
  'src/layouts',
  'src/pages',
  'src/content',
  'src/data',
  'src/scripts/interactions',
  'src/styles',
  'src/assets',
  'public/resume',
  'tests',
  '.github/workflows/ci.yml',
  'AGENTS.md',
  'README.md',
  'wrangler.jsonc',
];

const missing = [];
for (const path of requiredPaths) {
  try {
    await access(new URL(`../${path}`, import.meta.url));
  } catch {
    missing.push(path);
  }
}

if (missing.length > 0) {
  console.error('Repository structure is incomplete:');
  for (const path of missing) console.error(`- ${path}`);
  process.exit(1);
}

console.log(
  `Repository structure OK: ${requiredPaths.length} required paths present.`,
);
