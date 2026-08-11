import { expect, test } from '@playwright/test';

const primaryNavigation = [
  { label: 'Cover', href: '/' },
  { label: 'Feature', href: '/feature/' },
  { label: 'Reviews', href: '/reviews/' },
  { label: 'The Interview', href: '/interview/' },
  { label: 'Columns', href: '/columns/' },
  { label: 'B-Sides', href: '/b-sides/' },
  { label: 'Rotation', href: '/rotation/' },
  { label: 'Letters', href: '/letters/' },
] as const;

const routes = [
  { href: '/', heading: 'CABALLERO!', activeLabel: 'Cover' },
  { href: '/feature/', heading: 'Feature', activeLabel: 'Feature' },
  { href: '/reviews/', heading: 'Reviews', activeLabel: 'Reviews' },
  {
    href: '/interview/',
    heading: 'The Interview',
    activeLabel: 'The Interview',
  },
  { href: '/columns/', heading: 'Columns', activeLabel: 'Columns' },
  { href: '/b-sides/', heading: 'B-Sides', activeLabel: 'B-Sides' },
  { href: '/rotation/', heading: 'Rotation', activeLabel: 'Rotation' },
  { href: '/letters/', heading: 'Letters', activeLabel: 'Letters' },
  { href: '/resume/', heading: 'Resume', activeLabel: null },
] as const;

test('Sprint 0 root route is deployable without console errors', async ({
  page,
}) => {
  const consoleErrors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });

  const response = await page.goto('/');

  expect(response?.ok()).toBeTruthy();
  await expect(page).toHaveTitle(/CABALLERO!/);
  await expect(
    page.getByRole('heading', { level: 1, name: 'CABALLERO!' }),
  ).toBeVisible();
  await expect(page.locator('[data-sprint="0"]')).toBeVisible();
  expect(consoleErrors).toEqual([]);
});

test('Shared Newsstand navigation matches the approved primary chrome', async ({
  page,
}) => {
  await page.goto('/');

  const brand = page.getByRole('link', { name: 'CABALLERO!', exact: true });
  await expect(brand).toHaveAttribute('href', '/');
  await expect(page.getByText('Issue 05 · Aug 2026')).toBeVisible();
  await expect(page.getByText('Open to work · Nov 2026')).toBeVisible();

  const nav = page.getByRole('navigation', { name: 'Primary' });
  await expect(nav.getByRole('link')).toHaveCount(primaryNavigation.length);

  for (const item of primaryNavigation) {
    await expect(
      nav.getByRole('link', { name: item.label, exact: true }),
    ).toHaveAttribute('href', item.href);
  }

  await expect(
    nav.getByRole('link', { name: 'Cover', exact: true }),
  ).toHaveAttribute('aria-current', 'page');
  await expect(
    nav.getByRole('link', { name: 'Resume', exact: true }),
  ).toHaveCount(0);
  await expect(page.locator('[data-sprint="0"]')).toBeVisible();
});

for (const route of routes) {
  test(`${route.href} resolves directly and exposes the shared Newsstand shell`, async ({
    page,
  }) => {
    const response = await page.goto(route.href);

    expect(response?.ok()).toBeTruthy();
    expect(new URL(page.url()).pathname).toBe(route.href);
    await expect(
      page.getByRole('heading', { level: 1, name: route.heading }),
    ).toBeVisible();

    const nav = page.getByRole('navigation', { name: 'Primary' });
    await expect(nav.getByRole('link')).toHaveCount(primaryNavigation.length);
    await expect(
      nav.getByRole('link', { name: 'Resume', exact: true }),
    ).toHaveCount(0);

    for (const item of primaryNavigation) {
      const link = nav.getByRole('link', { name: item.label, exact: true });
      if (item.label === route.activeLabel) {
        await expect(link).toHaveAttribute('aria-current', 'page');
      } else {
        await expect(link).not.toHaveAttribute('aria-current', 'page');
      }
    }

    await expect(nav.locator('[aria-current="page"]')).toHaveCount(
      route.activeLabel ? 1 : 0,
    );

    const reloadResponse = await page.reload();
    expect(reloadResponse?.ok()).toBeTruthy();
    expect(new URL(page.url()).pathname).toBe(route.href);
    await expect(
      page.getByRole('heading', { level: 1, name: route.heading }),
    ).toBeVisible();
  });
}

