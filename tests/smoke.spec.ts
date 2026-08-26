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
  {
    href: '/feature/',
    heading: 'The inbox that learned to answer itself',
    activeLabel: 'Feature',
  },
  {
    href: '/reviews/',
    heading: 'All the work, rated and reviewed',
    activeLabel: 'Reviews',
  },
  {
    href: '/interview/',
    heading: 'Forty players, one tempo, and a deploy on Sunday',
    activeLabel: 'The Interview',
  },
  {
    href: '/columns/',
    heading: 'Words, rants and gadget reviews',
    activeLabel: 'Columns',
  },
  { href: '/b-sides/', heading: 'The playground', activeLabel: 'B-Sides' },
  {
    href: '/rotation/',
    heading: "This month's rotation",
    activeLabel: 'Rotation',
  },
  {
    href: '/letters/',
    heading: 'Write to the editor',
    activeLabel: 'Letters',
  },
  { href: '/resume/', heading: 'Full Résumé', activeLabel: null },
] as const;

test('Cover root route renders the Newsstand Cover shell without console errors', async ({
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
  await expect(page.locator('.cover-masthead__badge')).toBeVisible();
  await expect(page.locator('.cover-masthead__badge')).toContainText(
    'Portfolio',
  );
  await expect(
    page.getByRole('heading', {
      level: 2,
      name: 'The inbox that learned to answer itself',
    }),
  ).toBeVisible();
  await expect(
    page.getByRole('heading', { level: 2, name: 'In this issue' }),
  ).toBeVisible();
  await expect(
    page.getByRole('img', { name: /placeholder portrait/i }),
  ).toBeVisible();
  expect(consoleErrors).toEqual([]);
});

test('Cover exposes its principal editorial links as native anchors to real production routes', async ({
  page,
}) => {
  await page.goto('/');

  await expect(
    page.getByRole('link', {
      name: /The inbox that learned to answer itself/,
    }),
  ).toHaveAttribute('href', '/feature/');
  await expect(
    page.getByRole('link', { name: /Figma to paying customers/ }),
  ).toHaveAttribute('href', '/reviews/');
  await expect(
    page.getByRole('link', { name: /Conducting is just standup/ }),
  ).toHaveAttribute('href', '/interview/');
  await expect(
    page.getByRole('link', { name: /Four side projects rated/ }),
  ).toHaveAttribute('href', '/b-sides/');

  const issueCards = [
    { name: 'The Cover Story', href: '/feature/' },
    { name: 'All The Work', href: '/reviews/' },
    { name: 'Who I Am', href: '/interview/' },
    { name: "This Month's Rotation", href: '/rotation/' },
  ] as const;

  for (const card of issueCards) {
    await expect(
      page.getByRole('link', { name: new RegExp(card.name) }),
    ).toHaveAttribute('href', card.href);
  }
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
});

test('Shared Newsstand bottom chrome (Dispatch strip + publication footer) renders on the Cover', async ({
  page,
}) => {
  await page.goto('/');

  const chrome = page.locator('footer.newsstand-bottom-chrome');
  await expect(chrome).toBeVisible();
  await expect(chrome.getByText('Dispatch')).toBeVisible();
  await expect(
    chrome.getByText('Caballero! Issue 05 · printed in Cebu'),
  ).toBeVisible();
  await expect(chrome.getByText('© 2026 John Vincent Caballero')).toBeVisible();
});

test.describe('Post-Sprint-2 fix: Dispatch band rotation', () => {
  test('The Dispatch message rotates to the second message after the rotation interval, in the source order', async ({
    page,
  }) => {
    await page.goto('/');

    const message = page.locator('[data-dispatch-message]');
    await expect(message).toHaveText(
      'Case file: teaching a bot to say “I don’t know”',
    );

    await expect(message).toHaveText(
      'New in the playground — Shelf, a manga backlog tracker',
      { timeout: 6000 },
    );
  });

  test('The Dispatch message keeps rotating after navigating away and back, without leaking a duplicate timer', async ({
    page,
  }) => {
    await page.goto('/');
    const message = page.locator('[data-dispatch-message]');

    await expect(message).not.toHaveText(
      'Case file: teaching a bot to say “I don’t know”',
      { timeout: 6000 },
    );

    await page.getByRole('link', { name: 'Feature', exact: true }).click();
    await expect(page).toHaveURL(/\/feature\/$/);
    await page.getByRole('link', { name: 'Cover', exact: true }).click();
    await expect(page).toHaveURL(/\/$/);

    const restarted = page.locator('[data-dispatch-message]');
    await expect(restarted).toHaveText(
      'Case file: teaching a bot to say “I don’t know”',
    );
    await expect(restarted).toHaveText(
      'New in the playground — Shelf, a manga backlog tracker',
      { timeout: 6000 },
    );
  });

  test('Dispatch band renders console-clean and the dot stays decorative/aria-hidden', async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    page.on('pageerror', (error) => errors.push(error.message));

    await page.goto('/');
    await page.waitForTimeout(200);

    const dot = page.locator('.newsstand-dispatch__dot');
    await expect(dot).toHaveAttribute('aria-hidden', 'true');
    expect(errors).toEqual([]);
  });
});

test.describe('Sprint 1H Cover shell', () => {
  test('Cover teaser navigation reaches a real route, and Back/Forward/reload remain correct', async ({
    page,
  }) => {
    const consoleErrors: string[] = [];
    page.on('console', (message) => {
      if (message.type() === 'error') consoleErrors.push(message.text());
    });

    await page.goto('/');
    const wipe = page.locator('[data-transition-wipe]');
    const storyTeaser = page.getByRole('link', {
      name: /The inbox that learned to answer itself/,
    });

    await storyTeaser.click();
    await expect(wipe).toHaveClass(/is-active/);
    await expect(page).toHaveURL(/\/feature\/$/);
    await expect(
      page.getByRole('heading', {
        level: 1,
        name: 'The inbox that learned to answer itself',
      }),
    ).toBeVisible();
    await expect(wipe).not.toHaveClass(/is-active/, { timeout: 2000 });

    await page.goBack();
    await expect(page).toHaveURL(/\/$/);
    await expect(
      page.getByRole('heading', { level: 1, name: 'CABALLERO!' }),
    ).toBeVisible();

    await page.goForward();
    await expect(page).toHaveURL(/\/feature\/$/);
    await expect(
      page.getByRole('heading', {
        level: 1,
        name: 'The inbox that learned to answer itself',
      }),
    ).toBeVisible();

    const reloadResponse = await page.reload();
    expect(reloadResponse?.ok()).toBeTruthy();
    expect(new URL(page.url()).pathname).toBe('/feature/');

    expect(consoleErrors).toEqual([]);
  });

  test('Cover-local entrance/badge/handwriting animation collapses under reduced motion, and all Cover content stays visible', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const consoleErrors: string[] = [];
    page.on('console', (message) => {
      if (message.type() === 'error') consoleErrors.push(message.text());
    });

    await page.goto('/');

    await expect(
      page.getByRole('heading', { level: 1, name: 'CABALLERO!' }),
    ).toBeVisible();
    await expect(
      page.getByRole('heading', {
        level: 2,
        name: 'The inbox that learned to answer itself',
      }),
    ).toBeVisible();
    await expect(page.getByText("yes, that's a real baton")).toBeVisible();
    await expect(page.getByText('5 yrs')).toBeVisible();
    await expect(
      page.getByRole('heading', { level: 2, name: 'In this issue' }),
    ).toBeVisible();

    const durations = await page.evaluate(() => {
      const cover = document.querySelector('.cover-page');
      const badge = document.querySelector('.cover-badge');
      const handnote = document.querySelector('.cover-handnote');
      if (!cover || !badge || !handnote) {
        throw new Error('Cover-local animated elements not found');
      }
      return {
        cover: getComputedStyle(cover).animationDuration,
        badge: getComputedStyle(badge).animationDuration,
        handnote: getComputedStyle(handnote).animationDuration,
      };
    });

    for (const value of Object.values(durations)) {
      expect(parseFloat(value)).toBeLessThan(0.001);
    }

    expect(consoleErrors).toEqual([]);
  });

  test('Highlighted Rotation issue card resolves the golden-master rest/hover color inversion, including its eyebrow', async ({
    page,
  }) => {
    // Reduced motion collapses the card's transition-duration to near-zero,
    // so the hover color check below reads the settled target value rather
    // than an interpolated mid-transition frame.
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');

    const card = page.getByRole('link', { name: /This Month's Rotation/ });

    const readColors = () =>
      card.evaluate((el) => {
        const eyebrow = el.querySelector('.cover-card__eyebrow');
        if (!eyebrow) throw new Error('eyebrow element not found');
        return {
          cardBackground: getComputedStyle(el).backgroundColor,
          eyebrowColor: getComputedStyle(eyebrow).color,
        };
      });

    const rest = await readColors();
    expect(rest.cardBackground).toBe('rgb(255, 230, 0)'); // --color-highlight
    expect(rest.eyebrowColor).toBe('rgb(23, 19, 15)'); // --color-text (inherited)

    await card.hover();
    // Even at a near-zero reduced-motion duration, the transitioned
    // background/color values apply on the next animation frame rather
    // than synchronously with the hover event, so poll rather than read
    // immediately.
    await expect(async () => {
      const hovered = await readColors();
      expect(hovered.cardBackground).toBe('rgb(23, 19, 15)'); // --color-ink
      expect(hovered.eyebrowColor).toBe('rgb(255, 230, 0)'); // --color-highlight (inherited)
    }).toPass({ timeout: 2000 });
  });
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

    await expect(page.locator('footer.newsstand-bottom-chrome')).toBeVisible();

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
    page.getByRole('heading', {
      level: 1,
      name: 'The inbox that learned to answer itself',
    }),
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
    page.getByRole('heading', {
      level: 1,
      name: 'All the work, rated and reviewed',
    }),
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
    page.getByRole('heading', {
      level: 1,
      name: 'The inbox that learned to answer itself',
    }),
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
    page.getByRole('heading', {
      level: 1,
      name: 'All the work, rated and reviewed',
    }),
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
    page.getByRole('heading', {
      level: 1,
      name: 'All the work, rated and reviewed',
    }),
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
    page.getByRole('heading', {
      level: 1,
      name: 'The inbox that learned to answer itself',
    }),
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
      page.getByRole('heading', {
        level: 1,
        name: 'The inbox that learned to answer itself',
      }),
    ).toBeVisible();
    await expect(
      nav.getByRole('link', { name: 'Feature', exact: true }),
    ).toHaveAttribute('aria-current', 'page');
    await expect(wipe).not.toHaveClass(/is-active/);

    await nav.getByRole('link', { name: 'Reviews', exact: true }).click();
    await expect(page).toHaveURL(/\/reviews\/$/);
    await expect(
      page.getByRole('heading', {
        level: 1,
        name: 'All the work, rated and reviewed',
      }),
    ).toBeVisible();
    await expect(wipe).not.toHaveClass(/is-active/);

    // 6 & 7: Back succeeds, wipe remains suppressed.
    await page.goBack();
    await expect(page).toHaveURL(/\/feature\/$/);
    await expect(
      page.getByRole('heading', {
        level: 1,
        name: 'The inbox that learned to answer itself',
      }),
    ).toBeVisible();
    await expect(
      nav.getByRole('link', { name: 'Feature', exact: true }),
    ).toHaveAttribute('aria-current', 'page');
    await expect(wipe).not.toHaveClass(/is-active/);

    // 8 & 9: Forward succeeds, wipe remains suppressed.
    await page.goForward();
    await expect(page).toHaveURL(/\/reviews\/$/);
    await expect(
      page.getByRole('heading', {
        level: 1,
        name: 'All the work, rated and reviewed',
      }),
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
      page.getByRole('heading', {
        level: 1,
        name: 'All the work, rated and reviewed',
      }),
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
      page.getByRole('heading', {
        level: 1,
        name: 'The inbox that learned to answer itself',
      }),
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
      page.getByRole('heading', {
        level: 1,
        name: 'All the work, rated and reviewed',
      }),
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

  // Feature, Reviews, Interview, and Columns are still exercised here (as
  // hops on the way to Rotation) but have real page-specific interaction
  // work of their own — Feature's four Sprint 2A modules, Reviews' Sprint
  // 2B scroll-reveal/cursor-preview, Interview's Sprint 2C scroll-reveal/
  // magnetic-navigation, and Columns' Sprint 2D scroll-reveal/cursor-
  // preview — so their dedicated lifecycle behavior is covered by
  // "Sprint 2A Feature interaction lifecycle", "Sprint 2B Reviews
  // interaction lifecycle", "Sprint 2C Interview interaction lifecycle",
  // and "Sprint 2D Columns interaction lifecycle" below, not by this
  // generic console-cleanliness pass-through. Letters is deliberately
  // excluded from this hop chain as of Sprint 2H — it now has its own
  // page-specific interaction module (clipboard-copy.ts), covered by
  // "Sprint 2H Letters interaction lifecycle" below.
  test('Routes with no active interaction work navigate cleanly with no console errors', async ({
    page,
  }) => {
    const consoleErrors: string[] = [];
    page.on('console', (message) => {
      if (message.type() === 'error') consoleErrors.push(message.text());
    });

    await installLifecycleInstrumentation(page);
    await page.goto('/');
    const nav = page.getByRole('navigation', { name: 'Primary' });

    for (const label of ['Feature', 'Reviews', 'B-Sides', 'Rotation']) {
      await nav.getByRole('link', { name: label, exact: true }).click();
    }

    await expect(page).toHaveURL(/\/rotation\/$/);
    expect(consoleErrors).toEqual([]);
  });
});

test.describe('Sprint 2A Feature page', () => {
  test('Feature renders the golden-master anatomy: folio, headline, dek, meta, hero, narrative, build sequence, verdict, spec, and Next CTA', async ({
    page,
  }) => {
    const consoleErrors: string[] = [];
    page.on('console', (message) => {
      if (message.type() === 'error') consoleErrors.push(message.text());
    });

    const response = await page.goto('/feature/');
    expect(response?.ok()).toBeTruthy();

    await expect(page.locator('.feature-kicker')).toHaveText(
      'Feature / p.04 · AI & Automation',
    );
    await expect(
      page.getByRole('heading', {
        level: 1,
        name: 'The inbox that learned to answer itself',
      }),
    ).toBeVisible();
    await expect(page.locator('.feature-dek')).toBeVisible();
    await expect(page.locator('.feature-meta')).toBeVisible();

    const hero = page.locator('figure.feature-hero');
    await expect(hero).toBeVisible();
    await expect(hero.locator('img')).toBeVisible();

    await expect(page.locator('.feature-columns').first()).toBeVisible();
    await expect(page.getByRole('blockquote')).toBeVisible();

    await expect(
      page.getByRole('heading', { level: 2, name: 'How it was built' }),
    ).toBeVisible();
    const buildRows = page.locator('.feature-build__row');
    await expect(buildRows).toHaveCount(4);

    const verdict = page.locator('.feature-verdict');
    await expect(verdict).toBeVisible();
    await expect(verdict.getByText('The verdict')).toBeVisible();

    const spec = page.locator('aside.feature-sidebar .feature-spec');
    await expect(spec).toBeVisible();
    await expect(spec.getByText('The spec')).toBeVisible();

    const nextCta = page.getByRole('link', { name: /See all six builds/ });
    await expect(nextCta).toBeVisible();
    await expect(nextCta).toHaveAttribute('href', '/reviews/');

    await expect(page.locator('footer.newsstand-bottom-chrome')).toBeVisible();
    await expect(
      page
        .getByRole('navigation', { name: 'Primary' })
        .getByRole('link', { name: 'Feature', exact: true }),
    ).toHaveAttribute('aria-current', 'page');

    expect(consoleErrors).toEqual([]);
  });

  test('Feature images declare explicit dimensions and meaningful placeholder-aware alt text', async ({
    page,
  }) => {
    await page.goto('/feature/');

    const images = page.locator('article.feature-page img');
    await expect(images).toHaveCount(3);

    const count = await images.count();
    for (let i = 0; i < count; i++) {
      const image = images.nth(i);
      await expect(image).toHaveAttribute('width', /.+/);
      await expect(image).toHaveAttribute('height', /.+/);
      const alt = await image.getAttribute('alt');
      expect(alt).toBeTruthy();
      expect(alt?.toLowerCase()).toMatch(/placeholder/);
    }
  });

  test('Feature has no positive tabindex anywhere on the page', async ({
    page,
  }) => {
    await page.goto('/feature/');

    const positiveTabindexCount = await page
      .locator('[tabindex]')
      .evaluateAll(
        (nodes) =>
          nodes.filter((node) => Number(node.getAttribute('tabindex')) > 0)
            .length,
      );

    expect(positiveTabindexCount).toBe(0);
  });

  test('Feature Next CTA is keyboard reachable, shows a visible focus ring, and behaves as a native link', async ({
    page,
  }) => {
    await page.goto('/feature/');

    const nextCta = page.getByRole('link', { name: /See all six builds/ });
    await expect(nextCta).toHaveAttribute('href', '/reviews/');

    await nextCta.focus();
    await expect(nextCta).toBeFocused();

    const outlineStyle = await nextCta.evaluate((element) => {
      const style = getComputedStyle(element);
      return {
        outlineStyle: style.outlineStyle,
        outlineWidth: style.outlineWidth,
      };
    });
    expect(outlineStyle.outlineStyle).toBe('solid');
    expect(parseFloat(outlineStyle.outlineWidth)).toBeGreaterThan(0);

    await nextCta.press('Enter');
    await expect(page).toHaveURL(/\/reviews\/$/);
    await expect(
      page.getByRole('heading', {
        level: 1,
        name: 'All the work, rated and reviewed',
      }),
    ).toBeVisible();
  });

  test('Feature -> Reviews navigation via the Next CTA works, and Back returns to Feature', async ({
    page,
  }) => {
    await page.goto('/feature/');
    const nextCta = page.getByRole('link', { name: /See all six builds/ });

    await nextCta.click();
    await expect(page).toHaveURL(/\/reviews\/$/);
    await expect(
      page.getByRole('heading', {
        level: 1,
        name: 'All the work, rated and reviewed',
      }),
    ).toBeVisible();

    await page.goBack();
    await expect(page).toHaveURL(/\/feature\/$/);
    await expect(
      page.getByRole('heading', {
        level: 1,
        name: 'The inbox that learned to answer itself',
      }),
    ).toBeVisible();
  });
});

test.describe('Sprint 2A Feature interaction lifecycle', () => {
  test('Feature interaction modules initialize exactly once on direct load and resolve visible/understandable content', async ({
    page,
  }) => {
    const consoleErrors: string[] = [];
    page.on('console', (message) => {
      if (message.type() === 'error') consoleErrors.push(message.text());
    });

    await page.goto('/feature/');

    await expect(page.locator('.feature-kicker')).toBeVisible();
    await expect(
      page.getByRole('heading', {
        level: 1,
        name: 'The inbox that learned to answer itself',
      }),
    ).toBeVisible();

    // Above-the-fold [data-reveal] content (the hero) must never be stuck
    // hidden, whether or not the reveal module has run yet.
    await expect(page.locator('figure.feature-hero')).toBeVisible();

    // Verdict statistics resolve to real, understandable final values.
    await expect(async () => {
      const text = await page.locator('.feature-stats').innerText();
      expect(text).toContain('82%');
      expect(text).toContain('11h');
    }).toPass({ timeout: 2000 });

    expect(consoleErrors).toEqual([]);
  });

  // The generic Sprint 1F controller-lifecycle tests above already prove,
  // for any registered module, that each navigation performs exactly one
  // teardown (`astro:before-swap`) followed by one reinitialization
  // (`astro:page-load`) without accumulating controller-level listeners.
  // This test adds the Feature-specific half: that repeated round trips
  // through a route with real, non-empty module work stay stable and
  // console-clean, reusing the same instrumentation.
  test('Repeated ClientRouter navigation into and out of Feature stays console-clean and performs exactly one teardown/reinit pair per hop', async ({
    page,
  }) => {
    const consoleErrors: string[] = [];
    page.on('console', (message) => {
      if (message.type() === 'error') consoleErrors.push(message.text());
    });

    await installLifecycleInstrumentation(page);
    await page.goto('/');
    const nav = page.getByRole('navigation', { name: 'Primary' });

    const baselineFires = await page.evaluate(
      () =>
        (window as unknown as { __lifecycleFires: string[] }).__lifecycleFires
          .length,
    );

    for (let visit = 0; visit < 3; visit++) {
      await nav.getByRole('link', { name: 'Feature', exact: true }).click();
      await expect(page).toHaveURL(/\/feature\/$/);
      await expect(
        page.getByRole('heading', {
          level: 1,
          name: 'The inbox that learned to answer itself',
        }),
      ).toBeVisible();
      await waitForFireCount(page, baselineFires + visit * 4 + 2);

      await nav.getByRole('link', { name: 'Reviews', exact: true }).click();
      await expect(page).toHaveURL(/\/reviews\/$/);
      await waitForFireCount(page, baselineFires + visit * 4 + 4);
    }

    const registrations = await page.evaluate(
      () =>
        (window as unknown as { __lifecycleRegistrations: string[] })
          .__lifecycleRegistrations,
    );
    expect(registrationCount(registrations, 'astro:before-swap')).toBe(1);

    expect(consoleErrors).toEqual([]);
  });

  test('Feature interaction cleanup runs on page exit and reinitializes correctly on return', async ({
    page,
  }) => {
    async function parallaxValue() {
      return page
        .locator('.feature-hero__image')
        .evaluate((el) =>
          getComputedStyle(el).getPropertyValue('--feature-parallax-y'),
        );
    }

    await page.goto('/feature/');
    const nav = page.getByRole('navigation', { name: 'Primary' });

    const beforeScroll = await parallaxValue();
    await page.mouse.wheel(0, 300);
    await expect(async () => {
      expect(await parallaxValue()).not.toBe(beforeScroll);
    }).toPass({ timeout: 2000 });

    await nav.getByRole('link', { name: 'Reviews', exact: true }).click();
    await expect(page).toHaveURL(/\/reviews\/$/);

    await nav.getByRole('link', { name: 'Feature', exact: true }).click();
    await expect(page).toHaveURL(/\/feature\/$/);
    await expect(
      page.getByRole('heading', {
        level: 1,
        name: 'The inbox that learned to answer itself',
      }),
    ).toBeVisible();

    // Reinitialized cleanly: the hero responds to scroll again on the fresh
    // mount rather than being stuck on whatever value survived teardown.
    const afterReturn = await parallaxValue();
    await page.mouse.wheel(0, 300);
    await expect(async () => {
      expect(await parallaxValue()).not.toBe(afterReturn);
    }).toPass({ timeout: 2000 });
  });

  test('Feature content stays fully visible and understandable under reduced motion, including resolved count-up values', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const consoleErrors: string[] = [];
    page.on('console', (message) => {
      if (message.type() === 'error') consoleErrors.push(message.text());
    });

    await page.goto('/feature/');

    await expect(
      page.getByRole('heading', {
        level: 1,
        name: 'The inbox that learned to answer itself',
      }),
    ).toBeVisible();

    for (const el of [
      '.feature-kicker',
      '.feature-hero__frame',
      '.feature-columns',
      '.feature-verdict',
      'aside.feature-sidebar',
    ]) {
      await expect(page.locator(el).first()).toBeVisible();
      const opacity = await page
        .locator(el)
        .first()
        .evaluate((node) => getComputedStyle(node).opacity);
      expect(opacity).toBe('1');
    }

    const stats = page.locator('.feature-stats');
    await expect(stats).toContainText('82%');
    await expect(stats).toContainText('4');
    await expect(stats).toContainText('11h');
    await expect(stats).toContainText('0');

    const hero = page.locator('.feature-hero__image');
    const parallaxValue = await hero.evaluate((el) =>
      getComputedStyle(el).getPropertyValue('--feature-parallax-y'),
    );
    expect(parallaxValue.trim()).toBe('0px');
    // Reduced motion must disable parallax entirely, including its base
    // scale: parallax.ts never sets --feature-parallax-scale, so it stays
    // at the CSS default of 1 (no zoom).
    const parallaxScale = await hero.evaluate((el) =>
      getComputedStyle(el).getPropertyValue('--feature-parallax-scale'),
    );
    expect(parallaxScale.trim()).toBe('1');

    const nextCta = page.getByRole('link', { name: /See all six builds/ });
    const ctaTransformBefore = await nextCta.evaluate(
      (el) => getComputedStyle(el).transform,
    );
    await nextCta.hover();
    const ctaTransformAfterHover = await nextCta.evaluate(
      (el) => getComputedStyle(el).transform,
    );
    expect(ctaTransformAfterHover).toBe(ctaTransformBefore);

    await page.goBack().catch(() => {});
    await page.goto('/feature/');
    await expect(
      page.getByRole('heading', {
        level: 1,
        name: 'The inbox that learned to answer itself',
      }),
    ).toBeVisible();

    expect(consoleErrors).toEqual([]);
  });
});

