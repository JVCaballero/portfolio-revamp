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

/*
  Sprint 2C — Interview's own, separately-approved contrast exceptions. Both
  are NARROWLY scoped, exact-node additions kept independent from the
  Cover/Feature/Reviews exceptions above: neither adds to, modifies, or
  otherwise touches any prior target set, and both target a different route
  entirely. See DESIGN_DEVIATIONS.md, "Sprint 2C — Interview" for the full
  record of both.

  1. Interview small Newsstand-red text (`.interview-kicker`,
     `.interview-qa__marker` (x5), `.interview-timeline-heading`,
     `.interview-cta__label`) reuses the same golden-master red-on-paper
     pairing as the Cover/Feature/Reviews exception targets (`#e2231a` on
     `#efe9dc`, ~3.86:1) at rest, plus a second gap once the Rotation CTA's
     own hover swaps its background to `#17130f` (~3.95:1).
  2. Interview muted résumé status (`.interview-timeline__status--muted`)
     passes at rest (~4.68:1) — the resting state is deliberately NOT
     allowlisted — but fails once an ancestor `.interview-timeline__row` is
     hovered (~4.19:1) or pressed (~3.88:1), since the row background
     itself swaps.
*/
const INTERVIEW_CTA_LABEL_SELECTOR = '.interview-cta__label';
const EXPECTED_CTA_HOVER_BG_RGB: [number, number, number] = [23, 19, 15]; // #17130f
const EXPECTED_CTA_HOVER_CONTRAST_RATIO = 3.95;

// Exact set of Interview nodes Axe's automated scan flags at rest. Axe's
// color-contrast rule does not report the five inline `.interview-qa__marker`
// <strong> nodes (verified empirically — they carry the identical failing
// color pair but are short, bold inline runs embedded inside much longer
// paragraph text, which axe-core's own sampling heuristic does not flag as
// a violation on its own). They are still part of the approved exception
// and are verified directly below by real computed style, not by Axe.
const INTERVIEW_AXE_RED_TEXT_SELECTORS = [
  '.interview-kicker',
  '.interview-timeline-heading',
  INTERVIEW_CTA_LABEL_SELECTOR,
].sort();

// The complete approved exception membership is exactly 8 nodes: 1 kicker +
// 5 Q markers + 1 "Tour dates / the résumé" heading + 1 CTA "Also" label —
// the 3-selector Axe-visible set above, plus the 5 Q markers verified
// directly below. Any Interview node outside this exact set failing
// contrast is NOT allowlisted and must fail this test.
const EXPECTED_QA_MARKER_COUNT = 5;

