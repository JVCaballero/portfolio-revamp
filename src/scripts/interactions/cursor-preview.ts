/*
  Sprint 2B — Reviews cursor-preview plate, extended in Sprint 2D to
  Columns. Mirrors the golden master's onMove() cursor-preview branch
  (reference/newsstand-original/source/Newsstand - Full Site.dc.html,
  ~lines 720-728 and the fixed plate node at ~line 759): while the pointer
  is over a review row (or, on Columns, a lead/secondary column item), a
  small yellow plate follows it, offset from the pointer position.

  The immutable source's onMove() hit-tests
  `e.target.closest('[data-cue],[data-preview]')` — a single selector
  covering both attributes the prototype uses across different pages.
  Reviews rows carry data-preview (a picsum.photos URL, used only as a
  presence marker, never read for its value — this module never reads it).
  Columns items carry data-cue (a short label string, e.g. "Read the
  essay →") which IS read, to drive Columns' per-item dynamic plate label;
  Reviews' plate text stays the static markup string it always was.

  Both routes share one plate-following pointermove handler and one 900px
  desktop-only threshold; only the visible-state class and the
  static-vs-dynamic label behavior are route-specific, kept in one small
  per-route config table rather than a second module.
*/
import type { InteractionModule } from './interaction-controller';

const ROW_SELECTOR = '[data-cue],[data-preview]';
const PLATE_SELECTOR = '[data-cursor-preview]';
const MIN_WIDTH_PX = 900;
const POINTER_Y_OFFSET_PX = 14;

interface RouteConfig {
  pathname: string;
  visibleClass: string;
  // Columns' plate text tracks the hovered item's own data-cue label;
  // Reviews' plate keeps its existing static markup text untouched.
  dynamicLabel: boolean;
}

const ROUTES: RouteConfig[] = [
  {
    pathname: '/reviews/',
    visibleClass: 'reviews-cursor-preview--visible',
    dynamicLabel: false,
  },
  {
    pathname: '/columns/',
    visibleClass: 'columns-cursor-preview--visible',
    dynamicLabel: true,
  },
];

export const cursorPreview: InteractionModule = {
  name: 'cursor-preview',
  init(context) {
    const route = ROUTES.find((r) => r.pathname === context.pathname);
    if (!route) return;
    if (context.reducedMotion.matches) return;

    const plate = document.querySelector<HTMLElement>(PLATE_SELECTOR);
    if (!plate) return;

    const hide = () => plate.classList.remove(route.visibleClass);

    const onMove = (event: PointerEvent) => {
      const target = event.target as Element | null;
      const row = target?.closest?.(ROW_SELECTOR);
      if (row && window.innerWidth > MIN_WIDTH_PX) {
        if (route.dynamicLabel) {
          const cue = row.getAttribute('data-cue');
          if (cue) plate.textContent = cue;
        }
        plate.style.left = `${event.clientX}px`;
        plate.style.top = `${event.clientY - POINTER_Y_OFFSET_PX}px`;
        plate.classList.add(route.visibleClass);
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
