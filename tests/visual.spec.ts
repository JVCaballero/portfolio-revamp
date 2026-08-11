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

test('Feature shell full-page visual regression', async ({ page }) => {
  // Reduced motion settles scroll-reveal/parallax/count-up/magnetic-nav to
  // their resting, fully-visible final state (scroll-reveal.ts,
  // parallax.ts, count-up.ts, magnetic-navigation.ts), so the snapshot
  // captures deterministic layout and final statistic values rather than
  // an arbitrary mid-animation frame.
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/feature/');

  await expect(page).toHaveScreenshot('feature-shell.png', {
    fullPage: true,
  });
});