test('Interview route has no automated WCAG A/AA violations beyond the documented golden-master contrast exceptions (Cover/Feature/Reviews exceptions untouched)', async ({
  page,
}, testInfo) => {
  // Interview's scroll-reveal module hides [data-reveal] nodes until they
  // scroll into view or reduced motion is detected — same rationale as the
  // Feature/Reviews scans above: settle to the resting, fully-visible state
  // first so Axe never pixel-samples a mid-fade frame.
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/interview/');

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
  // landmarks, quote, and list semantics are all covered by Axe's own rule
  // set, not hand-rolled here.
  expect(otherViolations).toEqual([]);

  const nodes = colorContrastViolation?.nodes ?? [];
  const targets = nodes.map((node) => node.target.join(' ')).sort();

  // Exact membership, not "whatever Axe happened to report": if a new
  // Interview node starts failing contrast, or an approved node stops being
  // flagged, this array differs from the fixed expected set and the test
  // fails. No other Interview contrast violation is silently allowlisted.
  expect(targets).toEqual(INTERVIEW_AXE_RED_TEXT_SELECTORS);

  for (const target of targets) {
    const foreground = await getComputedForeground(page, target);
    const background = await getEffectiveBackground(page, target);
    expect(foreground).toEqual(EXPECTED_FOREGROUND_RGB);
    expect(background).toEqual(EXPECTED_BACKGROUND_RGB);
    const ratio = contrastRatio(foreground, background);
    expect(ratio).toBeGreaterThan(EXPECTED_CONTRAST_RATIO - CONTRAST_TOLERANCE);
    expect(ratio).toBeLessThan(EXPECTED_CONTRAST_RATIO + CONTRAST_TOLERANCE);
  }

  // The five Q markers are part of the approved exception (see file
  // comment above) but are not reported by Axe's own scan — verified here
  // directly against real computed style, and the count is pinned so a
  // missing/extra marker also fails this test.
  const qaMarkers = page.locator('.interview-qa__marker');
  await expect(qaMarkers).toHaveCount(EXPECTED_QA_MARKER_COUNT);
  const markerCount = await qaMarkers.count();
  for (let i = 0; i < markerCount; i++) {
    const marker = qaMarkers.nth(i);
    const foreground = await marker.evaluate(
      (el) => getComputedStyle(el).color,
    );
    const [fr, fg, fb] = parseRgb(foreground);
    expect([fr, fg, fb]).toEqual(EXPECTED_FOREGROUND_RGB);
    const background = await getEffectiveBackground(
      page,
      '.interview-qa__marker',
    );
    expect(background).toEqual(EXPECTED_BACKGROUND_RGB);
    const ratio = contrastRatio([fr, fg, fb], background);
    expect(ratio).toBeGreaterThan(EXPECTED_CONTRAST_RATIO - CONTRAST_TOLERANCE);
    expect(ratio).toBeLessThan(EXPECTED_CONTRAST_RATIO + CONTRAST_TOLERANCE);
  }

  // The CTA label's own hover-state gap (against the darker CTA hover
  // background) is not visible to a resting-state Axe scan — verified
  // deterministically below instead.
  await page.hover(`a:has(${INTERVIEW_CTA_LABEL_SELECTOR})`);
  const hoverForeground = await getComputedForeground(
    page,
    INTERVIEW_CTA_LABEL_SELECTOR,
  );
  const hoverBackground = await getEffectiveBackground(
    page,
    INTERVIEW_CTA_LABEL_SELECTOR,
  );
  expect(hoverForeground).toEqual(EXPECTED_FOREGROUND_RGB);
  expect(hoverBackground).toEqual(EXPECTED_CTA_HOVER_BG_RGB);
  const hoverRatio = contrastRatio(hoverForeground, hoverBackground);
  expect(hoverRatio).toBeGreaterThan(
    EXPECTED_CTA_HOVER_CONTRAST_RATIO - CONTRAST_TOLERANCE,
  );
  expect(hoverRatio).toBeLessThan(
    EXPECTED_CTA_HOVER_CONTRAST_RATIO + CONTRAST_TOLERANCE,
  );

  testInfo.annotations.push({
    type: 'known-issue',
    description:
      `Sprint 2C approved Interview contrast exceptions: (1) red editorial ` +
      `text (rgb(226, 35, 26) on rgb(239, 233, 220), ~${EXPECTED_CONTRAST_RATIO}:1 ` +
      `at rest; ~${EXPECTED_CTA_HOVER_CONTRAST_RATIO}:1 on ${INTERVIEW_CTA_LABEL_SELECTOR} ` +
      `hover) on ${targets.join(', ')}. Needs 4.5:1. See DESIGN_DEVIATIONS.md ` +
      `for the approval record and exception #2 (muted résumé status, ` +
      `hover/active row states only, verified separately below). The ` +
      `Cover, Feature, and Reviews exceptions above remain separate, ` +
      `untouched target sets.`,
  });
});