test.describe('Sprint 2A Feature review corrections', () => {
  test('Hero frame owns its data-reveal marker; the hero caption does not', async ({
    page,
  }) => {
    await page.goto('/feature/');

    const frameHasReveal = await page
      .locator('.feature-hero__frame')
      .evaluate((el) => el.hasAttribute('data-reveal'));
    expect(frameHasReveal).toBe(true);

    const caption = page.locator('figure.feature-hero > figcaption');
    await expect(caption).toHaveCount(1);
    const captionHasReveal = await caption.evaluate((el) =>
      el.hasAttribute('data-reveal'),
    );
    expect(captionHasReveal).toBe(false);
  });

  test('Both Feature image frames independently own data-reveal', async ({
    page,
  }) => {
    await page.goto('/feature/');

    const frames = page.locator(
      '.feature-figures__grid .feature-figures__frame',
    );
    await expect(frames).toHaveCount(2);
    const revealFlags = await frames.evaluateAll((els) =>
      els.map((el) => el.hasAttribute('data-reveal')),
    );
    expect(revealFlags).toEqual([true, true]);
  });

  test('The two-image figure caption sits outside the image grid but inside the semantic figure', async ({
    page,
  }) => {
    await page.goto('/feature/');

    await expect(
      page.locator('.feature-figures__grid > figcaption'),
    ).toHaveCount(0);
    await expect(
      page.locator('figure.feature-figures > figcaption'),
    ).toHaveCount(1);
  });

  test('Below-fold scroll-reveal target animates through its authored .85s transition rather than snapping to its resting state', async ({
    page,
  }) => {
    await page.goto('/feature/');
    const target = page.locator('.feature-quote');
    await target.scrollIntoViewIfNeeded();

    await expect(async () => {
      const opacity = await target.evaluate(
        (el) => getComputedStyle(el).opacity,
      );
      expect(opacity).toBe('1');
    }).toPass({ timeout: 2000 });

    // The transition must still be the authored one — a snap-to-resolve
    // bug would have cleared `transition` back to '' at the same moment
    // opacity/transform were set, which would read back as the browser
    // default (0s) here instead.
    const transitionDuration = await target.evaluate(
      (el) => getComputedStyle(el).transitionDuration,
    );
    expect(transitionDuration).not.toBe('0s');
    expect(transitionDuration.split(',')[0].trim()).toBe('0.85s');
  });

  test('Feature hero parallax applies the source-equivalent base scale under normal motion', async ({
    page,
  }) => {
    await page.goto('/feature/');
    const hero = page.locator('.feature-hero__image');

    await page.mouse.wheel(0, 100);
    await expect(async () => {
      const scale = (
        await hero.evaluate((el) =>
          getComputedStyle(el).getPropertyValue('--feature-parallax-scale'),
        )
      ).trim();
      expect(scale).toBe('1.06');
    }).toPass({ timeout: 2000 });
  });

  test('Feature verdict statistics all begin counting together through the verdict-level reveal, not independently', async ({
    page,
  }) => {
    await page.goto('/feature/');

    // Structural proof: every [data-count] shares the exact same nearest
    // [data-reveal] ancestor (the verdict block), not four independent
    // observation targets.
    const sameContainer = await page
      .locator('[data-count]')
      .evaluateAll((els) => {
        const containers = els.map((el) => el.closest('[data-reveal]'));
        return (
          containers.every((c) => c === containers[0]) && containers[0] !== null
        );
      });
    expect(sameContainer).toBe(true);

    const verdict = page.locator('.feature-verdict');
    await verdict.scrollIntoViewIfNeeded();

    await expect(async () => {
      const counted = await page
        .locator('[data-count]')
        .evaluateAll((els) => els.map((el) => el.hasAttribute('data-counted')));
      expect(counted).toEqual([true, true, true, true]);
    }).toPass({ timeout: 2000 });
  });

  test('Feature count-up animation work is cancelled on page exit, not left running on a detached node', async ({
    page,
  }) => {
    const consoleErrors: string[] = [];
    page.on('console', (message) => {
      if (message.type() === 'error') consoleErrors.push(message.text());
    });

    await page.goto('/feature/');
    const verdict = page.locator('.feature-verdict');
    await verdict.scrollIntoViewIfNeeded();

    // Grab a handle to a statistic while it is very likely still mid-
    // animation (well before the 1250ms count-up duration elapses).
    const handle = await page.evaluateHandle(() =>
      document.querySelector('[data-count="82"]'),
    );

    const nav = page.getByRole('navigation', { name: 'Primary' });
    await nav.getByRole('link', { name: 'Reviews', exact: true }).click();
    await expect(page).toHaveURL(/\/reviews\/$/);

    const textAfterNav = await handle.evaluate(
      (el) => (el as Element | null)?.textContent,
    );
    await page.waitForTimeout(400);
    const textAfterWait = await handle.evaluate(
      (el) => (el as Element | null)?.textContent,
    );

    // If the requestAnimationFrame loop had kept running against the
    // detached node, its text would keep changing after navigation.
    expect(textAfterWait).toBe(textAfterNav);

    expect(consoleErrors).toEqual([]);
  });

  test('Feature drop cap remains real accessible text, not hidden from the accessibility tree', async ({
    page,
  }) => {
    await page.goto('/feature/');

    const dropcap = page.locator('.feature-dropcap');
    await expect(dropcap).toHaveText('L');
    await expect(dropcap).not.toHaveAttribute('aria-hidden', 'true');

    const firstParagraphText = await page
      .locator('.feature-columns p')
      .first()
      .evaluate((el) => el.textContent?.trim().slice(0, 11));
    expect(firstParagraphText).toBe('Lorem ipsum');
  });
});

