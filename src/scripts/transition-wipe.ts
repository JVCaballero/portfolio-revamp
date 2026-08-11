/*
  Sprint 1E — narrowly wires the Newsstand transition wipe to Astro's
  client-side navigation. Mirrors the golden master's pingWipe(): a
  fixed-duration visual that accompanies navigation rather than gating it
  (reference/newsstand-original/source/Newsstand - Full Site.dc.html,
  pingWipe(), ~line 884).
*/

const WIPE_SELECTOR = '[data-transition-wipe]';
const ACTIVE_CLASS = 'is-active';
// Mirrors the accepted golden-master timeout / the --duration-wipe-timeout
// token in tokens.css (760ms). Kept as a literal rather than read from CSS
// at runtime — this does not consume the token, it mirrors its value.
const HIDE_DELAY_MS = 760;

declare global {
  interface Window {
    __transitionWipeInitialized?: boolean;
  }
}

export function initTransitionWipe(): void {
  if (window.__transitionWipeInitialized) return;
  window.__transitionWipeInitialized = true;

  let hideTimer: number | undefined;
  // Wall-clock start of the current sweep, used to correct the CSS
  // animation's progress after Astro's DOM swap (see below).
  let activatedAt: number | undefined;

  document.addEventListener('astro:before-preparation', () => {
    const bar = document.querySelector<HTMLElement>(WIPE_SELECTOR);
    if (!bar) return;

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    if (prefersReducedMotion) return;

    window.clearTimeout(hideTimer);
    bar.classList.remove(ACTIVE_CLASS);
    // Force a reflow so the animation restarts on repeated navigation.
    void bar.offsetWidth;
    bar.classList.add(ACTIVE_CLASS);
    activatedAt = performance.now();

    hideTimer = window.setTimeout(() => {
      bar.classList.remove(ACTIVE_CLASS);
      activatedAt = undefined;
    }, HIDE_DELAY_MS);
  });

  // The wipe bar is `transition:persist`ed, so the same DOM node survives
  // Astro's body swap. However, empirical testing (see
  // 08-transition-runtime-evidence.txt) shows the swap still resets the
  // *CSS animation's* internal progress back to 0 even though the node
  // itself is untouched. Re-assert the elapsed wall-clock progress on the
  // persisted node's animation immediately after the swap so the visible
  // sweep continues rather than visibly restarting.
  document.addEventListener('astro:after-swap', () => {
    if (activatedAt === undefined) return;
    const bar = document.querySelector<HTMLElement>(WIPE_SELECTOR);
    if (!bar || !bar.classList.contains(ACTIVE_CLASS)) return;

    const elapsed = performance.now() - activatedAt;
    for (const animation of bar.getAnimations()) {
      animation.currentTime = elapsed;
    }
  });
}