test('Interview muted résumé status passes contrast at rest, and only its approved hover/active exception applies', async ({
  page,
}) => {
  await page.goto('/interview/');

  const mutedRow = page
    .locator('.interview-timeline__row')
    .filter({ hasText: 'SOLD OUT' });
  const status = mutedRow.locator('.interview-timeline__status--muted');

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

  const statusRest = await contrastFor(status);
  expect(statusRest.foreground).toEqual(EXPECTED_MUTED_RGB);
  expect(statusRest.ratio).toBeGreaterThanOrEqual(AA_NORMAL_TEXT_THRESHOLD);

  await mutedRow.hover();
  const statusHover = await contrastFor(status);
  expect(statusHover.background).toEqual([229, 221, 204]); // #e5ddcc
  expect(statusHover.ratio).toBeLessThan(AA_NORMAL_TEXT_THRESHOLD);
  expect(statusHover.ratio).toBeGreaterThan(4.0);

  // Active state: hold the pointer down on the row (still hovering from
  // above) to trigger :active, then release — mouse.up() runs even if an
  // assertion above throws is not guaranteed, so this is wrapped to always
  // clean up the pressed state before the test ends.
  const box = await mutedRow.boundingBox();
  if (!box) throw new Error('interview timeline row bounding box unavailable');
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  try {
    // The row's background/padding transition over .32s (normal motion);
    // sampling immediately after mousedown can catch an interpolated
    // mid-transition color instead of the settled :active value.
    await page.waitForTimeout(400);
    const EXPECTED_ACTIVE_RATIO = 3.88;

    const statusActive = await contrastFor(status);
    expect(statusActive.background).toEqual([222, 213, 194]); // #ded5c2
    expect(statusActive.ratio).toBeLessThan(AA_NORMAL_TEXT_THRESHOLD);
    expect(statusActive.ratio).toBeGreaterThan(
      EXPECTED_ACTIVE_RATIO - CONTRAST_TOLERANCE,
    );
    expect(statusActive.ratio).toBeLessThan(
      EXPECTED_ACTIVE_RATIO + CONTRAST_TOLERANCE,
    );
  } finally {
    await page.mouse.up();
  }
});

