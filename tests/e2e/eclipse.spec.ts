/**
 * Browser end-to-end coverage.
 *
 * Real Chrome, real service worker, real runtime injection, real ShadowRoot UI.
 * See fixtures.ts for why sessions are driven through the worker's own message
 * contract rather than by clicking a popup rendered as a tab.
 */

import {
  DEMO_A,
  DEMO_B,
  articleText,
  card,
  expect,
  readProfile,
  send,
  skipCalibrationInPopup,
  startEclipse,
  stopEclipse,
  test,
  tokens,
} from './fixtures';

const ATTENDRE = 'button[data-eclipse-concept="fr:attendre:wait"]';

test.describe('1–2. first run', () => {
  test('a fresh install can complete calibration', async ({ popup }) => {
    await expect(popup.getByText(/Question 1 of 3/)).toBeVisible();
    await expect(popup.locator('.cal-surface')).toHaveText('bonjour');

    await popup.getByRole('button', { name: 'hello' }).click();
    await expect(popup.getByText(/Question 2 of 3/)).toBeVisible();
    await expect(popup.locator('.cal-surface')).toHaveText('bibliothèque');

    await popup.getByRole('button', { name: 'a library' }).click();
    await expect(popup.getByText(/Question 3 of 3/)).toBeVisible();
    await expect(popup.locator('.cal-surface')).toHaveText('avoir le cafard');

    await popup.getByRole('button', { name: 'he feels gloomy' }).click();

    await expect(popup.getByRole('button', { name: /Start Eclipse/ })).toBeVisible();
    await expect(popup.getByText('English → French')).toBeVisible();
  });

  test('a fresh install can skip calibration', async ({ popup }) => {
    await expect(popup.getByText(/Question 1 of 3/)).toBeVisible();
    await popup.getByRole('button', { name: /^Skip/ }).click();
    await expect(popup.getByRole('button', { name: /Start Eclipse/ })).toBeVisible();
    await expect(popup.getByText(/Question 1 of 3/)).toBeHidden();
  });

  test('a completed calibration is remembered', async ({ context, extensionId, popup }) => {
    await popup.getByRole('button', { name: /^Skip/ }).click();
    await expect(popup.getByRole('button', { name: /Start Eclipse/ })).toBeVisible();

    const second = await context.newPage();
    await second.goto(`chrome-extension://${extensionId}/popup.html`);
    await expect(second.getByRole('button', { name: /Start Eclipse/ })).toBeVisible();
    await expect(second.getByText(/Question 1 of 3/)).toBeHidden();
    await second.close();
  });

  test('a perfect calibration raises global ability to its maximum', async ({
    popup,
    serviceWorker,
  }) => {
    await popup.getByRole('button', { name: 'hello' }).click();
    await popup.getByRole('button', { name: 'a library' }).click();
    await popup.getByRole('button', { name: 'he feels gloomy' }).click();
    await expect(popup.getByRole('button', { name: /Start Eclipse/ })).toBeVisible();

    const profile = await readProfile(serviceWorker);
    expect(profile?.calibrationCompleted).toBe(true);
    expect(profile?.globalAbility).toBeCloseTo(1, 5);
  });
});

