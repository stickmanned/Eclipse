/**
 * Visual capture of the four screens that matter.
 *
 * Not assertions — this exists so the UI can be eyeballed without a manual
 * run-through, and so a reviewer can see what the demo looks like. Skipped
 * unless `ECLIPSE_SHOTS=1`, so it never slows the real suite down.
 */

import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { DEMO_A, card, expect, send, startEclipse, test, tokens } from './fixtures';

const OUT = join(process.cwd(), 'test-results', 'screens');

test.describe('screens', () => {
  test.skip(process.env.ECLIPSE_SHOTS !== '1', 'set ECLIPSE_SHOTS=1 to capture');

  test('capture', async ({ context, driver, extensionId }) => {
    mkdirSync(OUT, { recursive: true });

    // 1. DELF setup.
    const popup = await context.newPage();
    await popup.setViewportSize({ width: 420, height: 600 });
    await popup.goto(`chrome-extension://${extensionId}/popup.html`);
    await expect(popup.getByRole('heading', { name: 'Set your DELF level' })).toBeVisible();
    await popup.screenshot({ path: join(OUT, '1-level-setup.png') });

    // 2. The article with traps placed.
    const page = await context.newPage();
    await page.setViewportSize({ width: 1100, height: 900 });
    await page.goto(DEMO_A);
    await startEclipse(driver, page);
    await expect(tokens(page).first()).toBeVisible();
    await tokens(page).first().scrollIntoViewIfNeeded();
    await page.screenshot({ path: join(OUT, '2-article.png') });

    // 3. The question.
    await page.locator('button[data-eclipse-concept="fr:attendre:wait"]').click();
    await expect(card(page)).toBeVisible();
    await page.screenshot({ path: join(OUT, '3-question.png') });

    // 4. The Truth Card, answered wrong so both markers show.
    await card(page).getByRole('button', { name: 'hope', exact: true }).click();
    await expect(card(page).locator('.eclipse-verdict')).toContainText('Not this time');
    await page.screenshot({ path: join(OUT, '4-truth-card.png') });

    // Seed one correct highlighted-word answer so the daily streak is visible.
    const streakAnswer = await send(driver, {
      type: 'RECORD_ANSWER',
      interactionId: 'screenshot_streak_1',
      conceptId: 'fr:attendre:wait',
      difficulty: 0.35,
      correct: true,
      assisted: true,
      mode: 'context-choice',
      display: {
        targetSurface: 'attendre',
        englishMeaning: 'wait',
        kind: 'word',
      },
    });
    expect(streakAnswer.ok).toBe(true);

    // 5. The popup in its ready state, with progress.
    await popup.reload();
    await expect(popup.getByRole('button', { name: /Start Eclipse|End Eclipse/ })).toBeVisible();
    await popup.waitForTimeout(1_100); // Settle the panel and catch the first shooting-star pass.
    await popup.screenshot({ path: join(OUT, '5-popup.png') });

    // 6. The momentum dashboard, backed by the answer recorded above.
    await popup.getByRole('tab', { name: 'Stats' }).click();
    await expect(popup.getByRole('heading', { name: 'Learning momentum' })).toBeVisible();
    expect(
      await popup.evaluate(
        () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
      ),
    ).toBe(true);
    await popup.screenshot({ path: join(OUT, '6-stats.png'), fullPage: true });

    // 7. The lower dashboard interpretation layer.
    await popup.getByRole('heading', { name: 'What the data says' }).scrollIntoViewIfNeeded();
    await popup.screenshot({ path: join(OUT, '7-stats-insights.png') });
  });
});