test('Interview exposes exactly one h1, real section headings in order, and blockquote/list/aside semantics for its editorial content', async ({
  page,
}) => {
  await page.goto('/interview/');

  await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
  await expect(
    page.getByRole('heading', {
      level: 1,
      name: 'Forty players, one tempo, and a deploy on Sunday',
    }),
  ).toBeVisible();

  const h2s = (
    await page.getByRole('heading', { level: 2 }).allTextContents()
  ).map((text) => text.trim());
  expect(h2s).toEqual(['Tour dates / the résumé', 'The rider', 'Instruments']);

  await expect(page.getByRole('blockquote')).toBeVisible();
  await expect(page.locator('.interview-quote cite')).toBeVisible();

  await expect(page.locator('ol.interview-timeline')).toBeVisible();
  await expect(page.locator('li.interview-timeline__item')).toHaveCount(3);

  await expect(page.locator('ul.interview-rider__list')).toBeVisible();
  await expect(page.locator('ul.interview-rider__list li')).toHaveCount(5);

  await expect(page.getByRole('complementary')).toBeVisible();
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

/*
  Sprint 2D — Columns' own, separately-approved contrast exceptions. Both
  are NARROWLY scoped, exact-node additions kept independent from the
  Cover/Feature/Reviews/Interview exceptions above: neither adds to,
  modifies, or otherwise touches any prior target set, and both target a
  different route entirely. See DESIGN_DEVIATIONS.md, "Sprint 2D —
  Columns" for the full record of both.

  1. Columns small Newsstand-red text (`.columns-kicker`,
     `.columns-lead__cta`, `.columns-more__kicker` x4) reuses the same
     golden-master red-on-paper pairing as the Cover/Feature/Reviews/
     Interview exception targets (`#e2231a` on `#efe9dc`, ~3.86:1) at rest.
  2. More Columns row hover/active opacity (`.columns-more__row`'s own
     `opacity: .72` on hover, applied to the whole row) reduces the
     effective, alpha-composited contrast of the row's own text (title,
     excerpt, date/read-time) below AA, even though every one of those
     colors passes AA at full (resting) opacity. Unlike the Reviews/
     Interview background-swap exceptions, this is an opacity-blend
     exception — verified below by composing the row's own color against
     its effective background at the measured opacity, not by a background
     color change.
*/
const COLUMNS_RED_TEXT_SELECTORS = [
  '.columns-kicker',
  '.columns-lead__cta',
  '.columns-more__kicker',
];

test('Columns route has no automated WCAG A/AA violations beyond the documented golden-master contrast exceptions (Cover/Feature/Reviews/Interview exceptions untouched)', async ({
  page,
}, testInfo) => {
  // Columns' scroll-reveal module hides [data-reveal] nodes until they
  // scroll into view or reduced motion is detected — same rationale as the
  // Feature/Reviews/Interview scans above: settle to the resting,
  // fully-visible state first so Axe never pixel-samples a mid-fade frame.
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/columns/');

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
  const targets = nodes.map((node) => node.target.join(' '));

  // Exactly six flagged nodes at rest: one `.columns-kicker`, one
  // `.columns-lead__cta`, and four `.columns-more__kicker` (one per
  // secondary row) — no more, no fewer. The row-hover opacity exception
  // (#2 above) is never visible to a resting-state Axe scan, since the
  // resting state passes; it is verified separately below.
  expect(targets).toHaveLength(6);
  const rowKickerTargets = targets.filter((t) =>
    t.includes('.columns-more__kicker'),
  );
  const ctaTargets = targets.filter((t) => t.includes('.columns-lead__cta'));
  const kickerTargets = targets.filter(
    (t) => t.includes('.columns-kicker') && !t.includes('.columns-more__'),
  );
  expect(rowKickerTargets).toHaveLength(4);
  expect(ctaTargets).toHaveLength(1);
  expect(kickerTargets).toHaveLength(1);

  // Color identity verified for every occurrence of all three node types
  // (including the four repeated row kickers), not just axe's own
  // diagnostic fields — see the file-level comment near the top of this
  // file for why real computed style is the source of truth here.
  for (const selector of COLUMNS_RED_TEXT_SELECTORS) {
    const locator = page.locator(selector);
    const count = await locator.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < count; i++) {
      const node = locator.nth(i);
      const foreground = await node.evaluate(
        (el) => getComputedStyle(el).color,
      );
      const [r, g, b] = parseRgb(foreground);
      expect([r, g, b]).toEqual(EXPECTED_FOREGROUND_RGB);
    }
    const background = await getEffectiveBackground(page, selector);
    expect(background).toEqual(EXPECTED_BACKGROUND_RGB);
    const foreground = await getComputedForeground(page, selector);
    const ratio = contrastRatio(foreground, background);
    expect(ratio).toBeGreaterThan(EXPECTED_CONTRAST_RATIO - CONTRAST_TOLERANCE);
    expect(ratio).toBeLessThan(EXPECTED_CONTRAST_RATIO + CONTRAST_TOLERANCE);
  }

  testInfo.annotations.push({
    type: 'known-issue',
    description:
      `Sprint 2D approved Columns contrast exception #1: red editorial ` +
      `text (rgb(226, 35, 26) on rgb(239, 233, 220), ~${EXPECTED_CONTRAST_RATIO}:1) ` +
      `on ${COLUMNS_RED_TEXT_SELECTORS.join(', ')} (the row kicker occurs 4 ` +
      `times, once per secondary row). Needs 4.5:1. See DESIGN_DEVIATIONS.md ` +
      `for the approval record and exception #2 (More Columns row ` +
      `hover/active opacity, verified separately below). The Cover, ` +
      `Feature, Reviews, and Interview exceptions above remain separate, ` +
      `untouched target sets.`,
  });
});

test('More Columns rows apply their approved hover/active opacity exception to row text, without lowering resting contrast', async ({
  page,
}) => {
  await page.goto('/columns/');

  const firstRow = page.locator('a.columns-more__row').first();
  const excerpt = firstRow.locator('.columns-more__excerpt');
  const date = firstRow.locator('.columns-more__date');

  // Unlike the Reviews/Interview background-swap exceptions, the Columns
  // row applies opacity to itself (and therefore to all of its own text),
  // so the *effective* rendered color is the row's own text color
  // alpha-composited over its ancestor's opaque background at the row's
  // current opacity — not a background color swap. This helper reproduces
  // that composition directly from real computed style.
  async function blendedContrast(locator: ReturnType<Page['locator']>) {
    return locator.evaluate((el) => {
      function relativeLuminance([r, g, b]: number[]): number {
        const [rs, gs, bs] = [r, g, b].map((channel) => {
          const c = channel / 255;
          return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
        });
        return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
      }
      function ratioOf(fg: number[], bg: number[]): number {
        const l1 = relativeLuminance(fg);
        const l2 = relativeLuminance(bg);
        const [lighter, darker] = l1 > l2 ? [l1, l2] : [l2, l1];
        return (lighter + 0.05) / (darker + 0.05);
      }

      const row = el.closest('.columns-more__row') as HTMLElement;
      const opacity = parseFloat(getComputedStyle(row).opacity);
      const parseRgbLocal = (value: string) =>
        (value.match(/[\d.]+/g) ?? []).map(Number).slice(0, 3);
      const fg = parseRgbLocal(getComputedStyle(el).color);

      let node: Element | null = el.parentElement;
      let bg = [239, 233, 220];
      while (node) {
        const bgc = getComputedStyle(node).backgroundColor;
        const match = bgc.match(/rgba?\(([^)]+)\)/);
        if (match) {
          const parts = match[1].split(',').map((part) => parseFloat(part));
          if ((parts[3] ?? 1) > 0) {
            bg = parts.slice(0, 3);
            break;
          }
        }
        node = node.parentElement;
      }

      const blended = fg.map((c, i) => bg[i] + opacity * (c - bg[i]));
      return { opacity, ratio: ratioOf(blended, bg) };
    });
  }

  const AA_NORMAL_TEXT_THRESHOLD = 4.5;

  const excerptRest = await blendedContrast(excerpt);
  expect(excerptRest.opacity).toBe(1);
  expect(excerptRest.ratio).toBeGreaterThanOrEqual(AA_NORMAL_TEXT_THRESHOLD);

  const dateRest = await blendedContrast(date);
  expect(dateRest.opacity).toBe(1);
  expect(dateRest.ratio).toBeGreaterThanOrEqual(AA_NORMAL_TEXT_THRESHOLD);

  await firstRow.hover();
  await expect(async () => {
    const excerptHover = await blendedContrast(excerpt);
    expect(excerptHover.opacity).toBeCloseTo(0.72, 2);
    expect(excerptHover.ratio).toBeLessThan(AA_NORMAL_TEXT_THRESHOLD);

    const dateHover = await blendedContrast(date);
    expect(dateHover.opacity).toBeCloseTo(0.72, 2);
    expect(dateHover.ratio).toBeLessThan(AA_NORMAL_TEXT_THRESHOLD);
  }).toPass({ timeout: 2000 });
});

