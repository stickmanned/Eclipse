import { describe, expect, it } from 'vitest';
import { createContextFingerprint } from '@/domain/ids';

describe('context fingerprints', () => {
  it('normalizes equivalent sentence text into the same SHA-256 label', async () => {
    const first = await createContextFingerprint(
      'fr:attendre:wait',
      '  Nous   devons ATTENDRE ici. ',
    );
    const second = await createContextFingerprint('fr:attendre:wait', 'nous devons attendre ici.');
    expect(first).toBe(second);
    expect(first).toMatch(/^ctx_[a-f0-9]{64}$/);
    expect(first).not.toContain('attendre');
  });

  it('separates concepts and contexts', async () => {
    const base = await createContextFingerprint('fr:attendre:wait', 'Nous devons attendre.');
    await expect(
      createContextFingerprint('fr:patienter:wait', 'Nous devons attendre.'),
    ).resolves.not.toBe(base);
    await expect(
      createContextFingerprint('fr:attendre:wait', 'Il faut attendre.'),
    ).resolves.not.toBe(base);
  });
});
