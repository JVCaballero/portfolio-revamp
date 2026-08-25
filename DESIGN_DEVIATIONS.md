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

## Sprint 2D — Columns

### 7. Columns small Newsstand-red editorial text

- **Date:** 2026-08-26.
- **Route / component:** `/columns/` — `.columns-kicker` ("Columns /
  p.26"), `.columns-lead__cta` (the lead "Read the essay →" line), and
  `.columns-more__kicker` (the four sidebar category kickers — "Gadget
  review", "Column", "Rant", "Notebook"), `src/pages/columns/index.astro`,
  `src/styles/columns.css`.
- **Immutable source behavior/design:** Small bold Newsstand-red text
  (`#e2231a`) directly on the paper background (`#efe9dc`) — the kicker at
  ~11px bold Space Mono/0.24em tracking, the lead CTA at ~10px bold Space
  Mono/0.16em tracking, and the sidebar category kickers at ~9.5px bold
  Space Mono/0.16em tracking (`Newsstand - Full Site.dc.html`, ~lines 476,
  487, 462/493-496).
- **Production behavior/design:** Preserved exactly — same color pairing,
  sizes, weights, and tracking for all three node types. No color, size,
  typography, or hierarchy change was made.
- **Reason for deviation:** The exact color pairing produces ~3.87:1
  contrast at rest, which fails the WCAG 2.2 AA normal-text threshold
  (4.5:1). Changing the red, the paper background, or the affected node's
  size/weight would visibly redesign the immutable Newsstand golden
  master, which is outside this checkpoint's authorized scope. This does
  not broaden the equivalent Sprint 2A/2B/2C exceptions above — it is a
  separate, Columns-scoped selector set on a separate route.
- **Classification:** accessibility.
- **Status:** accepted permanent design-preservation exception, pending
  final holistic QA.
- **Approval source:** explicitly approved by the project owner during the
  Sprint 2D architecture review (approved architecture map referenced at
  the top of the Sprint 2D implementation task).
- **Exact files/nodes affected:** `.columns-kicker`, `.columns-lead__cta`,
  and `.columns-more__kicker` in `src/styles/columns.css`; the
  corresponding nodes in `src/pages/columns/index.astro`.
- **Testing:** `tests/accessibility.spec.ts` adds a narrowly-scoped,
  Columns-specific contrast expectation for exactly these node types
  (foreground `rgb(226, 35, 26)` on background `rgb(239, 233, 220)`, ratio
  ≈3.87:1 at rest). It does not modify, broaden, or otherwise touch the
  existing Cover, Feature, Reviews, or Interview exceptions, and does not
  disable Axe's `color-contrast` rule page-wide — any other Columns
  contrast violation still fails the test.
- **Final-QA reminder:** re-verify this exception still matches the golden
  master exactly (no drift in color/size/weight) during the post-Sprint-2
  holistic design QA.

### 8. More Columns hover/active opacity

- **Date:** 2026-08-26.
- **Route / component:** `/columns/` — `.columns-more__row` (the four
  secondary column rows), scoped to that row's own `:hover` and `:active`
  states only, `src/pages/columns/index.astro`, `src/styles/columns.css`.
- **Immutable source behavior/design:** Each secondary row applies
  `opacity:.72` to itself (the whole row, including its title, excerpt,
  and date/read-time text) while hovered, plus a translateX shift on hover
  and active (`Newsstand - Full Site.dc.html`, ~lines 493-496).
- **Production behavior/design:** Preserved exactly — same `opacity: .72`
  hover value and translateX shift, applied to the whole row.
- **Reason for deviation:** The row's own hover opacity multiplies against
  every text color inside it (title, excerpt color `#544a3d`, muted
  date/read-time color `#6f6656`), reducing their effective contrast
  against the paper background below what each color achieves at full
  opacity. Removing the opacity, recoloring the row's text specifically
  during hover, or raising the opacity to satisfy contrast would change an
  accepted golden-master interaction's feel, which is outside this
  checkpoint's authorized scope.
- **Classification:** accessibility.
- **Status:** accepted permanent design-preservation exception, pending
  final holistic QA. Route scoped, selector scoped, and state scoped — the
  resting state is unaffected and is not allowlisted.
- **Approval source:** explicitly approved by the project owner during the
  Sprint 2D architecture review (approved architecture map referenced at
  the top of the Sprint 2D implementation task).
- **Exact files/nodes affected:** `.columns-more__row` in
  `src/styles/columns.css`, only while the row itself is `:hover`/`:active`;
  the corresponding nodes in `src/pages/columns/index.astro`.
- **Testing:** `tests/accessibility.spec.ts` verifies the row's hover
  opacity value and its effect on the row's text colors is scoped to
  exactly `.columns-more__row`'s own hover/active states, and does not
  disable Axe's `color-contrast` rule page-wide — any other Columns
  contrast violation still fails the test.
- **Final-QA reminder:** re-verify this exception still matches the golden
  master exactly (no drift in opacity value) during the post-Sprint-2
  holistic design QA. A later, explicit design decision may change this
  interaction's feel; this entry does not authorize that on its own.

### 9. Temporary Columns [slug] route-integrity shell

- **Date:** 2026-08-26.
- **Route / component:** `/columns/<slug>/` for the five temporary demo
  slugs (`your-automation-doesnt-need-a-model`,
  `six-months-with-a-mechanical-keyboard-i-regret`,
  `what-conducting-taught-me-about-standups`,
  `gacha-ui-is-better-than-your-products-ui`,
  `the-eval-sheet-is-the-deliverable`), `src/pages/columns/[slug]/index.astro`.
- **Immutable source behavior/design:** Opening a column in the golden
  master swaps to a full article-detail view — hero image, byline/date/
  read-time bar, two-column prose, a pull quote, a "Tour dates"-style
  prev/next module, and a "More columns" sidebar (`Newsstand - Full
Site.dc.html`, the `isColumns` sc-if block's `readingColumn` branch,
  ~lines 401-472).
- **Production behavior/design:** Each of the five demo slugs resolves to
  a real, direct `/columns/<slug>/` URL that renders a minimal, `noindex`
  placeholder shell (kicker, the column's own title as an h1, one
  paragraph stating the reading view is deferred, and a link back to
  `/columns/`) instead of the immutable article-detail template. The
  route survives reload, is Back/Forward-safe, and keeps the shared
  Columns navigation state active.
- **Immutable source detail view (correction):** the golden master contains
  an individual-column detail experience, but Sprint 2D intentionally
  provides only a temporary noindex route-integrity shell. Sprint 2E will
  reproduce the approved detail-page system.
- **Reason for deviation:** Sprint 2E's production article template has not
  yet run, and its content architecture is explicitly deferred, not
  pre-decided, by Sprint 2D. Sprint 2E will inspect the immutable
  individual-column template and determine the smallest durable content
  architecture then. Building the production template now would be
  premature infrastructure outside this checkpoint's approved scope. A
  route that resolves and behaves correctly is still required so the
  Columns index's five article links are real, navigable, native anchors
  rather than dead or fake links.
- **Classification:** temporary implementation deviation, not a permanent
  design decision.
- **Status:** temporary — expected to be superseded by the Sprint 2E
  production article template. Not part of the post-Sprint-2 holistic
  design QA's golden-master comparison (this temporary shell is explicitly
  not attempting to match the golden master's own detail view).
- **Approval source:** explicitly approved by the project owner during the
  Sprint 2D architecture review (approved architecture map referenced at
  the top of the Sprint 2D implementation task).
- **Exact files/nodes affected:** `src/pages/columns/[slug]/index.astro`;
  the `.columns-detail-shell*`, `.columns-detail__kicker`, and
  `.columns-detail__back` selectors in `src/styles/columns.css`. Correction
  pass (2026-08-26): this shell was found reusing `.columns-kicker`, which
  imports the Columns Index's approved red-on-paper contrast exception
  (entry 7) onto a node that exception was never approved for. Fixed by
  giving the shell its own `.columns-detail__kicker` and
  `.columns-detail__back` (resting state), both using `--color-ink` instead
  of the accent red — no new accessibility exception was introduced, and
  the Index's existing exception was not broadened.
- **Testing:** `tests/smoke.spec.ts` covers all five slugs resolving
  directly, `noindex`, active Columns navigation, reload, Back/Forward,
  and the back-to-index link. `tests/accessibility.spec.ts` adds a
  representative Axe A/AA scan of one detail route
  (`/columns/your-automation-doesnt-need-a-model/`), confirming no new
  contrast exception is needed there.
- **Final-QA reminder:** remove or fully rewrite this entry once Sprint 2E
  replaces this shell with the production article template.

### 10. More Columns reveal-wrapper placement (implementation deviation, approved)

- **Date:** 2026-08-26 (correction pass).
- **Route / component:** `/columns/` — each secondary column row,
  `src/pages/columns/index.astro`.
- **Immutable source behavior/design:** The source markup places reveal
  state and hover transform/opacity on the same row node, and the
  prototype's own runtime generates per-element hover pseudo-class rules
  with `!important`, which is what lets its hover transform/opacity
  declarations override that same node's reveal inline state.
- **Production behavior/design:** Production deliberately does not port
  that prototype specificity plumbing. The non-interactive `<li
class="columns-more__item" data-reveal>` owns reveal state (the
  scroll-reveal module's inline `opacity`/`transform`); the child `<a
class="columns-more__row">` owns its own `:hover`/`:active` transform and
  opacity via ordinary stylesheet rules. Because the anchor is a descendant
  of the `<li>`, it fades up with its parent during reveal, so the settled
  visual, stagger, reading order, and hover/active states all remain
  faithful to the source.
- **Reason for deviation:** Astro/production CSS has no equivalent to the
  prototype's generated `!important` pseudo-style runtime, and recreating
  that machinery purely to keep reveal and hover on the same node would be
  a specificity hack, not a faithful reproduction. Putting both on the
  same node without that machinery would let scroll-reveal.ts's inline
  `opacity:1`/`transform:none` (which, being inline, always outranks a
  stylesheet `:hover` rule on the same element regardless of specificity)
  permanently defeat the row's own hover dim/shift after the first reveal.
  Moving reveal state one level up to the `<li>` avoids that outcome
  without changing what's visible.
- **Classification:** approved implementation deviation, not a visual
  redesign.
- **Status:** accepted, pending final holistic QA. One known, accepted
  edge case: hovering a row while its initial reveal animation is still in
  progress may compose slightly differently than the prototype, since the
  two states now animate on different nodes; this does not affect the
  settled (post-reveal) appearance or behavior.
- **Approval source:** explicitly approved by the project owner during the
  Sprint 2D correction-pass review, following GPT-5.6 Sol — High's review
  of the initial Sprint 2D implementation.
- **Exact files/nodes affected:** `li.columns-more__item` and
  `a.columns-more__row` in `src/pages/columns/index.astro`; no CSS
  selector changes were required in `src/styles/columns.css`.
- **Testing:** `tests/smoke.spec.ts` and `tests/accessibility.spec.ts`
  exercise reveal, hover, and active states on the secondary rows; see the
  file-level comment in `src/pages/columns/index.astro` for the
  implementation rationale.
- **Final-QA reminder:** re-verify this remains the correct approach if
  Sprint 2E or a later pass changes how reveal or row hover is
  implemented site-wide.
