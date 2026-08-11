import { expect, test } from '@playwright/test';

test('Cover shell full-page visual regression', async ({ page }) => {
  // Reduced motion gives deterministic structural evidence: the Cover-local
  // entrance/badge/handwriting animations collapse instantly, so the
  // snapshot captures settled layout rather than an arbitrary mid-animation
  // frame.
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');

  await expect(page).toHaveScreenshot('cover-shell.png', { fullPage: true });
});
