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

### 9. Temporary Columns [slug] route-integrity shell (RETIRED — superseded by Sprint 2E entries 11 and 12)

- **Date:** 2026-08-26. **Retired:** 2026-08-26 (Sprint 2E).
- **Route / component:** `/columns/<slug>/` for the five demo slugs
  (`your-automation-doesnt-need-a-model`,
  `six-months-with-a-mechanical-keyboard-i-regret`,
  `what-conducting-taught-me-about-standups`,
  `gacha-ui-is-better-than-your-products-ui`,
  `the-eval-sheet-is-the-deliverable`), `src/pages/columns/[slug]/index.astro`.
- **Status:** RETIRED. Sprint 2D intentionally shipped only a temporary,
  `noindex` route-integrity shell on this route (no hero, no article body,
  no byline system, no sticky rail, no prev/next navigation, no pull
  quote, no signature, no multi-column prose), explicitly deferring the
  production article-detail template to Sprint 2E. Sprint 2E has now
  replaced that shell entirely with the real production template — see
  entry 11 (production template + extended contrast exceptions) and entry
  12 (hero-image implementation choice) below. This entry is kept for the
  historical record only; its "Production behavior/design" description no
  longer matches what ships on this route. Not part of the post-Sprint-2
  holistic design QA's golden-master comparison in its retired form — see
  entry 11 for the current golden-master comparison.
- **Original approval source:** explicitly approved by the project owner
  during the Sprint 2D architecture review (approved architecture map
  referenced at the top of the Sprint 2D implementation task).

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

## Sprint 2E — Columns detail

### 11. Columns detail-template contrast exceptions (extends entries 7 and 8)

- **Date:** 2026-08-26.
- **Route / component:** `/columns/<slug>/` (all five demo slugs, one
  shared template), `src/pages/columns/[slug]/index.astro`,
  `src/styles/columns.css`. This entry documents the production
  article-detail template that replaces the retired temporary shell (see
  entry 9 above) and confirms that reproducing it faithfully requires no
  new accessibility exception categories beyond the two the Columns Index
  already established.
- **Immutable source behavior/design:** Opening a column in the golden
  master swaps to a full article-detail view — a top bar ("← All columns"
  plus "← Previous"/"Next →"), a folio kicker, headline, italic standfirst,
  a byline/date/read-time meta bar, a hero image, a two-column prose block,
  a pull quote, a second heading and prose block, a handwritten signature,
  a prev/next card module, and a "More columns" sidebar (`Newsstand - Full
Site.dc.html`, the `isColumns` sc-if block's `readingColumn` branch,
  ~lines 401-472). Several of these nodes reuse the same small
  Newsstand-red-on-paper text pairing (`#e2231a` on `#efe9dc`) already
  documented for the Columns Index in entry 7, and the sidebar row reuses
  the same `opacity: .72` hover/active treatment already documented in
  entry 8.
- **Production behavior/design:** Preserved exactly — same color pairing,
  sizes, weights, and tracking for every affected node; same hover/active
  opacity value and translateX shift on sidebar rows. No color, size,
  typography, hierarchy, or interaction-feel change was made anywhere in
  this template.
- **Reason for deviation:** Identical to the reasoning already accepted for
  entries 7 and 8 — changing the red, the paper background, the hover
  opacity, or any affected node's size/weight would visibly redesign the
  immutable Newsstand golden master, which is outside this checkpoint's
  authorized scope. This is a straightforward extension of already-approved
  reasoning to the equivalent nodes on a new, faithfully-reproduced route,
  not a new accessibility trade-off requiring separate sign-off.
- **Classification:** accessibility (exception extension, not a new
  exception category).
- **Status:** accepted permanent design-preservation exception, pending
  final holistic QA. This does NOT broaden entries 7 or 8 to any node type
  they did not already cover in spirit (small red editorial text; row
  hover/active opacity) — it applies the same, already-approved reasoning
  to this template's equivalent nodes.
- **Approval source:** project owner, Sprint 2E implementation task (no
  external reviewer this sprint; the exact CSS/markup below is subject to
  independent review before this ships).
- **Exact files/nodes affected (extends entry 7 — red-on-paper text):**
  `.columns-detail__kicker` (the "{{ kicker }} / p.26" folio line, one per
  route), `.columns-detail__all` (the top "← All columns" link),
  `.columns-detail__card-kicker` (the prev/next cards' "← Previous
  column" / "Next column →" labels, one or two per route depending on
  position), `.columns-detail__sidebar-kicker` (the four "More columns"
  row kickers), and `.columns-detail__back` ("Back to all columns →") —
  all in `src/styles/columns.css`, with corresponding nodes in
  `src/pages/columns/[slug]/index.astro`. Explicitly NOT included: the
  top-bar "← Previous" / "Next →" links (`.columns-detail__prevnext-link`)
  — these use the muted-metadata color (`#6f6656`) already documented for
  Reviews/Interview (entries 4 and 6), which passes AA at rest and needs no
  exception here.