test.describe('Sprint 2B Reviews page', () => {
  test('Reviews renders the golden-master anatomy: folio, headline, deck, four taxonomy labels, six review rows, and closing note', async ({
    page,
  }) => {
    const consoleErrors: string[] = [];
    page.on('console', (message) => {
      if (message.type() === 'error') consoleErrors.push(message.text());
    });

    const response = await page.goto('/reviews/');
    expect(response?.ok()).toBeTruthy();

    await expect(page.locator('.reviews-kicker')).toHaveText('Reviews / p.18');
    await expect(
      page.getByRole('heading', {
        level: 1,
        name: 'All the work, rated and reviewed',
      }),
    ).toBeVisible();
    await expect(page.locator('.reviews-deck')).toBeVisible();

    const taxonomy = page.locator('.reviews-taxonomy__label');
    await expect(taxonomy).toHaveCount(4);
    await expect(taxonomy.nth(0)).toHaveText('All');
    await expect(taxonomy.nth(1)).toHaveText('AI & automation');
    await expect(taxonomy.nth(2)).toHaveText('Web');
    await expect(taxonomy.nth(3)).toHaveText('Mobile');

    const rows = page.locator('li.review-row-item');
    await expect(rows).toHaveCount(6);
    await expect(page.locator('h2.review-row__title')).toHaveCount(6);

    await expect(page.locator('.reviews-closing-note')).toBeVisible();
    await expect(page.locator('footer.newsstand-bottom-chrome')).toBeVisible();
    await expect(
      page
        .getByRole('navigation', { name: 'Primary' })
        .getByRole('link', { name: 'Reviews', exact: true }),
    ).toHaveAttribute('aria-current', 'page');

    expect(consoleErrors).toEqual([]);
  });

  test('All six Reviews rows are native links to /feature/, and only the first row shows the "Read the feature" CTA', async ({
    page,
  }) => {
    await page.goto('/reviews/');

    const rowLinks = page.locator('a.review-row');
    await expect(rowLinks).toHaveCount(6);

    const count = await rowLinks.count();
    for (let i = 0; i < count; i++) {
      await expect(rowLinks.nth(i)).toHaveAttribute('href', '/feature/');
    }

    await expect(rowLinks.nth(0).locator('.review-row__cta')).toHaveText(
      'Read the feature →',
    );
    for (let i = 1; i < count; i++) {
      await expect(rowLinks.nth(i).locator('.review-row__cta')).toHaveCount(0);
    }
  });

  test('Reviews images expose explicit dimensions and decorative (non-truthful placeholder) alt text', async ({
    page,
  }) => {
    await page.goto('/reviews/');

    const images = page.locator('.review-row__image img');
    await expect(images).toHaveCount(6);

    const count = await images.count();
    for (let i = 0; i < count; i++) {
      const image = images.nth(i);
      await expect(image).toHaveAttribute('width', '600');
      await expect(image).toHaveAttribute('height', '400');
      await expect(image).toHaveAttribute('alt', '');
    }
  });

  test('Reviews star ratings expose an accessible textual equivalent without relying on repeated glyphs alone', async ({
    page,
  }) => {
    await page.goto('/reviews/');

    const firstRow = page.locator('li.review-row-item').first();
    await expect(firstRow.locator('.review-row__rating')).toHaveAttribute(
      'aria-hidden',
      'true',
    );
    await expect(firstRow.getByText('5 out of 5 stars')).toHaveCount(1);

    const thirdRow = page.locator('li.review-row-item').nth(2);
    await expect(thirdRow.getByText('4 out of 5 stars')).toHaveCount(1);
  });

  test('Reviews taxonomy labels remain non-interactive text, not fake controls', async ({
    page,
  }) => {
    await page.goto('/reviews/');

    const taxonomy = page.locator('.reviews-taxonomy__label');
    await expect(taxonomy).toHaveCount(4);

    const tagNames = await taxonomy.evaluateAll((els) =>
      els.map((el) => el.tagName.toLowerCase()),
    );
    expect(tagNames).toEqual(['span', 'span', 'span', 'span']);

    const roles = await taxonomy.evaluateAll((els) =>
      els.map((el) => el.getAttribute('role')),
    );
    expect(roles.every((role) => role === null)).toBe(true);

    const tabindexes = await taxonomy.evaluateAll((els) =>
      els.map((el) => el.getAttribute('tabindex')),
    );
    expect(tabindexes.every((value) => value === null)).toBe(true);

    await expect(page.getByRole('button')).toHaveCount(0);

    // Source-faithful visual affordance only (reviews.css): an outline
    // label (e.g. "Web") lifts and turns yellow on hover, darker yellow and
    // pressed-down on active — while remaining the same non-interactive
    // span verified above. A regression here (e.g. losing the hover rule)
    // would silently fall back to no visual change at all.
    const outlineLabel = page.getByText('Web', { exact: true });
    const restBackground = await outlineLabel.evaluate(
      (el) => getComputedStyle(el).backgroundColor,
    );
    expect(restBackground).toBe('rgba(0, 0, 0, 0)');

    await outlineLabel.hover();
    await expect(async () => {
      const hoverStyle = await outlineLabel.evaluate((el) => {
        const style = getComputedStyle(el);
        return {
          background: style.backgroundColor,
          transform: style.transform,
        };
      });
      expect(hoverStyle.background).toBe('rgb(255, 230, 0)'); // --color-highlight
      expect(hoverStyle.transform).toContain('-2'); // translateY(-2px)
    }).toPass({ timeout: 2000 });

    const box = await outlineLabel.boundingBox();
    if (!box) throw new Error('taxonomy label bounding box unavailable');
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    try {
      await expect(async () => {
        const activeStyle = await outlineLabel.evaluate((el) => {
          const style = getComputedStyle(el);
          return {
            background: style.backgroundColor,
            transform: style.transform,
          };
        });
        expect(activeStyle.background).toBe('rgb(242, 217, 0)'); // --color-highlight-active
        expect(activeStyle.transform).toContain('2'); // translateY(2px) scale(.96)
      }).toPass({ timeout: 2000 });
    } finally {
      await page.mouse.up();
    }

    // The "All" active-style label uses the same transform-only affordance
    // (background stays ink, no background transition).
    const activeAllLabel = page.getByText('All', { exact: true });
    const allBox = await activeAllLabel.boundingBox();
    if (!allBox) throw new Error('"All" label bounding box unavailable');
    await page.mouse.move(
      allBox.x + allBox.width / 2,
      allBox.y + allBox.height / 2,
    );
    await expect(async () => {
      const transform = await activeAllLabel.evaluate(
        (el) => getComputedStyle(el).transform,
      );
      expect(transform).toContain('-2');
    }).toPass({ timeout: 2000 });
  });

  test('Reviews has no positive tabindex anywhere on the page', async ({
    page,
  }) => {
    await page.goto('/reviews/');

    const positiveTabindexCount = await page
      .locator('[tabindex]')
      .evaluateAll(
        (nodes) =>
          nodes.filter((node) => Number(node.getAttribute('tabindex')) > 0)
            .length,
      );

    expect(positiveTabindexCount).toBe(0);
  });

  test('A Reviews row link is keyboard reachable, shows a visible focus ring, and behaves as a native link', async ({
    page,
  }) => {
    await page.goto('/reviews/');

    const firstRow = page.locator('a.review-row').first();
    await firstRow.focus();
    await expect(firstRow).toBeFocused();

    const outlineStyle = await firstRow.evaluate((element) => {
      const style = getComputedStyle(element);
      return {
        outlineStyle: style.outlineStyle,
        outlineWidth: style.outlineWidth,
      };
    });
    expect(outlineStyle.outlineStyle).toBe('solid');
    expect(parseFloat(outlineStyle.outlineWidth)).toBeGreaterThan(0);

    await firstRow.press('Enter');
    await expect(page).toHaveURL(/\/feature\/$/);
  });

  test('Reviews -> Feature navigation via a row click works, and Back returns to Reviews', async ({
    page,
  }) => {
    await page.goto('/reviews/');
    const firstRow = page.locator('a.review-row').first();

    await firstRow.click();
    await expect(page).toHaveURL(/\/feature\/$/);
    await expect(
      page.getByRole('heading', {
        level: 1,
        name: 'The inbox that learned to answer itself',
      }),
    ).toBeVisible();

    await page.goBack();
    await expect(page).toHaveURL(/\/reviews\/$/);
    await expect(
      page.getByRole('heading', {
        level: 1,
        name: 'All the work, rated and reviewed',
      }),
    ).toBeVisible();

    await page.goForward();
    await expect(page).toHaveURL(/\/feature\/$/);
  });
});

test.describe('Sprint 2B Reviews interaction lifecycle', () => {
  test('Reviews interaction modules initialize exactly once on direct load and resolve visible content', async ({
    page,
  }) => {
    const consoleErrors: string[] = [];
    page.on('console', (message) => {
      if (message.type() === 'error') consoleErrors.push(message.text());
    });

    await page.goto('/reviews/');

    await expect(page.locator('li.review-row-item')).toHaveCount(6);
    for (const row of await page.locator('a.review-row').all()) {
      await expect(row).toBeVisible();
    }

    expect(consoleErrors).toEqual([]);
  });

  test('Repeated ClientRouter navigation into and out of Reviews stays console-clean', async ({
    page,
  }) => {
    const consoleErrors: string[] = [];
    page.on('console', (message) => {
      if (message.type() === 'error') consoleErrors.push(message.text());
    });

    await page.goto('/');
    const nav = page.getByRole('navigation', { name: 'Primary' });

    for (let visit = 0; visit < 3; visit++) {
      await nav.getByRole('link', { name: 'Reviews', exact: true }).click();
      await expect(page).toHaveURL(/\/reviews\/$/);
      await expect(
        page.getByRole('heading', {
          level: 1,
          name: 'All the work, rated and reviewed',
        }),
      ).toBeVisible();

      await nav.getByRole('link', { name: 'Feature', exact: true }).click();
      await expect(page).toHaveURL(/\/feature\/$/);
    }

    expect(consoleErrors).toEqual([]);
  });

  test('Desktop cursor preview shows over a review row and hides on exit, without persisting after navigation', async ({
    page,
  }, testInfo) => {
    if (testInfo.project.name !== 'desktop') {
      test.skip(true, 'cursor preview only applies above the 900px threshold');
    }

    await page.goto('/reviews/');
    const plate = page.locator('[data-cursor-preview]');
    const firstRow = page.locator('a.review-row').first();

    await expect(plate).not.toHaveClass(/reviews-cursor-preview--visible/);

    const box = await firstRow.boundingBox();
    if (!box) throw new Error('review row bounding box unavailable');
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);

    await expect(plate).toHaveClass(/reviews-cursor-preview--visible/);
    await expect(plate).toHaveText('Read the case file →');

    await page.mouse.move(box.x + box.width / 2, box.y - 40);
    await expect(plate).not.toHaveClass(/reviews-cursor-preview--visible/);

    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await expect(plate).toHaveClass(/reviews-cursor-preview--visible/);

    const nav = page.getByRole('navigation', { name: 'Primary' });
    await nav.getByRole('link', { name: 'Feature', exact: true }).click();
    await expect(page).toHaveURL(/\/feature\/$/);
    await expect(page.locator('[data-cursor-preview]')).toHaveCount(0);
  });

  test('Re-entering Reviews does not duplicate cursor-preview behavior', async ({
    page,
  }, testInfo) => {
    if (testInfo.project.name !== 'desktop') {
      test.skip(true, 'cursor preview only applies above the 900px threshold');
    }

    await installLifecycleInstrumentation(page);
    await page.goto('/');
    const nav = page.getByRole('navigation', { name: 'Primary' });

    // Each client-side navigation contributes one before-swap/page-load
    // pair; the interaction controller (and therefore cursor-preview's own
    // pointermove listener) only attaches once its destination page-load
    // has actually fired — `toHaveURL` can resolve slightly ahead of that,
    // so this waits for the settled fire count rather than racing it (same
    // rationale as the Sprint 1F lifecycle tests above).
    let expectedFires = await page.evaluate(
      () =>
        (window as unknown as { __lifecycleFires: string[] }).__lifecycleFires
          .length,
    );

    for (let visit = 0; visit < 2; visit++) {
      await nav.getByRole('link', { name: 'Reviews', exact: true }).click();
      expectedFires += 2;
      await waitForFireCount(page, expectedFires);
      await expect(page).toHaveURL(/\/reviews\/$/);
      await expect(page.locator('[data-transition-wipe]')).not.toHaveClass(
        /is-active/,
        { timeout: 2000 },
      );

      const plate = page.locator('[data-cursor-preview]');
      await expect(plate).toHaveCount(1);

      const firstRow = page.locator('a.review-row').first();
      const box = await firstRow.boundingBox();
      if (!box) throw new Error('review row bounding box unavailable');
      // Move away first: on the second visit the pointer is already
      // resting at this exact position from the prior visit's move, and a
      // move to an unchanged position does not reliably re-dispatch
      // `pointermove`.
      await page.mouse.move(0, 0);
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await expect(plate).toHaveClass(/reviews-cursor-preview--visible/);

      await nav.getByRole('link', { name: 'Feature', exact: true }).click();
      expectedFires += 2;
      await waitForFireCount(page, expectedFires);
      await expect(page).toHaveURL(/\/feature\/$/);
    }
  });

  test('Reviews content stays fully visible under reduced motion, and the cursor-preview plate never becomes visible', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const consoleErrors: string[] = [];
    page.on('console', (message) => {
      if (message.type() === 'error') consoleErrors.push(message.text());
    });

    await page.goto('/reviews/');

    const rows = page.locator('a.review-row');
    await expect(rows).toHaveCount(6);
    const count = await rows.count();
    for (let i = 0; i < count; i++) {
      await expect(rows.nth(i)).toBeVisible();
      const opacity = await rows
        .nth(i)
        .evaluate((node) => getComputedStyle(node).opacity);
      expect(opacity).toBe('1');
    }

    const plate = page.locator('[data-cursor-preview]');
    const box = await rows.first().boundingBox();
    if (box) {
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    }
    await expect(plate).not.toHaveClass(/reviews-cursor-preview--visible/);

    await page.goBack().catch(() => {});
    await page.goto('/reviews/');
    await expect(
      page.getByRole('heading', {
        level: 1,
        name: 'All the work, rated and reviewed',
      }),
    ).toBeVisible();

    expect(consoleErrors).toEqual([]);
  });
});