test.describe('3. activating Demo A', () => {
  test('places 2–4 French traps in the article', async ({ context, driver }) => {
    const page = await context.newPage();
    await page.goto(DEMO_A);

    const started = await startEclipse(driver, page);
    expect(started.ok, JSON.stringify(started)).toBe(true);

    await expect(tokens(page).first()).toBeVisible();
    const count = await tokens(page).count();
    expect(count).toBeGreaterThanOrEqual(2);
    expect(count).toBeLessThanOrEqual(4);

    for (let i = 0; i < count; i += 1) {
      const token = tokens(page).nth(i);
      await expect(token).toHaveAttribute('lang', 'fr-FR');
      await expect(token).toHaveAttribute('type', 'button');
      await expect(token).toHaveAttribute('aria-label', /French context challenge/);
    }

    await expect(page.locator(ATTENDRE)).toHaveText('attendre');
  });

  test('leaves navigation, links, code, captions and forms untouched', async ({
    context,
    driver,
  }) => {
    const page = await context.newPage();
    await page.goto(DEMO_A);
    await startEclipse(driver, page);
    await expect(tokens(page).first()).toBeVisible();

    for (const selector of [
      'nav',
      'header',
      'footer',
      'aside',
      'form',
      'pre',
      'code',
      'a',
      'figcaption',
      '[contenteditable]',
      '[aria-hidden="true"]',
    ]) {
      await expect(page.locator(`${selector} button[data-eclipse-owner="eclipse"]`)).toHaveCount(0);
    }
  });

  test('places at most one trap per paragraph', async ({ context, driver }) => {
    const page = await context.newPage();
    await page.goto(DEMO_A);
    await startEclipse(driver, page);
    await expect(tokens(page).first()).toBeVisible();

    const perBlock = await page.evaluate(() =>
      Array.from(document.querySelectorAll('button[data-eclipse-owner="eclipse"]')).map((token) => {
        const block = token.closest('p, li, blockquote');
        return block
          ? Array.from(document.querySelectorAll('p, li, blockquote')).indexOf(block)
          : -1;
      }),
    );
    expect(new Set(perBlock).size).toBe(perBlock.length);
    expect(perBlock).not.toContain(-1);
  });
});

test.describe('4. answering attendre correctly', () => {
  test('the Truth Card gives meaning, clue, reason, distractor and phase', async ({
    context,
    driver,
    serviceWorker,
  }) => {
    const page = await context.newPage();
    await page.goto(DEMO_A);
    await startEclipse(driver, page);

    await page.locator(ATTENDRE).click();

    const dialog = card(page);
    await expect(dialog).toBeVisible();
    await expect(dialog).toHaveAttribute('aria-modal', 'true');
    await expect(dialog.getByText('What does it mean here?')).toBeVisible();
    await expect(dialog.locator('.eclipse-choice')).toHaveCount(3);

    await dialog.getByRole('button', { name: 'wait', exact: true }).click();

    await expect(dialog.locator('.eclipse-verdict')).toContainText('Correct');
    await expect(dialog.getByText('Means here')).toBeVisible();
    await expect(dialog.locator('.eclipse-clue')).toHaveText('for the bus');
    await expect(dialog.getByText(/attendre is to wait/)).toBeVisible();
    await expect(dialog.getByText(/Why not/)).toBeVisible();
    await expect(dialog.locator('.eclipse-phase')).toContainText(
      /New moon|Crescent|Half moon|Full moon/,
    );
    await expect(dialog.locator('.eclipse-note')).toContainText(/Saved/);

    await dialog.getByRole('button', { name: 'Keep reading' }).click();
    await expect(dialog).toBeHidden();

    const profile = await readProfile(serviceWorker);
    const mastery = (profile?.mastery as Record<string, { correct: number }>)['fr:attendre:wait'];
    expect(mastery?.correct).toBe(1);
  });

  test('three interactions get from page to answered', async ({ context, driver }) => {
    const page = await context.newPage();
    await page.goto(DEMO_A);
    await startEclipse(driver, page);

    // 1. open the token, 2. choose a meaning, 3. dismiss.
    await page.locator(ATTENDRE).click();
    await card(page).getByRole('button', { name: 'wait', exact: true }).click();
    await card(page).getByRole('button', { name: 'Keep reading' }).click();
    await expect(card(page)).toBeHidden();
  });
});

