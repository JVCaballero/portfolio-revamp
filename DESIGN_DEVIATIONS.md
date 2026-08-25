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

## Sprint 2B — Reviews

### 3. Reviews small Newsstand-red editorial text

- **Date:** 2026-08-12.
- **Route / component:** `/reviews/` — `.reviews-kicker` ("Reviews / p.18"),
  `.review-row__rating` (the six star-rating strings), and
  `.review-row__cta` (the row-one "Read the feature →" line),
  `src/pages/reviews/index.astro`, `src/components/ReviewRow.astro`,
  `src/styles/reviews.css`.
- **Immutable source behavior/design:** Small bold Newsstand-red text
  (`#e2231a`) directly on the paper background (`#efe9dc`) — the kicker at
  ~11px bold Space Mono/0.24em tracking, the rating strings at 15px bold
  Space Mono, and the row-one CTA at ~10px bold Space Mono/0.14em tracking
  (`Newsstand - Full Site.dc.html`, ~lines 244, 259, 263).
- **Production behavior/design:** Preserved exactly — same color pairing,
  sizes, weights, and tracking for all three node types. No color, size,
  typography, or hierarchy change was made.
- **Reason for deviation:** The exact color pairing produces ~3.87:1
  contrast at rest, which fails the WCAG 2.2 AA normal-text threshold
  (4.5:1); it degrades further under a review row's own hover (~3.46:1) and
  active (~3.21:1) background swap. Changing the red, background, source
  typography, or hierarchy would visibly redesign the immutable Newsstand
  golden master, which is outside this checkpoint's authorized scope.
- **Classification:** accessibility.
- **Status:** accepted permanent design-preservation exception, pending
  final holistic QA.
- **Approval source:** explicitly approved by the project owner during the
  Sprint 2B architecture review (approved architecture map referenced at
  the top of the Sprint 2B implementation task).
- **Exact files/nodes affected:** `.reviews-kicker`,
  `.review-row__rating`, and `.review-row__cta` in
  `src/styles/reviews.css`; the corresponding nodes in
  `src/pages/reviews/index.astro` and `src/components/ReviewRow.astro`.
- **Testing:** `tests/accessibility.spec.ts` adds a narrowly-scoped,
  Reviews-specific contrast expectation for exactly these three node types
  (foreground `rgb(226, 35, 26)` on background `rgb(239, 233, 220)`,
  ratio ≈3.87:1 at rest). `.review-row__rating` is `aria-hidden="true"` (its
  accessible equivalent is a separate visually-hidden "N out of 5 stars"
  node), so Axe's `color-contrast` rule never reports it directly — its
  color identity is still verified from real computed style, since sighted
  users see it regardless of aria-hidden. It does not modify, broaden, or
  otherwise touch the existing Cover or Feature exceptions, and does not
  disable Axe's `color-contrast` rule page-wide — any other Reviews
  contrast violation still fails the test.
- **Final-QA reminder:** re-verify this exception still matches the golden
  master exactly (no drift in color/size/weight) during the post-Sprint-2
  holistic design QA.

### 4. Reviews muted metadata and Verdict labels, hover/active row states only

- **Date:** 2026-08-12.
- **Route / component:** `/reviews/` — `.review-row__meta` (the six review
  metadata lines) and `.review-row__verdict-label` (the six small "Verdict"
  labels), `src/components/ReviewRow.astro`, `src/styles/reviews.css`,
  scoped to the parent `.review-row`'s `:hover` and `:active` states only.
- **Immutable source behavior/design:** Muted metadata color (`#6f6656`) on
  the paper background (`#efe9dc`), which itself swaps to a slightly darker
  tone while the row is hovered (`#e5ddcc`) or pressed (`#ded5c2`)
  (`Newsstand - Full Site.dc.html`, ~lines 256, 260, 263).
- **Production behavior/design:** Preserved exactly — same muted-metadata
  color, same row hover/active background values, same typography.
