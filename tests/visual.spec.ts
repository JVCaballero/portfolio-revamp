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

test('Reviews shell full-page visual regression', async ({ page }) => {
  // Reduced motion settles scroll-reveal to its resting, fully-visible
  // final state (scroll-reveal.ts) and disables the cursor-preview plate
  // entirely (cursor-preview.ts), so the snapshot captures deterministic
  // layout rather than an arbitrary mid-reveal frame.
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/reviews/');

  await expect(page).toHaveScreenshot('reviews-shell.png', {
    fullPage: true,
  });
});

test('Interview shell full-page visual regression', async ({ page }) => {
  // Reduced motion settles scroll-reveal and the magnetic Rotation CTA to
  // their resting, fully-visible final state (scroll-reveal.ts,
  // magnetic-navigation.ts), so the snapshot captures deterministic layout
  // rather than an arbitrary mid-reveal frame.
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/interview/');

  await expect(page).toHaveScreenshot('interview-shell.png', {
    fullPage: true,
  });
});

test('Columns shell full-page visual regression', async ({ page }) => {
  // Reduced motion settles scroll-reveal to its resting, fully-visible
  // final state (scroll-reveal.ts) and disables the cursor-preview plate
  // entirely (cursor-preview.ts), so the snapshot captures deterministic
  // layout rather than an arbitrary mid-reveal frame.
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/columns/');

  await expect(page).toHaveScreenshot('columns-shell.png', {
    fullPage: true,
  });
});

test('Columns detail (production article template) full-page visual regression', async ({
  page,
}) => {
  // Sprint 2E: one representative route stands in for all five demo
  // slugs, since they all share the exact same template — the middle
  // slug is used because it is the only one with both a Previous and a
  // Next module present, giving the fullest layout coverage in one
  // baseline. Reduced motion settles scroll-reveal to its resting,
  // fully-visible final state and disables the cursor-preview plate
  // entirely, same rationale as the Columns Index baseline above.
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/columns/what-conducting-taught-me-about-standups/');

  await expect(page).toHaveScreenshot('columns-detail-shell.png', {
    fullPage: true,
  });
});

test('B-Sides shell full-page visual regression', async ({ page }) => {
  // Reduced motion settles scroll-reveal to its resting, fully-visible
  // final state (scroll-reveal.ts) — B-Sides has no cursor-preview plate
  // and no other page-local interaction module, so the snapshot captures
  // deterministic layout rather than an arbitrary mid-reveal frame.
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/b-sides/');
  // Four picsum.photos images load concurrently here (every other page's
  // baseline has at most one remote hero image), which can outrun a
  // screenshot taken immediately on --update-snapshots (no prior baseline
  // means no retry-until-stable comparison). Wait for all of them to
  // finish loading so the baseline captures real photos, not a mid-load
  // blank frame.
  await page.waitForFunction(() =>
    Array.from(document.images).every((img) => img.complete),
  );

  await expect(page).toHaveScreenshot('bsides-shell.png', {
    fullPage: true,
  });
});

test('Rotation shell full-page visual regression', async ({ page }) => {
  // Reduced motion settles scroll-reveal to its resting, fully-visible
  // final state (scroll-reveal.ts) — Rotation has no cursor-preview plate,
  // no remote images, and no other page-local interaction module, so the
  // snapshot captures deterministic layout rather than an arbitrary
  // mid-reveal frame.
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/rotation/');

  await expect(page).toHaveScreenshot('rotation-shell.png', {
    fullPage: true,
  });
});