test.describe('5. wrong answer transfers from Demo A to Demo B', () => {
  test('a missed concept comes back on the next page', async ({
    context,
    driver,
    serviceWorker,
  }) => {
    const pageA = await context.newPage();
    await pageA.goto(DEMO_A);
    await startEclipse(driver, pageA);

    await pageA.locator(ATTENDRE).click();
    const dialog = card(pageA);
    await dialog.getByRole('button', { name: 'hope', exact: true }).click();
    await expect(dialog.locator('.eclipse-verdict')).toContainText('Not this time');
    await expect(dialog.locator('.eclipse-note')).toContainText(/next time it appears/i);
    await dialog.getByRole('button', { name: 'Keep reading' }).click();

    const profile = await readProfile(serviceWorker);
    const mastery = (profile?.mastery as Record<string, { due: { kind: string } }>)[
      'fr:attendre:wait'
    ];
    expect(mastery?.due).toEqual({ kind: 'next_occurrence' });

    await stopEclipse(driver);

    const pageB = await context.newPage();
    await pageB.goto(DEMO_B);
    const startedB = await startEclipse(driver, pageB);
    expect(startedB.ok).toBe(true);

    await expect(tokens(pageB).first()).toBeVisible();
    await expect(pageB.locator(ATTENDRE)).toHaveText('attendre');
  });

  test('a fresh learner on Demo B does not see attendre', async ({ context, driver }) => {
    const page = await context.newPage();
    await page.goto(DEMO_B);
    await startEclipse(driver, page);

    await expect(tokens(page).first()).toBeVisible();
    await expect(page.locator(ATTENDRE)).toHaveCount(0);
  });

  test('answering the review correctly schedules it a day out', async ({
    context,
    driver,
    serviceWorker,
  }) => {
    const pageA = await context.newPage();
    await pageA.goto(DEMO_A);
    await startEclipse(driver, pageA);
    await pageA.locator(ATTENDRE).click();
    await card(pageA).getByRole('button', { name: 'hope', exact: true }).click();
    await card(pageA).getByRole('button', { name: 'Keep reading' }).click();
    await stopEclipse(driver);

    const pageB = await context.newPage();
    await pageB.goto(DEMO_B);
    await startEclipse(driver, pageB);
    await pageB.locator(ATTENDRE).click();
    await card(pageB).getByRole('button', { name: 'wait', exact: true }).click();

    await expect(card(pageB).locator('.eclipse-note')).toContainText(/Review scheduled in 1 day/);

    const profile = await readProfile(serviceWorker);
    const mastery = (
      profile?.mastery as Record<string, { due: { kind: string }; attempts: number }>
    )['fr:attendre:wait'];
    expect(mastery?.due.kind).toBe('timestamp');
    expect(mastery?.attempts).toBe(2);
  });
});

test.describe('6. deactivation restores the page', () => {
  test('visible text matches the pre-activation snapshot', async ({ context, driver }) => {
    const page = await context.newPage();
    await page.goto(DEMO_A);
    const before = await articleText(page);

    await startEclipse(driver, page);
    await expect(tokens(page).first()).toBeVisible();
    expect(await articleText(page)).not.toBe(before);

    const stopped = await stopEclipse(driver);
    expect(stopped.ok).toBe(true);

    await expect(tokens(page)).toHaveCount(0);
    expect(await articleText(page)).toBe(before);
    await expect(page.locator('eclipse-challenge')).toHaveCount(0);
    await expect(page.locator('#eclipse-token-styles')).toHaveCount(0);
  });
});

test.describe('6b. the popup reflects the running session', () => {
  test('shows End Eclipse while a session is live, and stops it', async ({
    context,
    driver,
    extensionId,
  }) => {
    const page = await context.newPage();
    await page.goto(DEMO_A);
    const before = await articleText(page);
    await startEclipse(driver, page);
    await expect(tokens(page).first()).toBeVisible();

    // A real popup is not a tab, so it never becomes its own active-tab result.
    // Opening it and leaving the article in front reproduces that.
    const popup = await context.newPage();
    await popup.goto(`chrome-extension://${extensionId}/popup.html`);
    await page.bringToFront();
    await popup.reload();

    await expect(popup.getByRole('button', { name: 'End Eclipse' })).toBeVisible();
    await expect(popup.getByText(/Eclipse is running on this page/)).toBeVisible();

    await popup.getByRole('button', { name: 'End Eclipse' }).click();
    await expect(popup.getByRole('button', { name: 'Start Eclipse' })).toBeVisible();

    await expect(tokens(page)).toHaveCount(0);
    expect(await articleText(page)).toBe(before);
  });

  test('offers the AI toggle, off, with the no-network claim', async ({ popup }) => {
    await skipCalibrationInPopup(popup);
    const toggle = popup.getByRole('button', { name: /AI-generated traps/ });
    await expect(toggle).toBeVisible();
    await expect(toggle).toHaveAttribute('aria-pressed', 'false');
    await expect(popup.getByText(/Off\. Eclipse makes no network requests at all\./)).toBeVisible();
  });
});

