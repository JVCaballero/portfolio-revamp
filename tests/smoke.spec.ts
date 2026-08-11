import { expect, test } from '@playwright/test';

const primaryNavigation = [
  { label: 'Cover', href: '/' },
  { label: 'Feature', href: '/feature/' },
  { label: 'Reviews', href: '/reviews/' },
  { label: 'The Interview', href: '/interview/' },
  { label: 'Columns', href: '/columns/' },
  { label: 'B-Sides', href: '/b-sides/' },
  { label: 'Rotation', href: '/rotation/' },
  { label: 'Letters', href: '/letters/' },
] as const;

const routes = [
  { href: '/', heading: 'CABALLERO!', activeLabel: 'Cover' },
  { href: '/feature/', heading: 'Feature', activeLabel: 'Feature' },
  { href: '/reviews/', heading: 'Reviews', activeLabel: 'Reviews' },
  {
    href: '/interview/',
    heading: 'The Interview',
    activeLabel: 'The Interview',
  },
  { href: '/columns/', heading: 'Columns', activeLabel: 'Columns' },
  { href: '/b-sides/', heading: 'B-Sides', activeLabel: 'B-Sides' },
  { href: '/rotation/', heading: 'Rotation', activeLabel: 'Rotation' },
  { href: '/letters/', heading: 'Letters', activeLabel: 'Letters' },
  { href: '/resume/', heading: 'Resume', activeLabel: null },
] as const;

test('Sprint 0 root route is deployable without console errors', async ({
  page,
}) => {
  const consoleErrors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });

  const response = await page.goto('/');

  expect(response?.ok()).toBeTruthy();
  await expect(page).toHaveTitle(/CABALLERO!/);
  await expect(
    page.getByRole('heading', { level: 1, name: 'CABALLERO!' }),
  ).toBeVisible();
  await expect(page.locator('[data-sprint="0"]')).toBeVisible();
  expect(consoleErrors).toEqual([]);
});

test('Shared Newsstand navigation matches the approved primary chrome', async ({
  page,
}) => {
  await page.goto('/');

  const brand = page.getByRole('link', { name: 'CABALLERO!', exact: true });
  await expect(brand).toHaveAttribute('href', '/');
  await expect(page.getByText('Issue 05 · Aug 2026')).toBeVisible();
  await expect(page.getByText('Open to work · Nov 2026')).toBeVisible();

  const nav = page.getByRole('navigation', { name: 'Primary' });
  await expect(nav.getByRole('link')).toHaveCount(primaryNavigation.length);

  for (const item of primaryNavigation) {
    await expect(
      nav.getByRole('link', { name: item.label, exact: true }),
    ).toHaveAttribute('href', item.href);
  }

  await expect(
    nav.getByRole('link', { name: 'Cover', exact: true }),
  ).toHaveAttribute('aria-current', 'page');
  await expect(
    nav.getByRole('link', { name: 'Resume', exact: true }),
  ).toHaveCount(0);
  await expect(page.locator('[data-sprint="0"]')).toBeVisible();
});

for (const route of routes) {
  test(`${route.href} resolves directly and exposes the shared Newsstand shell`, async ({
    page,
  }) => {
    const response = await page.goto(route.href);

    expect(response?.ok()).toBeTruthy();
    expect(new URL(page.url()).pathname).toBe(route.href);
    await expect(
      page.getByRole('heading', { level: 1, name: route.heading }),
    ).toBeVisible();

    const nav = page.getByRole('navigation', { name: 'Primary' });
    await expect(nav.getByRole('link')).toHaveCount(primaryNavigation.length);
    await expect(
      nav.getByRole('link', { name: 'Resume', exact: true }),
    ).toHaveCount(0);

    for (const item of primaryNavigation) {
      const link = nav.getByRole('link', { name: item.label, exact: true });
      if (item.label === route.activeLabel) {
        await expect(link).toHaveAttribute('aria-current', 'page');
      } else {
        await expect(link).not.toHaveAttribute('aria-current', 'page');
      }
    }

    await expect(nav.locator('[aria-current="page"]')).toHaveCount(
      route.activeLabel ? 1 : 0,
    );

    const reloadResponse = await page.reload();
    expect(reloadResponse?.ok()).toBeTruthy();
    expect(new URL(page.url()).pathname).toBe(route.href);
    await expect(
      page.getByRole('heading', { level: 1, name: route.heading }),
    ).toBeVisible();
  });
}