- **Exact files/nodes affected (extends entry 8 — row hover/active
  opacity):** `.columns-detail__sidebar-row` in `src/styles/columns.css`,
  only while the row itself is `:hover`/`:active`; in practice only its
  `.columns-detail__sidebar-date` child (muted-metadata color) actually
  drops below AA under the blend, since the row's title is ink-colored
  (inherited, not muted) and stays above AA even at 0.72 opacity — the
  same reason the Columns Index's own equivalent test never asserts its
  title drops below AA either. Corresponding nodes in
  `src/pages/columns/[slug]/index.astro`.
- **Testing:** `tests/accessibility.spec.ts` adds a narrowly-scoped Axe
  A/AA scan of one representative route (the middle of the five, the only
  one with both a Previous and a Next module present, giving the fullest
  exception surface in one scan), asserting the exact expected
  color-contrast target set (nine nodes: one kicker, one "All columns"
  link, two card kickers, four sidebar kickers, one back link) — no more,
  no fewer, no different targets — plus a separate deterministic
  hover/active opacity-blend check confirming the sidebar row's
  `.columns-detail__sidebar-date` text drops below AA under hover/active
  while its ink-colored title stays passing, mirroring the Columns Index's
  own two-part testing pattern (entries 7 and 8). It does not modify,
  broaden, or otherwise touch the Columns Index's own exceptions, the
  Cover/Feature/Reviews/Interview exceptions, or disable Axe's
  `color-contrast` rule page-wide.
- **Final-QA reminder:** re-verify this exception still matches the golden
  master exactly (no drift in color/size/weight/opacity) during the
  post-Sprint-2 holistic design QA.

### 12. Columns detail hero image: `<img>` instead of a CSS background-image div

- **Date:** 2026-08-26.
- **Route / component:** `/columns/<slug>/` (all five demo slugs),
  `.columns-detail__hero`, `src/pages/columns/[slug]/index.astro`,
  `src/styles/columns.css`.
- **Immutable source behavior/design:** The hero image is a plain `<div>`
  with `background-image: {{ colImgCss }}`, `background-size: cover`,
  `background-position: center`, inside an outer bordered/striped frame
  div (`Newsstand - Full Site.dc.html`, ~line 415). There is no `<img>`
  element and no `alt` text anywhere in this node.
- **Production behavior/design:** A real `<img>` inside the same bordered/
  striped `.columns-detail__hero` frame, with explicit `width="1600"`
  `height="700"` (matching the source's `16/7` aspect ratio), `alt=""`
  (decorative — the image is a temporary remote placeholder with no
  trustworthy editorial information, same rationale as every other
  placeholder image in this codebase), and the exact same grayscale-to-
  color/scale hover treatment (`filter: grayscale(1) contrast(1.06)` at
  rest, `filter: none; transform: scale(1.03)` on hover) applied to the
  `<img>` itself rather than to a background-image div.
- **Reason for deviation:** Every other hero-style image already shipped in
  this codebase (Reviews' review-row thumbnails, Interview's two portrait
  images, the Columns Index's lead image) uses a real `<img>`, not a CSS
  background-image, specifically for explicit width/height layout
  stability and accessible alt semantics — an `<img>` participates in the
  accessibility tree and image-loading/decoding pipeline in ways a
  background-image div does not. Reproducing the source's specific CSS
  mechanism here instead of following that established production
  convention would introduce an inconsistent, one-off pattern across an
  otherwise-consistent set of sibling pages, for no visible benefit: the
  aspect ratio, framing, grayscale-hover treatment, and cover/center
  sizing are all preserved exactly.
- **Classification:** approved implementation deviation, not a visual
  redesign.
- **Status:** accepted, pending final holistic QA.
- **Approval source:** project owner, Sprint 2E implementation task.
- **Exact files/nodes affected:** `.columns-detail__hero` and
  `.columns-detail__hero img` in `src/styles/columns.css`; the single
  `<div class="columns-detail__hero"><img .../></div>` node (one per
  route) in `src/pages/columns/[slug]/index.astro`.
- **Testing:** `tests/smoke.spec.ts` verifies the hero `<img>` has explicit
  `width`/`height` and decorative `alt=""`; `tests/accessibility.spec.ts`
  and `tests/visual.spec.ts` exercise the route as a whole, including this
  node's resting/hover appearance.
- **Final-QA reminder:** re-verify this remains the correct approach if a
  later pass changes how hero-style images are implemented site-wide.
