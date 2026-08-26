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

## Sprint 2F — B-Sides

### 13. B-Sides kicker red-on-paper contrast (extends entries 1, 3, 5, 7)

- **Date:** 2026-08-26.
- **Route / component:** `/b-sides/` — `.bsides-kicker` ("B-Sides / p.28"),
  `src/pages/b-sides/index.astro`, `src/styles/b-sides.css`.
- **Immutable source behavior/design:** Small bold Newsstand-red text
  (`#e2231a`) directly on the paper background (`#efe9dc`), ~11px bold
  Space Mono, uppercase, 0.24em tracking — the same folio/kicker treatment
  already documented for every other page's kicker (`Newsstand - Full
Site.dc.html`, the `isBsides` sc-if block, ~line 510).
- **Production behavior/design:** Preserved exactly — same color pairing,
  size, weight, and tracking. No color, size, typography, or hierarchy
  change was made.
- **Reason for deviation:** Identical to the reasoning already accepted for
  entries 1, 3, 5, and 7 — this exact color pairing produces ~3.87:1
  contrast, which fails the WCAG 2.2 AA normal-text threshold (4.5:1).
  Changing the red or the paper background would visibly redesign the
  immutable Newsstand golden master, which is outside this checkpoint's
  authorized scope. This is a straightforward extension of already-approved
  reasoning to this route's equivalent node, not a new accessibility
  trade-off requiring separate sign-off.
- **Classification:** accessibility (exception extension, not a new
  exception category).
- **Status:** accepted permanent design-preservation exception, pending
  final holistic QA. Route scoped and selector scoped.
- **Approval source:** project owner, Sprint 2F implementation task.
- **Exact files/nodes affected:** `.bsides-kicker` in
  `src/styles/b-sides.css`; the single `<p class="bsides-kicker">` node in
  `src/pages/b-sides/index.astro`.
- **Testing:** `tests/accessibility.spec.ts` adds a narrowly-scoped,
  B-Sides-specific contrast expectation for exactly this node (foreground
  `rgb(226, 35, 26)` on background `rgb(239, 233, 220)`, ratio ≈3.87:1). It
  does not modify, broaden, or otherwise touch the existing Cover, Feature,
  Reviews, Interview, or Columns exceptions, and does not disable Axe's
  `color-contrast` rule page-wide — any other B-Sides contrast violation
  still fails the test. The same test also independently verifies (and
  requires passing, not just "no Axe flag") the three badge treatments (IN
  USE ink-on-yellow, LIVE white-on-red ~4.68:1, WIP ink-on-paper outline)
  and the inverted card's opacity-.75 tech-stack line (paper-on-ink,
  ~8.9:1) — none of these needed a new exception, and the test fails if any
  of them ever regresses below AA.
- **Final-QA reminder:** re-verify this exception still matches the golden
  master exactly (no drift in color/size/weight) during the post-Sprint-2
  holistic design QA.

### 14. B-Sides card images: decorative `alt=""` instead of the source's literal alt text

- **Date:** 2026-08-26.
- **Route / component:** `/b-sides/` — the four `.bsides-card__image img`
  nodes, `src/pages/b-sides/index.astro`.
- **Immutable source behavior/design:** Each of the four picsum.photos
  placeholder images carries a literal `alt` attribute naming the project
  ("Bandstand", "Pity Counter", "Setlist", "Shelf") (`Newsstand - Full