test.describe('Sprint 2C Interview page', () => {
  test('Interview renders the golden-master anatomy: kicker, headline, portraits, Q&A, quote, résumé, rider, instruments, and Rotation CTA', async ({
    page,
  }) => {
    const consoleErrors: string[] = [];
    page.on('console', (message) => {
      if (message.type() === 'error') consoleErrors.push(message.text());
    });

    const response = await page.goto('/interview/');
    expect(response?.ok()).toBeTruthy();

    await expect(page.locator('.interview-kicker')).toHaveText(
      'The Interview / p.12',
    );
    await expect(
      page.getByRole('heading', {
        level: 1,
        name: 'Forty players, one tempo, and a deploy on Sunday',
      }),
    ).toBeVisible();

    const portraits = page.locator('.interview-portrait');
    await expect(portraits).toHaveCount(2);

    await expect(page.locator('.interview-qa').first()).toBeVisible();
    await expect(page.locator('.interview-qa__marker')).toHaveCount(5);

    await expect(page.getByRole('blockquote')).toBeVisible();
    await expect(page.locator('.interview-quote cite')).toBeVisible();

    await expect(
      page.getByRole('heading', {
        level: 2,
        name: 'Tour dates / the résumé',
      }),
    ).toBeVisible();
    const timelineRows = page.locator('.interview-timeline__row');
    await expect(timelineRows).toHaveCount(3);

    await expect(
      page.getByRole('heading', { level: 2, name: 'The rider' }),
    ).toBeVisible();
    await expect(page.locator('.interview-rider__list li')).toHaveCount(5);

    await expect(
      page.getByRole('heading', { level: 2, name: 'Instruments' }),
    ).toBeVisible();
    await expect(page.locator('.interview-card--instruments')).toBeVisible();

    const rotationCta = page.getByRole('link', {
      name: /doing right now/,
    });
    await expect(rotationCta).toBeVisible();
    await expect(rotationCta).toHaveAttribute('href', '/rotation/');

    await expect(page.locator('footer.newsstand-bottom-chrome')).toBeVisible();
    await expect(
      page
        .getByRole('navigation', { name: 'Primary' })
        .getByRole('link', { name: 'The Interview', exact: true }),
    ).toHaveAttribute('aria-current', 'page');

    expect(consoleErrors).toEqual([]);
  });

  test('Interview portraits declare explicit dimensions and meaningful placeholder-aware alt text', async ({
    page,
  }) => {
    await page.goto('/interview/');

    const images = page.locator('.interview-portrait img');
    await expect(images).toHaveCount(2);

    const count = await images.count();
    for (let i = 0; i < count; i++) {
      const image = images.nth(i);
      await expect(image).toHaveAttribute('width', '900');
      await expect(image).toHaveAttribute('height', '1100');
      const alt = await image.getAttribute('alt');
      expect(alt).toBeTruthy();
      expect(alt?.toLowerCase()).toMatch(/placeholder/);
    }
  });

  test('Interview has no positive tabindex and no click-only div controls', async ({
    page,
  }) => {
    await page.goto('/interview/');

    const positiveTabindexCount = await page
      .locator('[tabindex]')
      .evaluateAll(
        (nodes) =>
          nodes.filter((node) => Number(node.getAttribute('tabindex')) > 0)
            .length,
      );
    expect(positiveTabindexCount).toBe(0);

    const onclickDivCount = await page
      .locator('div[onclick], div[role="button"]')
      .count();
    expect(onclickDivCount).toBe(0);
  });

  test('Interview Rotation CTA is keyboard reachable, shows a visible focus ring, and behaves as a native link', async ({
    page,
  }) => {
    await page.goto('/interview/');

    const rotationCta = page.getByRole('link', {
      name: /doing right now/,
    });
    await expect(rotationCta).toHaveAttribute('href', '/rotation/');

    await rotationCta.focus();
    await expect(rotationCta).toBeFocused();

    const outlineStyle = await rotationCta.evaluate((element) => {
      const style = getComputedStyle(element);
      return {
        outlineStyle: style.outlineStyle,
        outlineWidth: style.outlineWidth,
      };
    });
    expect(outlineStyle.outlineStyle).toBe('solid');
    expect(parseFloat(outlineStyle.outlineWidth)).toBeGreaterThan(0);

    await rotationCta.press('Enter');
    await expect(page).toHaveURL(/\/rotation\/$/);
  });

  test('Interview -> Rotation navigation via the CTA works, and Back returns to Interview', async ({
    page,
  }) => {
    await page.goto('/interview/');
    const rotationCta = page.getByRole('link', {
      name: /doing right now/,
    });
    await rotationCta.click();
    await expect(page).toHaveURL(/\/rotation\/$/);

    await page.goBack();
    await expect(page).toHaveURL(/\/interview\/$/);
    await expect(
      page.getByRole('heading', {
        level: 1,
        name: 'Forty players, one tempo, and a deploy on Sunday',
      }),
    ).toBeVisible();

    await page.goForward();
    await expect(page).toHaveURL(/\/rotation\/$/);
  });

  test('Direct reload of /interview/ keeps the same URL, re-renders the golden-master anatomy, and reinitializes interaction cleanly', async ({
    page,
  }) => {
    const consoleErrors: string[] = [];
    page.on('console', (message) => {
      if (message.type() === 'error') consoleErrors.push(message.text());
    });

    await page.goto('/interview/');
    await expect(
      page.getByRole('heading', {
        level: 1,
        name: 'Forty players, one tempo, and a deploy on Sunday',
      }),
    ).toBeVisible();

    const reloadResponse = await page.reload();
    expect(reloadResponse?.ok()).toBeTruthy();

    await expect(page).toHaveURL(/\/interview\/$/);
    await expect(
      page.getByRole('heading', {
        level: 1,
        name: 'Forty players, one tempo, and a deploy on Sunday',
      }),
    ).toBeVisible();
    await expect(page.locator('.interview-kicker')).toBeVisible();
    await expect(page.locator('.interview-portrait')).toHaveCount(2);
    await expect(page.locator('.interview-timeline__row')).toHaveCount(3);
    const rotationCta = page.getByRole('link', { name: /doing right now/ });
    await expect(rotationCta).toHaveAttribute('href', '/rotation/');

    // Interaction initialization stays sane after a full-document reload:
    // the magnetic CTA responds to pointer movement exactly once, from a
    // fresh rest state, matching the direct-load lifecycle test above.
    await rotationCta.scrollIntoViewIfNeeded();
    const box = await rotationCta.boundingBox();
    if (!box) throw new Error('Rotation CTA bounding box unavailable');
    const restTransform = await rotationCta.evaluate(
      (el) => getComputedStyle(el).transform,
    );
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await expect(async () => {
      const transform = await rotationCta.evaluate(
        (el) => getComputedStyle(el).transform,
      );
      expect(transform).not.toBe(restTransform);
    }).toPass({ timeout: 2000 });

    expect(consoleErrors).toEqual([]);
  });
});

test.describe('Sprint 2C Interview interaction lifecycle', () => {
  test('Interview interaction modules initialize exactly once on direct load and resolve visible/understandable content', async ({
    page,
  }) => {
    const consoleErrors: string[] = [];
    page.on('console', (message) => {
      if (message.type() === 'error') consoleErrors.push(message.text());
    });

    await page.goto('/interview/');

    await expect(page.locator('.interview-kicker')).toBeVisible();
    await expect(
      page.getByRole('heading', {
        level: 1,
        name: 'Forty players, one tempo, and a deploy on Sunday',
      }),
    ).toBeVisible();

    // Above-the-fold [data-reveal] content (the portraits) must never be
    // stuck hidden, whether or not the reveal module has run yet.
    await expect(page.locator('.interview-portrait').first()).toBeVisible();

    expect(consoleErrors).toEqual([]);
  });

  test('Repeated ClientRouter navigation into and out of Interview stays console-clean and performs exactly one teardown/reinit pair per hop', async ({
    page,
  }) => {
    const consoleErrors: string[] = [];
    page.on('console', (message) => {
      if (message.type() === 'error') consoleErrors.push(message.text());
    });

    await installLifecycleInstrumentation(page);
    await page.goto('/');
    const nav = page.getByRole('navigation', { name: 'Primary' });

    const baselineFires = await page.evaluate(
      () =>
        (window as unknown as { __lifecycleFires: string[] }).__lifecycleFires
          .length,
    );

    for (let visit = 0; visit < 3; visit++) {
      await nav
        .getByRole('link', { name: 'The Interview', exact: true })
        .click();
      await expect(page).toHaveURL(/\/interview\/$/);
      await expect(
        page.getByRole('heading', {
          level: 1,
          name: 'Forty players, one tempo, and a deploy on Sunday',
        }),
      ).toBeVisible();
      await waitForFireCount(page, baselineFires + visit * 4 + 2);

      await nav.getByRole('link', { name: 'Columns', exact: true }).click();
      await expect(page).toHaveURL(/\/columns\/$/);
      await waitForFireCount(page, baselineFires + visit * 4 + 4);
    }

    const registrations = await page.evaluate(
      () =>
        (window as unknown as { __lifecycleRegistrations: string[] })
          .__lifecycleRegistrations,
    );
    expect(registrationCount(registrations, 'astro:before-swap')).toBe(1);

    expect(consoleErrors).toEqual([]);
  });

  test('Interview magnetic CTA cleanup runs on page exit and reinitializes correctly on return', async ({
    page,
  }) => {
    async function ctaTransform() {
      return page
        .getByRole('link', { name: /doing right now/ })
        .evaluate((el) => getComputedStyle(el).transform);
    }

    await page.goto('/interview/');
    const nav = page.getByRole('navigation', { name: 'Primary' });

    const cta = page.getByRole('link', { name: /doing right now/ });
    await cta.scrollIntoViewIfNeeded();
    const box = await cta.boundingBox();
    if (!box) throw new Error('Rotation CTA bounding box unavailable');

    const restTransform = await ctaTransform();
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await expect(async () => {
      expect(await ctaTransform()).not.toBe(restTransform);
    }).toPass({ timeout: 2000 });

    await page.mouse.move(0, 0);
    await nav.getByRole('link', { name: 'Feature', exact: true }).click();
    await expect(page).toHaveURL(/\/feature\/$/);

    await nav.getByRole('link', { name: 'The Interview', exact: true }).click();
    await expect(page).toHaveURL(/\/interview\/$/);
    await expect(
      page.getByRole('heading', {
        level: 1,
        name: 'Forty players, one tempo, and a deploy on Sunday',
      }),
    ).toBeVisible();

    // No stale transform survives the page exit — the fresh mount starts
    // from rest again.
    expect(await ctaTransform()).toBe(restTransform);

    const freshCta = page.getByRole('link', {
      name: /doing right now/,
    });
    await freshCta.scrollIntoViewIfNeeded();
    const freshBox = await freshCta.boundingBox();
    if (!freshBox) throw new Error('Rotation CTA bounding box unavailable');
    await page.mouse.move(
      freshBox.x + freshBox.width / 2,
      freshBox.y + freshBox.height / 2,
    );
    await expect(async () => {
      expect(await ctaTransform()).not.toBe(restTransform);
    }).toPass({ timeout: 2000 });
  });

  test('Interview content stays fully visible under reduced motion, and the magnetic CTA does not displace on pointer movement', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const consoleErrors: string[] = [];
    page.on('console', (message) => {
      if (message.type() === 'error') consoleErrors.push(message.text());
    });

    await page.goto('/interview/');

    await expect(
      page.getByRole('heading', {
        level: 1,
        name: 'Forty players, one tempo, and a deploy on Sunday',
      }),
    ).toBeVisible();

    for (const el of [
      '.interview-kicker',
      '.interview-portrait',
      '.interview-qa',
      '.interview-quote',
      '.interview-timeline__row',
      'aside.interview-sidebar',
    ]) {
      await expect(page.locator(el).first()).toBeVisible();
      const opacity = await page
        .locator(el)
        .first()
        .evaluate((node) => getComputedStyle(node).opacity);
      expect(opacity).toBe('1');
    }

    const cta = page.getByRole('link', { name: /doing right now/ });
    await cta.scrollIntoViewIfNeeded();
    const box = await cta.boundingBox();
    if (!box) throw new Error('Rotation CTA bounding box unavailable');
    const transformBefore = await cta.evaluate(
      (el) => getComputedStyle(el).transform,
    );
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    const transformAfter = await cta.evaluate(
      (el) => getComputedStyle(el).transform,
    );
    expect(transformAfter).toBe(transformBefore);

    await page.goBack().catch(() => {});
    await page.goto('/interview/');
    await expect(
      page.getByRole('heading', {
        level: 1,
        name: 'Forty players, one tempo, and a deploy on Sunday',
      }),
    ).toBeVisible();

    expect(consoleErrors).toEqual([]);
  });
});

test.describe('Sprint 2D Columns page', () => {
  test('Columns renders the golden-master anatomy: kicker, headline, lead article, four secondary rows, and handwritten note', async ({
    page,
  }) => {
    const consoleErrors: string[] = [];
    page.on('console', (message) => {
      if (message.type() === 'error') consoleErrors.push(message.text());
    });

    const response = await page.goto('/columns/');
    expect(response?.ok()).toBeTruthy();

    await expect(page.locator('.columns-kicker')).toHaveText('Columns / p.26');
    await expect(
      page.getByRole('heading', {
        level: 1,
        name: 'Words, rants and gadget reviews',
      }),
    ).toBeVisible();

    await expect(page.locator('article.columns-lead')).toBeVisible();
    await expect(
      page.getByRole('heading', {
        level: 2,
        name: "Your automation doesn't need a model",
      }),
    ).toBeVisible();

    await expect(
      page.getByRole('heading', { level: 2, name: 'More columns' }),
    ).toBeVisible();
    await expect(page.locator('li.columns-more__item')).toHaveCount(4);
    await expect(page.locator('h3.columns-more__title')).toHaveCount(4);

    await expect(page.locator('.columns-hand-note')).toBeVisible();
    await expect(page.locator('footer.newsstand-bottom-chrome')).toBeVisible();
    await expect(
      page
        .getByRole('navigation', { name: 'Primary' })
        .getByRole('link', { name: 'Columns', exact: true }),
    ).toHaveAttribute('aria-current', 'page');

    expect(consoleErrors).toEqual([]);
  });

  test('All five Columns article links are native anchors to real /columns/<slug>/ URLs', async ({
    page,
  }) => {
    await page.goto('/columns/');

    const leadLink = page.locator('a.columns-lead__link');
    await expect(leadLink).toHaveAttribute(
      'href',
      '/columns/your-automation-doesnt-need-a-model/',
    );

    const rowLinks = page.locator('a.columns-more__row');
    await expect(rowLinks).toHaveCount(4);
    const expectedHrefs = [
      '/columns/six-months-with-a-mechanical-keyboard-i-regret/',
      '/columns/what-conducting-taught-me-about-standups/',
      '/columns/gacha-ui-is-better-than-your-products-ui/',
      '/columns/the-eval-sheet-is-the-deliverable/',
    ];
    for (let i = 0; i < expectedHrefs.length; i++) {
      await expect(rowLinks.nth(i)).toHaveAttribute('href', expectedHrefs[i]);
    }
  });

  test('Columns has no positive tabindex and no click-only div semantics anywhere on the page', async ({
    page,
  }) => {
    await page.goto('/columns/');

    const positiveTabindexCount = await page
      .locator('[tabindex]')
      .evaluateAll(
        (nodes) =>
          nodes.filter((node) => Number(node.getAttribute('tabindex')) > 0)
            .length,
      );
    expect(positiveTabindexCount).toBe(0);

    const linkCount = await page
      .locator('a.columns-lead__link, a.columns-more__row')
      .count();
    expect(linkCount).toBe(5);
  });

  test('Columns lead image has explicit dimensions and decorative (non-truthful placeholder) alt text', async ({
    page,
  }) => {
    await page.goto('/columns/');

    const image = page.locator('.columns-lead__image img');
    await expect(image).toHaveAttribute('width', '1200');
    await expect(image).toHaveAttribute('height', '675');
    await expect(image).toHaveAttribute('alt', '');
  });

  test('A Columns article link is keyboard reachable, shows a visible focus ring, and behaves as a native link — lead, then secondary rows 1-4, in order', async ({
    page,
  }) => {
    await page.goto('/columns/');

    const leadLink = page.locator('a.columns-lead__link');
    await leadLink.focus();
    await expect(leadLink).toBeFocused();

    const outlineStyle = await leadLink.evaluate((element) => {
      const style = getComputedStyle(element);
      return {
        outlineStyle: style.outlineStyle,
        outlineWidth: style.outlineWidth,
      };
    });
    expect(outlineStyle.outlineStyle).toBe('solid');
    expect(parseFloat(outlineStyle.outlineWidth)).toBeGreaterThan(0);

    await page.keyboard.press('Tab');
    await expect(page.locator('a.columns-more__row').first()).toBeFocused();

    await leadLink.focus();
    await leadLink.press('Enter');
    await expect(page).toHaveURL(
      /\/columns\/your-automation-doesnt-need-a-model\/$/,
    );
  });

  test('Columns lead -> detail navigation via click works, and Back returns to Columns', async ({
    page,
  }) => {
    await page.goto('/columns/');
    const leadLink = page.locator('a.columns-lead__link');

    await leadLink.click();
    await expect(page).toHaveURL(
      /\/columns\/your-automation-doesnt-need-a-model\/$/,
    );
    await expect(
      page.getByRole('heading', {
        level: 1,
        name: "Your automation doesn't need a model",
      }),
    ).toBeVisible();

    await page.goBack();
    await expect(page).toHaveURL(/\/columns\/$/);
    await expect(
      page.getByRole('heading', {
        level: 1,
        name: 'Words, rants and gadget reviews',
      }),
    ).toBeVisible();

    await page.goForward();
    await expect(page).toHaveURL(
      /\/columns\/your-automation-doesnt-need-a-model\/$/,
    );
  });
});

