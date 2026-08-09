import { expect, readProfile, send, skipCalibrationInPopup, test } from './fixtures';

const CONCEPT_ID = 'fr:attendre:wait';
const LONG_PHRASE =
  'Une seule commande pour installer le système et configurer tous les outils nécessaires';

async function seedMiss(driver: Parameters<typeof send>[0]): Promise<void> {
  const result = await send(driver, {
    type: 'RECORD_ANSWER',
    interactionId: 'e2e_context_miss',
    conceptId: CONCEPT_ID,
    difficulty: 0.4,
    correct: false,
    assisted: true,
    mode: 'context-choice',
    contextFingerprint: `ctx_${'a'.repeat(64)}`,
    display: {
      targetSurface: 'attendre',
      englishMeaning: 'wait',
      kind: 'word',
    },
  });
  expect(result.ok).toBe(true);
}

async function seedLongPhrase(driver: Parameters<typeof send>[0]): Promise<void> {
  const result = await send(driver, {
    type: 'RECORD_ANSWER',
    interactionId: 'e2e_long_phrase_miss',
    conceptId: 'fr:une-seule-commande:one-command',
    difficulty: 0.6,
    correct: false,
    assisted: true,
    mode: 'context-choice',
    display: {
      targetSurface: LONG_PHRASE,
      englishMeaning: 'One command to install and configure all the required tools',
      kind: 'phrase',
    },
  });
  expect(result.ok).toBe(true);
}

test.describe('Vocabulary mastery popup', () => {
  test('removes New Moon and completes a typed due review in real Chromium', async ({
    driver,
    popup,
    serviceWorker,
  }) => {
    const errors: string[] = [];
    popup.on('console', (message) => {
      if (message.type() === 'error') errors.push(message.text());
    });
    popup.on('requestfailed', (request) => {
      errors.push(`NETWORK: ${request.url()} — ${request.failure()?.errorText ?? 'failed'}`);
    });

    await skipCalibrationInPopup(popup);
    await seedMiss(driver);
    await popup.reload();
    await popup.getByRole('tab', { name: 'Vocab' }).click();

    await expect(popup.getByRole('heading', { name: 'Vocabulary deck' })).toBeVisible();
    await expect(popup.getByText('attendre', { exact: true })).toBeVisible();
    await expect(popup.getByText('Practice now', { exact: true })).toBeVisible();
    await expect(popup.locator('.phase-filters button')).toHaveCount(4);
    await expect(popup.getByText('New Moon', { exact: true })).toHaveCount(0);
    await expect(popup.locator('.phase-filters')).toContainText('All');

    for (let attempt = 1; attempt <= 3; attempt += 1) {
      await popup
        .getByRole('button', { name: attempt === 1 ? 'Review now' : 'Practice weakest' })
        .click();
      await expect(popup.getByText('Type the English meaning')).toBeVisible();
      await popup.getByPlaceholder('Type from memory').fill('to wait');
      await popup.getByRole('button', { name: 'Check answer' }).click();
      await expect(
        popup
          .locator('.practice-saved p')
          .getByText(attempt === 3 ? /Full Moon — mastered/ : new RegExp(`${attempt} of 3`)),
      ).toBeVisible();
      await popup.getByRole('button', { name: 'Finish practice' }).click();
    }

    await expect(popup.getByRole('button', { name: 'Mastered', exact: true })).toBeDisabled();
    await expect(popup.getByRole('button', { name: 'Practice weakest' })).toHaveCount(0);
    await expect(popup.locator('.mini-progress')).toHaveCount(0);

    const profile = await readProfile(serviceWorker);
    const mastery = (
      profile?.mastery as Record<
        string,
        {
          phase: string;
          unassistedCorrect: number;
          due: { kind: string };
          contextFingerprints: string[];
        }
      >
    )[CONCEPT_ID];
    expect(mastery).toMatchObject({
      phase: 'full',
      unassistedCorrect: 3,
      due: { kind: 'timestamp' },
    });
    expect(mastery?.contextFingerprints).toEqual([`ctx_${'a'.repeat(64)}`]);
    expect(JSON.stringify(profile)).not.toContain('article sentence');

    await popup.setViewportSize({ width: 420, height: 812 });
    await expect(popup.locator('html')).toHaveCSS('width', '420px');
    expect(
      await popup.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
      ),
    ).toBe(false);
    await popup.screenshot({ path: 'test-results/vocabulary-mastery-popup.png', fullPage: true });
    expect(errors).toEqual([]);
  });

  test('returns one missed practice item at session end for correction', async ({
    driver,
    popup,
    serviceWorker,
  }) => {
    await skipCalibrationInPopup(popup);
    await seedMiss(driver);
    await popup.reload();
    await popup.getByRole('tab', { name: 'Vocab' }).click();
    await popup.getByRole('button', { name: 'Review now' }).click();
    await popup.getByRole('button', { name: "I don't know" }).click();

    await expect(popup.getByText(/queued for relearning/)).toBeVisible();
    await expect(popup.getByText(/1 of 2/)).toBeVisible();
    await popup.getByRole('button', { name: 'Next word' }).click();
    await expect(popup.getByText(/2 of 2/)).toBeVisible();

    const profile = await readProfile(serviceWorker);
    const mastery = (
      profile?.mastery as Record<
        string,
        { attempts: number; lapses: number; due: { kind: string } }
      >
    )[CONCEPT_ID];
    expect(mastery).toMatchObject({ attempts: 2, lapses: 2, due: { kind: 'next_occurrence' } });
  });

  test('widens the popup and pans a long phrase instead of replacing it with an ellipsis', async ({
    driver,
    popup,
  }) => {
    await skipCalibrationInPopup(popup);
    await seedLongPhrase(driver);
    await popup.reload();
    await popup.getByRole('tab', { name: 'Vocab' }).click();

    const phrase = popup.locator('.phrase-scroll');
    await expect(popup.locator('html')).toHaveCSS('width', '420px');
    await expect(phrase).toHaveText(LONG_PHRASE);
    await expect(phrase).toHaveAttribute('title', LONG_PHRASE);
    await expect(phrase).toHaveAttribute('data-scrolling', 'true');
    expect(await phrase.evaluate((element) => getComputedStyle(element).textOverflow)).not.toBe(
      'ellipsis',
    );
  });
});
