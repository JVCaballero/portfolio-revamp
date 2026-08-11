import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

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
 * Rather than filtering by selector alone (which would silently swallow a
 * *different* future contrast regression landing on one of these same
 * elements), this test asserts the exact expected target set/count AND
 * verifies, from axe's own per-node check data, that every flagged node
 * really is this exact foreground/background pair before excluding it. Any
 * new, different, or additional violation still fails the test.
 */
const EXPECTED_CONTRAST_EXCEPTION_TARGETS = [
  '.cover-teaser__cta',
  '#cover-issue-heading',
  '.cover-card[href$="feature/"] > .cover-card__eyebrow',
  '.cover-card[href$="reviews/"] > .cover-card__eyebrow',
  '.cover-card[href$="interview/"] > .cover-card__eyebrow',
].sort();

const EXPECTED_FOREGROUND = '#e2231a';
const EXPECTED_BACKGROUND = '#efe9dc';
const EXPECTED_CONTRAST_RATIO = 3.86;

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

  // Each flagged node must resolve to the exact documented color pair
  // before it is accepted as the known exception.
  for (const node of nodes) {
    const check = node.any.find((entry) => entry.id === 'color-contrast');
    const data = check?.data as
      | { fgColor?: string; bgColor?: string; contrastRatio?: number }
      | undefined;

    expect(data?.fgColor?.toLowerCase()).toBe(EXPECTED_FOREGROUND);
    expect(data?.bgColor?.toLowerCase()).toBe(EXPECTED_BACKGROUND);
    expect(data?.contrastRatio).toBeGreaterThan(EXPECTED_CONTRAST_RATIO - 0.1);
    expect(data?.contrastRatio).toBeLessThan(EXPECTED_CONTRAST_RATIO + 0.1);
  }

  testInfo.annotations.push({
    type: 'known-issue',
    description:
      `Documented golden-master WCAG AA contrast exception ` +
      `(${EXPECTED_FOREGROUND} on ${EXPECTED_BACKGROUND}, ~${EXPECTED_CONTRAST_RATIO}:1, ` +
      `needs 4.5:1), verified on exactly ${nodes.length} expected node(s): ` +
      `${targets.join('; ')}`,
  });
});