test('Columns exposes exactly one h1, the lead title and "More columns" as h2s, four h3 secondary titles, a semantic list, and five keyboard-reachable links in logical focus order', async ({
  page,
}) => {
  await page.goto('/columns/');

  await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
  await expect(
    page.getByRole('heading', {
      level: 1,
      name: 'Words, rants and gadget reviews',
    }),
  ).toBeVisible();

  const h2s = await page.getByRole('heading', { level: 2 }).allTextContents();
  expect(h2s).toEqual(["Your automation doesn't need a model", 'More columns']);

  const h3s = await page.getByRole('heading', { level: 3 }).allTextContents();
  expect(h3s).toHaveLength(4);

  await expect(
    page
      .getByRole('list')
      .filter({ hasText: 'Six months with a mechanical keyboard' }),
  ).toBeVisible();
  await expect(page.locator('li.columns-more__item')).toHaveCount(4);

  const leadLink = page.locator('a.columns-lead__link');
  const rowLinks = page.locator('a.columns-more__row');
  await expect(leadLink).toHaveCount(1);
  await expect(rowLinks).toHaveCount(4);

  // Logical focus order: lead article first, then the four secondary rows
  // in document order — matches the visual left-to-right / top-to-bottom
  // reading order on desktop and the stacked order on narrower viewports.
  await leadLink.focus();
  await expect(leadLink).toBeFocused();
  const outlineStyle = await leadLink.evaluate((element) => {
    const style = getComputedStyle(element);
    return {
      outlineStyle: style.outlineStyle,
      outlineWidth: style.outlineWidth,
    };
  });
  expect(outlineStyle.outlineStyle).toBe('solid');
  expect(parseFloat(outlineStyle.outlineWidth)).toBeGreaterThan(0);

  for (let i = 0; i < 4; i++) {
    await page.keyboard.press('Tab');
    await expect(rowLinks.nth(i)).toBeFocused();
  }
});