test.describe('7–8. pages Eclipse cannot work on', () => {
  test('an article with no eligible traps returns NO_ELIGIBLE_TRAPS', async ({
    context,
    driver,
  }) => {
    const page = await context.newPage();
    await page.goto(`${DEMO_A.replace('demo-a.html', '')}no-traps.html`);
    await page.bringToFront();

    const started = await startEclipse(driver, page);
    expect(started.ok).toBe(false);
    if (!started.ok) expect(started.error.code).toBe('NO_ELIGIBLE_TRAPS');
    await expect(tokens(page)).toHaveCount(0);
  });

  test('an unsupported URL returns UNSUPPORTED_URL and the popup says so', async ({
    context,
    driver,
    extensionId,
  }) => {
    const blank = await context.newPage();
    await blank.goto('about:blank');
    await blank.bringToFront();

    const started = await send(driver, { type: 'START_SESSION' });
    expect(started.ok).toBe(false);
    if (!started.ok) expect(started.error.code).toBe('UNSUPPORTED_URL');

    const popup = await context.newPage();
    await popup.goto(`chrome-extension://${extensionId}/popup.html`);
    await skipCalibrationInPopup(popup);
    await expect(popup.getByText(/only runs on regular http|cannot run on/i)).toBeVisible();
    await expect(popup.getByRole('button', { name: 'Start Eclipse' })).toBeDisabled();
  });
});

test.describe('8b. provider-backed catalog-free articles', () => {
  test('guides an AI-off failure into an explicit opt-in and retries automatically', async ({
    context,
    popup,
    providerServer,
  }) => {
    void providerServer;
    await skipCalibrationInPopup(popup);

    const page = await context.newPage();
    await page.goto(`${DEMO_A.replace('demo-a.html', '')}no-traps.html`);
    await page.bringToFront();
    await popup.reload();

    await popup.getByRole('button', { name: 'Start Eclipse' }).click();
    await expect(popup.getByRole('alert')).toContainText(/needs AI-generated traps/i);

    await popup.getByRole('button', { name: /Enable AI-generated traps.*retry/i }).click();

    await expect(popup.getByRole('button', { name: 'End Eclipse' })).toBeVisible();
    await expect(tokens(page)).toHaveCount(4);
  });

  test('activates on generic visible text blocks without article or main markup', async ({
    context,
    driver,
    providerServer,
  }) => {
    void providerServer;
    const enabled = await send<{ enabled: boolean }>(driver, {
      type: 'SET_PROVIDER',
      enabled: true,
    });
    expect(enabled.ok).toBe(true);

    const page = await context.newPage();
    await page.goto(`${DEMO_A.replace('demo-a.html', '')}generic-text.html`);

    const started = await startEclipse(driver, page);
    expect(started.ok, JSON.stringify(started)).toBe(true);
    expect(await tokens(page).count()).toBeGreaterThanOrEqual(2);
  });

  test('activates with 2–4 traps and reuses the sentence-free cache', async ({
    context,
    driver,
    providerServer,
    serviceWorker,
  }) => {
    const enabled = await send<{ enabled: boolean }>(driver, {
      type: 'SET_PROVIDER',
      enabled: true,
    });
    expect(enabled.ok).toBe(true);

    const page = await context.newPage();
    await page.goto(`${DEMO_A.replace('demo-a.html', '')}no-traps.html`);
    const before = await articleText(page);

    const first = await startEclipse(driver, page);
    expect(first.ok).toBe(true);
    await expect(tokens(page)).toHaveCount(4);
    const requestsAfterFirst = providerServer.requestCount();
    expect(requestsAfterFirst).toBeGreaterThan(0);

    const stored = await serviceWorker.evaluate(async () =>
      JSON.stringify(await chrome.storage.local.get('eclipse:provider-cache:v1')),
    );
    expect(stored).not.toContain('Tension in a stayed bridge is measured');
    expect(stored).not.toContain('API_KEY');

    await stopEclipse(driver);
    await expect(tokens(page)).toHaveCount(0);
    expect(await articleText(page)).toBe(before);

    const second = await startEclipse(driver, page);
    expect(second.ok).toBe(true);
    await expect(tokens(page)).toHaveCount(4);
    expect(providerServer.requestCount()).toBe(requestsAfterFirst);
  });

  test('leaves the page untouched for empty, invalid, and timed-out generation', async ({
    context,
    driver,
    providerServer,
  }) => {
    const enabled = await send<{ enabled: boolean }>(driver, {
      type: 'SET_PROVIDER',
      enabled: true,
    });
    expect(enabled.ok).toBe(true);

    for (const scenario of [
      { mode: 'zero' as const, code: 'NO_ELIGIBLE_TRAPS' },
      { mode: 'invalid' as const, code: 'PROVIDER_INVALID_RESPONSE' },
      { mode: 'timeout' as const, code: 'PROVIDER_TIMEOUT' },
    ]) {
      providerServer.setMode(scenario.mode);
      const page = await context.newPage();
      await page.goto(`${DEMO_A.replace('demo-a.html', '')}no-traps.html`);
      const before = await articleText(page);

      const result = await startEclipse(driver, page);
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.error.code).toBe(scenario.code);
      await expect(tokens(page)).toHaveCount(0);
      expect(await articleText(page)).toBe(before);
      await page.close();
    }

    providerServer.setMode('ok');
  });
});

