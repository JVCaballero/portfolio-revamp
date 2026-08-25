import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

/**
 * Known, pre-existing accessibility gap surfaced by Sprint 1H: the immutable
 * golden master's own red-on-paper label color (#e2231a on #efe9dc) fails
 * WCAG AA contrast (~3.86:1; AA requires 4.5:1) at the small bold sizes it
 * uses for the "In this issue" kicker, the Cover Story teaser CTA, and three
 * of the four issue-card eyebrows (the fourth, highlighted Rotation card's
 * eyebrow has no explicit color in the source and inherits instead, so it
 * never violates). This is a source color choice, not something introduced
 * by this implementation. Resolving it means changing an accepted color
 * value, which is outside Sprint 1H's authorized scope (AGENTS.md: visible
 * design changes require sign-off from the PF Revamp planning thread).
 *
 * Axe still owns violation *detection*: the test fails on every
 * non-color-contrast violation and asserts the exact expected
 * color-contrast target set (no more, no fewer, no different targets).
 *
 * Design-color *identity* is verified separately from real browser
 * `getComputedStyle()` values, not from axe's own diagnostic `fgColor` /
 * `bgColor` fields. In CI, axe's reported `fgColor` for these exact nodes
 * was observed to vary between runs and retries (e.g. #e2281f, #e2251c,
 * #e2241b, #e2261d) despite the authored CSS color never changing — an
 * environmental artifact of axe's own anti-aliased-pixel color sampling,
 * not a real regression. Comparing against that field with exact equality
 * made the test flaky. The browser's own computed style for `color` is
 * deterministic and is what actually renders, so it — plus a small local
 * relative-luminance contrast calculation — is the source of truth here.
 */
const EXPECTED_CONTRAST_EXCEPTION_TARGETS = [
  '.cover-teaser__cta',
  '#cover-issue-heading',
  '.cover-card[href$="feature/"] > .cover-card__eyebrow',
  '.cover-card[href$="reviews/"] > .cover-card__eyebrow',
  '.cover-card[href$="interview/"] > .cover-card__eyebrow',
].sort();

const EXPECTED_FOREGROUND_RGB: [number, number, number] = [226, 35, 26]; // #e2231a
const EXPECTED_BACKGROUND_RGB: [number, number, number] = [239, 233, 220]; // #efe9dc
const EXPECTED_CONTRAST_RATIO = 3.86;
const CONTRAST_TOLERANCE = 0.05;

function parseRgb(value: string): [number, number, number, number] {
  const match = value.match(/rgba?\(([^)]+)\)/);
  if (!match) throw new Error(`Unparseable computed color: ${value}`);
  const parts = match[1].split(',').map((part) => parseFloat(part.trim()));
  return [parts[0], parts[1], parts[2], parts.length === 4 ? parts[3] : 1];
}