test.describe('Sprint 2E Columns [slug] production article-detail template', () => {
  const slugs = [
    'your-automation-doesnt-need-a-model',
    'six-months-with-a-mechanical-keyboard-i-regret',
    'what-conducting-taught-me-about-standups',
    'gacha-ui-is-better-than-your-products-ui',
    'the-eval-sheet-is-the-deliverable',
  ];

  const titles: Record<string, string> = {
    'your-automation-doesnt-need-a-model':
      "Your automation doesn't need a model",
    'six-months-with-a-mechanical-keyboard-i-regret':
      'Six months with a mechanical keyboard I regret',
    'what-conducting-taught-me-about-standups':
      'What conducting taught me about standups',
    'gacha-ui-is-better-than-your-products-ui':
      "Gacha UI is better than your product's UI",
    'the-eval-sheet-is-the-deliverable': 'The eval sheet is the deliverable',
  };

  const kickers: Record<string, string> = {
    'your-automation-doesnt-need-a-model': 'Essay',
    'six-months-with-a-mechanical-keyboard-i-regret': 'Gadget review',
    'what-conducting-taught-me-about-standups': 'Column',
    'gacha-ui-is-better-than-your-products-ui': 'Rant',
    'the-eval-sheet-is-the-deliverable': 'Notebook',
  };

  test('Each of the five demo slugs resolves directly, is indexable, and keeps Columns navigation active', async ({
    page,
  }) => {
    for (const slug of slugs) {
      const response = await page.goto(`/columns/${slug}/`);
      expect(response?.ok()).toBeTruthy();
      expect(new URL(page.url()).pathname).toBe(`/columns/${slug}/`);

      // No longer a temporary noindex shell — Sprint 2E's production
      // template is real, indexable content.
      await expect(page.locator('meta[name="robots"]')).toHaveCount(0);
      await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
      await expect(page.locator('.columns-detail__kicker')).toHaveText(
        `${kickers[slug]} / p.26`,
      );
      await expect(
        page.getByRole('heading', { level: 1, name: titles[slug] }),
      ).toBeVisible();

      await expect(
        page
          .getByRole('navigation', { name: 'Primary' })
          .getByRole('link', { name: 'Columns', exact: true }),
      ).toHaveAttribute('aria-current', 'page');
    }
  });

  test('Renders the golden-master anatomy: standfirst, meta bar, hero image, 4+5 paragraph prose, pull quote, section, signature, and sidebar', async ({
    page,
  }) => {
    const consoleErrors: string[] = [];
    page.on('console', (message) => {
      if (message.type() === 'error') consoleErrors.push(message.text());
    });

    await page.goto('/columns/your-automation-doesnt-need-a-model/');

    await expect(page.locator('.columns-detail__standfirst')).toBeVisible();
    await expect(page.locator('.columns-detail__meta')).toBeVisible();

    const hero = page.locator('.columns-detail__hero img');
    await expect(hero).toHaveAttribute('width', '1600');
    await expect(hero).toHaveAttribute('height', '700');
    await expect(hero).toHaveAttribute('alt', '');
    await expect(page.locator('.columns-detail__caption')).toBeVisible();

    const proseBlocks = page.locator('.columns-detail__prose');
    await expect(proseBlocks).toHaveCount(2);
    await expect(proseBlocks.nth(0).locator('p')).toHaveCount(4);
    await expect(proseBlocks.nth(1).locator('p')).toHaveCount(5);

    await expect(
      page.locator('blockquote.columns-detail__quote'),
    ).toBeVisible();
    await expect(
      page.locator('blockquote.columns-detail__quote cite'),
    ).toHaveCount(0);
    await expect(page.getByRole('heading', { level: 2 }).first()).toBeVisible();
    await expect(page.locator('.columns-detail__signature')).toHaveText(
      '— J. V. Caballero',
    );

    await expect(
      page.getByRole('heading', { level: 2, name: 'More columns' }),
    ).toBeVisible();
    await expect(page.locator('.columns-detail__sidebar-row')).toHaveCount(4);

    await expect(page.locator('footer.newsstand-bottom-chrome')).toBeVisible();
    expect(consoleErrors).toEqual([]);
  });

  test('The lead column (first in order) has no Previous link/card, and the last column has no Next link/card', async ({
    page,
  }) => {
    await page.goto('/columns/your-automation-doesnt-need-a-model/');
    await expect(
      page.locator('.columns-detail__prevnext-link--prev'),
    ).toHaveCount(0);
    await expect(page.locator('.columns-detail__card--prev')).toHaveCount(0);
    await expect(
      page.locator('.columns-detail__prevnext-link--next'),
    ).toHaveCount(1);
    await expect(page.locator('.columns-detail__card--next')).toHaveCount(1);
    await expect(page.locator('.columns-detail__divider')).toHaveCount(0);

    await page.goto('/columns/the-eval-sheet-is-the-deliverable/');
    await expect(
      page.locator('.columns-detail__prevnext-link--next'),
    ).toHaveCount(0);
    await expect(page.locator('.columns-detail__card--next')).toHaveCount(0);
    await expect(
      page.locator('.columns-detail__prevnext-link--prev'),
    ).toHaveCount(1);
    await expect(page.locator('.columns-detail__card--prev')).toHaveCount(1);
    await expect(page.locator('.columns-detail__divider')).toHaveCount(0);
  });

  test('A middle column has both Previous and Next, pointing at its immediate neighbors in fixed order (no wraparound)', async ({
    page,
  }) => {
    await page.goto('/columns/what-conducting-taught-me-about-standups/');

    await expect(
      page.locator('.columns-detail__prevnext-link--prev'),
    ).toHaveAttribute(
      'href',
      '/columns/six-months-with-a-mechanical-keyboard-i-regret/',
    );
    await expect(
      page.locator('.columns-detail__prevnext-link--next'),
    ).toHaveAttribute(
      'href',
      '/columns/gacha-ui-is-better-than-your-products-ui/',
    );
    await expect(page.locator('.columns-detail__divider')).toHaveCount(1);

    await expect(page.locator('.columns-detail__card--prev')).toHaveAttribute(
      'href',
      '/columns/six-months-with-a-mechanical-keyboard-i-regret/',
    );
    await expect(page.locator('.columns-detail__card--next')).toHaveAttribute(
      'href',
      '/columns/gacha-ui-is-better-than-your-products-ui/',
    );
  });

  test('Sidebar "More columns" lists the other four columns in fixed order, each linking to its own route', async ({
    page,
  }) => {
    await page.goto('/columns/your-automation-doesnt-need-a-model/');

    const rows = page.locator('a.columns-detail__sidebar-row');
    await expect(rows).toHaveCount(4);
    const expectedHrefs = [
      '/columns/six-months-with-a-mechanical-keyboard-i-regret/',
      '/columns/what-conducting-taught-me-about-standups/',
      '/columns/gacha-ui-is-better-than-your-products-ui/',
      '/columns/the-eval-sheet-is-the-deliverable/',
    ];
    for (let i = 0; i < expectedHrefs.length; i++) {
      await expect(rows.nth(i)).toHaveAttribute('href', expectedHrefs[i]);
    }
    // The current column never appears in its own "More columns" list.
    await expect(
      rows.filter({ hasText: "Your automation doesn't need a model" }),
    ).toHaveCount(0);
  });

  test('Columns detail has no positive tabindex and no click-only div semantics', async ({
    page,
  }) => {
    await page.goto('/columns/what-conducting-taught-me-about-standups/');

    const positiveTabindexCount = await page
      .locator('[tabindex]')
      .evaluateAll(
        (nodes) =>
          nodes.filter((node) => Number(node.getAttribute('tabindex')) > 0)
            .length,
      );
    expect(positiveTabindexCount).toBe(0);

    // All navigation is real <a href> — top "All columns" link, prev/next
    // (topbar + cards), the four sidebar rows, and the sidebar's own
    // "Back to all columns" link.
    const linkCount = await page
      .locator(
        'a.columns-detail__all, a.columns-detail__prevnext-link, ' +
          'a.columns-detail__card, a.columns-detail__sidebar-row, ' +
          'a.columns-detail__back',
      )
      .count();
    // 1 (all) + 2 (prevnext, both present on this middle-order slug) +
    // 2 (cards, both present) + 4 (sidebar rows) + 1 (back) = 10.
    expect(linkCount).toBe(10);
  });

  test('Direct reload of a Columns slug route keeps the same URL and re-renders the template', async ({
    page,
  }) => {
    const response = await page.goto(
      '/columns/the-eval-sheet-is-the-deliverable/',
    );
    expect(response?.ok()).toBeTruthy();
    await expect(
      page.getByRole('heading', {
        level: 1,
        name: 'The eval sheet is the deliverable',
      }),
    ).toBeVisible();

    const reloadResponse = await page.reload();
    expect(reloadResponse?.ok()).toBeTruthy();
    expect(new URL(page.url()).pathname).toBe(
      '/columns/the-eval-sheet-is-the-deliverable/',
    );
    await expect(
      page.getByRole('heading', {
        level: 1,
        name: 'The eval sheet is the deliverable',
      }),
    ).toBeVisible();
  });

  test('Back navigates from a Columns slug route to the Columns index, and Forward returns to the slug route', async ({
    page,
  }) => {
    await page.goto('/columns/');
    await page.locator('a.columns-lead__link').click();
    await expect(page).toHaveURL(
      /\/columns\/your-automation-doesnt-need-a-model\/$/,
    );

    await page.goBack();
    await expect(page).toHaveURL(/\/columns\/$/);

    await page.goForward();
    await expect(page).toHaveURL(
      /\/columns\/your-automation-doesnt-need-a-model\/$/,
    );
  });

  test('The detail template links back to the Columns index via real anchors ("← All columns" and "Back to all columns →")', async ({
    page,
  }) => {
    await page.goto('/columns/what-conducting-taught-me-about-standups/');

    const topLink = page.locator('a.columns-detail__all');
    await expect(topLink).toHaveAttribute('href', '/columns/');

    const backLink = page.locator('a.columns-detail__back');
    await expect(backLink).toHaveAttribute('href', '/columns/');
    await backLink.click();
    await expect(page).toHaveURL(/\/columns\/$/);
    await expect(
      page.getByRole('heading', {
        level: 1,
        name: 'Words, rants and gadget reviews',
      }),
    ).toBeVisible();
  });

  test('Clicking a sidebar "More columns" row and a Next card navigate to the correct detail routes', async ({
    page,
  }) => {
    await page.goto('/columns/your-automation-doesnt-need-a-model/');

    await page.locator('a.columns-detail__sidebar-row').nth(1).click();
    await expect(page).toHaveURL(
      /\/columns\/what-conducting-taught-me-about-standups\/$/,
    );

    await page.locator('a.columns-detail__card--next').click();
    await expect(page).toHaveURL(
      /\/columns\/gacha-ui-is-better-than-your-products-ui\/$/,
    );
  });

  test('Keyboard focus order on the detail template: back link, prev/next, then prev/next cards and sidebar rows, in document order', async ({
    page,
  }) => {
    await page.goto('/columns/what-conducting-taught-me-about-standups/');

    const allLink = page.locator('a.columns-detail__all');
    await allLink.focus();
    await expect(allLink).toBeFocused();
    const outlineStyle = await allLink.evaluate((element) => {
      const style = getComputedStyle(element);
      return {
        outlineStyle: style.outlineStyle,
        outlineWidth: style.outlineWidth,
      };
    });
    expect(outlineStyle.outlineStyle).toBe('solid');
    expect(parseFloat(outlineStyle.outlineWidth)).toBeGreaterThan(0);

    await page.keyboard.press('Tab');
    await expect(
      page.locator('.columns-detail__prevnext-link--prev'),
    ).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(
      page.locator('.columns-detail__prevnext-link--next'),
    ).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(page.locator('.columns-detail__card--prev')).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(page.locator('.columns-detail__card--next')).toBeFocused();
    for (let i = 0; i < 4; i++) {
      await page.keyboard.press('Tab');
      await expect(
        page.locator('a.columns-detail__sidebar-row').nth(i),
      ).toBeFocused();
    }
    await page.keyboard.press('Tab');
    await expect(page.locator('a.columns-detail__back')).toBeFocused();
  });
});