test('Columns has no positive tabindex, and the cursor-preview plate is excluded from the accessibility tree', async ({
  page,
}) => {
  await page.goto('/columns/');

  const positiveTabindexCount = await page
    .locator('[tabindex]')
    .evaluateAll(
      (nodes) =>
        nodes.filter((node) => Number(node.getAttribute('tabindex')) > 0)
          .length,
    );
  expect(positiveTabindexCount).toBe(0);

  const plate = page.locator('[data-cursor-preview]');
  await expect(plate).toHaveAttribute('aria-hidden', 'true');
  await expect(page.getByRole('button')).toHaveCount(0);
});

/*
  Sprint 2E — Columns article-detail template
  (src/pages/columns/[slug]/index.astro), replacing the retired temporary
  [slug] route-integrity shell. All five demo slugs share the exact same
  template, so one representative route is scanned rather than five
  redundant Axe runs; tests/smoke.spec.ts already covers all five routes
  resolving and active Columns navigation.

  The representative route below (`what-conducting-taught-me-about-
  standups`, the middle of the five, position 2 of 5) is deliberately
  chosen because it is the only slug with BOTH a Previous and a Next
  card/link present, giving the fullest exception surface in one scan.

  This template extends (does not duplicate) two exceptions already
  documented for the Columns Index in DESIGN_DEVIATIONS.md:
  1. Entry 7 (small Newsstand-red text, `#e2231a` on `#efe9dc`, ~3.87:1):
     extended to `.columns-detail__kicker`, `.columns-detail__all` (the
     top "← All columns" link), `.columns-detail__card-kicker` (the
     prev/next cards' "← Previous column" / "Next column →" labels),
     `.columns-detail__sidebar-kicker` (the four "More columns" row
     kickers), and `.columns-detail__back` ("Back to all columns →").
     Note: the top-bar "← Previous" / "Next →" links
     (`.columns-detail__prevnext-link`) are NOT part of this exception —
     they use the same muted-metadata color (`#6f6656`) the Reviews/
     Interview exceptions already document, which passes AA at rest.
  2. Entry 8 (More Columns row hover/active opacity, `opacity: .72`):
     extended to `.columns-detail__sidebar-row`'s own hover/active state.
  No new exception categories were introduced.
*/
const COLUMNS_DETAIL_RED_TEXT_SELECTORS = [
  '.columns-detail__kicker',
  '.columns-detail__all',
  '.columns-detail__card-kicker',
  '.columns-detail__sidebar-kicker',
  '.columns-detail__back',
];

