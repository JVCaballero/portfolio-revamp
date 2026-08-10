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
