# Design Deviations

This is a project record, not a redesign backlog. Every intentional
deviation from the immutable Newsstand golden master
(`reference/newsstand-original/`) introduced from Sprint 2A onward is
logged here. Entries are added only for differences that are actually
visible or behavioral — normal code-structure changes with zero visible or
behavioral effect are not logged.

A holistic design QA against the golden master will be performed after all
Sprint 2 page shells are complete and before bulk placeholder-content
replacement. That QA will explicitly re-check every entry below marked
"pending final holistic QA."

---

## Sprint 2A — Feature

### 1. Feature folio/kicker contrast

- **Date:** 2026-08-11
- **Route / component:** `/feature/` — `.feature-kicker` (the "Feature /
  p.04 · AI & Automation" folio line), `src/pages/feature/index.astro`,
  `src/styles/feature.css`.
- **Immutable source behavior/design:** Small bold Newsstand-red text
  (`#e2231a`) directly on the paper background (`#efe9dc`) at ~11px bold
  Space Mono, uppercase, 0.24em tracking (`Newsstand - Full Site.dc.html`,
  ~line 145).
- **Production behavior/design:** Preserved exactly — same color pairing,
  size, weight, tracking, and visual hierarchy. No color, size, typography,
  or hierarchy change was made.
- **Reason for deviation:** The exact color pairing produces ~3.87:1
  contrast, which fails the WCAG 2.2 AA normal-text threshold (4.5:1).
  Changing it would be a visible design change to an accepted golden-master
  color choice, which is outside this checkpoint's authorized scope.
- **Classification:** accessibility.
- **Status:** accepted permanent design-preservation exception, pending
  final holistic QA.
- **Approval source:** explicitly approved by the project owner during the
  Sprint 2A architecture review (approved architecture map referenced at
  the top of the Sprint 2A implementation task).
- **Exact files/nodes affected:** `.feature-kicker` in
  `src/styles/feature.css`; the single `<p class="feature-kicker">` node in
  `src/pages/feature/index.astro`.
- **Testing:** `tests/accessibility.spec.ts` adds a narrowly-scoped,
  Feature-specific contrast expectation for exactly this node (foreground
  `rgb(226, 35, 26)` on background `rgb(239, 233, 220)`, ratio ≈3.87:1). It
  does not modify, broaden, or otherwise touch the existing five-target
  Cover exception, and does not disable Axe's `color-contrast` rule
  page-wide — any other Feature contrast violation still fails the test.
- **Final-QA reminder:** re-verify this exception still matches the golden
  master exactly (no drift in color/size/weight) during the post-Sprint-2
  holistic design QA.

### 2. "Next" CTA label opacity contrast

- **Date:** 2026-08-11
- **Route / component:** `/feature/` — `.feature-next__label` (the small
  "Next" label above "See all six builds, rated →"),
  `src/pages/feature/index.astro`, `src/styles/feature.css`.
- **Immutable source behavior/design:** White Space Mono label text at
  `opacity:.85` over the solid red CTA background (`Newsstand - Full
Site.dc.html`, ~line 233: `font:700 10px 'Space Mono',monospace;
letter-spacing:.2em;text-transform:uppercase;opacity:.85`).
- **Production behavior/design:** Preserved exactly — same white color,
  same `opacity: 0.85`, same red background, same size/weight/tracking.
- **Reason for deviation:** The 85% opacity blends the rendered (composited)
  color to an effective ~`#fbdedd` on `#e2231a`, ~3.7:1 — below the WCAG
  2.2 AA normal-text threshold (4.5:1). This is a render-time consequence
  of an accepted golden-master opacity value, not a color chosen without
  reference to contrast; changing it would be a visible design change to
  an accepted golden-master treatment.
- **Classification:** accessibility.
- **Status:** accepted permanent design-preservation exception, pending
  final holistic QA.
- **Approval source:** explicitly approved by the project owner during the
  Sprint 2A implementation checkpoint, after this second gap was
  independently discovered, demonstrated (real composited-color
  measurement, not axe's raw diagnostic value), and reported rather than
  silently allowlisted.
- **Exact files/nodes affected:** `.feature-next__label` in
  `src/styles/feature.css`; the single `<span class="feature-next__label">`
  node in `src/pages/feature/index.astro`.
- **Testing:** `tests/accessibility.spec.ts` verifies this exact node's
  rendered (opacity-blended) foreground against its effective background,
  computed the same way the browser composites it — not the raw authored
  `color: white`, which alone would misleadingly read as passing. It does
  not modify the Cover exception or the Feature kicker exception, and does
  not disable Axe's `color-contrast` rule page-wide.
- **Final-QA reminder:** re-verify this exception still matches the golden
  master exactly (same opacity, same color, same background) during the
  post-Sprint-2 holistic design QA.