- **Reason for deviation:** Resting contrast (~4.68:1) passes WCAG 2.2 AA
  and is not part of this exception. Only the row's own hover (~4.19:1) and
  active (~3.88:1) background swap drags these two node types under the
  4.5:1 AA threshold. Changing the muted-metadata color or the row
  hover/active background would visibly redesign an accepted golden-master
  interaction, which is outside this checkpoint's authorized scope.
- **Classification:** accessibility.
- **Status:** accepted permanent design-preservation exception, pending
  final holistic QA. Route scoped, selector scoped, and state scoped — the
  resting state passes and is not allowlisted.
- **Approval source:** explicitly approved by the project owner during the
  Sprint 2B architecture review (approved architecture map referenced at
  the top of the Sprint 2B implementation task).
- **Exact files/nodes affected:** `.review-row__meta` and
  `.review-row__verdict-label` in `src/styles/reviews.css`, only while an
  ancestor `.review-row` is `:hover`/`:active`; the corresponding nodes in
  `src/components/ReviewRow.astro`.
- **Testing:** `tests/accessibility.spec.ts` adds deterministic
  hover-state and active-state contrast checks for exactly these two node
  types (foreground `rgb(111, 102, 86)`), verified against the row's
  computed hover/active background — a resting-state-only Axe scan cannot
  prove this exception, since the resting state passes. It does not modify,
  broaden, or otherwise touch the existing Cover, Feature, or Reviews
  exception #3 above, and does not disable Axe's `color-contrast` rule
  page-wide, nor does it broaden this to muted metadata site-wide.
- **Final-QA reminder:** re-verify this exception still matches the golden
  master exactly (no drift in color/background) during the post-Sprint-2
  holistic design QA.

## Sprint 2C — Interview

### 5. Interview small Newsstand-red text

- **Date:** 2026-08-25.
- **Route / component:** `/interview/` — `.interview-kicker` ("The
  Interview / p.12"), `.interview-qa__marker` (the five inline "Q"
  markers), `.interview-timeline-heading` ("Tour dates / the résumé"), and
  `.interview-cta__label` (the Rotation CTA's "Also" label, both at rest
  and on its own `:hover` state), `src/pages/interview/index.astro`,
  `src/styles/interview.css`.
- **Immutable source behavior/design:** Small bold Newsstand-red text
  (`#e2231a`) directly on the paper background (`#efe9dc`) for the kicker,
  Q markers, and timeline heading — all ~11px bold Space Mono, uppercase,
  0.24em/0.1em tracking depending on role. The CTA's "Also" label uses the
  same red at rest, and again after the CTA's own hover swaps its
  background to `#17130f` (`Newsstand - Full Site.dc.html`: kicker ~line
  325; the five inline "Q" markers ~lines 340, 342, 344, 346, 348; the
  "Tour dates / the résumé" heading ~line 366; the CTA "Also" label ~line
  391).
- **Production behavior/design:** Preserved exactly — same color pairing,
  sizes, weights, and tracking for all four node types and both CTA states.
  No color, size, typography, or hierarchy change was made.
- **Reason for deviation:** The red-on-paper pairing produces ~3.87:1
  contrast, and the red-on-hover-background pairing produces ~3.95:1 —
  both below the WCAG 2.2 AA normal-text threshold (4.5:1). Changing the
  red, the paper background, or the CTA hover background would visibly
  redesign an accepted golden-master color choice, which is outside this
  checkpoint's authorized scope. The larger handwritten red `*` aside
  marker is unaffected — it satisfies the large-text threshold and is not
  part of this exception.
- **Classification:** accessibility.
- **Status:** accepted permanent design-preservation exception, pending
  final holistic QA. Route scoped, selector scoped, and state scoped —
  every other Interview node still fails the test if it regresses.
