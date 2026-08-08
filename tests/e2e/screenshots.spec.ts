/**
 * Visual capture of the four screens that matter.
 *
 * Not assertions — this exists so the UI can be eyeballed without a manual
 * run-through, and so a reviewer can see what the demo looks like. Skipped
 * unless `ECLIPSE_SHOTS=1`, so it never slows the real suite down.
 */

import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { DEMO_A, card, expect, startEclipse, test, tokens } from './fixtures';

const OUT = join(process.cwd(), 'test-results', 'screens');

test.describe('screens', () => {
  test.skip(process.env.ECLIPSE_SHOTS !== '1', 'set ECLIPSE_SHOTS=1 to capture');

  test('capture', async ({ context, driver, extensionId }) => {
    mkdirSync(OUT, { recursive: true });

    // 1. Calibration, first question.
    const popup = await context.newPage();
    await popup.setViewportSize({ width: 360, height: 620 });
    await popup.goto(`chrome-extension://${extensionId}/popup.html`);
    await expect(popup.getByText(/Question 1 of 3/)).toBeVisible();
    await popup.screenshot({ path: join(OUT, '1-calibration.png') });

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

    // 5. The popup in its ready state, with progress.
    await popup.reload();
    await expect(popup.getByRole('button', { name: /Start Eclipse|End Eclipse/ })).toBeVisible();
    await popup.screenshot({ path: join(OUT, '5-popup.png') });
  });
});
