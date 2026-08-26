/*
  Post-Sprint-2 fix — Dispatch band message rotation. Mirrors the golden
  master's runtime (reference/newsstand-original/source/Newsstand - Full
  Site.dc.html, ~lines 707-712 for the five-message array and ~lines
  895-939 for the rotation itself): a `setInterval` advances `beat` every
  4800ms, `idx = beat % dispatches.length` selects the current message,
  and the message node re-mounts with a fresh `dv-fade .5s ease both` on
  every change. The five messages below are that array, verbatim.

  This is the first genuinely SITE-WIDE interaction module — every other
  module in interaction-controller.ts pathname-gates itself to specific
  routes, but the Dispatch band (src/components/NewsstandBottomChrome.astro)
  renders in every page's shared footer, so this module intentionally has
  no pathname check and runs on every route.

  The very first message (index 0) is already server-rendered as static
  HTML in NewsstandBottomChrome.astro, unanimated — deliberately not the
  same "fades in on mount" behavior the source's React runtime gives its
  very first render. Adding an unconditional fade-in to the static initial
  paint proved actively harmful: it left every page's Dispatch message in
  a timing-dependent opacity state right as Playwright's automated
  screenshot tooling disables/freezes animations, which broke every
  existing visual baseline by a handful of antialiased pixels. This module
  only ever applies the fade via the `--rotating` modifier class, toggled
  on for each JS-driven message change and never for the static first
  paint — see NewsstandBottomChrome.astro's own comment on that class.

  Reduced motion needs no handling here beyond that: global.css's
  `prefers-reduced-motion: reduce` rule already forces every animation
  (including the fade this module triggers) to a single near-instant
  iteration, and the rotation interval itself keeps running regardless of
  motion preference, matching the source (`reduce` only ever gates
  parallax/magnet/cursor-preview there, never the beat timer or the
  dispatch rotation).
*/
import type { InteractionModule } from './interaction-controller';

const MESSAGE_SELECTOR = '[data-dispatch-message]';
const ROTATING_CLASS = 'newsstand-dispatch__message--rotating';
const ROTATE_INTERVAL_MS = 4800;

const MESSAGES = [
  'Case file: teaching a bot to say “I don’t know”',
  'New in the playground — Shelf, a manga backlog tracker',
  'Field show season opens October — Saturdays are gone',
  'Open to contract work from November 2026',
  'Now reviewing: a split keyboard I already regret',
];

export const dispatchRotation: InteractionModule = {
  name: 'dispatch-rotation',
  // No pathname gate needed — this module is intentionally site-wide (see
  // file header comment) — and reduced motion is already fully handled
  // by global.css, so the context parameter is omitted entirely here.
  init() {
    const message = document.querySelector<HTMLElement>(MESSAGE_SELECTOR);
    if (!message) return;

    let index = 0;

    const timer = setInterval(() => {
      index = (index + 1) % MESSAGES.length;
      message.textContent = MESSAGES[index];
      // Restart the fade: drop the class, force a reflow so the browser
      // forgets the previous run, then reapply it.
      message.classList.remove(ROTATING_CLASS);
      void message.offsetWidth;
      message.classList.add(ROTATING_CLASS);
    }, ROTATE_INTERVAL_MS);

    return () => clearInterval(timer);
  },
};