Site.dc.html`, the `isBsides` sc-if block, ~lines 516, 522, 528, 534).
  Unlike every other page's picsum.photos placeholders, this is the one
  section of the source where the literal alt text is not itself a
  template placeholder — it is real, final golden-master copy.
- **Production behavior/design:** All four images use `alt=""` (decorative)
  instead, with explicit `width="800"` `height="500"` matching the source's
  `16/10` aspect ratio.
- **Reason for deviation:** Every other remote picsum.photos placeholder
  already shipped in this codebase (Reviews' review-row thumbnails,
  Interview's two portraits, the Columns index lead image, the Columns
  detail hero) is treated as decorative `alt=""`, because the image itself
  is a temporary, unrelated stock photo carrying no trustworthy editorial
  information — captioning it with a literal project name would assert a
  connection between the placeholder photo and the named project that does
  not actually exist. Reproducing the source's literal alt strings here
  instead of following that established, codebase-wide convention would
  introduce a one-off inconsistency for no accessibility benefit: a screen
  reader user would be told "Bandstand" is depicted in an image that is
  actually an unrelated stock photo of something else entirely.
- **Classification:** approved implementation deviation, not a visual
  redesign (this affects no sighted-visible behavior at all).
- **Status:** accepted, pending final holistic QA.
- **Approval source:** project owner, Sprint 2F implementation task,
  applying the same established reasoning as Sprint 2E entry 12's
  `<img>`-vs-background-image implementation choice.
- **Exact files/nodes affected:** the four `<img>` nodes inside
  `.bsides-card__image` in `src/pages/b-sides/index.astro`.
- **Testing:** `tests/smoke.spec.ts` verifies each of the four card images
  has explicit `width="800"` `height="500"` and `alt=""`.
- **Final-QA reminder:** re-verify this remains the correct approach if a
  later pass changes how placeholder-image alt text is handled site-wide.

## Sprint 2G — Rotation

### 15. Rotation kicker, status-card labels, list-card headings, and star-rating red-on-paper contrast (extends entries 1, 3, 5, 7, 13)

- **Date:** 2026-08-26.
- **Route / component:** `/rotation/` — `.rotation-kicker` ("Rotation /
  p.30 · updated 4 August 2026"), the "Building" and "Gigging"
  status-card labels (`.rotation-status-card__label`, on the two status
  cards that are not the always-yellow "Rehearsing" card), the two
  list-card headings (`.rotation-list-card__heading`, "On heavy rotation ·
  games" / "On the shelf · manga & gear"), and the four games star ratings
  (`.rotation-games__rating`), `src/pages/rotation/index.astro`,
  `src/styles/rotation.css`.
- **Immutable source behavior/design:** Small bold Newsstand-red text
  (`#e2231a`) directly on the paper background (`#efe9dc`) — the kicker
  and both list-card headings at ~11px/10px bold Space Mono, the two
  status-card labels at ~10px bold Space Mono, and the star ratings at
  ~11px bold Space Mono — the same folio/kicker/label treatment already
  documented for every other page (`Newsstand - Full Site.dc.html`, the
  `isRotation` sc-if block, ~lines 545, 549, 551, 556, 558-561, 565). The
  "Rehearsing" status card's own label has no explicit color in the source
  at all, so it inherits ink instead and never violates — it is
  deliberately excluded from this exception.
- **Production behavior/design:** Preserved exactly — same color pairing,
  sizes, weights, and tracking for every affected node. No color, size,
  typography, or hierarchy change was made.
- **Reason for deviation:** Identical to the reasoning already accepted
  for entries 1, 3, 5, 7, and 13 — this exact color pairing produces
  ~3.87:1 contrast, which fails the WCAG 2.2 AA normal-text threshold
  (4.5:1). Changing the red or the paper background would visibly
  redesign the immutable Newsstand golden master, which is outside this
  checkpoint's authorized scope. This is a straightforward extension of
  already-approved reasoning to this route's equivalent nodes, not a new
  accessibility trade-off requiring separate sign-off.
- **Classification:** accessibility (exception extension, not a new
  exception category).
- **Status:** accepted permanent design-preservation exception, pending
  final holistic QA. Route scoped and selector scoped. The "Rehearsing"
  card's ink-on-yellow label/title/description text and the dotted-border
  list rows all pass WCAG AA at rest and are explicitly NOT part of this
  exception — verified as passing in the dedicated pass-through test
  below.