test('Direct initial load does not activate the transition wipe', async ({
  page,
}) => {
  const consoleErrors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });

  await page.goto('/');

  const wipe = page.locator('[data-transition-wipe]');
  await expect(wipe).toHaveCount(1);
  await expect(wipe).not.toHaveClass(/is-active/);
  expect(consoleErrors).toEqual([]);
});

/**
 * Tags the current wipe element with a unique, random marker attribute so a
 * later locator scoped to that exact marker can only match the SAME DOM
 * node — never a freshly-arrived replacement element that merely satisfies
 * the `[data-transition-wipe]` selector. This is what catches the body-swap
 * defect: Astro's ClientRouter replaces the whole <body>, so an assertion
 * against the bare selector alone can pass by resolving a brand-new,
 * inactive wipe that arrived with the destination page.
 */
async function markWipeInstance(page: import('@playwright/test').Page) {
  return page.evaluate(() => {
    const bar = document.querySelector('[data-transition-wipe]');
    if (!bar) throw new Error('wipe element not found');
    const id = `wipe-instance-${Math.random().toString(36).slice(2)}`;
    bar.setAttribute('data-wipe-instance', id);
    return id;
  });
}

test('Client-side navigation activates the wipe and the same persisted node stays active across the Astro body swap', async ({
  page,
}) => {
  const consoleErrors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });

  await page.goto('/');
  const nav = page.getByRole('navigation', { name: 'Primary' });

  const marker = await markWipeInstance(page);
  const persistedWipe = page.locator(
    `[data-transition-wipe][data-wipe-instance="${marker}"]`,
  );

  const navigationStartedAt = Date.now();
  await nav.getByRole('link', { name: 'Feature', exact: true }).click();
  await expect(persistedWipe).toHaveClass(/is-active/);

  await expect(page).toHaveURL(/\/feature\/$/);
  await expect(
    page.getByRole('heading', { level: 1, name: 'Feature' }),
  ).toBeVisible();
  await expect(
    nav.getByRole('link', { name: 'Feature', exact: true }),
  ).toHaveAttribute('aria-current', 'page');

  // The marker was set before navigation, so this proves the exact same
  // node — not a replacement — survived the body swap and is still active.
  await expect(persistedWipe).toHaveCount(1);
  await expect(persistedWipe).toHaveClass(/is-active/);

  // Lower-bound only (never a brittle exact-duration assertion): the wipe
  // must still be running well after the swap has settled, proving the
  // lifetime did not collapse down to the swap itself.
  await page.waitForTimeout(150);
  await expect(persistedWipe).toHaveClass(/is-active/);

  await expect(persistedWipe).not.toHaveClass(/is-active/, { timeout: 2000 });
  expect(Date.now() - navigationStartedAt).toBeGreaterThan(300);

  expect(consoleErrors).toEqual([]);
});