test.describe('Sprint 2E Columns detail interaction lifecycle', () => {
  test('Columns detail template resolves data-reveal targets and stays console-clean', async ({
    page,
  }) => {
    const consoleErrors: string[] = [];
    page.on('console', (message) => {
      if (message.type() === 'error') consoleErrors.push(message.text());
    });

    await page.goto('/columns/your-automation-doesnt-need-a-model/');

    await expect(page.locator('[data-reveal]')).toHaveCount(5);
    for (const el of await page.locator('[data-reveal]').all()) {
      await expect(el).toBeVisible();
    }

    expect(consoleErrors).toEqual([]);
  });

  test('Desktop cursor preview activates on a Columns detail route over sidebar rows and prev/next cards', async ({
    page,
  }, testInfo) => {
    if (testInfo.project.name !== 'desktop') {
      test.skip(true, 'cursor preview only applies above the 900px threshold');
    }

    await page.goto('/columns/what-conducting-taught-me-about-standups/');
    const plate = page.locator('[data-cursor-preview]');
    await expect(plate).not.toHaveClass(/columns-cursor-preview--visible/);

    // The full-width 16/7 hero pushes the sidebar/cards below the fold at
    // this viewport height, so scroll each target into view first —
    // otherwise a synthetic pointer move to its raw page coordinates lands
    // outside the actual viewport and never hit-tests the element.
    const row = page.locator('a.columns-detail__sidebar-row').first();
    await row.scrollIntoViewIfNeeded();
    const rowBox = await row.boundingBox();
    if (!rowBox) throw new Error('sidebar row bounding box unavailable');
    await page.mouse.move(
      rowBox.x + rowBox.width / 2,
      rowBox.y + rowBox.height / 2,
    );
    await expect(plate).toHaveClass(/columns-cursor-preview--visible/);
    await expect(plate).toHaveText('Read the column →');

    const card = page.locator('a.columns-detail__card--next');
    await card.scrollIntoViewIfNeeded();
    const cardBox = await card.boundingBox();
    if (!cardBox) throw new Error('card bounding box unavailable');
    await page.mouse.move(
      cardBox.x + cardBox.width / 2,
      cardBox.y + cardBox.height / 2,
    );
    await expect(plate).toHaveClass(/columns-cursor-preview--visible/);
    await expect(plate).toHaveText('Read the column →');
  });

  test('Columns detail content stays fully visible under reduced motion, and the cursor-preview plate never becomes visible', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const consoleErrors: string[] = [];
    page.on('console', (message) => {
      if (message.type() === 'error') consoleErrors.push(message.text());
    });

    await page.goto('/columns/your-automation-doesnt-need-a-model/');

    const reveals = page.locator('[data-reveal]');
    const count = await reveals.count();
    for (let i = 0; i < count; i++) {
      await expect(reveals.nth(i)).toBeVisible();
      const opacity = await reveals
        .nth(i)
        .evaluate((node) => getComputedStyle(node).opacity);
      expect(opacity).toBe('1');
    }

    const plate = page.locator('[data-cursor-preview]');
    const box = await page
      .locator('a.columns-detail__sidebar-row')
      .first()
      .boundingBox();
    if (box) {
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    }
    await expect(plate).not.toHaveClass(/columns-cursor-preview--visible/);

    expect(consoleErrors).toEqual([]);
  });
});

test.describe('Sprint 2D Columns interaction lifecycle', () => {
  test('Columns interaction modules initialize exactly once on direct load and resolve visible content', async ({
    page,
  }) => {
    const consoleErrors: string[] = [];
    page.on('console', (message) => {
      if (message.type() === 'error') consoleErrors.push(message.text());
    });

    await page.goto('/columns/');

    await expect(page.locator('a.columns-lead__link')).toBeVisible();
    for (const row of await page.locator('a.columns-more__row').all()) {
      await expect(row).toBeVisible();
    }

    expect(consoleErrors).toEqual([]);
  });

  test('Repeated ClientRouter navigation into and out of Columns stays console-clean', async ({
    page,
  }) => {
    const consoleErrors: string[] = [];
    page.on('console', (message) => {
      if (message.type() === 'error') consoleErrors.push(message.text());
    });

    await page.goto('/');
    const nav = page.getByRole('navigation', { name: 'Primary' });

    for (let visit = 0; visit < 3; visit++) {
      await nav.getByRole('link', { name: 'Columns', exact: true }).click();
      await expect(page).toHaveURL(/\/columns\/$/);
      await expect(
        page.getByRole('heading', {
          level: 1,
          name: 'Words, rants and gadget reviews',
        }),
      ).toBeVisible();

      await nav.getByRole('link', { name: 'Reviews', exact: true }).click();
      await expect(page).toHaveURL(/\/reviews\/$/);
    }

    expect(consoleErrors).toEqual([]);
  });

  test('Desktop cursor preview shows a per-item label over Columns items and hides on exit, without persisting after navigation', async ({
    page,
  }, testInfo) => {
    if (testInfo.project.name !== 'desktop') {
      test.skip(true, 'cursor preview only applies above the 900px threshold');
    }

    await page.goto('/columns/');
    const plate = page.locator('[data-cursor-preview]');
    const leadLink = page.locator('a.columns-lead__link');
    const firstRow = page.locator('a.columns-more__row').first();

    await expect(plate).not.toHaveClass(/columns-cursor-preview--visible/);

    const leadBox = await leadLink.boundingBox();
    if (!leadBox) throw new Error('lead link bounding box unavailable');
    await page.mouse.move(
      leadBox.x + leadBox.width / 2,
      leadBox.y + leadBox.height / 2,
    );
    await expect(plate).toHaveClass(/columns-cursor-preview--visible/);
    await expect(plate).toHaveText('Read the essay →');

    const rowBox = await firstRow.boundingBox();
    if (!rowBox) throw new Error('row bounding box unavailable');
    await page.mouse.move(
      rowBox.x + rowBox.width / 2,
      rowBox.y + rowBox.height / 2,
    );
    await expect(plate).toHaveClass(/columns-cursor-preview--visible/);
    await expect(plate).toHaveText('Read the review →');

    await page.mouse.move(rowBox.x + rowBox.width / 2, rowBox.y - 60);
    await expect(plate).not.toHaveClass(/columns-cursor-preview--visible/);

    const nav = page.getByRole('navigation', { name: 'Primary' });
    await nav.getByRole('link', { name: 'Reviews', exact: true }).click();
    await expect(page).toHaveURL(/\/reviews\/$/);
    await expect(page.locator('.columns-cursor-preview')).toHaveCount(0);
  });

  test('Re-entering Columns does not duplicate cursor-preview behavior, and Reviews cursor-preview behavior is unaffected', async ({
    page,
  }, testInfo) => {
    if (testInfo.project.name !== 'desktop') {
      test.skip(true, 'cursor preview only applies above the 900px threshold');
    }

    await installLifecycleInstrumentation(page);
    await page.goto('/');
    const nav = page.getByRole('navigation', { name: 'Primary' });

    let expectedFires = await page.evaluate(
      () =>
        (window as unknown as { __lifecycleFires: string[] }).__lifecycleFires
          .length,
    );

    for (let visit = 0; visit < 2; visit++) {
      await nav.getByRole('link', { name: 'Columns', exact: true }).click();
      expectedFires += 2;
      await waitForFireCount(page, expectedFires);
      await expect(page).toHaveURL(/\/columns\/$/);
      // The transition wipe overlay intercepts pointer events (and
      // therefore `event.target`) while active — wait for it to clear
      // before dispatching pointermove, same rationale as the equivalent
      // Reviews lifecycle test above.
      await expect(page.locator('[data-transition-wipe]')).not.toHaveClass(
        /is-active/,
        { timeout: 2000 },
      );

      const plate = page.locator('[data-cursor-preview]');
      await expect(plate).toHaveCount(1);

      const leadLink = page.locator('a.columns-lead__link');
      const box = await leadLink.boundingBox();
      if (!box) throw new Error('lead link bounding box unavailable');
      await page.mouse.move(0, 0);
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await expect(plate).toHaveClass(/columns-cursor-preview--visible/);

      await nav.getByRole('link', { name: 'Reviews', exact: true }).click();
      expectedFires += 2;
      await waitForFireCount(page, expectedFires);
      await expect(page).toHaveURL(/\/reviews\/$/);
      await expect(page.locator('[data-transition-wipe]')).not.toHaveClass(
        /is-active/,
        { timeout: 2000 },
      );

      // Reviews' own cursor-preview keeps its static label and visible
      // class untouched by Columns' dynamic-label extension.
      const reviewsPlate = page.locator('[data-cursor-preview]');
      const reviewRow = page.locator('a.review-row').first();
      const reviewBox = await reviewRow.boundingBox();
      if (!reviewBox) throw new Error('review row bounding box unavailable');
      await page.mouse.move(0, 0);
      await page.mouse.move(
        reviewBox.x + reviewBox.width / 2,
        reviewBox.y + reviewBox.height / 2,
      );
      await expect(reviewsPlate).toHaveClass(/reviews-cursor-preview--visible/);
      await expect(reviewsPlate).toHaveText('Read the case file →');
    }
  });

  test('Columns content stays fully visible under reduced motion, and the cursor-preview plate never becomes visible', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const consoleErrors: string[] = [];
    page.on('console', (message) => {
      if (message.type() === 'error') consoleErrors.push(message.text());
    });

    await page.goto('/columns/');

    const links = page.locator('a.columns-lead__link, a.columns-more__row');
    await expect(links).toHaveCount(5);
    const count = await links.count();
    for (let i = 0; i < count; i++) {
      await expect(links.nth(i)).toBeVisible();
      const opacity = await links
        .nth(i)
        .evaluate((node) => getComputedStyle(node).opacity);
      expect(opacity).toBe('1');
    }

    const plate = page.locator('[data-cursor-preview]');
    const box = await links.first().boundingBox();
    if (box) {
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    }
    await expect(plate).not.toHaveClass(/columns-cursor-preview--visible/);

    await page.goBack().catch(() => {});
    await page.goto('/columns/');
    await expect(
      page.getByRole('heading', {
        level: 1,
        name: 'Words, rants and gadget reviews',
      }),
    ).toBeVisible();

    expect(consoleErrors).toEqual([]);
  });
});

test.describe('Sprint 2D Columns lead image hover correction', () => {
  // Correction pass: the lead image's grayscale-to-color/scale transition
  // must be owned by the image itself (`.columns-lead__image img:hover`),
  // not by the whole `.columns-lead__link` article link. Hovering the
  // title/excerpt/metadata/CTA must NOT animate the image; only hovering
  // the image itself should. The cursor-preview cue is a separate
  // responsibility and still activates across the whole lead link — this
  // test does not conflate the two.
  test('Lead image only animates when the image itself is hovered, not when other lead content is hovered', async ({
    page,
  }, testInfo) => {
    if (testInfo.project.name !== 'desktop') {
      test.skip(true, 'hover interactions are desktop-only');
    }

    await page.goto('/columns/');

    const image = page.locator('.columns-lead__image img');
    const title = page.locator('.columns-lead__title');
    const excerpt = page.locator('.columns-lead__excerpt');

    async function imageState() {
      return image.evaluate((el) => {
        const style = getComputedStyle(el);
        return { filter: style.filter, transform: style.transform };
      });
    }

    // State A — resting: grayscale filter, no scale transform.
    await page.mouse.move(10, 10);
    const resting = await imageState();
    expect(resting.filter).toContain('grayscale(1)');
    expect(resting.transform).toBe('none');

    // State B — hovering non-image lead content (title, excerpt) must NOT
    // animate the image; it stays in its resting filter/transform state.
    const titleBox = await title.boundingBox();
    if (!titleBox) throw new Error('lead title bounding box unavailable');
    await page.mouse.move(
      titleBox.x + titleBox.width / 2,
      titleBox.y + titleBox.height / 2,
    );
    // Give any (incorrect) transition a moment to start, then assert it
    // never left the resting state.
    await page.waitForTimeout(150);
    const duringTitleHover = await imageState();
    expect(duringTitleHover.filter).toContain('grayscale(1)');
    expect(duringTitleHover.transform).toBe('none');

    const excerptBox = await excerpt.boundingBox();
    if (!excerptBox) throw new Error('lead excerpt bounding box unavailable');
    await page.mouse.move(
      excerptBox.x + excerptBox.width / 2,
      excerptBox.y + excerptBox.height / 2,
    );
    await page.waitForTimeout(150);
    const duringExcerptHover = await imageState();
    expect(duringExcerptHover.filter).toContain('grayscale(1)');
    expect(duringExcerptHover.transform).toBe('none');

    // State C — hovering the image itself must reach the golden-master
    // hover state (filter removed, ~scale(1.03)) once the transition
    // settles. Wait for the transition to finish rather than sampling
    // mid-animation.
    const imageBox = await image.boundingBox();
    if (!imageBox) throw new Error('lead image bounding box unavailable');
    await page.mouse.move(
      imageBox.x + imageBox.width / 2,
      imageBox.y + imageBox.height / 2,
    );
    await expect(async () => {
      const hovered = await imageState();
      expect(hovered.filter).toBe('none');
      const match = hovered.transform.match(
        /matrix\(([-\d.]+),\s*0,\s*0,\s*([-\d.]+)/,
      );
      expect(match).not.toBeNull();
      if (match) {
        expect(parseFloat(match[1])).toBeCloseTo(1.03, 1);
        expect(parseFloat(match[2])).toBeCloseTo(1.03, 1);
      }
    }).toPass({ timeout: 2000 });

    // The cursor-preview cue is a separate responsibility from the image
    // hover above and still activates across the whole lead article link,
    // including over non-image content — verify it is not conflated with
    // the image-hover fix.
    const plate = page.locator('[data-cursor-preview]');
    await page.mouse.move(
      titleBox.x + titleBox.width / 2,
      titleBox.y + titleBox.height / 2,
    );
    await expect(plate).toHaveClass(/columns-cursor-preview--visible/);
  });
});

test.describe('Sprint 2F B-Sides page', () => {
  const cardCopy = [
    {
      title: 'Bandstand',
      badge: 'IN USE',
      description:
        'Sheet music, parts and call times for forty musicians. Built because I was the one maintaining the group chat, and the group chat was losing.',
      stack: 'Next.js · Postgres · PDF wrangling',
    },
    {
      title: 'Pity Counter',
      badge: 'LIVE',
      description:
        'Four gacha games, one dashboard that tells the truth about my pull history. Wuthering Waves, Zenless Zone Zero, Genshin, Endfield. The numbers are not kind.',
      stack: 'React · charts · denial',
    },
    {
      title: 'Setlist',
      badge: 'LIVE',
      description:
        'Keys, capos and audience requests for acoustic bar nights. Written between two sets; its offline sync pattern ended up in a production clinic app.',
      stack: 'React Native · offline-first',
    },
    {
      title: 'Shelf',
      badge: 'WIP',
      description:
        'Manga backlog tracker with a working guilt meter. Currently telling me I am three volumes behind on four series.',
      stack: 'Svelte · scraping · shame',
    },
  ] as const;

  test('B-Sides renders the golden-master anatomy: kicker, headline, intro, and four project cards with verbatim copy', async ({
    page,
  }) => {
    const consoleErrors: string[] = [];
    page.on('console', (message) => {
      if (message.type() === 'error') consoleErrors.push(message.text());
    });

    const response = await page.goto('/b-sides/');
    expect(response?.ok()).toBeTruthy();

    await expect(page.locator('.bsides-kicker')).toHaveText('B-Sides / p.28');
    await expect(
      page.getByRole('heading', { level: 1, name: 'The playground' }),
    ).toBeVisible();
    await expect(page.locator('.bsides-intro')).toHaveText(
      'Things built for an audience of one — me — which is how most of my best patterns start.',
    );

    const cards = page.locator('article.bsides-card');
    await expect(cards).toHaveCount(4);
    const h2s = page.locator('h2.bsides-card__title');
    await expect(h2s).toHaveCount(4);

    for (let i = 0; i < cardCopy.length; i++) {
      const card = cards.nth(i);
      const expected = cardCopy[i];
      await expect(card.locator('.bsides-card__title')).toHaveText(
        expected.title,
      );
      await expect(card.locator('.bsides-card__badge')).toHaveText(
        expected.badge,
      );
      await expect(card.locator('.bsides-card__description')).toHaveText(
        expected.description,
      );
      await expect(card.locator('.bsides-card__stack')).toHaveText(
        expected.stack,
      );
    }

    await expect(page.locator('footer.newsstand-bottom-chrome')).toBeVisible();
    await expect(
      page
        .getByRole('navigation', { name: 'Primary' })
        .getByRole('link', { name: 'B-Sides', exact: true }),
    ).toHaveAttribute('aria-current', 'page');

    expect(consoleErrors).toEqual([]);
  });

  test('The first card (Bandstand) is the only inverted/dark card; the other three share the paper treatment', async ({
    page,
  }) => {
    await page.goto('/b-sides/');

    const cards = page.locator('article.bsides-card');
    await expect(cards.nth(0)).toHaveClass(/bsides-card--inverted/);
    for (let i = 1; i < 4; i++) {
      await expect(cards.nth(i)).not.toHaveClass(/bsides-card--inverted/);
    }
  });

  test('B-Sides cards are non-interactive: no <a> elements, no click handlers, no invented navigation', async ({
    page,
  }) => {
    await page.goto('/b-sides/');

    await expect(
      page.locator('a.bsides-card, a article.bsides-card'),
    ).toHaveCount(0);
    const cardTagNames = await page
      .locator('.bsides-grid > li > *')
      .evaluateAll((nodes) => nodes.map((node) => node.tagName));
    expect(cardTagNames).toEqual(['ARTICLE', 'ARTICLE', 'ARTICLE', 'ARTICLE']);

    const onclickCount = await page
      .locator('article.bsides-card[onclick]')
      .count();
    expect(onclickCount).toBe(0);

    const positiveTabindexCount = await page
      .locator('[tabindex]')
      .evaluateAll(
        (nodes) =>
          nodes.filter((node) => Number(node.getAttribute('tabindex')) > 0)
            .length,
      );
    expect(positiveTabindexCount).toBe(0);
  });

  test('B-Sides card images have explicit dimensions matching the 16/10 aspect ratio and decorative alt text', async ({
    page,
  }) => {
    await page.goto('/b-sides/');

    const images = page.locator('.bsides-card__image img');
    await expect(images).toHaveCount(4);
    const count = await images.count();
    for (let i = 0; i < count; i++) {
      const image = images.nth(i);
      await expect(image).toHaveAttribute('width', '800');
      await expect(image).toHaveAttribute('height', '500');
      await expect(image).toHaveAttribute('alt', '');
    }
  });

  test('Direct reload of /b-sides/ keeps the same URL and re-renders the page', async ({
    page,
  }) => {
    const response = await page.goto('/b-sides/');
    expect(response?.ok()).toBeTruthy();
    await expect(
      page.getByRole('heading', { level: 1, name: 'The playground' }),
    ).toBeVisible();

    const reloadResponse = await page.reload();
    expect(reloadResponse?.ok()).toBeTruthy();
    expect(new URL(page.url()).pathname).toBe('/b-sides/');
    await expect(
      page.getByRole('heading', { level: 1, name: 'The playground' }),
    ).toBeVisible();
  });
});

test.describe('Sprint 2F B-Sides interaction lifecycle', () => {
  test('B-Sides scroll-reveal targets initialize exactly once on direct load and resolve visible content', async ({
    page,
  }) => {
    const consoleErrors: string[] = [];
    page.on('console', (message) => {
      if (message.type() === 'error') consoleErrors.push(message.text());
    });

    await page.goto('/b-sides/');

    const reveals = page.locator('[data-reveal]');
    await expect(reveals).toHaveCount(4);
    for (const el of await reveals.all()) {
      await expect(el).toBeVisible();
    }

    expect(consoleErrors).toEqual([]);
  });

  test('B-Sides content stays fully visible under reduced motion, with all reveal targets resolved to opacity 1', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const consoleErrors: string[] = [];
    page.on('console', (message) => {
      if (message.type() === 'error') consoleErrors.push(message.text());
    });

    await page.goto('/b-sides/');

    const reveals = page.locator('[data-reveal]');
    const count = await reveals.count();
    expect(count).toBe(4);
    for (let i = 0; i < count; i++) {
      await expect(reveals.nth(i)).toBeVisible();
      const opacity = await reveals
        .nth(i)
        .evaluate((node) => getComputedStyle(node).opacity);
      expect(opacity).toBe('1');
    }

    expect(consoleErrors).toEqual([]);
  });

  test('Repeated ClientRouter navigation into and out of B-Sides stays console-clean without accumulating controller listeners', async ({
    page,
  }) => {
    const consoleErrors: string[] = [];
    page.on('console', (message) => {
      if (message.type() === 'error') consoleErrors.push(message.text());
    });

    await installLifecycleInstrumentation(page);
    await page.goto('/');
    const nav = page.getByRole('navigation', { name: 'Primary' });

    for (let visit = 0; visit < 3; visit++) {
      await nav.getByRole('link', { name: 'B-Sides', exact: true }).click();
      await expect(page).toHaveURL(/\/b-sides\/$/);
      await expect(
        page.getByRole('heading', { level: 1, name: 'The playground' }),
      ).toBeVisible();

      await nav.getByRole('link', { name: 'Reviews', exact: true }).click();
      await expect(page).toHaveURL(/\/reviews\/$/);
    }

    const registrations = await page.evaluate(
      () =>
        (window as unknown as { __lifecycleRegistrations: string[] })
          .__lifecycleRegistrations,
    );
    expect(registrationCount(registrations, 'astro:before-swap')).toBe(1);

    expect(consoleErrors).toEqual([]);
  });
});