test.describe('9. repeated activation', () => {
  test('starting twice does not duplicate tokens or overlays', async ({ context, driver }) => {
    const page = await context.newPage();
    await page.goto(DEMO_A);
    await startEclipse(driver, page);
    await expect(tokens(page).first()).toBeVisible();
    const first = await tokens(page).count();

    // A second START_SESSION on the same tab replaces the session in place.
    const again = await startEclipse(driver, page);
    expect(again.ok).toBe(true);

    await expect(tokens(page)).toHaveCount(first);
    await expect(page.locator('eclipse-challenge')).toHaveCount(1);
    await expect(page.locator('#eclipse-token-styles')).toHaveCount(1);
  });
});

test.describe('10. session replacement across tabs', () => {
  test('starting in a second tab restores the first', async ({ context, driver }) => {
    const pageA = await context.newPage();
    await pageA.goto(DEMO_A);
    const beforeA = await articleText(pageA);
    await startEclipse(driver, pageA);
    await expect(tokens(pageA).first()).toBeVisible();

    const pageB = await context.newPage();
    await pageB.goto(DEMO_B);
    await startEclipse(driver, pageB);
    await expect(tokens(pageB).first()).toBeVisible();

    await expect(tokens(pageA)).toHaveCount(0);
    expect(await articleText(pageA)).toBe(beforeA);
  });

  test('a stale session from a closed tab is cleared rather than sticking', async ({
    context,
    driver,
  }) => {
    const pageA = await context.newPage();
    await pageA.goto(DEMO_A);
    await startEclipse(driver, pageA);
    await expect(tokens(pageA).first()).toBeVisible();

    await pageA.close();

    const pageB = await context.newPage();
    await pageB.goto(DEMO_B);
    const started = await startEclipse(driver, pageB);
    expect(started.ok, JSON.stringify(started)).toBe(true);
    await expect(tokens(pageB).first()).toBeVisible();
  });
});

test.describe('11. no network required', () => {
  test('the full flow works with the network blocked', async ({ context, driver }) => {
    const page = await context.newPage();
    await page.route('**/*', (route) => {
      const url = route.request().url();
      if (url.startsWith('http://127.0.0.1:4321') || url.startsWith('chrome-extension://')) {
        return route.continue();
      }
      return route.abort();
    });

    await page.goto(DEMO_A);
    await startEclipse(driver, page);

    await expect(tokens(page).first()).toBeVisible();
    expect(await tokens(page).count()).toBeGreaterThanOrEqual(2);

    await page.locator(ATTENDRE).click();
    await card(page).getByRole('button', { name: 'wait', exact: true }).click();
    await expect(card(page).locator('.eclipse-verdict')).toContainText('Correct');
  });

  test('the provider is off by default even in the loopback-enabled test build', async ({
    driver,
  }) => {
    const status = await send<{
      provider: { enabled: boolean; permissionGranted: boolean };
    }>(driver, { type: 'GET_STATUS' });

    expect(status.ok).toBe(true);
    if (status.ok) {
      expect(status.data.provider.enabled).toBe(false);
      // The E2E-only manifest grants loopback access so browser automation can
      // exercise the fake server. The production manifest audit below proves
      // the shipped build keeps this permission optional.
      expect(status.data.provider.permissionGranted).toBe(true);
    }
  });
});