test('A second client-side navigation triggers a fresh, complete wipe', async ({
  page,
}) => {
  const consoleErrors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });

  await page.goto('/');
  const nav = page.getByRole('navigation', { name: 'Primary' });
  const marker = await markWipeInstance(page);
  const persistedWipe = page.locator(
    `[data-transition-wipe][data-wipe-instance="${marker}"]`,
  );

  await nav.getByRole('link', { name: 'Feature', exact: true }).click();
  await expect(page).toHaveURL(/\/feature\/$/);
  await expect(persistedWipe).not.toHaveClass(/is-active/, { timeout: 2000 });

  // Still the same persisted node ahead of the second navigation.
  await expect(persistedWipe).toHaveCount(1);

  const secondNavStartedAt = Date.now();
  await nav.getByRole('link', { name: 'Reviews', exact: true }).click();
  await expect(persistedWipe).toHaveClass(/is-active/);
  await expect(page).toHaveURL(/\/reviews\/$/);
  await expect(
    page.getByRole('heading', { level: 1, name: 'Reviews' }),
  ).toBeVisible();
  await expect(persistedWipe).toHaveClass(/is-active/);
  await expect(persistedWipe).not.toHaveClass(/is-active/, { timeout: 2000 });
  expect(Date.now() - secondNavStartedAt).toBeGreaterThan(300);

  expect(consoleErrors).toEqual([]);
});

test('Browser back navigation triggers the custom wipe and resolves the correct destination', async ({
  page,
}) => {
  await page.goto('/');
  const nav = page.getByRole('navigation', { name: 'Primary' });
  const wipe = page.locator('[data-transition-wipe]');

  await nav.getByRole('link', { name: 'Feature', exact: true }).click();
  await expect(page).toHaveURL(/\/feature\/$/);
  await nav.getByRole('link', { name: 'Reviews', exact: true }).click();
  await expect(page).toHaveURL(/\/reviews\/$/);
  await expect(wipe).not.toHaveClass(/is-active/, { timeout: 2000 });

  const backNavigation = page.goBack();
  await expect(wipe).toHaveClass(/is-active/);
  await backNavigation;

  await expect(page).toHaveURL(/\/feature\/$/);
  await expect(
    page.getByRole('heading', { level: 1, name: 'Feature' }),
  ).toBeVisible();
  await expect(
    nav.getByRole('link', { name: 'Feature', exact: true }),
  ).toHaveAttribute('aria-current', 'page');
  await expect(wipe).not.toHaveClass(/is-active/, { timeout: 2000 });
});

test('Browser forward navigation triggers the custom wipe and resolves the correct destination', async ({
  page,
}) => {
  await page.goto('/');
  const nav = page.getByRole('navigation', { name: 'Primary' });
  const wipe = page.locator('[data-transition-wipe]');

  await nav.getByRole('link', { name: 'Feature', exact: true }).click();
  await expect(page).toHaveURL(/\/feature\/$/);
  await nav.getByRole('link', { name: 'Reviews', exact: true }).click();
  await expect(page).toHaveURL(/\/reviews\/$/);
  await page.goBack();
  await expect(page).toHaveURL(/\/feature\/$/);
  await expect(wipe).not.toHaveClass(/is-active/, { timeout: 2000 });

  const forwardNavigation = page.goForward();
  await expect(wipe).toHaveClass(/is-active/);
  await forwardNavigation;

  await expect(page).toHaveURL(/\/reviews\/$/);
  await expect(
    page.getByRole('heading', { level: 1, name: 'Reviews' }),
  ).toBeVisible();
  await expect(
    nav.getByRole('link', { name: 'Reviews', exact: true }),
  ).toHaveAttribute('aria-current', 'page');
  await expect(wipe).not.toHaveClass(/is-active/, { timeout: 2000 });
});

test('Reload after client-side navigation resolves the direct route and does not behave like a client-navigation wipe', async ({
  page,
}) => {
  await page.goto('/');
  const nav = page.getByRole('navigation', { name: 'Primary' });
  const wipe = page.locator('[data-transition-wipe]');

  await nav.getByRole('link', { name: 'Reviews', exact: true }).click();
  await expect(page).toHaveURL(/\/reviews\/$/);
  await expect(wipe).not.toHaveClass(/is-active/, { timeout: 2000 });

  const reloadResponse = await page.reload();
  expect(reloadResponse?.ok()).toBeTruthy();
  expect(new URL(page.url()).pathname).toBe('/reviews/');
  await expect(
    page.getByRole('heading', { level: 1, name: 'Reviews' }),
  ).toBeVisible();

  // A full reload is not a client-side navigation: the wipe must come back
  // in its inactive resting state, not mid-sweep.
  await expect(wipe).toHaveCount(1);
  await expect(wipe).not.toHaveClass(/is-active/);
});