- **Approval source:** project owner, Sprint 2G implementation task.
- **Exact files/nodes affected:** `.rotation-kicker`,
  `.rotation-status-card__label` (only the Building and Gigging cards —
  the Rehearsing card's label is excluded, as it never violates),
  `.rotation-list-card__heading`, and `.rotation-games__rating` in
  `src/styles/rotation.css`; the corresponding nodes in
  `src/pages/rotation/index.astro`.
- **Testing:** `tests/accessibility.spec.ts` adds a narrowly-scoped,
  Rotation-specific contrast expectation for exactly these node types
  (foreground `rgb(226, 35, 26)` on background `rgb(239, 233, 220)`, ratio
  ≈3.87:1). `.rotation-games__rating` is `aria-hidden="true"` (its
  accessible equivalent is a separate visually-hidden "N out of 5 stars"
  node per row, mirroring Reviews' entry 3 pattern), so Axe's
  `color-contrast` rule never reports it directly — its color identity is
  still verified from real computed style. It does not modify, broaden, or
  otherwise touch the existing Cover, Feature, Reviews, Interview,
  Columns, or B-Sides exceptions, and does not disable Axe's
  `color-contrast` rule page-wide — any other Rotation contrast violation
  still fails the test. A separate pass-through test independently
  verifies (and requires passing, not just "no Axe flag") the
  "Rehearsing" card's ink-on-yellow text and the dotted-border list rows —
  none of these needed a new exception, and the test fails if any of them
  ever regresses below AA.
- **Final-QA reminder:** re-verify this exception still matches the golden
  master exactly (no drift in color/size/weight) during the post-Sprint-2
  holistic design QA.

## Sprint 2H — Letters

### 16. Real contact information: email, GitHub, and LinkedIn (NOT a "pending review" placeholder deviation)

- **Date:** 2026-08-26.
- **Route / component:** `/letters/` — the three contact rows in
  `.letters-contact`, `src/pages/letters/index.astro`.
- **Immutable source behavior/design:** The golden master displays three
  literal, hardcoded strings with identical visual treatment:
  `HELLO@JVCABALLERO.DEV`, `GITHUB.COM/JVCABALLERO`, and
  `LINKEDIN.COM/IN/JVCABALLERO` (`Newsstand - Full Site.dc.html`, the
  `isLetters` sc-if block, ~lines 589-591).
- **Production behavior/design:** The displayed email address is changed
  to the real, final address `JVCABALLERO@TUTA.IO` (`mailto:jvcaballero@tuta.io`),
  reproducing the source's own literal-uppercase display convention
  rather than its exact string. The GitHub and LinkedIn rows keep the
  source's exact display strings (`GITHUB.COM/JVCABALLERO`,
  `LINKEDIN.COM/IN/JVCABALLERO`) but now point to the real profile URLs
  (`https://github.com/JVCaballero`,
  `https://linkedin.com/in/john-vincent-c-06814b111`).
- **Reason for deviation:** This is explicitly NOT the "temporary demo
  content pending final Sprint 2 review" framing used for every other
  piece of copy on this page (and every other page in this codebase).
  Letters' entire purpose is to be a genuinely working contact surface —
  shipping a fictional or placeholder address/profile here would defeat
  the page's own point and could mislead a real visitor into attempting
  to contact a non-existent or wrong destination. The project owner
  explicitly decided, for this sprint only, that the three contact
  mechanisms (and only these three — the "Currently taking"/"Also
  accepting" service-offering copy and both handwritten notes stay
  golden-master demo content, same framing as every other page) are real,
  final, production content, not a placeholder.
- **Classification:** approved real-content substitution, not a "pending
  review" placeholder and not a visual redesign (the display treatment,
  typography, and layout are all preserved exactly).
- **Status:** accepted, real production content — not subject to the
  post-Sprint-2 holistic "placeholder content" QA sweep the same way the
  rest of this page's copy is. Still subject to ordinary visual/behavioral
  QA (does it look right, does it work).
- **Approval source:** project owner, Sprint 2H implementation task
  (explicit instruction, not inferred).
- **Exact files/nodes affected:** the three `<a class="letters-contact__link">`
  nodes in `src/pages/letters/index.astro`.
