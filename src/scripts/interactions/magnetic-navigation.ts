/*
  Sprint 2A — Feature "Next" CTA magnetic navigation. Mirrors the golden
  master's onMove() magnet branch (reference/newsstand-original/index.html):
  the target marked [data-magnet-target] drifts toward the pointer within a
  proximity threshold.

  Sprint 2A scope is the Feature CTA only — the shared Newsstand primary
  navigation does not receive this behavior (see the Sprint 2A task
  contract's interaction-architecture scope note).
*/
import type { InteractionModule } from './interaction-controller';

const PATHNAME_PREFIX = '/feature/';
const SELECTOR = '[data-magnet-target]';
const PROXIMITY_X_PX = 70;
const PROXIMITY_Y_PX = 50;
const FACTOR_X = 0.07;
const FACTOR_Y = 0.09;

export const magneticNavigation: InteractionModule = {
  name: 'magnetic-navigation',
  init(context) {
    if (!context.pathname.startsWith(PATHNAME_PREFIX)) return;
    if (context.reducedMotion.matches) return;

    const target = document.querySelector<HTMLElement>(SELECTOR);
    if (!target) return;

    const reset = () => {
      target.style.transform = '';
    };

    const onMove = (event: PointerEvent) => {
      const rect = target.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = event.clientX - cx;
      const dy = event.clientY - cy;
      const near =
        Math.abs(dx) < rect.width / 2 + PROXIMITY_X_PX &&
        Math.abs(dy) < rect.height / 2 + PROXIMITY_Y_PX;

      target.style.transform = near
        ? `translate(${(dx * FACTOR_X).toFixed(2)}px, ${(dy * FACTOR_Y).toFixed(2)}px)`
        : '';
    };

    window.addEventListener('pointermove', onMove, {
      passive: true,
      signal: context.signal,
    });
    target.addEventListener('pointerleave', reset, { signal: context.signal });

    return reset;
  },
};
