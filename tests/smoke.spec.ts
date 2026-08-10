import { expect, test } from '@playwright/test';

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