- **Testing:** `tests/smoke.spec.ts` asserts the exact real email address,
  `mailto:` href, GitHub URL, and LinkedIn URL verbatim.
- **Final-QA reminder:** if the real email address, GitHub username, or
  LinkedIn profile slug ever changes, update this entry, the page, and the
  smoke test together — these three values are treated as real contact
  information, not demo copy, so a drift here is a real defect, not a
  content-review backlog item.

### 17. GitHub and LinkedIn rows upgraded from inert styled text to real, functional external links

- **Date:** 2026-08-26.
- **Route / component:** `/letters/` — the GitHub and LinkedIn rows in
  `.letters-contact`, `src/pages/letters/index.astro`.
- **Immutable source behavior/design:** Both rows are bare
  `<span style="cursor:pointer;...">` elements with the exact same visual
  treatment (hover/active transform + color swap) as the email span, but
  no `onClick` and no `href` at all — visually identical, but genuinely
  inert (`Newsstand - Full Site.dc.html`, ~lines 590-591).
- **Production behavior/design:** Both become real `<a href="...">`
  elements with `target="_blank" rel="noopener noreferrer"`, keeping the
  exact same visual treatment (hover→yellow+translateX(4px),
  active→ink+scale(.98)+translateX(8px), word-break:break-all, same
  font/weight/tracking).
- **Reason for deviation:** A production portfolio page that visually
  presents two contact methods as clickable, styled-identically-to-email
  rows, but which do nothing when clicked, is a worse outcome than making
  them real links — this is squarely "replace the prototype plumbing,
  preserve the experience," the same principle already applied to the
  email row's click-to-copy mechanism (entry 18 below). The visual
  experience is unchanged; only the underlying inert-span-with-no-target
  is upgraded to a real anchor.
- **Classification:** approved implementation/functionality upgrade, not
  a visual redesign.
- **Status:** accepted, project owner's explicit Sprint 2H decision.
- **Approval source:** project owner, Sprint 2H implementation task.
- **Exact files/nodes affected:** the two `<a class="letters-contact__link">`
  nodes (GitHub, LinkedIn) in `src/pages/letters/index.astro`.
- **Testing:** `tests/smoke.spec.ts` verifies both links' `href`, `target`,
  and `rel` attributes, and that no `<span onclick>` or `href="#"` pattern
  exists anywhere on the page.
- **Final-QA reminder:** re-verify these remain real, correctly-targeted
  external links if the visual contact-row treatment is ever revisited
  site-wide.

### 18. Email click-to-copy: real `mailto:` anchor with progressive-enhancement clipboard copy, replacing a non-functional `<span onClick>`

- **Date:** 2026-08-26.
- **Route / component:** `/letters/` — the email row,
  `src/pages/letters/index.astro`,
  `src/scripts/interactions/clipboard-copy.ts`.
- **Immutable source behavior/design:** `<span onClick="{{ copyEmail }}"
style="cursor:pointer;...">HELLO@JVCABALLERO.DEV</span>` — a bare span,
  not a real link, not natively focusable or keyboard-operable, with a
  template-runtime `copyEmail` handler this codebase does not and cannot
  execute. Clicking it in the golden master sets a `copied` flag that
  reveals a "copied! now tell me the actual problem →" line with a
  `dv-scrawl` entrance animation (~line 594).
- **Production behavior/design:** A real `<a href="mailto:jvcaballero@tuta.io"
data-copy-email="jvcaballero@tuta.io">` — keyboard-focusable, works with
  zero JavaScript via the native `mailto:` fallback. `clipboard-copy.ts`
  (new interaction module, registered in `interaction-controller.ts`)
  progressively enhances the click: if `navigator.clipboard.writeText` is
  available, the click is intercepted (`preventDefault`), the real
  address is copied, and the golden master's own "copied!" line
  (reproduced verbatim, including its `dv-scrawl`-equivalent entrance
  animation) is shown and announced via `aria-live="polite"`. If the
  Clipboard API is unavailable, or the copy promise rejects, the click is
  left alone (or the module falls back to `window.location.href`) and the
  native mailto navigation proceeds — no false "copied!" confirmation is
  ever shown for a copy that didn't happen.
