/*
  Sprint 2A — Feature verdict count-up. Mirrors the golden master's count()
  method (reference/newsstand-original/index.html): the verdict's
  [data-count] statistics animate from 0 to their targets together, once
  the verdict block itself enters view, using the same cubic ease-out and
  duration as the source. The source triggers every [data-count] inside a
  revealed container from that single reveal() call — this observes each
  container that owns [data-reveal] (here, `.feature-verdict`) once, rather
  than observing each number independently with its own unrelated
  IntersectionObserver timing.

  Authored HTML already contains the final, understandable value (see
  src/pages/feature/index.astro), so this module only ever replaces text
  content the browser already rendered — nothing depends on the animation
  running to be readable.
*/
import type { InteractionModule } from './interaction-controller';

const PATHNAME_PREFIX = '/feature/';
const SELECTOR = '[data-count]';
const REVEAL_ANCESTOR_SELECTOR = '[data-reveal]';
const DURATION_MS = 1250;

function readTarget(el: HTMLElement): { to: number; suffix: string } {
  const to = parseFloat(el.getAttribute('data-count') ?? '') || 0;
  const suffix = el.getAttribute('data-suffix') ?? '';
  return { to, suffix };
}

function resolveFinal(el: HTMLElement): void {
  if (el.hasAttribute('data-counted')) return;
  el.setAttribute('data-counted', '1');
  const { to, suffix } = readTarget(el);
  el.textContent = `${to}${suffix}`;
}

function animateCount(el: HTMLElement, activeFrames: Set<number>): void {
  if (el.hasAttribute('data-counted')) return;
  el.setAttribute('data-counted', '1');
  const { to, suffix } = readTarget(el);

  if (to === 0) {
    el.textContent = `0${suffix}`;
    return;
  }

  const start = performance.now();
  let frameId: number;
  const step = (now: number) => {
    activeFrames.delete(frameId);
    const progress = Math.min(1, (now - start) / DURATION_MS);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = `${Math.round(to * eased)}${suffix}`;
    if (progress < 1) {
      frameId = requestAnimationFrame(step);
      activeFrames.add(frameId);
    }
  };
  frameId = requestAnimationFrame(step);
  activeFrames.add(frameId);
}

export const countUp: InteractionModule = {
  name: 'count-up',
  init(context) {
    if (!context.pathname.startsWith(PATHNAME_PREFIX)) return;

    const targets = Array.from(
      document.querySelectorAll<HTMLElement>(SELECTOR),
    );
    if (targets.length === 0) return;

    if (
      context.reducedMotion.matches ||
      typeof IntersectionObserver === 'undefined'
    ) {
      targets.forEach(resolveFinal);
      return;
    }

    // Group targets by the nearest ancestor that owns [data-reveal] (the
    // verdict block), so every count inside the same container animates
    // from the exact same intersection event rather than independently.
    const groups = new Map<Element, HTMLElement[]>();
    for (const el of targets) {
      const container = el.closest(REVEAL_ANCESTOR_SELECTOR) ?? el;
      const group = groups.get(container);
      if (group) group.push(el);
      else groups.set(container, [el]);
    }

    const activeFrames = new Set<number>();
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          const group = groups.get(entry.target) ?? [];
          for (const el of group) animateCount(el, activeFrames);
          observer.unobserve(entry.target);
        }
      }
    });

    for (const container of groups.keys()) observer.observe(container);

    return () => {
      observer.disconnect();
      for (const frameId of activeFrames) cancelAnimationFrame(frameId);
      activeFrames.clear();
    };
  },
};