test('prefers-reduced-motion navigation works without a visible animated wipe', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const consoleErrors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });

  await page.goto('/');
  const wipe = page.locator('[data-transition-wipe]');
  const nav = page.getByRole('navigation', { name: 'Primary' });

  await nav.getByRole('link', { name: 'Feature', exact: true }).click();
  await expect(wipe).not.toHaveClass(/is-active/);
  await expect(page).toHaveURL(/\/feature\/$/);
  await expect(
    page.getByRole('heading', { level: 1, name: 'Feature' }),
  ).toBeVisible();
  await expect(wipe).not.toHaveClass(/is-active/);

  expect(consoleErrors).toEqual([]);
});

test.describe('Sprint 1G reduced-motion journey', () => {
  // Representative CSS-owned transition (Sprint 1C nav-link hover/active
  // feedback, --duration-control) used to prove reduced motion collapses
  // real component timing rather than only a wipe-specific value. Declared
  // duration is 0.3s under normal motion (tokens.css) and 0.01ms under
  // reduced motion (global.css); 1ms is comfortably between the two
  // regardless of how the browser serializes the computed value.
  const INSTANT_THRESHOLD_SECONDS = 0.001;

  async function getNavLinkTransitionDurationSeconds(
    page: import('@playwright/test').Page,
  ): Promise<number> {
    return page.evaluate(() => {
      const link = document.querySelector('.newsstand-nav-link');
      if (!link) throw new Error('nav link not found');
      const duration = getComputedStyle(link).transitionDuration;
      return parseFloat(duration);
    });
  }

  test('Full reduced-motion journey (load, nav, Back, Forward, reload) keeps the wipe suppressed, preserves content and focus, and stays console-clean', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const consoleErrors: string[] = [];
    page.on('console', (message) => {
      if (message.type() === 'error') consoleErrors.push(message.text());
    });

    const wipe = page.locator('[data-transition-wipe]');
    const nav = page.getByRole('navigation', { name: 'Primary' });

    // 1 & 2: initial direct load succeeds, wipe does not visibly run.
    const initialResponse = await page.goto('/');
    expect(initialResponse?.ok()).toBeTruthy();
    await expect(wipe).toHaveCount(1);
    await expect(wipe).not.toHaveClass(/is-active/);

    // 12: representative CSS-owned motion resolves effectively
    // instantaneously under reduced motion.
    expect(await getNavLinkTransitionDurationSeconds(page)).toBeLessThan(
      INSTANT_THRESHOLD_SECONDS,
    );

    // 3, 4, 5: client-side navigation succeeds, wipe stays suppressed,
    // destination content is visible and understandable.
    await nav.getByRole('link', { name: 'Feature', exact: true }).click();
    await expect(page).toHaveURL(/\/feature\/$/);
    await expect(
      page.getByRole('heading', { level: 1, name: 'Feature' }),
    ).toBeVisible();
    await expect(
      nav.getByRole('link', { name: 'Feature', exact: true }),
    ).toHaveAttribute('aria-current', 'page');
    await expect(wipe).not.toHaveClass(/is-active/);

    await nav.getByRole('link', { name: 'Reviews', exact: true }).click();
    await expect(page).toHaveURL(/\/reviews\/$/);
    await expect(
      page.getByRole('heading', { level: 1, name: 'Reviews' }),
    ).toBeVisible();
    await expect(wipe).not.toHaveClass(/is-active/);

    // 6 & 7: Back succeeds, wipe remains suppressed.
    await page.goBack();
    await expect(page).toHaveURL(/\/feature\/$/);
    await expect(
      page.getByRole('heading', { level: 1, name: 'Feature' }),
    ).toBeVisible();
    await expect(
      nav.getByRole('link', { name: 'Feature', exact: true }),
    ).toHaveAttribute('aria-current', 'page');
    await expect(wipe).not.toHaveClass(/is-active/);

    // 8 & 9: Forward succeeds, wipe remains suppressed.
    await page.goForward();
    await expect(page).toHaveURL(/\/reviews\/$/);
    await expect(
      page.getByRole('heading', { level: 1, name: 'Reviews' }),
    ).toBeVisible();
    await expect(
      nav.getByRole('link', { name: 'Reviews', exact: true }),
    ).toHaveAttribute('aria-current', 'page');
    await expect(wipe).not.toHaveClass(/is-active/);

    // 10, 11, 13: direct reload succeeds, preserves the route, does not
    // create a transition wipe, and the final state remains intact.
    const reloadResponse = await page.reload();
    expect(reloadResponse?.ok()).toBeTruthy();
    expect(new URL(page.url()).pathname).toBe('/reviews/');
    await expect(
      page.getByRole('heading', { level: 1, name: 'Reviews' }),
    ).toBeVisible();
    await expect(wipe).toHaveCount(1);
    await expect(wipe).not.toHaveClass(/is-active/);
    expect(await getNavLinkTransitionDurationSeconds(page)).toBeLessThan(
      INSTANT_THRESHOLD_SECONDS,
    );

    // 14: keyboard focus remains visibly indicated.
    const brand = page.getByRole('link', { name: 'CABALLERO!', exact: true });
    await brand.focus();
    await page.keyboard.press('Tab');
    const focused = page.locator(':focus-visible');
    await expect(focused).toHaveCount(1);
    const outlineStyle = await focused.evaluate((element) => {
      const style = getComputedStyle(element);
      return {
        outlineStyle: style.outlineStyle,
        outlineWidth: style.outlineWidth,
      };
    });
    expect(outlineStyle.outlineStyle).toBe('solid');
    expect(parseFloat(outlineStyle.outlineWidth)).toBeGreaterThan(0);

    // 15: no console errors across the whole reduced-motion journey.
    expect(consoleErrors).toEqual([]);
  });
});