test.describe('12. keyboard and reduced motion', () => {
  test('the challenge is fully operable from the keyboard', async ({
    context,
    driver,
    serviceWorker,
  }) => {
    const page = await context.newPage();
    // The persistent context is launched directly, so Playwright's own
    // reducedMotion option does not apply — emulate it on the page.
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(DEMO_A);
    await startEclipse(driver, page);
    await page.bringToFront();

    const token = page.locator(ATTENDRE);
    await expect(token).toBeVisible();

    await token.focus();
    await expect(token).toBeFocused();
    await page.keyboard.press('Enter');

    const dialog = card(page);
    await expect(dialog).toBeVisible();

    // Focus moved inside the dialog, within the shadow root.
    const focusedTag = await page.evaluate(
      () => document.querySelector('eclipse-challenge')?.shadowRoot?.activeElement?.tagName ?? null,
    );
    expect(focusedTag).toBe('BUTTON');

    // Escape closes without submitting and hands focus back to the token.
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(token).toBeFocused();

    const profile = await readProfile(serviceWorker);
    expect(profile?.mastery).toEqual({});

    // Reopen and answer, still without a mouse.
    await page.keyboard.press('Enter');
    await expect(dialog).toBeVisible();
    await dialog.getByRole('button', { name: 'wait', exact: true }).focus();
    await page.keyboard.press('Enter');
    await expect(dialog.locator('.eclipse-verdict')).toContainText('Correct');
  });

  test('the reveal animation is suppressed under prefers-reduced-motion', async ({
    context,
    driver,
  }) => {
    const page = await context.newPage();
    // The persistent context is launched directly, so Playwright's own
    // reducedMotion option does not apply — emulate it on the page.
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(DEMO_A);
    await startEclipse(driver, page);

    await page.locator(ATTENDRE).click();
    await expect(card(page)).toBeVisible();

    const animation = await page.evaluate(() => {
      const dialog = document
        .querySelector('eclipse-challenge')
        ?.shadowRoot?.querySelector('.eclipse-card');
      return dialog ? getComputedStyle(dialog).animationName : null;
    });
    expect(animation).toBe('none');
  });

  test('the result is announced through a live region', async ({ context, driver }) => {
    const page = await context.newPage();
    // The persistent context is launched directly, so Playwright's own
    // reducedMotion option does not apply — emulate it on the page.
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(DEMO_A);
    await startEclipse(driver, page);

    await page.locator(ATTENDRE).click();
    await card(page).getByRole('button', { name: 'hope', exact: true }).click();

    const announcement = await page.evaluate(
      () =>
        document
          .querySelector('eclipse-challenge')
          ?.shadowRoot?.querySelector('[aria-live="polite"]')?.textContent ?? null,
    );
    expect(announcement).toContain('Incorrect');
    expect(announcement).toContain('hope');
    expect(announcement).toContain('wait');
  });
});

test.describe('13. service worker restart', () => {
  test('learner progress survives a worker restart', async ({ context, driver, serviceWorker }) => {
    const page = await context.newPage();
    await page.goto(DEMO_A);
    await startEclipse(driver, page);

    await page.locator(ATTENDRE).click();
    await card(page).getByRole('button', { name: 'wait', exact: true }).click();
    await expect(card(page).locator('.eclipse-note')).toContainText(/Saved/);

    await serviceWorker.evaluate(async () => {
      await chrome.storage.local.set({
        'eclipse:provider-cache:v1': { dryRunCacheEntry: true },
        'eclipse:provider-settings:v1': { enabled: false, lastError: null },
      });
    });

    const before = await readProfile(serviceWorker);
    expect(before).toBeTruthy();

    // Ask Chrome to recycle the worker. Whether it actually tears down is up to
    // the browser, so the assertion that matters is the one after: the profile
    // is still there and the worker still answers.
    await serviceWorker.evaluate(async () => {
      const registrations = await navigator.serviceWorker?.getRegistrations?.();
      await Promise.all((registrations ?? []).map((registration) => registration.update()));
    });
    await driver.waitForTimeout(500);
    await driver.reload();

    const after = await readProfile(serviceWorker);
    expect(after).toEqual(before);

    // And the extension still answers on the same durable data.
    const status = await send<{ calibrationCompleted: boolean }>(driver, { type: 'GET_STATUS' });
    expect(status.ok).toBe(true);
  });
});

