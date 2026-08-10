import { chromium } from '@playwright/test';
import { createServer } from 'node:http';
import { mkdir, readFile, stat } from 'node:fs/promises';
import { extname, join, normalize, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = resolve(fileURLToPath(new URL('..', import.meta.url)));
const referenceRoot = join(repoRoot, 'reference', 'newsstand-original');
const outputRoot = join(repoRoot, 'tests', 'baselines', 'newsstand-original');
const viewports = [
  ['desktop', 1440, 900],
  ['tablet', 768, 1024],
  ['mobile', 390, 844],
];
const mimeTypes = new Map([
  ['.html', 'text/html; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.css', 'text/css; charset=utf-8'],
  ['.svg', 'image/svg+xml'],
  ['.png', 'image/png'],
  ['.jpg', 'image/jpeg'],
  ['.jpeg', 'image/jpeg'],
  ['.webp', 'image/webp'],
  ['.woff2', 'font/woff2'],
]);

function safePath(pathname) {
  const requested =
    pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '');
  const normalized = normalize(requested);
  const resolved = resolve(referenceRoot, normalized);
  if (!resolved.startsWith(referenceRoot)) return null;
  return resolved;
}

const server = createServer(async (request, response) => {
  const url = new URL(request.url ?? '/', 'http://127.0.0.1');
  const filePath = safePath(decodeURIComponent(url.pathname));
  if (!filePath) {
    response.writeHead(403).end('Forbidden');
    return;
  }

  try {
    const fileStat = await stat(filePath);
    if (!fileStat.isFile()) throw new Error('Not a file');
    const body = await readFile(filePath);
    response.writeHead(200, {
      'Content-Type':
        mimeTypes.get(extname(filePath).toLowerCase()) ??
        'application/octet-stream',
      'Cache-Control': 'no-store',
    });
    response.end(body);
  } catch {
    response.writeHead(404).end('Not found');
  }
});

await new Promise((resolveListen) =>
  server.listen(0, '127.0.0.1', resolveListen),
);
const address = server.address();
if (!address || typeof address === 'string')
  throw new Error('Unable to start reference server.');
const url = `http://127.0.0.1:${address.port}/`;

const browser = await chromium.launch();
try {
  await mkdir(outputRoot, { recursive: true });
  for (const [name, width, height] of viewports) {
    const context = await browser.newContext({ viewport: { width, height } });
    const page = await context.newPage();
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    await page.getByText('CABALLERO!', { exact: false }).first().waitFor({
      state: 'visible',
      timeout: 15_000,
    });
    await page.evaluate(async () => {
      await document.fonts.ready;
    });
    await page
      .waitForLoadState('networkidle', { timeout: 5_000 })
      .catch(() => {});
    await page.waitForTimeout(750);
    const output = join(outputRoot, `${name}-${width}x${height}-cover.png`);
    await page.screenshot({ path: output, fullPage: false });
    console.log(`Captured ${output}`);
    await context.close();
  }
} finally {
  await browser.close();
  server.close();
}