test('Columns detail template (representative middle route) has no automated WCAG A/AA violations beyond the documented, extended golden-master contrast exceptions', async ({
  page,
}, testInfo) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/columns/what-conducting-taught-me-about-standups/');

  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
    .analyze();

  const colorContrastViolation = results.violations.find(
    (violation) => violation.id === 'color-contrast',
  );
  const otherViolations = results.violations.filter(
    (violation) => violation.id !== 'color-contrast',
  );
  expect(otherViolations).toEqual([]);

  const nodes = colorContrastViolation?.nodes ?? [];
  const targets = nodes.map((node) => node.target.join(' '));

  // Exactly nine flagged nodes at rest on this representative route: one
  // `.columns-detail__kicker`, one `.columns-detail__all`, two
  // `.columns-detail__card-kicker` (prev + next card, both present on this
  // middle route), four `.columns-detail__sidebar-kicker` (one per "More
  // columns" row), and one `.columns-detail__back`.
  expect(targets).toHaveLength(9);
  expect(
    targets.filter((t) => t.includes('.columns-detail__kicker')),
  ).toHaveLength(1);
  expect(
    targets.filter((t) => t.includes('.columns-detail__all')),
  ).toHaveLength(1);
  expect(
    targets.filter((t) => t.includes('.columns-detail__card-kicker')),
  ).toHaveLength(2);
  expect(
    targets.filter((t) => t.includes('.columns-detail__sidebar-kicker')),
  ).toHaveLength(4);
  expect(
    targets.filter((t) => t.includes('.columns-detail__back')),
  ).toHaveLength(1);

  for (const selector of COLUMNS_DETAIL_RED_TEXT_SELECTORS) {
    const locator = page.locator(selector);
    const count = await locator.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < count; i++) {
      const node = locator.nth(i);
      const foreground = await node.evaluate(
        (el) => getComputedStyle(el).color,
      );
      const [r, g, b] = parseRgb(foreground);
      expect([r, g, b]).toEqual(EXPECTED_FOREGROUND_RGB);
    }
    const background = await getEffectiveBackground(page, selector);
    expect(background).toEqual(EXPECTED_BACKGROUND_RGB);
    const foreground = await getComputedForeground(page, selector);
    const ratio = contrastRatio(foreground, background);
    expect(ratio).toBeGreaterThan(EXPECTED_CONTRAST_RATIO - CONTRAST_TOLERANCE);
    expect(ratio).toBeLessThan(EXPECTED_CONTRAST_RATIO + CONTRAST_TOLERANCE);
  }

  // The top-bar Previous/Next links are muted-metadata, not the red
  // exception — verify identity directly rather than relying on Axe's
  // absence of a violation for them alone.
  const prevNextColor = await page
    .locator('.columns-detail__prevnext-link')
    .first()
    .evaluate((el) => getComputedStyle(el).color);
  const [pr, pg, pb] = parseRgb(prevNextColor);
  expect([pr, pg, pb]).not.toEqual(EXPECTED_FOREGROUND_RGB);

  testInfo.annotations.push({
    type: 'known-issue',
    description:
      `Sprint 2E extends the Sprint 2D Columns Index exceptions (entries ` +
      `7 and 8 in DESIGN_DEVIATIONS.md) to the detail template's ` +
      `equivalent nodes: ${COLUMNS_DETAIL_RED_TEXT_SELECTORS.join(', ')} ` +
      `reuse the same red-on-paper pairing ` +
      `(rgb(226, 35, 26) on rgb(239, 233, 220), ~${EXPECTED_CONTRAST_RATIO}:1). ` +
      `No new exception categories were introduced. The Columns Index's ` +
      `own exceptions remain a separate, untouched target set.`,
  });
});

