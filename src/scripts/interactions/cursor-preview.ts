/*
  Sprint 2B — Reviews cursor-preview plate. Mirrors the golden master's
  onMove() cursor-preview branch (reference/newsstand-original/source/
  Newsstand - Full Site.dc.html, ~lines 720-728 and the fixed plate node at
  ~line 759): while the pointer is over a review row, a small yellow plate
  follows it, offset from the pointer position.

  The immutable source's data-preview attribute value (a picsum.photos URL)
  never drives an image-following preview — it is only used as a presence
  marker for row-hit-testing (`e.target.closest('[data-cue],[data-preview]')`)
  gating a static text plate. This module preserves that: it never reads
  the attribute's value, only its presence.
*/
import type { InteractionModule } from './interaction-controller';

const PATHNAME = '/reviews/';
const ROW_SELECTOR = '[data-preview]';
const PLATE_SELECTOR = '[data-cursor-preview]';
const MIN_WIDTH_PX = 900;
const POINTER_Y_OFFSET_PX = 14;
const VISIBLE_CLASS = 'reviews-cursor-preview--visible';

export const cursorPreview: InteractionModule = {
  name: 'cursor-preview',
  init(context) {
    if (context.pathname !== PATHNAME) return;
    if (context.reducedMotion.matches) return;

    const plate = document.querySelector<HTMLElement>(PLATE_SELECTOR);
    if (!plate) return;

    const hide = () => plate.classList.remove(VISIBLE_CLASS);

    const onMove = (event: PointerEvent) => {
      const target = event.target as Element | null;
      const row = target?.closest?.(ROW_SELECTOR);
      if (row && window.innerWidth > MIN_WIDTH_PX) {
        plate.style.left = `${event.clientX}px`;
        plate.style.top = `${event.clientY - POINTER_Y_OFFSET_PX}px`;
        plate.classList.add(VISIBLE_CLASS);
      } else {
        hide();
      }
    };

    window.addEventListener('pointermove', onMove, {
      passive: true,
      signal: context.signal,
    });

    return () => {
      hide();
      plate.style.removeProperty('left');
      plate.style.removeProperty('top');
    };
  },
};