- **Reason for deviation:** The source's mechanism (`onClick` on a bare
  span, driven by prototype-runtime template plumbing) cannot be
  reproduced as-is in static production Astro — there is no `copyEmail`
  handler to call. "Preserve the experience; replace the prototype
  plumbing" is this codebase's core operating rule (AGENTS.md): the
  visible experience (a stylized address that copies itself when clicked,
  with a confirmation message) is preserved exactly, while the
  underlying mechanism is upgraded to something real — keyboard-
  accessible, works with no JS, and actually copies the real address
  rather than doing nothing.
- **Classification:** approved implementation deviation (progressive-
  enhancement upgrade), not a visual redesign.
- **Status:** accepted, project owner's explicit Sprint 2H decision.
- **Approval source:** project owner, Sprint 2H implementation task.
- **Exact files/nodes affected:** the `<a class="letters-contact__link"
data-copy-email>` node in `src/pages/letters/index.astro`; the new
  `src/scripts/interactions/clipboard-copy.ts` module; its one-line
  registration in `src/scripts/interactions/interaction-controller.ts`'s
  `MODULES` array (the one expected exception to leaving that file
  alone — its own header comment describes exactly this kind of
  extension).
- **Testing:** `tests/smoke.spec.ts` grants Playwright's
  `clipboard-read`/`clipboard-write` context permissions and verifies
  `navigator.clipboard.readText()` returns the real address after a click,
  that the mailto navigation is intercepted, that the confirmation shows
  and is `aria-live="polite"`, that it auto-hides and can be re-triggered,
  and that the no-Clipboard-API fallback path leaves the link as a
  working mailto anchor without a false confirmation.
- **Final-QA reminder:** re-verify this remains the correct approach if a
  later pass changes how progressive-enhancement click interactions are
  implemented site-wide.

### 19. Letters kicker red-on-paper contrast (extends entries 1, 3, 5, 7, 13, 15) and a new route-scoped focus-visible override for the red panel

- **Date:** 2026-08-26.
- **Route / component:** `/letters/` — `.letters-kicker` ("Letters /
  p.34") and `.letters-contact__link:focus-visible` (the three contact
  links), `src/pages/letters/index.astro`, `src/styles/letters.css`.
- **Immutable source behavior/design:** Small bold Newsstand-red text
  (`#e2231a`) directly on the paper background (`#efe9dc`), ~11px bold
  Space Mono, uppercase, 0.24em tracking — the same folio/kicker treatment
  already documented for every other page's kicker (`Newsstand - Full
Site.dc.html`, the `isLetters` sc-if block, ~line 581). The source has no
  keyboard-focus concept at all.
- **Production behavior/design:** The kicker is preserved exactly — same
  color pairing, size, weight, and tracking. Separately (not a golden-
  master-derived value at all), this codebase's global `:focus-visible`
  outline (`src/styles/global.css`) is Newsstand red — identical to this
  page's own red panel background, which would render an invisible focus
  ring for the three contact links while they sit on that panel.
  `.letters-contact__link:focus-visible` gets a narrowly-scoped override to
  an ink (`#17130f`) outline instead, visible against the red panel.
- **Reason for deviation:** The kicker portion is identical reasoning to
  entries 1, 3, 5, 7, 13, and 15 — this exact color pairing produces
  ~3.87:1 contrast, which fails WCAG 2.2 AA normal-text (4.5:1); changing
  the red or paper background would visibly redesign the immutable
  golden master. The focus-visible portion is a distinct, narrow
  accessibility necessity introduced by this page's own background color,
  not a golden-master value at all (the source has no focus treatment to
  preserve or deviate from) — a real, new accessibility problem the global
  default would otherwise create on this one route.
- **Classification:** the kicker portion is an accessibility exception
  extension (not a new category); the focus-visible portion is an
  accessibility necessity/addition, not a design deviation from the
  golden master.
