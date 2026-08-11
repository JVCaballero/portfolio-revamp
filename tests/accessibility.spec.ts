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