test('Direct initial load does not activate the transition wipe', async ({
  page,
}) => {
  const consoleErrors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });

  await page.goto('/');

  const wipe = page.locator('[data-transition-wipe]');
  await expect(wipe).toHaveCount(1);
  await expect(wipe).not.toHaveClass(/is-active/);
  expect(consoleErrors).toEqual([]);
});

/**
 * Tags the current wipe element with a unique, random marker attribute so a
 * later locator scoped to that exact marker can only match the SAME DOM
 * node — never a freshly-arrived replacement element that merely satisfies
 * the `[data-transition-wipe]` selector. This is what catches the body-swap
 * defect: Astro's ClientRouter replaces the whole <body>, so an assertion
 * against the bare selector alone can pass by resolving a brand-new,
 * inactive wipe that arrived with the destination page.
 */
async function markWipeInstance(page: import('@playwright/test').Page) {
  return page.evaluate(() => {
    const bar = document.querySelector('[data-transition-wipe]');
    if (!bar) throw new Error('wipe element not found');
    const id = `wipe-instance-${Math.random().toString(36).slice(2)}`;
    bar.setAttribute('data-wipe-instance', id);
    return id;
  });
}

test('Client-side navigation activates the wipe and the same persisted node stays active across the Astro body swap', async ({
  page,
}) => {
  const consoleErrors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });

  await page.goto('/');
  const nav = page.getByRole('navigation', { name: 'Primary' });

  const marker = await markWipeInstance(page);
  const persistedWipe = page.locator(
    `[data-transition-wipe][data-wipe-instance="${marker}"]`,
  );

  const navigationStartedAt = Date.now();
  await nav.getByRole('link', { name: 'Feature', exact: true }).click();
  await expect(persistedWipe).toHaveClass(/is-active/);

  await expect(page).toHaveURL(/\/feature\/$/);
  await expect(
    page.getByRole('heading', { level: 1, name: 'Feature' }),
  ).toBeVisible();
  await expect(
    nav.getByRole('link', { name: 'Feature', exact: true }),
  ).toHaveAttribute('aria-current', 'page');

  // The marker was set before navigation, so this proves the exact same
  // node — not a replacement — survived the body swap and is still active.
  await expect(persistedWipe).toHaveCount(1);
  await expect(persistedWipe).toHaveClass(/is-active/);

  // Lower-bound only (never a brittle exact-duration assertion): the wipe
  // must still be running well after the swap has settled, proving the
  // lifetime did not collapse down to the swap itself.
  await page.waitForTimeout(150);
  await expect(persistedWipe).toHaveClass(/is-active/);

  await expect(persistedWipe).not.toHaveClass(/is-active/, { timeout: 2000 });
  expect(Date.now() - navigationStartedAt).toBeGreaterThan(300);

  expect(consoleErrors).toEqual([]);
});

test('A second client-side navigation triggers a fresh, complete wipe', async ({
  page,
}) => {
  const consoleErrors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });

  await page.goto('/');
  const nav = page.getByRole('navigation', { name: 'Primary' });
  const marker = await markWipeInstance(page);
  const persistedWipe = page.locator(
    `[data-transition-wipe][data-wipe-instance="${marker}"]`,
  );

  await nav.getByRole('link', { name: 'Feature', exact: true }).click();
  await expect(page).toHaveURL(/\/feature\/$/);
  await expect(persistedWipe).not.toHaveClass(/is-active/, { timeout: 2000 });

  // Still the same persisted node ahead of the second navigation.
  await expect(persistedWipe).toHaveCount(1);

  const secondNavStartedAt = Date.now();
  await nav.getByRole('link', { name: 'Reviews', exact: true }).click();
  await expect(persistedWipe).toHaveClass(/is-active/);
  await expect(page).toHaveURL(/\/reviews\/$/);
  await expect(
    page.getByRole('heading', { level: 1, name: 'Reviews' }),
  ).toBeVisible();
  await expect(persistedWipe).toHaveClass(/is-active/);
  await expect(persistedWipe).not.toHaveClass(/is-active/, { timeout: 2000 });
  expect(Date.now() - secondNavStartedAt).toBeGreaterThan(300);

  expect(consoleErrors).toEqual([]);
});