- **Status:** accepted permanent design-preservation exception (kicker)
  plus accepted accessibility addition (focus-visible override), pending
  final holistic QA for the kicker portion only — the focus-visible
  override is a production-only addition with no golden-master equivalent
  to re-check against.
- **Approval source:** project owner, Sprint 2H implementation task.
- **Exact files/nodes affected:** `.letters-kicker` and
  `.letters-contact__link:focus-visible` in `src/styles/letters.css`; the
  corresponding nodes in `src/pages/letters/index.astro`.
- **Testing:** `tests/accessibility.spec.ts` adds a narrowly-scoped,
  Letters-specific contrast expectation for the kicker (foreground
  `rgb(226, 35, 26)` on background `rgb(239, 233, 220)`, ratio ≈3.87:1),
  a pass-through test confirming the red panel's white-on-red text, the
  yellow "Also accepting" card's ink-on-yellow text, and the muted
  "✗ Unpaid..." line all pass WCAG AA at rest, and a dedicated
  focus-visible test confirming all three contact links resolve to an ink
  (not red) outline when focused. It does not modify, broaden, or
  otherwise touch the Cover, Feature, Reviews, Interview, Columns,
  B-Sides, or Rotation exceptions, and does not disable Axe's
  `color-contrast` rule page-wide.
- **Final-QA reminder:** re-verify the kicker exception still matches the
  golden master exactly (no drift in color/size/weight); re-verify the
  focus-visible override is still necessary if the global default focus
  treatment ever changes.

### 20. Letters handwritten hint contrast on the red panel (`.letters-hand-note`)

- **Date:** 2026-08-26.
- **Route / component:** `/letters/` — `.letters-hand-note` ("tap the
  address — it copies itself"), `src/pages/letters/index.astro`,
  `src/styles/letters.css`.
- **Immutable source behavior/design:** The handwritten hint uses a
  dedicated lighter-red handwriting color (`#ffd9d6`) directly on the red
  panel background (`#e2231a`), at `clamp(16px,2vw,19px)`/1.3 Architects
  Daughter, weight 400 (`Newsstand - Full Site.dc.html`, the `isLetters`
  sc-if block, ~line 597).
- **Production behavior/design:** Preserved exactly — same
  `--color-handwriting-on-red` value, same size, weight, line-height, and
  `rotate(-1deg)` treatment.
- **Reason for deviation:** This exact color pairing produces ~3.60:1
  contrast, which fails the WCAG 2.2 AA normal-text threshold (4.5:1) —
  the text does not meet the large-text exemption either (max 19px at
  weight 400 is below the 24px-regular/18.66px-bold large-text
  thresholds). This is the first page to actually use the
  `--color-handwriting-on-red` token (it was extracted into tokens.css
  during an earlier sprint's token pass but had no consumer until this
  one). Changing the color or the red panel background would visibly
  redesign an accepted golden-master handwriting treatment, which is
  outside this checkpoint's authorized scope.
- **Classification:** accessibility (new exception target — a red-panel-
  specific handwriting pairing, not an extension of the small-red-on-
  paper kicker exceptions above, which use a different foreground/
  background pair entirely).
- **Status:** accepted permanent design-preservation exception, pending
  final holistic QA.
- **Approval source:** project owner, Sprint 2H implementation task.
- **Exact files/nodes affected:** `.letters-hand-note` in
  `src/styles/letters.css`; the single `<p class="letters-hand-note">`
  node in `src/pages/letters/index.astro`.
- **Testing:** `tests/accessibility.spec.ts` adds a narrowly-scoped,
  Letters-specific contrast expectation for exactly this node (foreground
  `rgb(255, 217, 214)` on background `rgb(226, 35, 26)`, ratio ≈3.60:1).
  It does not modify, broaden, or otherwise touch the kicker exception
  above or any other page's exceptions, and does not disable Axe's
  `color-contrast` rule page-wide — any other Letters contrast violation
  still fails the test.
- **Final-QA reminder:** re-verify this exception still matches the golden
  master exactly (no drift in color/size/weight) during the post-Sprint-2
  holistic design QA.