test.describe('Sprint 2G Rotation page', () => {
  const games = [
    { name: 'Wuthering Waves', note: 'main rotation', rating: 5 },
    { name: 'Arknights: Endfield', note: 'new, dangerous', rating: 4 },
    { name: 'Zenless Zone Zero', note: 'daily, briefly', rating: 4 },
    { name: 'Genshin Impact', note: 'logging in out of loyalty', rating: 3 },
  ] as const;

  test('Rotation renders the golden-master anatomy: kicker, headline, three status cards, and two list cards with verbatim copy', async ({
    page,
  }) => {
    const consoleErrors: string[] = [];
    page.on('console', (message) => {
      if (message.type() === 'error') consoleErrors.push(message.text());
    });

    const response = await page.goto('/rotation/');
    expect(response?.ok()).toBeTruthy();

    await expect(page.locator('.rotation-kicker')).toHaveText(
      'Rotation / p.30 · updated 4 August 2026',
    );
    await expect(
      page.getByRole('heading', { level: 1, name: "This month's rotation" }),
    ).toBeVisible();

    const statusCards = page.locator('.rotation-status-card');
    await expect(statusCards).toHaveCount(3);

    await expect(
      statusCards.nth(0).locator('.rotation-status-card__label'),
    ).toHaveText('Building');
    await expect(
      statusCards.nth(0).locator('.rotation-status-card__title'),
    ).toHaveText('This site, third attempt');
    await expect(
      statusCards.nth(0).locator('.rotation-status-card__description'),
    ).toHaveText(
      'Last one was built during the pandemic and it shows. Also: a fresh eval harness I keep meaning to open-source.',
    );

    await expect(
      statusCards.nth(1).locator('.rotation-status-card__label'),
    ).toHaveText('Rehearsing');
    await expect(
      statusCards.nth(1).locator('.rotation-status-card__title'),
    ).toHaveText('Field show, season opens October');
    await expect(
      statusCards.nth(1).locator('.rotation-status-card__description'),
    ).toHaveText('Forty musicians, one baton, Saturdays gone until November.');

    await expect(
      statusCards.nth(2).locator('.rotation-status-card__label'),
    ).toHaveText('Gigging');
    await expect(
      statusCards.nth(2).locator('.rotation-status-card__title'),
    ).toHaveText('Acoustic sets, Fri & Sat');
    await expect(
      statusCards.nth(2).locator('.rotation-status-card__description'),
    ).toHaveText('Same four bars, same six requests, no complaints.');

    await expect(
      page.locator('.rotation-list-card__heading').nth(0),
    ).toHaveText('On heavy rotation · games');
    const gameRows = page.locator('.rotation-games__row');
    await expect(gameRows).toHaveCount(4);
    for (let i = 0; i < games.length; i++) {
      const row = gameRows.nth(i);
      await expect(row).toContainText(games[i].name);
      await expect(row).toContainText(games[i].note);
      const rating = row.locator('.rotation-games__rating');
      await expect(rating).toHaveAttribute('aria-hidden', 'true');
      await expect(rating).toHaveText(
        '★'.repeat(games[i].rating) + '☆'.repeat(5 - games[i].rating),
      );
      await expect(row.locator('.rotation-visually-hidden')).toHaveText(
        `${games[i].rating} out of 5 stars`,
      );
    }

    await expect(
      page.locator('.rotation-list-card__heading').nth(1),
    ).toHaveText('On the shelf · manga & gear');
    const shelfNotes = page.locator('.rotation-shelf-notes p');
    await expect(shelfNotes).toHaveCount(3);
    await expect(shelfNotes.nth(0)).toHaveText(
      'Three volumes behind on four series. The guilt meter is at 61%.',
    );
    await expect(shelfNotes.nth(1)).toHaveText(
      'Reviewing: a split keyboard I already regret buying, and a very good USB-C dock nobody asked about.',
    );
    await expect(shelfNotes.nth(2)).toHaveText(
      'Open to contract work from November. Say hello before the field show eats October.',
    );
    await expect(page.locator('.rotation-hand-note')).toHaveText(
      'the guilt meter is, regrettably, a real feature',
    );

    await expect(page.locator('footer.newsstand-bottom-chrome')).toBeVisible();
    await expect(
      page
        .getByRole('navigation', { name: 'Primary' })
        .getByRole('link', { name: 'Rotation', exact: true }),
    ).toHaveAttribute('aria-current', 'page');

    expect(consoleErrors).toEqual([]);
  });

  test('The "Rehearsing" card is the only status card with an always-on yellow background; Building and Gigging stay paper at rest', async ({
    page,
  }) => {
    await page.goto('/rotation/');

    const statusCards = page.locator('.rotation-status-card');
    await expect(statusCards.nth(1)).toHaveClass(
      /rotation-status-card--highlight/,
    );
    for (const i of [0, 2]) {
      await expect(statusCards.nth(i)).not.toHaveClass(
        /rotation-status-card--highlight/,
      );
    }

    const highlightBackground = await statusCards
      .nth(1)
      .evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(highlightBackground).toBe('rgb(255, 230, 0)');

    for (const i of [0, 2]) {
      const background = await statusCards
        .nth(i)
        .evaluate((el) => getComputedStyle(el).backgroundColor);
      expect(background).toMatch(/rgba\(0, 0, 0, 0\)|transparent/);
    }
  });

  test('Rotation cards are non-interactive: no <a> elements, no click handlers, no invented navigation, and no positive tabindex', async ({
    page,
  }) => {
    await page.goto('/rotation/');

    await expect(
      page.locator('a.rotation-status-card, a.rotation-list-card'),
    ).toHaveCount(0);

    const onclickCount = await page
      .locator('.rotation-status-card[onclick], .rotation-list-card[onclick]')
      .count();
    expect(onclickCount).toBe(0);

    const positiveTabindexCount = await page
      .locator('[tabindex]')
      .evaluateAll(
        (nodes) =>
          nodes.filter((node) => Number(node.getAttribute('tabindex')) > 0)
            .length,
      );
    expect(positiveTabindexCount).toBe(0);
  });

  test('Direct reload of /rotation/ keeps the same URL and re-renders the page', async ({
    page,
  }) => {
    const response = await page.goto('/rotation/');
    expect(response?.ok()).toBeTruthy();
    await expect(
      page.getByRole('heading', { level: 1, name: "This month's rotation" }),
    ).toBeVisible();

    const reloadResponse = await page.reload();
    expect(reloadResponse?.ok()).toBeTruthy();
    expect(new URL(page.url()).pathname).toBe('/rotation/');
    await expect(
      page.getByRole('heading', { level: 1, name: "This month's rotation" }),
    ).toBeVisible();
  });
});

test.describe('Sprint 2G Rotation interaction lifecycle', () => {
  test('Rotation scroll-reveal targets initialize exactly once on direct load and resolve visible content', async ({
    page,
  }) => {
    const consoleErrors: string[] = [];
    page.on('console', (message) => {
      if (message.type() === 'error') consoleErrors.push(message.text());
    });

    await page.goto('/rotation/');

    const reveals = page.locator('[data-reveal]');
    await expect(reveals).toHaveCount(5);
    for (const el of await reveals.all()) {
      await expect(el).toBeVisible();
    }

    expect(consoleErrors).toEqual([]);
  });

  test('Rotation content stays fully visible under reduced motion, with all reveal targets resolved to opacity 1', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const consoleErrors: string[] = [];
    page.on('console', (message) => {
      if (message.type() === 'error') consoleErrors.push(message.text());
    });

    await page.goto('/rotation/');

    const reveals = page.locator('[data-reveal]');
    const count = await reveals.count();
    expect(count).toBe(5);
    for (let i = 0; i < count; i++) {
      await expect(reveals.nth(i)).toBeVisible();
      const opacity = await reveals
        .nth(i)
        .evaluate((node) => getComputedStyle(node).opacity);
      expect(opacity).toBe('1');
    }

    expect(consoleErrors).toEqual([]);
  });

  test('Repeated ClientRouter navigation into and out of Rotation stays console-clean without accumulating controller listeners', async ({
    page,
  }) => {
    const consoleErrors: string[] = [];
    page.on('console', (message) => {
      if (message.type() === 'error') consoleErrors.push(message.text());
    });

    await installLifecycleInstrumentation(page);
    await page.goto('/');
    const nav = page.getByRole('navigation', { name: 'Primary' });

    for (let visit = 0; visit < 3; visit++) {
      await nav.getByRole('link', { name: 'Rotation', exact: true }).click();
      await expect(page).toHaveURL(/\/rotation\/$/);
      await expect(
        page.getByRole('heading', { level: 1, name: "This month's rotation" }),
      ).toBeVisible();

      await nav.getByRole('link', { name: 'Reviews', exact: true }).click();
      await expect(page).toHaveURL(/\/reviews\/$/);
    }

    const registrations = await page.evaluate(
      () =>
        (window as unknown as { __lifecycleRegistrations: string[] })
          .__lifecycleRegistrations,
    );
    expect(registrationCount(registrations, 'astro:before-swap')).toBe(1);

    expect(consoleErrors).toEqual([]);
  });
});

