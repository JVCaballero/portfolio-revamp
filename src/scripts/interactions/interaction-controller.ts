/*
  Sprint 1F lifecycle plumbing, populated starting Sprint 2A. Owns the Astro
  ClientRouter hookup that Newsstand interaction modules mount into and tear
  down from. Each module below is explicitly imported and pathname-gates
  itself to the route(s) it applies to (see each module's own file) — this
  registry performs no route filtering of its own.

  Independent from ../transition-wipe.ts, which keeps its own narrowly
  scoped astro:before-preparation / astro:after-swap wiring.
*/
import { scrollReveal } from './scroll-reveal';
import { parallax } from './parallax';
import { countUp } from './count-up';
import { magneticNavigation } from './magnetic-navigation';

export interface InteractionContext {
  signal: AbortSignal;
  pathname: string;
  reducedMotion: MediaQueryList;
}

export interface InteractionModule {
  name: string;
  init: (context: InteractionContext) => void | (() => void);
}

// Sprint 2A adds the first four Feature interaction modules. Modules are
// explicitly imported and listed here as they are implemented — no
// automatic discovery.
const MODULES: InteractionModule[] = [
  scrollReveal,
  parallax,
  countUp,
  magneticNavigation,
];

declare global {
  interface Window {
    __interactionControllerInitialized?: boolean;
  }
}

let activeScope: {
  controller: AbortController;
  cleanups: (() => void)[];
} | null = null;

function teardownActiveScope(): void {
  if (!activeScope) return;
  const { controller, cleanups } = activeScope;
  activeScope = null;
  controller.abort();
  for (const cleanup of cleanups) {
    try {
      cleanup();
    } catch (error) {
      console.error('[interaction-controller] cleanup failed', error);
    }
  }
}

function mountPageScope(): void {
  teardownActiveScope();

  const controller = new AbortController();
  const cleanups: (() => void)[] = [];
  activeScope = { controller, cleanups };

  const context: InteractionContext = {
    signal: controller.signal,
    pathname: window.location.pathname,
    reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)'),
  };

  for (const mod of MODULES) {
    try {
      const cleanup = mod.init(context);
      if (cleanup) cleanups.push(cleanup);
    } catch (error) {
      console.error(
        `[interaction-controller] "${mod.name}" failed to initialize`,
        error,
      );
    }
  }
}

export function initInteractionController(): void {
  if (window.__interactionControllerInitialized) return;
  window.__interactionControllerInitialized = true;

  document.addEventListener('astro:before-swap', teardownActiveScope);
  document.addEventListener('astro:page-load', mountPageScope);
}