test('Unknown routes resolve through the custom 404 page', async ({ page }) => {
  const response = await page.goto('/this-route-does-not-exist/');

  expect(response?.status()).toBe(404);
  await expect(page).toHaveTitle('Not found | CABALLERO!');
  await expect(
    page.getByRole('heading', { level: 1, name: 'Page not found' }),
  ).toBeVisible();
  await expect(
    page.getByRole('link', { name: 'Return to the cover.' }),
  ).toHaveAttribute('href', '/');
});

/**
 * Installs test-side instrumentation before any application script runs.
 * It does not touch production code or expose a debug API: it only wraps
 * `document.addEventListener` to log registrations of the two Astro
 * lifecycle events the interaction controller relies on, and adds its own
 * listeners (registered first) to log when those events actually fire.
 * This lets the tests below observe controller lifecycle behavior — one
 * registration per event type, and before-swap/page-load firing in the
 * expected order and count — without reading any internal controller state.
 */
async function installLifecycleInstrumentation(
  page: import('@playwright/test').Page,
) {
  await page.addInitScript(() => {
    const registrations: string[] = [];
    const fires: string[] = [];
    const tracked = new Set(['astro:before-swap', 'astro:page-load']);

    for (const type of tracked) {
      document.addEventListener(type, () => fires.push(type));
    }

    const originalAddEventListener = document.addEventListener.bind(document);
    document.addEventListener = ((type: string, ...rest: unknown[]) => {
      if (tracked.has(type)) registrations.push(type);
      // @ts-expect-error test-side instrumentation shim
      return originalAddEventListener(type, ...rest);
    }) as typeof document.addEventListener;

    Object.assign(window, {
      __lifecycleRegistrations: registrations,
      __lifecycleFires: fires,
    });
  });
}