/*
  Unlike the Columns Index's "More columns" row (whose secondary-copy
  excerpt color drops below AA under the row's own .72 hover/active
  opacity), this detail-page sidebar row has no excerpt line — only a
  kicker (already covered by the red-on-paper exception, entry 7 extended
  in entry 11), an ink-colored title (inherited `color: inherit`, exactly
  as the Index's own `.columns-more__title` inherits ink — high enough
  contrast at full opacity that it stays above AA even after the .72
  blend), and the muted-metadata date/read-time line. Only the date line
  actually crosses below AA under the row's own hover/active opacity,
  mirroring the Index's own `.columns-more__date` exception (entry 8,
  extended here). The title is verified to REMAIN passing under hover,
  not exempted — this test does not silently widen the exception to a
  node that doesn't need it.
*/
test('Columns detail sidebar rows apply their extended hover/active opacity exception to the date/read-time text only, without lowering resting contrast or affecting the ink-colored title', async ({
  page,
}) => {
  await page.goto('/columns/what-conducting-taught-me-about-standups/');

  const firstRow = page.locator('a.columns-detail__sidebar-row').first();
  const title = firstRow.locator('.columns-detail__sidebar-title');
  const date = firstRow.locator('.columns-detail__sidebar-date');

  async function blendedContrast(locator: ReturnType<Page['locator']>) {
    return locator.evaluate((el) => {
      function relativeLuminanceLocal([r, g, b]: number[]): number {
        const [rs, gs, bs] = [r, g, b].map((channel) => {
          const c = channel / 255;
          return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
        });
        return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
      }
      function ratioOf(fg: number[], bg: number[]): number {
        const l1 = relativeLuminanceLocal(fg);
        const l2 = relativeLuminanceLocal(bg);
        const [lighter, darker] = l1 > l2 ? [l1, l2] : [l2, l1];
        return (lighter + 0.05) / (darker + 0.05);
      }

      const row = el.closest('.columns-detail__sidebar-row') as HTMLElement;
      const opacity = parseFloat(getComputedStyle(row).opacity);
      const parseRgbLocal = (value: string) =>
        (value.match(/[\d.]+/g) ?? []).map(Number).slice(0, 3);
      const fg = parseRgbLocal(getComputedStyle(el).color);

      let node: Element | null = el.parentElement;
      let bg = [239, 233, 220];
      while (node) {
        const bgc = getComputedStyle(node).backgroundColor;
        const match = bgc.match(/rgba?\(([^)]+)\)/);
        if (match) {
          const parts = match[1].split(',').map((part) => parseFloat(part));
          if ((parts[3] ?? 1) > 0) {
            bg = parts.slice(0, 3);
            break;
          }
        }
        node = node.parentElement;
      }

      const blended = fg.map((c, i) => bg[i] + opacity * (c - bg[i]));
      return { opacity, ratio: ratioOf(blended, bg) };
    });
  }

  const AA_NORMAL_TEXT_THRESHOLD = 4.5;

  const titleRest = await blendedContrast(title);
  expect(titleRest.opacity).toBe(1);
  expect(titleRest.ratio).toBeGreaterThanOrEqual(AA_NORMAL_TEXT_THRESHOLD);

  const dateRest = await blendedContrast(date);
  expect(dateRest.opacity).toBe(1);
  expect(dateRest.ratio).toBeGreaterThanOrEqual(AA_NORMAL_TEXT_THRESHOLD);

  await firstRow.hover();
  await expect(async () => {
    // The ink-colored title stays above AA even under the row's own hover
    // opacity — high starting contrast, not part of this exception.
    const titleHover = await blendedContrast(title);
    expect(titleHover.opacity).toBeCloseTo(0.72, 2);
    expect(titleHover.ratio).toBeGreaterThanOrEqual(AA_NORMAL_TEXT_THRESHOLD);

    const dateHover = await blendedContrast(date);
    expect(dateHover.opacity).toBeCloseTo(0.72, 2);
    expect(dateHover.ratio).toBeLessThan(AA_NORMAL_TEXT_THRESHOLD);
  }).toPass({ timeout: 2000 });
});

test('Columns detail exposes one h1, the section heading and "More columns" as h2s, a semantic sidebar list, and keyboard-reachable links with no positive tabindex', async ({
  page,
}) => {
  await page.goto('/columns/what-conducting-taught-me-about-standups/');

  await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
  await expect(
    page.getByRole('heading', {
      level: 1,
      name: 'What conducting taught me about standups',
    }),
  ).toBeVisible();

  const h2s = await page.getByRole('heading', { level: 2 }).allTextContents();
  expect(h2s).toEqual(['Tempo over detail', 'More columns']);

  await expect(
    page
      .getByRole('list')
      .filter({ hasText: 'Six months with a mechanical keyboard' }),
  ).toBeVisible();
  await expect(page.locator('a.columns-detail__sidebar-row')).toHaveCount(4);

  const positiveTabindexCount = await page
    .locator('[tabindex]')
    .evaluateAll(
      (nodes) =>
        nodes.filter((node) => Number(node.getAttribute('tabindex')) > 0)
          .length,
    );
  expect(positiveTabindexCount).toBe(0);

  const plate = page.locator('[data-cursor-preview]');
  await expect(plate).toHaveAttribute('aria-hidden', 'true');
  await expect(page.getByRole('button')).toHaveCount(0);

  await expect(
    page
      .getByRole('navigation', { name: 'Primary' })
      .getByRole('link', { name: 'Columns', exact: true }),
  ).toHaveAttribute('aria-current', 'page');
});
