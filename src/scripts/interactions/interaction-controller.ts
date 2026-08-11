/*
  Sprint 1F — lifecycle plumbing only. Owns the Astro ClientRouter hookup
  that future Newsstand interaction modules (scroll-reveal, magnetic nav,
  count-up, etc.) will mount into and tear down from. No interaction
  module lives here yet: the registry below is intentionally empty.

  Independent from ../transition-wipe.ts, which keeps its own narrowly
  scoped astro:before-preparation / astro:after-swap wiring.
*/

export interface InteractionContext {
  signal: AbortSignal;
  pathname: string;
  reducedMotion: MediaQueryList;
}

export interface InteractionModule {
  name: string;
  init: (context: InteractionContext) => void | (() => void);
}

// Empty for Sprint 1F. Future modules are explicitly imported and listed
// here as they are implemented — no automatic discovery.
const MODULES: InteractionModule[] = [];

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