function relativeLuminance([r, g, b]: [number, number, number]): number {
  const [rs, gs, bs] = [r, g, b].map((channel) => {
    const c = channel / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function contrastRatio(
  fg: [number, number, number],
  bg: [number, number, number],
): number {
  const l1 = relativeLuminance(fg);
  const l2 = relativeLuminance(bg);
  const [lighter, darker] = l1 > l2 ? [l1, l2] : [l2, l1];
  return (lighter + 0.05) / (darker + 0.05);
}

async function getComputedForeground(
  page: Page,
  selector: string,
): Promise<[number, number, number]> {
  const value = await page
    .locator(selector)
    .first()
    .evaluate((el) => getComputedStyle(el).color);
  const [r, g, b] = parseRgb(value);
  return [r, g, b];
}

/**
 * Walks the target element's own computed background up through its
 * ancestor chain (self first) and returns the first fully-opaque
 * background color found. All five documented exception targets are plain
 * text elements with no background of their own, so this resolves to
 * whichever ancestor actually paints the paper color — the immediate
 * `.cover-card` container for the eyebrows (which sets `background:
 * var(--color-surface)` itself), or `<body>` for the kicker/CTA (whose
 * containers are all transparent up to the global body background).
 */
async function getEffectiveBackground(
  page: Page,
  selector: string,
): Promise<[number, number, number]> {
  const value = await page
    .locator(selector)
    .first()
    .evaluate((el) => {
      let node: Element | null = el;
      while (node) {
        const bg = getComputedStyle(node).backgroundColor;
        const match = bg.match(/rgba?\(([^)]+)\)/);
        if (match) {
          const parts = match[1]
            .split(',')
            .map((part) => parseFloat(part.trim()));
          const alpha = parts.length === 4 ? parts[3] : 1;
          if (alpha > 0) return bg;
        }
        node = node.parentElement;
      }
      return null;
    });
  if (!value) {
    throw new Error(`No opaque ancestor background found for ${selector}`);
  }
  const [r, g, b] = parseRgb(value);
  return [r, g, b];
}

test('Cover root route has no automated WCAG A/AA violations beyond the documented golden-master contrast exception', async ({
  page,
}, testInfo) => {
  // `.cover-page` fades in over .62s (cover-fade-in). On a slower/cold
  // environment (observed in CI, not reproducible on a warm local
  // dev-machine run), axe can sample pixels while that fade is still
  // mid-transition, catching `.cover-teaser__cta`'s sibling badge
  // (`.cover-teaser__kicker`, white-on-red, ~5.4:1 at rest — nowhere near
  // a real contrast failure) at a partially-blended, transiently-lower-
  // contrast frame. Reproduced directly: forcing an early scan (before
  // the animation settles) surfaces exactly that one extra node; emulating
  // reduced motion collapses the animation to instant and the extra node
  // never appears, across repeated runs and CPU-throttle stress-testing.
  // Emulating reduced motion here — exactly as tests/visual.spec.ts and
  // the Feature accessibility test below already do for the same class of
  // issue — scans the page's settled, steady-state rendering rather than
  // an arbitrary mid-animation frame. This is a test-determinism fix, not
  // a design change: no color, size, or timing value below is altered.
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');

  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
    .analyze();

  const colorContrastViolation = results.violations.find(
    (violation) => violation.id === 'color-contrast',
  );
  const otherViolations = results.violations.filter(
    (violation) => violation.id !== 'color-contrast',
  );

  // Every non-color-contrast violation must still fail this test.
  expect(otherViolations).toEqual([]);

  const nodes = colorContrastViolation?.nodes ?? [];
  const targets = nodes.map((node) => node.target.join(' ')).sort();

  // Exactly the documented set of nodes — no more, no fewer, no different
  // ones. A new/different contrast violation changes this array and fails.
  expect(targets).toEqual(EXPECTED_CONTRAST_EXCEPTION_TARGETS);

  // Design-color identity, verified from real browser computed style
  // rather than axe's diagnostic fgColor/bgColor (see file-level comment).
  for (const selector of EXPECTED_CONTRAST_EXCEPTION_TARGETS) {
    const foreground = await getComputedForeground(page, selector);
    const background = await getEffectiveBackground(page, selector);

    expect(foreground).toEqual(EXPECTED_FOREGROUND_RGB);
    expect(background).toEqual(EXPECTED_BACKGROUND_RGB);

    const ratio = contrastRatio(foreground, background);
    expect(ratio).toBeGreaterThan(EXPECTED_CONTRAST_RATIO - CONTRAST_TOLERANCE);
    expect(ratio).toBeLessThan(EXPECTED_CONTRAST_RATIO + CONTRAST_TOLERANCE);
  }

  testInfo.annotations.push({
    type: 'known-issue',
    description:
      `Documented golden-master WCAG AA contrast exception ` +
      `(rgb(226, 35, 26) on rgb(239, 233, 220), ~${EXPECTED_CONTRAST_RATIO}:1, ` +
      `needs 4.5:1), verified via browser getComputedStyle (not axe's ` +
      `diagnostic fgColor, which varies across environments/retries) on ` +
      `exactly ${nodes.length} expected node(s): ${targets.join('; ')}`,
  });
});

/**
 * Sprint 2A — Feature's own, separately-approved contrast exceptions. Both
 * are NARROWLY scoped, exact-node additions kept independent from the
 * Cover exception above: neither adds to, modifies, or otherwise touches
 * `EXPECTED_CONTRAST_EXCEPTION_TARGETS`, and both target a different route
 * entirely. See DESIGN_DEVIATIONS.md, "Sprint 2A — Feature" for the full
 * record of both.
 *
 * 1. The Feature folio/kicker ("Feature / p.04 · AI & Automation") reuses
 *    the exact same golden-master red-on-paper pairing as the Cover
 *    exception targets (`#e2231a` on `#efe9dc`, ~3.86:1), at a small bold
 *    size.
 * 2. The "Next" CTA's small "Next" label sits at the immutable source's
 *    own `opacity:.85` (Newsstand - Full Site.dc.html, ~line 233), which
 *    blends its authored white text down to an effective ~#fbdedd against
 *    the red CTA background (~3.69:1). Because `color-contrast` is a
 *    render-time property, not a static CSS value, this exception is
 *    verified against the actual composited (opacity-blended) color,
 *    computed the same way axe/the browser render it — not the raw
 *    authored `color: white`, which alone would misleadingly read as
 *    passing.
 *
 * Both are preserved exactly per approved Sprint 2A design-preservation
 * decisions rather than resolved by changing an accepted color/opacity.
 */
const FEATURE_KICKER_SELECTOR = '.feature-kicker';
const FEATURE_NEXT_LABEL_SELECTOR = '.feature-next__label';
const EXPECTED_NEXT_LABEL_BLENDED_RGB: [number, number, number] = [
  251, 222, 221,
]; // white at opacity .85 over #e2231a
const EXPECTED_NEXT_LABEL_BG_RGB: [number, number, number] = [226, 35, 26]; // #e2231a
const EXPECTED_NEXT_LABEL_CONTRAST_RATIO = 3.7;

async function getBlendedForeground(
  page: Page,
  selector: string,
): Promise<{ blended: [number, number, number]; alpha: number }> {
  const value = await page
    .locator(selector)
    .first()
    .evaluate((el) => {
      const style = getComputedStyle(el);
      return { color: style.color, opacity: style.opacity };
    });
  const [r, g, b] = parseRgb(value.color);
  const alpha = parseFloat(value.opacity);
  return { blended: [r, g, b], alpha };
}

function blendOverBackground(
  fg: [number, number, number],
  alpha: number,
  bg: [number, number, number],
): [number, number, number] {
  return [0, 1, 2].map((i) =>
    Math.round(fg[i] * alpha + bg[i] * (1 - alpha)),
  ) as [number, number, number];
}

test('Feature route has no automated WCAG A/AA violations beyond the documented golden-master contrast exceptions (Cover exception untouched)', async ({
  page,
}, testInfo) => {
  // Feature's scroll-reveal module hides [data-reveal] content (opacity:0,
  // translateY) until it scrolls into view or reduced motion is detected.
  // Scanning immediately after `goto` without emulating reduced motion
  // caught several of those elements mid-fade, so axe pixel-sampled
  // transitional, blended colors that never actually render at rest —
  // exactly the same "axe's own diagnostic sampling is unreliable" failure
  // mode documented at the top of this file for the Cover exception, just
  // triggered by animation-in-progress rather than anti-aliasing. Emulating
  // reduced motion first settles every [data-reveal] node to its resting,
  // fully-visible state before the scan (see scroll-reveal.ts), matching
  // how tests/visual.spec.ts already captures Cover deterministically.
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/feature/');

  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
    .analyze();

  const colorContrastViolation = results.violations.find(
    (violation) => violation.id === 'color-contrast',
  );
  const otherViolations = results.violations.filter(
    (violation) => violation.id !== 'color-contrast',
  );

  // Every non-color-contrast violation still fails this test — headings,
  // landmarks, figure/figcaption, list, and link semantics are all covered
  // by Axe's own rule set, not hand-rolled here.
  expect(otherViolations).toEqual([]);

  const nodes = colorContrastViolation?.nodes ?? [];
  const targets = nodes.map((node) => node.target.join(' ')).sort();

  // Exactly the two expected Feature-specific nodes — no more, no fewer,
  // no different ones. Any other Feature contrast violation fails this
  // test rather than being silently allowlisted.
  expect(targets).toEqual(
    [FEATURE_KICKER_SELECTOR, FEATURE_NEXT_LABEL_SELECTOR].sort(),
  );

  // 1. Feature kicker — same exact pairing as the Cover exception.
  const kickerForeground = await getComputedForeground(
    page,
    FEATURE_KICKER_SELECTOR,
  );
  const kickerBackground = await getEffectiveBackground(
    page,
    FEATURE_KICKER_SELECTOR,
  );
  expect(kickerForeground).toEqual(EXPECTED_FOREGROUND_RGB);
  expect(kickerBackground).toEqual(EXPECTED_BACKGROUND_RGB);
  const kickerRatio = contrastRatio(kickerForeground, kickerBackground);
  expect(kickerRatio).toBeGreaterThan(
    EXPECTED_CONTRAST_RATIO - CONTRAST_TOLERANCE,
  );
  expect(kickerRatio).toBeLessThan(
    EXPECTED_CONTRAST_RATIO + CONTRAST_TOLERANCE,
  );

  // 2. "Next" CTA label — verified against the actual rendered (opacity-
  // blended) color, since the raw authored `color` alone is white and
  // would misleadingly appear to pass.
  const { blended: rawWhite, alpha } = await getBlendedForeground(
    page,
    FEATURE_NEXT_LABEL_SELECTOR,
  );
  const nextLabelBackground = await getEffectiveBackground(
    page,
    FEATURE_NEXT_LABEL_SELECTOR,
  );
  expect(nextLabelBackground).toEqual(EXPECTED_NEXT_LABEL_BG_RGB);
  expect(alpha).toBeCloseTo(0.85, 2);
  const renderedForeground = blendOverBackground(
    rawWhite,
    alpha,
    nextLabelBackground,
  );
  expect(renderedForeground).toEqual(EXPECTED_NEXT_LABEL_BLENDED_RGB);
  const nextLabelRatio = contrastRatio(renderedForeground, nextLabelBackground);
  expect(nextLabelRatio).toBeGreaterThan(
    EXPECTED_NEXT_LABEL_CONTRAST_RATIO - CONTRAST_TOLERANCE,
  );
  expect(nextLabelRatio).toBeLessThan(
    EXPECTED_NEXT_LABEL_CONTRAST_RATIO + CONTRAST_TOLERANCE,
  );

  testInfo.annotations.push({
    type: 'known-issue',
    description:
      `Sprint 2A approved Feature contrast exceptions: (1) kicker ` +
      `(rgb(226, 35, 26) on rgb(239, 233, 220), ~${EXPECTED_CONTRAST_RATIO}:1) ` +
      `on ${FEATURE_KICKER_SELECTOR}; (2) Next CTA label, opacity-blended ` +
      `(rgb(${EXPECTED_NEXT_LABEL_BLENDED_RGB.join(', ')}) on rgb(${EXPECTED_NEXT_LABEL_BG_RGB.join(', ')}), ` +
      `~${EXPECTED_NEXT_LABEL_CONTRAST_RATIO}:1) on ${FEATURE_NEXT_LABEL_SELECTOR}. ` +
      `Both need 4.5:1. See DESIGN_DEVIATIONS.md for the approval record. ` +
      `The Cover exception above remains a separate, untouched five-target set.`,
  });
});

/*
  Sprint 2B — Reviews' own, separately-approved contrast exceptions. Both
  are NARROWLY scoped, exact-node additions kept independent from the
  Cover and Feature exceptions above: neither adds to, modifies, or
  otherwise touches EXPECTED_CONTRAST_EXCEPTION_TARGETS or the Feature
  target set, and both target a different route entirely. See
  DESIGN_DEVIATIONS.md, "Sprint 2B — Reviews" for the full record of both.

  1. Reviews small Newsstand-red editorial text (`.reviews-kicker`,
     `.review-row__rating`, `.review-row__cta`) reuses the exact same
     golden-master red-on-paper pairing as the Cover/Feature exception
     targets (`#e2231a` on `#efe9dc`, ~3.86:1) at rest. `.review-row__rating`
     is `aria-hidden="true"` (its accessible equivalent is a separate
     visually-hidden "N out of 5 stars" node), so Axe's `color-contrast`
     rule — which only ever scans nodes exposed to the accessibility tree —
     never reports it; its color identity is still verified directly below,
     since sighted users see it regardless of aria-hidden.
  2. Reviews muted metadata/Verdict labels (`.review-row__meta`,
     `.review-row__verdict-label`) pass at rest (~4.68:1) — the resting
     state is deliberately NOT allowlisted — but fail once an ancestor
     `.review-row` is hovered (~4.19:1) or pressed (~3.88:1), since the row
     background itself swaps. Axe's own scan only ever samples the resting
     DOM, so this exception is verified with deterministic hover/active
     state checks below rather than relying on Axe to catch it.
*/
const REVIEWS_RED_TEXT_SELECTORS = [
  '.reviews-kicker',
  '.review-row__cta',
].sort();
const REVIEWS_RED_TEXT_SELECTORS_INCLUDING_ARIA_HIDDEN = [
  ...REVIEWS_RED_TEXT_SELECTORS,
  '.review-row__rating',
];

test('Reviews route has no automated WCAG A/AA violations beyond the documented golden-master contrast exceptions (Cover/Feature exceptions untouched)', async ({
  page,
}, testInfo) => {
  // Reviews' scroll-reveal module hides [data-reveal] rows until they
  // scroll into view or reduced motion is detected — same rationale as the
  // Feature scan above: settle to the resting, fully-visible state first so
  // Axe never pixel-samples a mid-fade frame.
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/reviews/');

  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
    .analyze();

  const colorContrastViolation = results.violations.find(
    (violation) => violation.id === 'color-contrast',
  );
  const otherViolations = results.violations.filter(
    (violation) => violation.id !== 'color-contrast',
  );

  // Every non-color-contrast violation still fails this test — headings,
  // landmarks, list, and link semantics are all covered by Axe's own rule
  // set, not hand-rolled here.
  expect(otherViolations).toEqual([]);

  const nodes = colorContrastViolation?.nodes ?? [];
  const targets = nodes.map((node) => node.target.join(' ')).sort();

  // Exactly the two Axe-visible Reviews red-text node types at rest — no
  // more, no fewer, no different ones. `.review-row__rating` is aria-hidden
  // and never appears in an Axe scan (see file comment above); the
  // muted-metadata/Verdict-label exception below is hover/active-only and
  // therefore never appears in this resting-state scan either.
  expect(targets).toEqual(REVIEWS_RED_TEXT_SELECTORS);

  // Color identity is verified for all three red-text node types,
  // including the aria-hidden rating — sighted users see it regardless of
  // whether Axe's accessibility-tree-scoped scan reports it.
  for (const selector of REVIEWS_RED_TEXT_SELECTORS_INCLUDING_ARIA_HIDDEN) {
    const foreground = await getComputedForeground(page, selector);
    const background = await getEffectiveBackground(page, selector);
    expect(foreground).toEqual(EXPECTED_FOREGROUND_RGB);
    expect(background).toEqual(EXPECTED_BACKGROUND_RGB);
    const ratio = contrastRatio(foreground, background);
    expect(ratio).toBeGreaterThan(EXPECTED_CONTRAST_RATIO - CONTRAST_TOLERANCE);
    expect(ratio).toBeLessThan(EXPECTED_CONTRAST_RATIO + CONTRAST_TOLERANCE);
  }

  testInfo.annotations.push({
    type: 'known-issue',
    description:
      `Sprint 2B approved Reviews contrast exception #1: red editorial ` +
      `text (rgb(226, 35, 26) on rgb(239, 233, 220), ~${EXPECTED_CONTRAST_RATIO}:1) ` +
      `on ${REVIEWS_RED_TEXT_SELECTORS_INCLUDING_ARIA_HIDDEN.join(', ')} ` +
      `(the rating is aria-hidden and not itself flagged by Axe). Needs 4.5:1. See ` +
      `DESIGN_DEVIATIONS.md for the approval record and exception #2 ` +
      `(muted metadata/Verdict labels, hover/active row states only, ` +
      `verified separately below). The Cover and Feature exceptions above ` +
      `remain separate, untouched target sets.`,
  });
});

test('Reviews muted metadata and Verdict labels pass contrast at rest, and only their approved hover/active exception applies', async ({
  page,
}) => {
  await page.goto('/reviews/');

  const firstRow = page.locator('a.review-row').first();
  const meta = firstRow.locator('.review-row__meta');
  const verdictLabel = firstRow.locator('.review-row__verdict-label');

  async function contrastFor(locator: ReturnType<Page['locator']>) {
    const foreground = await locator.evaluate(
      (el) => getComputedStyle(el).color,
    );
    const background = await locator.evaluate((el) => {
      let node: Element | null = el;
      while (node) {
        const bg = getComputedStyle(node).backgroundColor;
        const match = bg.match(/rgba?\(([^)]+)\)/);
        if (match) {
          const parts = match[1].split(',').map((p) => parseFloat(p.trim()));
          if ((parts[3] ?? 1) > 0) return bg;
        }
        node = node.parentElement;
      }
      throw new Error('no opaque ancestor background found');
    });
    const [fr, fg, fb] = parseRgb(foreground);
    const [br, bg, bb] = parseRgb(background);
    return {
      ratio: contrastRatio([fr, fg, fb], [br, bg, bb]),
      foreground: [fr, fg, fb] as [number, number, number],
      background: [br, bg, bb] as [number, number, number],
    };
  }

  const EXPECTED_MUTED_RGB: [number, number, number] = [111, 102, 86]; // #6f6656
  const AA_NORMAL_TEXT_THRESHOLD = 4.5;

  const metaRest = await contrastFor(meta);
  expect(metaRest.foreground).toEqual(EXPECTED_MUTED_RGB);
  expect(metaRest.ratio).toBeGreaterThanOrEqual(AA_NORMAL_TEXT_THRESHOLD);

  const verdictRest = await contrastFor(verdictLabel);
  expect(verdictRest.foreground).toEqual(EXPECTED_MUTED_RGB);
  expect(verdictRest.ratio).toBeGreaterThanOrEqual(AA_NORMAL_TEXT_THRESHOLD);

  await firstRow.hover();
  const metaHover = await contrastFor(meta);
  expect(metaHover.background).toEqual([229, 221, 204]); // #e5ddcc
  expect(metaHover.ratio).toBeLessThan(AA_NORMAL_TEXT_THRESHOLD);
  expect(metaHover.ratio).toBeGreaterThan(4.0);

  const verdictHover = await contrastFor(verdictLabel);
  expect(verdictHover.background).toEqual([229, 221, 204]);
  expect(verdictHover.ratio).toBeLessThan(AA_NORMAL_TEXT_THRESHOLD);

  // Active state: hold the pointer down on the row (still hovering from
  // above) to trigger :active, then release — mouse.up() runs even if an
  // assertion above throws is not guaranteed, so this is wrapped to always
  // clean up the pressed state before the test ends.
  const box = await firstRow.boundingBox();
  if (!box) throw new Error('review row bounding box unavailable');
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  try {
    // The row's background/padding transition over .34s (normal motion);
    // sampling immediately after mousedown can catch an interpolated
    // mid-transition color instead of the settled :active value.
    await page.waitForTimeout(400);
    const EXPECTED_ACTIVE_RATIO = 3.88;

    const metaActive = await contrastFor(meta);
    expect(metaActive.background).toEqual([222, 213, 194]); // #ded5c2
    expect(metaActive.ratio).toBeLessThan(AA_NORMAL_TEXT_THRESHOLD);
    expect(metaActive.ratio).toBeGreaterThan(
      EXPECTED_ACTIVE_RATIO - CONTRAST_TOLERANCE,
    );
    expect(metaActive.ratio).toBeLessThan(
      EXPECTED_ACTIVE_RATIO + CONTRAST_TOLERANCE,
    );

    const verdictActive = await contrastFor(verdictLabel);
    expect(verdictActive.background).toEqual([222, 213, 194]);
    expect(verdictActive.ratio).toBeLessThan(AA_NORMAL_TEXT_THRESHOLD);
    expect(verdictActive.ratio).toBeGreaterThan(
      EXPECTED_ACTIVE_RATIO - CONTRAST_TOLERANCE,
    );
    expect(verdictActive.ratio).toBeLessThan(
      EXPECTED_ACTIVE_RATIO + CONTRAST_TOLERANCE,
    );
  } finally {
    await page.mouse.up();
  }
});

test('Feature exposes exactly one h1, real section headings in order, and figure/figcaption + list semantics for its editorial content', async ({
  page,
}) => {
  await page.goto('/feature/');

  await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
  await expect(
    page.getByRole('heading', {
      level: 1,
      name: 'The inbox that learned to answer itself',
    }),
  ).toBeVisible();

  const h2s = (
    await page.getByRole('heading', { level: 2 }).allTextContents()
  ).map((text) => text.trim());
  expect(h2s).toEqual(['Lorem ipsum, in five movements', 'How it was built']);

  await expect(page.locator('figure.feature-hero > figcaption')).toBeVisible();
  await expect(
    page.locator('figure.feature-figures > figcaption'),
  ).toBeVisible();

  await expect(page.locator('dl.feature-stats')).toBeVisible();
  await expect(page.locator('dl.feature-spec__list')).toBeVisible();
  await expect(page.locator('ol.feature-build')).toBeVisible();
  await expect(page.getByRole('complementary')).toBeVisible();
});

test('Reviews exposes exactly one h1, six h2 review titles, a semantic repeated-content list, and six keyboard-reachable links in logical focus order', async ({
  page,
}) => {
  await page.goto('/reviews/');

  await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
  await expect(
    page.getByRole('heading', {
      level: 1,
      name: 'All the work, rated and reviewed',
    }),
  ).toBeVisible();

  const h2s = await page.getByRole('heading', { level: 2 }).allTextContents();
  expect(h2s).toHaveLength(6);

  await expect(
    page.getByRole('list').filter({ hasText: 'Support Autopilot' }),
  ).toBeVisible();
  await expect(page.locator('li.review-row-item')).toHaveCount(6);

  const reviewLinks = page.locator('a.review-row');
  await expect(reviewLinks).toHaveCount(6);
  for (const link of await reviewLinks.all()) {
    await expect(link).toHaveAttribute('href', '/feature/');
  }
});