test.describe('Sprint 2H Letters page', () => {
  const EMAIL = 'jvcaballero@tuta.io';
  const EMAIL_DISPLAY = 'JVCABALLERO@TUTA.IO';
  const GITHUB_URL = 'https://github.com/JVCaballero';
  const GITHUB_DISPLAY = 'GITHUB.COM/JVCABALLERO';
  const LINKEDIN_URL = 'https://linkedin.com/in/john-vincent-c-06814b111';
  const LINKEDIN_DISPLAY = 'LINKEDIN.COM/IN/JVCABALLERO';

  test('Letters renders the golden-master anatomy: kicker, headline, red panel, real contact links, hand note, and both right-column cards', async ({
    page,
  }) => {
    const consoleErrors: string[] = [];
    page.on('console', (message) => {
      if (message.type() === 'error') consoleErrors.push(message.text());
    });

    const response = await page.goto('/letters/');
    expect(response?.ok()).toBeTruthy();

    await expect(page.locator('.letters-kicker')).toHaveText('Letters / p.34');
    await expect(
      page.getByRole('heading', { level: 1, name: 'Write to the editor' }),
    ).toBeVisible();

    await expect(page.locator('.letters-panel__statement')).toHaveText(
      "Got a weird problem in an unglamorous industry? That's the good stuff.",
    );
    await expect(page.locator('.letters-panel__intro')).toContainText(
      'Contract or full-time, web or mobile',
    );

    const emailLink = page.locator('[data-copy-email]');
    await expect(emailLink).toHaveText(EMAIL_DISPLAY);
    await expect(emailLink).toHaveAttribute('href', `mailto:${EMAIL}`);
    await expect(emailLink).toHaveAttribute('data-copy-email', EMAIL);
    await expect(emailLink).not.toHaveAttribute('target');

    const githubLink = page.getByRole('link', { name: GITHUB_DISPLAY });
    await expect(githubLink).toHaveAttribute('href', GITHUB_URL);
    await expect(githubLink).toHaveAttribute('target', '_blank');
    await expect(githubLink).toHaveAttribute('rel', 'noopener noreferrer');

    const linkedinLink = page.getByRole('link', { name: LINKEDIN_DISPLAY });
    await expect(linkedinLink).toHaveAttribute('href', LINKEDIN_URL);
    await expect(linkedinLink).toHaveAttribute('target', '_blank');
    await expect(linkedinLink).toHaveAttribute('rel', 'noopener noreferrer');

    await expect(page.locator('.letters-contact li')).toHaveCount(3);

    const confirmation = page.locator('[data-copy-confirmation]');
    await expect(confirmation).toBeHidden();
    await expect(confirmation).toHaveAttribute('aria-live', 'polite');

    await expect(page.locator('.letters-hand-note')).toHaveText(
      'tap the address — it copies itself',
    );

    const takingCard = page.locator('.letters-card').nth(0);
    await expect(
      takingCard.getByRole('heading', { level: 2, name: 'Currently taking' }),
    ).toBeVisible();
    const takingItems = takingCard.locator('.letters-taking li');
    await expect(takingItems).toHaveCount(4);
    await expect(takingItems.nth(0)).toContainText('Contract builds from');
    await expect(takingItems.nth(0).locator('strong')).toHaveText(
      'November 2026',
    );
    await expect(takingItems.nth(1)).toContainText('AI workflow audits');
    await expect(takingItems.nth(2)).toContainText(
      'Rescue jobs on stalled products',
    );
    await expect(takingItems.nth(3)).toContainText('Unpaid');
    await expect(takingItems.nth(3)).toHaveClass(/letters-taking__excluded/);

    const acceptingCard = page.locator('.letters-card').nth(1);
    await expect(
      acceptingCard.getByRole('heading', { level: 2, name: 'Also accepting' }),
    ).toBeVisible();
    await expect(acceptingCard).toContainText('Gig bookings');
    await expect(acceptingCard).toHaveClass(/letters-card--highlight/);

    await expect(page.locator('footer.newsstand-bottom-chrome')).toBeVisible();
    await expect(
      page
        .getByRole('navigation', { name: 'Primary' })
        .getByRole('link', { name: 'Letters', exact: true }),
    ).toHaveAttribute('aria-current', 'page');

    expect(consoleErrors).toEqual([]);
  });

  test('Letters contact links are real, native anchors — no span onClick, no href="#", no positive tabindex', async ({
    page,
  }) => {
    await page.goto('/letters/');

    const contactLinks = page.locator('.letters-contact__link');
    await expect(contactLinks).toHaveCount(3);
    for (const link of await contactLinks.all()) {
      const tagName = await link.evaluate((el) => el.tagName);
      expect(tagName).toBe('A');
      const href = await link.getAttribute('href');
      expect(href).not.toBe('#');
      expect(href).toBeTruthy();
    }

    const onclickCount = await page.locator('[onclick]').count();
    expect(onclickCount).toBe(0);

    const positiveTabindexCount = await page
      .locator('[tabindex]')
      .evaluateAll(
        (nodes) =>
          nodes.filter((node) => Number(node.getAttribute('tabindex')) > 0)
            .length,
      );
    expect(positiveTabindexCount).toBe(0);
  });

  test('Direct reload of /letters/ keeps the same URL and re-renders the page', async ({
    page,
  }) => {
    const response = await page.goto('/letters/');
    expect(response?.ok()).toBeTruthy();
    await expect(
      page.getByRole('heading', { level: 1, name: 'Write to the editor' }),
    ).toBeVisible();

    const reloadResponse = await page.reload();
    expect(reloadResponse?.ok()).toBeTruthy();
    expect(new URL(page.url()).pathname).toBe('/letters/');
    await expect(
      page.getByRole('heading', { level: 1, name: 'Write to the editor' }),
    ).toBeVisible();
  });
});

test.describe('Sprint 2H Letters interaction lifecycle', () => {
  const EMAIL = 'jvcaballero@tuta.io';

  test('Letters scroll-reveal targets initialize exactly once on direct load and resolve visible content', async ({
    page,
  }) => {
    const consoleErrors: string[] = [];
    page.on('console', (message) => {
      if (message.type() === 'error') consoleErrors.push(message.text());
    });

    await page.goto('/letters/');

    const reveals = page.locator('[data-reveal]');
    await expect(reveals).toHaveCount(2);
    for (const el of await reveals.all()) {
      await expect(el).toBeVisible();
    }

    expect(consoleErrors).toEqual([]);
  });

  test('Letters content stays fully visible under reduced motion, with all reveal targets resolved to opacity 1', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const consoleErrors: string[] = [];
    page.on('console', (message) => {
      if (message.type() === 'error') consoleErrors.push(message.text());
    });

    await page.goto('/letters/');

    const reveals = page.locator('[data-reveal]');
    const count = await reveals.count();
    expect(count).toBe(2);
    for (let i = 0; i < count; i++) {
      await expect(reveals.nth(i)).toBeVisible();
      const opacity = await reveals
        .nth(i)
        .evaluate((node) => getComputedStyle(node).opacity);
      expect(opacity).toBe('1');
    }

    expect(consoleErrors).toEqual([]);
  });

  test('Clicking the email address copies the real address to the clipboard, intercepts the mailto navigation, and shows/announces the "copied!" confirmation', async ({
    page,
    context,
  }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    const consoleErrors: string[] = [];
    page.on('console', (message) => {
      if (message.type() === 'error') consoleErrors.push(message.text());
    });

    await page.goto('/letters/');

    const emailLink = page.locator('[data-copy-email]');
    const confirmation = page.locator('[data-copy-confirmation]');
    await expect(confirmation).toBeHidden();

    await emailLink.click();

    // The click must be intercepted (preventDefault) rather than navigating
    // to a mailto: URL, which Chromium would otherwise attempt to hand off
    // to an external protocol handler and could stall the test.
    await expect(page).toHaveURL(/\/letters\/$/);

    const copiedText = await page.evaluate(() =>
      navigator.clipboard.readText(),
    );
    expect(copiedText).toBe(EMAIL);

    await expect(confirmation).toBeVisible();
    await expect(confirmation).toHaveText(
      'copied! now tell me the actual problem →',
    );

    expect(consoleErrors).toEqual([]);
  });

  test('The "copied!" confirmation auto-hides after its timeout and can be re-triggered by a second click', async ({
    page,
    context,
  }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.goto('/letters/');

    const emailLink = page.locator('[data-copy-email]');
    const confirmation = page.locator('[data-copy-confirmation]');

    await emailLink.click();
    await expect(confirmation).toBeVisible();
    await expect(confirmation).toBeHidden({ timeout: 6000 });

    await emailLink.click();
    await expect(confirmation).toBeVisible();
  });

  test('Without clipboard permission, clicking the email address does not show a false "copied!" confirmation and the link remains a real mailto anchor', async ({
    page,
    context,
  }) => {
    // Simulate an unsupported/unavailable Clipboard API by deleting it
    // before the page's own scripts run, exercising the module's
    // no-Clipboard-API fallback branch (the click must be left alone so
    // the native mailto: navigation proceeds).
    await context.clearPermissions();
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'clipboard', {
        value: undefined,
        configurable: true,
      });
    });

    await page.goto('/letters/');

    const emailLink = page.locator('[data-copy-email]');
    const confirmation = page.locator('[data-copy-confirmation]');
    await expect(emailLink).toHaveAttribute('href', `mailto:${EMAIL}`);

    await emailLink.click();
    await page.waitForTimeout(500);

    await expect(confirmation).toBeHidden();
  });

  test('Letters contact links show a visible focus ring against the red panel background', async ({
    page,
  }) => {
    await page.goto('/letters/');

    const emailLink = page.locator('[data-copy-email]');
    await emailLink.focus();
    await expect(emailLink).toBeFocused();

    const outline = await emailLink.evaluate((el) => {
      const style = getComputedStyle(el);
      return { color: style.outlineColor, width: style.outlineWidth };
    });
    expect(outline.width).not.toBe('0px');
    // The override must not be the invisible-on-red global default
    // (--color-red, rgb(226, 35, 26)) — it must be the ink override.
    expect(outline.color).toBe('rgb(23, 19, 15)');
  });

  test('Repeated ClientRouter navigation into and out of Letters stays console-clean without accumulating controller listeners', async ({
    page,
  }) => {
    const consoleErrors: string[] = [];
    page.on('console', (message) => {
      if (message.type() === 'error') consoleErrors.push(message.text());
    });

    await installLifecycleInstrumentation(page);
    await page.goto('/');
    const nav = page.getByRole('navigation', { name: 'Primary' });

    for (let visit = 0; visit < 3; visit++) {
      await nav.getByRole('link', { name: 'Letters', exact: true }).click();
      await expect(page).toHaveURL(/\/letters\/$/);
      await expect(
        page.getByRole('heading', { level: 1, name: 'Write to the editor' }),
      ).toBeVisible();

      await nav.getByRole('link', { name: 'Reviews', exact: true }).click();
      await expect(page).toHaveURL(/\/reviews\/$/);
    }

    const registrations = await page.evaluate(
      () =>
        (window as unknown as { __lifecycleRegistrations: string[] })
          .__lifecycleRegistrations,
    );
    expect(registrationCount(registrations, 'astro:before-swap')).toBe(1);

    expect(consoleErrors).toEqual([]);
  });
});

test.describe('Sprint 2I Resume', () => {
  test('Resume loads directly with the real, final résumé content, a working download link, and no console errors', async ({
    page,
  }) => {
    const consoleErrors: string[] = [];
    page.on('console', (message) => {
      if (message.type() === 'error') consoleErrors.push(message.text());
    });

    const response = await page.goto('/resume/');
    expect(response?.ok()).toBeTruthy();

    await expect(page.locator('.resume-kicker')).toHaveText('Résumé / p.36');
    await expect(
      page.getByRole('heading', { level: 1, name: 'Full Résumé' }),
    ).toBeVisible();

    const downloadLink = page.getByRole('link', { name: /download pdf/i });
    await expect(downloadLink).toHaveAttribute(
      'href',
      '/resume/john-vincent-caballero-resume.pdf',
    );
    await expect(downloadLink).toHaveAttribute('download', '');

    const h2s = (
      await page.getByRole('heading', { level: 2 }).allTextContents()
    ).map((text) => text.trim());
    expect(h2s).toEqual([
      'Core Competencies',
      'Professional Experience',
      'Education',
      'Skills & Tools',
    ]);

    await expect(page.locator('.resume-timeline__item')).toHaveCount(3);
    await expect(page.locator('.resume-education')).toBeVisible();
    await expect(page.locator('.resume-card')).toHaveCount(2);

    // Real content, not the Sprint 1 placeholder shell it replaces.
    await expect(page.locator('[data-route="resume"]')).toHaveCount(0);

    await expect(page.locator('footer.newsstand-bottom-chrome')).toBeVisible();

    expect(consoleErrors).toEqual([]);
  });

  test('Resume is not in the visible primary navigation and does not carry aria-current there', async ({
    page,
  }) => {
    await page.goto('/resume/');
    const nav = page.getByRole('navigation', { name: 'Primary' });
    await expect(
      nav.getByRole('link', { name: 'Resume', exact: true }),
    ).toHaveCount(0);
  });

  test('The "Download PDF" link resolves to the real static asset with a 200 response', async ({
    page,
    request,
  }) => {
    await page.goto('/resume/');
    const downloadLink = page.getByRole('link', { name: /download pdf/i });
    const href = await downloadLink.getAttribute('href');
    expect(href).toBe('/resume/john-vincent-caballero-resume.pdf');

    const response = await request.get(href as string);
    expect(response.status()).toBe(200);
    const contentType = response.headers()['content-type'] ?? '';
    expect(contentType).toContain('application/pdf');
  });

  test('Resume omits any phone number and generalizes location to "Cebu, Philippines" in on-page text', async ({
    page,
  }) => {
    await page.goto('/resume/');
    const bodyText = (
      await page.locator('article.resume-page').innerText()
    ).replace(/\s+/g, ' ');

    // No phone number pattern anywhere in the rendered text.
    expect(bodyText).not.toMatch(/\+?\d[\d\s().-]{7,}\d/);
    expect(bodyText).not.toMatch(/Talisay/i);
    expect(bodyText).toContain('Cebu, Philippines');
  });

  test('Resume has no positive tabindex and no click-only div controls', async ({
    page,
  }) => {
    await page.goto('/resume/');

    const positiveTabindexCount = await page
      .locator('[tabindex]')
      .evaluateAll(
        (nodes) =>
          nodes.filter((node) => Number(node.getAttribute('tabindex')) > 0)
            .length,
      );
    expect(positiveTabindexCount).toBe(0);

    const onclickDivCount = await page
      .locator('div[onclick], div[role="button"]')
      .count();
    expect(onclickDivCount).toBe(0);

    const hashHrefCount = await page.locator('a[href="#"]').count();
    expect(hashHrefCount).toBe(0);
  });

  test('Resume scroll-reveal targets are visible and settled under reduced motion', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const consoleErrors: string[] = [];
    page.on('console', (message) => {
      if (message.type() === 'error') consoleErrors.push(message.text());
    });

    await page.goto('/resume/');

    const reveals = page.locator('[data-reveal]');
    const count = await reveals.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < count; i++) {
      await expect(reveals.nth(i)).toBeVisible();
      const opacity = await reveals
        .nth(i)
        .evaluate((node) => getComputedStyle(node).opacity);
      expect(opacity).toBe('1');
    }

    expect(consoleErrors).toEqual([]);
  });

  test("Interview's new résumé link navigates to the real Resume page via the ClientRouter", async ({
    page,
  }) => {
    await page.goto('/interview/');
    const resumeLink = page.getByRole('link', { name: /full résumé/i });
    await expect(resumeLink).toHaveAttribute('href', '/resume/');

    await resumeLink.click();
    await expect(page).toHaveURL(/\/resume\/$/);
    await expect(
      page.getByRole('heading', { level: 1, name: 'Full Résumé' }),
    ).toBeVisible();
  });
});