test('Browser back navigation triggers the custom wipe and resolves the correct destination', async ({
  page,
}) => {
  await page.goto('/');
  const nav = page.getByRole('navigation', { name: 'Primary' });
  const wipe = page.locator('[data-transition-wipe]');

  await nav.getByRole('link', { name: 'Feature', exact: true }).click();
  await expect(page).toHaveURL(/\/feature\/$/);
  await nav.getByRole('link', { name: 'Reviews', exact: true }).click();
  await expect(page).toHaveURL(/\/reviews\/$/);
  await expect(wipe).not.toHaveClass(/is-active/, { timeout: 2000 });

  const backNavigation = page.goBack();
  await expect(wipe).toHaveClass(/is-active/);
  await backNavigation;

  await expect(page).toHaveURL(/\/feature\/$/);
  await expect(
    page.getByRole('heading', { level: 1, name: 'Feature' }),
  ).toBeVisible();
  await expect(
    nav.getByRole('link', { name: 'Feature', exact: true }),
  ).toHaveAttribute('aria-current', 'page');
  await expect(wipe).not.toHaveClass(/is-active/, { timeout: 2000 });
});

test('Browser forward navigation triggers the custom wipe and resolves the correct destination', async ({
  page,
}) => {
  await page.goto('/');
  const nav = page.getByRole('navigation', { name: 'Primary' });
  const wipe = page.locator('[data-transition-wipe]');

  await nav.getByRole('link', { name: 'Feature', exact: true }).click();
  await expect(page).toHaveURL(/\/feature\/$/);
  await nav.getByRole('link', { name: 'Reviews', exact: true }).click();
  await expect(page).toHaveURL(/\/reviews\/$/);
  await page.goBack();
  await expect(page).toHaveURL(/\/feature\/$/);
  await expect(wipe).not.toHaveClass(/is-active/, { timeout: 2000 });

  const forwardNavigation = page.goForward();
  await expect(wipe).toHaveClass(/is-active/);
  await forwardNavigation;

  await expect(page).toHaveURL(/\/reviews\/$/);
  await expect(
    page.getByRole('heading', { level: 1, name: 'Reviews' }),
  ).toBeVisible();
  await expect(
    nav.getByRole('link', { name: 'Reviews', exact: true }),
  ).toHaveAttribute('aria-current', 'page');
  await expect(wipe).not.toHaveClass(/is-active/, { timeout: 2000 });
});

test('Reload after client-side navigation resolves the direct route and does not behave like a client-navigation wipe', async ({
  page,
}) => {
  await page.goto('/');
  const nav = page.getByRole('navigation', { name: 'Primary' });
  const wipe = page.locator('[data-transition-wipe]');

  await nav.getByRole('link', { name: 'Reviews', exact: true }).click();
  await expect(page).toHaveURL(/\/reviews\/$/);
  await expect(wipe).not.toHaveClass(/is-active/, { timeout: 2000 });

  const reloadResponse = await page.reload();
  expect(reloadResponse?.ok()).toBeTruthy();
  expect(new URL(page.url()).pathname).toBe('/reviews/');
  await expect(
    page.getByRole('heading', { level: 1, name: 'Reviews' }),
  ).toBeVisible();

  // A full reload is not a client-side navigation: the wipe must come back
  // in its inactive resting state, not mid-sweep.
  await expect(wipe).toHaveCount(1);
  await expect(wipe).not.toHaveClass(/is-active/);
});

test('prefers-reduced-motion navigation works without a visible animated wipe', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const consoleErrors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });

  await page.goto('/');
  const wipe = page.locator('[data-transition-wipe]');
  const nav = page.getByRole('navigation', { name: 'Primary' });

  await nav.getByRole('link', { name: 'Feature', exact: true }).click();
  await expect(wipe).not.toHaveClass(/is-active/);
  await expect(page).toHaveURL(/\/feature\/$/);
  await expect(
    page.getByRole('heading', { level: 1, name: 'Feature' }),
  ).toBeVisible();
  await expect(wipe).not.toHaveClass(/is-active/);

  expect(consoleErrors).toEqual([]);
});

test('Unknown routes resolve through the custom 404 page', async ({ page }) => {
  const response = await page.goto('/this-route-does-not-exist/');

  expect(response?.status()).toBe(404);
  await expect(page).toHaveTitle('Not found | CABALLERO!');
  await expect(
    page.getByRole('heading', { level: 1, name: 'Page not found' }),
  ).toBeVisible();
  await expect(
    page.getByRole('link', { name: 'Return to the cover.' }),
  ).toHaveAttribute('href', '/');
});
