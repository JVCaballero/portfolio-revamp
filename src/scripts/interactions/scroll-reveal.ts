/*
  Sprint 2A — Feature scroll-reveal, extended in Sprint 2B to Reviews,
  Sprint 2C to Interview, and Sprint 2D to Columns (including its
  temporary [slug] route-integrity shell, which shares the '/columns/'
  prefix but currently has no [data-reveal] targets of its own).
  Mirrors the golden master's sweep()/reveal() pair (reference/newsstand-
  original/index.html, the compiled runtime's IntersectionObserver setup
  and stagger logic): elements marked [data-reveal] fade up on entering
  view, staggered by document order.

  Above-fold elements (already within 90% of viewport height at mount) are
  revealed immediately without ever being hidden, matching the source's own
  "reveal on mount" branch — this is also what keeps content visible when
  JS fails or IntersectionObserver is unavailable: nothing here sets a
  default hidden state via CSS, only this module's own inline styles do.

  Two distinct resolution paths, kept deliberately separate: immediate
  resolution (above-fold / reduced motion / no IntersectionObserver) resets
  all three inline styles including `transition`, since nothing should
  animate. The animated observer-triggered reveal only flips
  opacity/transform and leaves the already-declared `transition` alone, so
  the browser actually animates through the authored .85s transition
  instead of snapping straight to the resting state.
*/
import type { InteractionModule } from './interaction-controller';

const PATHNAME_PREFIXES = [
  '/feature/',
  '/reviews/',
  '/interview/',
  '/columns/',
];
const SELECTOR = '[data-reveal]';
const ROOT_MARGIN = '0px 0px -6% 0px';
const THRESHOLD = 0.06;
const REVEAL_DURATION_S = 0.85;
const STAGGER_STEP_S = 0.09;
const STAGGER_MODULO = 5;
const EASE = 'cubic-bezier(.2,.7,.2,1)';
const ABOVE_FOLD_RATIO = 0.9;

// Case A — immediate resolution (above-fold, reduced motion, no
// IntersectionObserver support): these targets never had opacity/
// transform/transition set, so resetting all three is a safe no-op that
// also covers the case where a target WAS mid-observation and needs to be
// snapped to its resting state without animating.
function resolveImmediately(el: HTMLElement): void {
  el.style.opacity = '';
  el.style.transform = '';
  el.style.transition = '';
}

// Case B — animated observer reveal: only flip the two animated
// properties. The `transition` declared when this target was first
// observed (below) is deliberately left untouched so the browser actually
// animates through the authored .85s transition instead of snapping.
function resolveViaTransition(el: HTMLElement): void {
  el.style.opacity = '1';
  el.style.transform = 'none';
}

export const scrollReveal: InteractionModule = {
  name: 'scroll-reveal',
  init(context) {
    if (
      !PATHNAME_PREFIXES.some((prefix) => context.pathname.startsWith(prefix))
    )
      return;

    const targets = Array.from(
      document.querySelectorAll<HTMLElement>(SELECTOR),
    );
    if (targets.length === 0) return;

    if (
      context.reducedMotion.matches ||
      typeof IntersectionObserver === 'undefined'
    ) {
      targets.forEach(resolveImmediately);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting || entry.boundingClientRect.bottom < 0) {
            resolveViaTransition(entry.target as HTMLElement);
            observer.unobserve(entry.target);
          }
        }
      },
      { rootMargin: ROOT_MARGIN, threshold: THRESHOLD },
    );

    targets.forEach((el, index) => {
      if (
        el.getBoundingClientRect().top <=
        window.innerHeight * ABOVE_FOLD_RATIO
      ) {
        resolveImmediately(el);
        return;
      }

      const delay = (index % STAGGER_MODULO) * STAGGER_STEP_S;
      el.style.opacity = '0';
      el.style.transform = 'translateY(16px)';
      el.style.transition =
        `opacity ${REVEAL_DURATION_S}s ${EASE} ${delay}s, ` +
        `transform ${REVEAL_DURATION_S}s ${EASE} ${delay}s`;
      observer.observe(el);
    });

    return () => observer.disconnect();
  },
};