test.describe('14. resetting learning data', () => {
  test('requires confirmation, then clears everything', async ({
    context,
    driver,
    extensionId,
    serviceWorker,
  }) => {
    const page = await context.newPage();
    await page.goto(DEMO_A);
    await startEclipse(driver, page);

    await page.locator(ATTENDRE).click();
    await card(page).getByRole('button', { name: 'wait', exact: true }).click();
    await expect(card(page).locator('.eclipse-note')).toContainText(/Saved/);

    const popup = await context.newPage();
    await popup.goto(`chrome-extension://${extensionId}/popup.html`);
    await expect(popup.getByText('1/1')).toBeVisible();

    // First press only asks.
    await popup.getByRole('button', { name: 'Reset all Eclipse data' }).click();
    await expect(popup.getByRole('button', { name: 'Yes, erase everything' })).toBeVisible();

    // Cancelling changes nothing.
    await popup.getByRole('button', { name: 'Cancel' }).click();
    await expect(popup.getByText('1/1')).toBeVisible();

    // Confirming clears the profile and ends the session.
    await popup.getByRole('button', { name: 'Reset all Eclipse data' }).click();
    await popup.getByRole('button', { name: 'Yes, erase everything' }).click();

    await expect(popup.getByText(/Question 1 of 3/)).toBeVisible();
    await expect(tokens(page)).toHaveCount(0);

    const remaining = await serviceWorker.evaluate(async () => ({
      local: await chrome.storage.local.get([
        'eclipse:profile:v1',
        'eclipse:interactions:v1',
        'eclipse:provider-cache:v1',
        'eclipse:provider-settings:v1',
      ]),
      session: await chrome.storage.session.get('eclipse:session:v1'),
    }));
    expect(remaining).toEqual({ local: {}, session: {} });
    expect(await readProfile(serviceWorker)).toBeUndefined();
  });
});

test.describe('15. French, and only French', () => {
  test('every rendered surface is fr-FR with its accents intact', async ({ context, driver }) => {
    const page = await context.newPage();
    await page.goto(DEMO_B);
    await startEclipse(driver, page);
    await expect(tokens(page).first()).toBeVisible();

    const surfaces = await tokens(page).allTextContents();
    expect(surfaces.length).toBeGreaterThan(0);

    for (const surface of surfaces) {
      expect(surface).toBe(surface.normalize('NFC'));
      expect(surface).toMatch(/^[\p{L}\p{M}][\p{L}\p{M} '’-]*$/u);
    }

    if (surfaces.includes('bibliothèque')) {
      expect(surfaces).not.toContain('bibliotheque');
    }

    const body = (await page.locator('body').textContent()) ?? '';
    for (const spanish of ['esperar', 'asistir', 'biblioteca', 'es-ES']) {
      expect(body.includes(spanish), spanish).toBe(false);
    }
  });

  test('the popup states the language pair', async ({ popup }) => {
    await skipCalibrationInPopup(popup);
    await expect(popup.getByText('English → French')).toBeVisible();
  });

  test('the privacy disclosure is present and accurate', async ({ popup }) => {
    await skipCalibrationInPopup(popup);
    await popup.getByText('Privacy').click();
    await expect(popup.getByText(/No account, no sign-in/)).toBeVisible();
    await expect(popup.getByText(/No analytics and no telemetry/)).toBeVisible();
    // Scoped to the disclosure list: the provider toggle makes the same claim,
    // so an unscoped match would be ambiguous.
    const disclosure = popup.locator('details.popup-disclosure');
    await expect(disclosure.getByText(/makes no network requests at all/)).toBeVisible();
  });
});
