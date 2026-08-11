/*
  Sprint 2A — Feature hero parallax. Mirrors the golden master's onScroll()
  parallax branch (reference/newsstand-original/index.html), which sets
  `transform: scale(1.06) translateY(-p*amt)` on the element while its
  containing frame is in/near view: elements marked [data-parallax] zoom
  slightly and drift vertically as the frame moves through the viewport.

  Movement (and the base scale) is applied through CSS custom properties
  (--feature-parallax-y / --feature-parallax-scale) rather than writing the
  element's `transform` shorthand directly, so it composes with the hero
  image's own CSS :hover rule (feature.css) instead of fighting over the
  same property. Verified against the actual immutable prototype (not
  assumed): normal motion at rest renders `scale(1.06) translateY(T)` with
  T matching the exact source formula; hovering fully replaces the
  transform with `scale(1.03)` alone (translateY dropped), which is why the
  hover rule in feature.css does not reference --feature-parallax-y at all.
  Same rendered outcome as the source, different implementation mechanism —
  no DESIGN_DEVIATIONS.md entry needed (zero visible/behavioral
  difference).
*/
import type { InteractionModule } from './interaction-controller';

const PATHNAME_PREFIX = '/feature/';
const SELECTOR = '[data-parallax]';
const OFFSCREEN_MARGIN_PX = 200;
const DEFAULT_AMOUNT = 8;
const BASE_SCALE = '1.06';
const Y_PROPERTY = '--feature-parallax-y';
const SCALE_PROPERTY = '--feature-parallax-scale';

export const parallax: InteractionModule = {
  name: 'parallax',
  init(context) {
    if (!context.pathname.startsWith(PATHNAME_PREFIX)) return;
    if (context.reducedMotion.matches) return;

    const targets = Array.from(
      document.querySelectorAll<HTMLElement>(SELECTOR),
    );
    if (targets.length === 0) return;

    // The base scale is only ever present while this module is actually
    // tracking scroll (normal motion) — reduced motion and JS failure both
    // leave the CSS default of 1 (no zoom), matching the source skipping
    // its entire parallax branch under reduced motion.
    for (const el of targets) el.style.setProperty(SCALE_PROPERTY, BASE_SCALE);

    const update = () => {
      for (const el of targets) {
        const frame = el.parentElement;
        if (!frame) continue;

        const rect = frame.getBoundingClientRect();
        if (
          rect.bottom < -OFFSCREEN_MARGIN_PX ||
          rect.top > window.innerHeight + OFFSCREEN_MARGIN_PX
        ) {
          continue;
        }

        const amount =
          parseFloat(el.getAttribute('data-parallax') ?? '') || DEFAULT_AMOUNT;
        const p =
          (rect.top + rect.height / 2 - window.innerHeight / 2) /
          window.innerHeight;
        el.style.setProperty(Y_PROPERTY, `${(-p * amount).toFixed(2)}px`);
      }
    };

    window.addEventListener('scroll', update, {
      passive: true,
      signal: context.signal,
    });
    window.addEventListener('resize', update, {
      passive: true,
      signal: context.signal,
    });
    update();

    return () => {
      for (const el of targets) {
        el.style.removeProperty(Y_PROPERTY);
        el.style.removeProperty(SCALE_PROPERTY);
      }
    };
  },
};