function registrationCount(list: string[], type: string): number {
  return list.filter((entry) => entry === type).length;
}

/**
 * Native browser Back/Forward updates `location.href` before Astro's async
 * before-swap/page-load pair for that transition has actually fired, so
 * `toHaveURL` can resolve ahead of the lifecycle events settling. Poll the
 * fire log itself rather than the URL so assertions observe a settled count.
 */
async function waitForFireCount(
  page: import('@playwright/test').Page,
  expected: number,
) {
  await expect
    .poll(
      () =>
        page.evaluate(
          () =>
            (window as unknown as { __lifecycleFires: string[] })
              .__lifecycleFires.length,
        ),
      { timeout: 2000 },
    )
    .toBe(expected);
}

test.describe('Sprint 1F interaction controller lifecycle', () => {
  // `astro:before-swap` is registered on `document` exclusively by our
  // controller (ClientRouter's own internal wiring for prefetch/announce/
  // scroll-restoration only ever registers `astro:page-load`), so its
  // registration count is asserted as an exact value throughout. For
  // `astro:page-load`, ClientRouter's own internal listeners contribute a
  // fixed number of registrations that are outside the controller's
  // control, so tests instead assert the count established right after the
  // controller's own bootstrap script first runs never grows afterwards —
  // that is what proves the controller's own idempotency guard works.
  test('direct initial document load registers the controller listener exactly once and mounts exactly one page scope', async ({
    page,
  }) => {
    await installLifecycleInstrumentation(page);
    await page.goto('/');

    const registrations = await page.evaluate(
      () =>
        (window as unknown as { __lifecycleRegistrations: string[] })
          .__lifecycleRegistrations,
    );
    const fires = await page.evaluate(
      () =>
        (window as unknown as { __lifecycleFires: string[] }).__lifecycleFires,
    );

    expect(registrationCount(registrations, 'astro:before-swap')).toBe(1);
    expect(registrationCount(fires, 'astro:page-load')).toBe(1);
    // No outgoing-page cleanup should occur before the initial scope exists.
    expect(registrationCount(fires, 'astro:before-swap')).toBe(0);
  });

  test('client-side navigation performs one teardown followed by one destination initialization, without accumulating controller listeners', async ({
    page,
  }) => {
    const consoleErrors: string[] = [];
    page.on('console', (message) => {
      if (message.type() === 'error') consoleErrors.push(message.text());
    });

    await installLifecycleInstrumentation(page);
    await page.goto('/');
    const nav = page.getByRole('navigation', { name: 'Primary' });

    const baselinePageLoadRegistrations = await page.evaluate(
      () =>
        (window as unknown as { __lifecycleRegistrations: string[] })
          .__lifecycleRegistrations.length,
    );

    await nav.getByRole('link', { name: 'Feature', exact: true }).click();
    await expect(page).toHaveURL(/\/feature\/$/);

    const afterFirstNav = await page.evaluate(() => ({
      registrations: (
        window as unknown as { __lifecycleRegistrations: string[] }
      ).__lifecycleRegistrations,
      fires: (window as unknown as { __lifecycleFires: string[] })
        .__lifecycleFires,
    }));

    // Registrations must not multiply: the controller's init guard means the
    // re-executed inline bootstrap script skips re-registering listeners.
    expect(
      registrationCount(afterFirstNav.registrations, 'astro:before-swap'),
    ).toBe(1);
    expect(afterFirstNav.registrations.length).toBe(
      baselinePageLoadRegistrations,
    );
    // One teardown (before-swap) followed by one destination init (page-load):
    // the initial mount plus the post-navigation mount is two page-load fires.
    expect(registrationCount(afterFirstNav.fires, 'astro:before-swap')).toBe(1);
    expect(registrationCount(afterFirstNav.fires, 'astro:page-load')).toBe(2);
    // The events fire strictly in order (teardown before the new mount), so
    // the last fire recorded must be the destination's page-load.
    expect(afterFirstNav.fires.at(-1)).toBe('astro:page-load');

    await nav.getByRole('link', { name: 'Reviews', exact: true }).click();
    await expect(page).toHaveURL(/\/reviews\/$/);

    const afterSecondNav = await page.evaluate(() => ({
      registrations: (
        window as unknown as { __lifecycleRegistrations: string[] }
      ).__lifecycleRegistrations,
      fires: (window as unknown as { __lifecycleFires: string[] })
        .__lifecycleFires,
    }));

    // Repeated navigation must not accumulate controller-level listeners.
    expect(
      registrationCount(afterSecondNav.registrations, 'astro:before-swap'),
    ).toBe(1);
    expect(afterSecondNav.registrations.length).toBe(
      baselinePageLoadRegistrations,
    );
    // Each navigation contributes exactly one before-swap/page-load pair, so
    // there is never more than one active page scope at a time.
    expect(registrationCount(afterSecondNav.fires, 'astro:before-swap')).toBe(
      2,
    );
    expect(registrationCount(afterSecondNav.fires, 'astro:page-load')).toBe(3);

    expect(consoleErrors).toEqual([]);
  });

  test('Back navigation performs teardown and reinitialization exactly once', async ({
    page,
  }) => {
    await installLifecycleInstrumentation(page);
    await page.goto('/');
    const nav = page.getByRole('navigation', { name: 'Primary' });

    const baselineRegistrations = await page.evaluate(
      () =>
        (window as unknown as { __lifecycleRegistrations: string[] })
          .__lifecycleRegistrations.length,
    );
    const baselineFires = await page.evaluate(
      () =>
        (window as unknown as { __lifecycleFires: string[] }).__lifecycleFires
          .length,
    );

    await nav.getByRole('link', { name: 'Feature', exact: true }).click();
    await expect(page).toHaveURL(/\/feature\/$/);
    await waitForFireCount(page, baselineFires + 2);
    await nav.getByRole('link', { name: 'Reviews', exact: true }).click();
    await expect(page).toHaveURL(/\/reviews\/$/);
    await waitForFireCount(page, baselineFires + 4);

    const beforeBack = await page.evaluate(
      () =>
        (window as unknown as { __lifecycleFires: string[] }).__lifecycleFires
          .length,
    );

    await page.goBack();
    await expect(page).toHaveURL(/\/feature\/$/);
    await expect(
      page.getByRole('heading', { level: 1, name: 'Feature' }),
    ).toBeVisible();
    await waitForFireCount(page, beforeBack + 2);

    const afterBack = await page.evaluate(() => ({
      registrations: (
        window as unknown as { __lifecycleRegistrations: string[] }
      ).__lifecycleRegistrations,
      fires: (window as unknown as { __lifecycleFires: string[] })
        .__lifecycleFires,
    }));

    expect(
      registrationCount(afterBack.registrations, 'astro:before-swap'),
    ).toBe(1);
    expect(afterBack.registrations.length).toBe(baselineRegistrations);
    expect(afterBack.fires.length - beforeBack).toBe(2);
    expect(afterBack.fires.slice(beforeBack)).toEqual([
      'astro:before-swap',
      'astro:page-load',
    ]);
  });

  test('Forward navigation performs teardown and reinitialization exactly once', async ({
    page,
  }) => {
    await installLifecycleInstrumentation(page);
    await page.goto('/');
    const nav = page.getByRole('navigation', { name: 'Primary' });

    const baselineRegistrations = await page.evaluate(
      () =>
        (window as unknown as { __lifecycleRegistrations: string[] })
          .__lifecycleRegistrations.length,
    );
    const baselineFires = await page.evaluate(
      () =>
        (window as unknown as { __lifecycleFires: string[] }).__lifecycleFires
          .length,
    );

    await nav.getByRole('link', { name: 'Feature', exact: true }).click();
    await expect(page).toHaveURL(/\/feature\/$/);
    await waitForFireCount(page, baselineFires + 2);
    await nav.getByRole('link', { name: 'Reviews', exact: true }).click();
    await expect(page).toHaveURL(/\/reviews\/$/);
    await waitForFireCount(page, baselineFires + 4);
    await page.goBack();
    await expect(page).toHaveURL(/\/feature\/$/);
    await waitForFireCount(page, baselineFires + 6);

    const beforeForward = await page.evaluate(
      () =>
        (window as unknown as { __lifecycleFires: string[] }).__lifecycleFires
          .length,
    );

    await page.goForward();
    await expect(page).toHaveURL(/\/reviews\/$/);
    await expect(
      page.getByRole('heading', { level: 1, name: 'Reviews' }),
    ).toBeVisible();
    await waitForFireCount(page, beforeForward + 2);

    const afterForward = await page.evaluate(() => ({
      registrations: (
        window as unknown as { __lifecycleRegistrations: string[] }
      ).__lifecycleRegistrations,
      fires: (window as unknown as { __lifecycleFires: string[] })
        .__lifecycleFires,
    }));

    expect(
      registrationCount(afterForward.registrations, 'astro:before-swap'),
    ).toBe(1);
    expect(afterForward.registrations.length).toBe(baselineRegistrations);
    expect(afterForward.fires.length - beforeForward).toBe(2);
    expect(afterForward.fires.slice(beforeForward)).toEqual([
      'astro:before-swap',
      'astro:page-load',
    ]);
  });

  test('Direct reload re-establishes a single controller registration and a single page scope', async ({
    page,
  }) => {
    await installLifecycleInstrumentation(page);
    await page.goto('/reviews/');

    const baselineRegistrations = await page.evaluate(
      () =>
        (window as unknown as { __lifecycleRegistrations: string[] })
          .__lifecycleRegistrations.length,
    );

    const reloadResponse = await page.reload();
    expect(reloadResponse?.ok()).toBeTruthy();

    const afterReload = await page.evaluate(() => ({
      registrations: (
        window as unknown as { __lifecycleRegistrations: string[] }
      ).__lifecycleRegistrations,
      fires: (window as unknown as { __lifecycleFires: string[] })
        .__lifecycleFires,
    }));

    // A reload is a fresh document: the init script reruns, so counts reset
    // to exactly one controller registration and one mount rather than
    // accumulating across the reload boundary.
    expect(
      registrationCount(afterReload.registrations, 'astro:before-swap'),
    ).toBe(1);
    expect(afterReload.registrations.length).toBe(baselineRegistrations);
    expect(registrationCount(afterReload.fires, 'astro:page-load')).toBe(1);
    expect(registrationCount(afterReload.fires, 'astro:before-swap')).toBe(0);
  });

  test('Routes with an empty interaction registry navigate cleanly with no console errors', async ({
    page,
  }) => {
    const consoleErrors: string[] = [];
    page.on('console', (message) => {
      if (message.type() === 'error') consoleErrors.push(message.text());
    });

    await installLifecycleInstrumentation(page);
    await page.goto('/');
    const nav = page.getByRole('navigation', { name: 'Primary' });

    for (const label of [
      'Feature',
      'Reviews',
      'The Interview',
      'Columns',
      'B-Sides',
      'Rotation',
      'Letters',
    ]) {
      await nav.getByRole('link', { name: label, exact: true }).click();
    }

    await expect(page).toHaveURL(/\/letters\/$/);
    expect(consoleErrors).toEqual([]);
  });
});