- **Approval source:** explicitly approved by the project owner during the
  Sprint 2C architecture review (approved architecture map referenced at
  the top of the Sprint 2C implementation task).
- **Exact files/nodes affected:** `.interview-kicker`,
  `.interview-qa__marker`, `.interview-timeline-heading`, and
  `.interview-cta__label` in `src/styles/interview.css`; the corresponding
  nodes in `src/pages/interview/index.astro`.
- **Testing:** `tests/accessibility.spec.ts` adds a narrowly-scoped,
  Interview-specific contrast expectation for exactly these node types
  (foreground `rgb(226, 35, 26)` on background `rgb(239, 233, 220)` at
  rest, ratio ≈3.87:1; the CTA label additionally checked against
  `rgb(23, 19, 15)` on hover, ratio ≈3.95:1). It does not modify, broaden,
  or otherwise touch the existing Cover, Feature, or Reviews exceptions,
  and does not disable Axe's `color-contrast` rule page-wide — any other
  Interview contrast violation still fails the test.
- **Final-QA reminder:** re-verify this exception still matches the golden
  master exactly (no drift in color/size/weight) during the post-Sprint-2
  holistic design QA.

### 6. Interview muted résumé status, hover/active row states only

- **Date:** 2026-08-25.
- **Route / component:** `/interview/` — `.interview-timeline__status--muted`
  (the "SOLD OUT" and "ARCHIVE" résumé/tour status labels),
  `src/pages/interview/index.astro`, `src/styles/interview.css`, scoped to
  the parent `.interview-timeline__row`'s `:hover` and `:active` states
  only.
- **Immutable source behavior/design:** Muted status color (`#6f6656`) on
  the paper background (`#efe9dc`), which itself swaps to a slightly darker
  tone while the row is hovered (`#e5ddcc`) or pressed (`#ded5c2`) — set via
  each row's `style-hover`/`style-active` attributes (`Newsstand - Full
Site.dc.html`, the three résumé/tour timeline rows, ~lines 368-370).
- **Production behavior/design:** Preserved exactly — same muted-status
  color, same row hover/active background values, same typography.
- **Reason for deviation:** Resting contrast (~4.68:1) passes WCAG 2.2 AA
  and is not part of this exception. Only the row's own hover (~4.19:1) and
  active (~3.88:1) background swap drags this node type under the 4.5:1 AA
  threshold. Changing the muted-status color or the row hover/active
  background would visibly redesign an accepted golden-master interaction,
  which is outside this checkpoint's authorized scope. This does not
  broaden the equivalent Sprint 2B Reviews exception (#4 above) — it is a
  separate, Interview-scoped selector on a separate route.
- **Classification:** accessibility.
- **Status:** accepted permanent design-preservation exception, pending
  final holistic QA. Route scoped, selector scoped, and state scoped — the
  resting state passes and is not allowlisted.
- **Approval source:** explicitly approved by the project owner during the
  Sprint 2C architecture review (approved architecture map referenced at
  the top of the Sprint 2C implementation task).
- **Exact files/nodes affected:** `.interview-timeline__status--muted` in
  `src/styles/interview.css`, only while an ancestor
  `.interview-timeline__row` is `:hover`/`:active`; the corresponding nodes
  in `src/pages/interview/index.astro`.
- **Testing:** `tests/accessibility.spec.ts` adds deterministic hover-state
  and active-state contrast checks for exactly this node type (foreground
  `rgb(111, 102, 86)`), verified against the row's computed hover/active
  background — a resting-state-only Axe scan cannot prove this exception,
  since the resting state passes. It does not modify, broaden, or otherwise
  touch the existing Cover, Feature, or Reviews exceptions, and does not
  disable Axe's `color-contrast` rule page-wide, nor does it broaden this
  to muted status text site-wide.
- **Final-QA reminder:** re-verify this exception still matches the golden
  master exactly (no drift in color/background) during the post-Sprint-2
  holistic design QA.
