import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';

const expected = new Map([
  [
    'README.txt',
    'e1db782fe575342a4a78bdfb72fc25e695761728161a3d4ae369a5f03e0368fd',
  ],
  [
    'index.html',
    '2023e03d8a6cc8dd2a89343c5769d13171c633972ffc075da54a01302198cdfd',
  ],
  [
    'source/Newsstand - Full Site.dc.html',
    '01f294e5b7f2340ced99cec390017e75ee9baffc3ee126707242b8d74578827c',
  ],
  [
    'source/support.js',
    '8fe7df74405f3c55f49b7249c74ea1397e65d07dea2b1bd3b4a489bec2e28cbe',
  ],
]);

let failed = false;
for (const [relativePath, expectedHash] of expected) {
  try {
    const data = await readFile(
      new URL(
        `../reference/newsstand-original/${relativePath}`,
        import.meta.url,
      ),
    );
    const actualHash = createHash('sha256').update(data).digest('hex');
    if (actualHash !== expectedHash) {
      failed = true;
      console.error(`MISMATCH ${relativePath}`);
      console.error(`  expected ${expectedHash}`);
      console.error(`  actual   ${actualHash}`);
    } else {
      console.log(`OK ${relativePath}`);
    }
  } catch (error) {
    failed = true;
    console.error(`MISSING ${relativePath}: ${error.message}`);
  }
}

if (failed) process.exit(1);
console.log(
  'Immutable Newsstand reference verified: all 4 files match the locked archive.',
);
