import { describe, expect, it } from 'vitest';
import { memoryArea } from '@/storage/area';
import { PROVIDER_SETTINGS_KEY } from '@/storage/keys';
import {
  clearProviderSettings,
  readProviderSettings,
  writeProviderSettings,
} from '@/storage/provider-settings';

describe('provider settings reset', () => {
  it('removes the key and reads back the always-on default', async () => {
    const area = memoryArea();
    await writeProviderSettings(area, { enabled: true, lastError: 'content-free error' });

    expect((await clearProviderSettings(area)).ok).toBe(true);
    expect(await area.get(PROVIDER_SETTINGS_KEY)).toBeUndefined();
    expect(await readProviderSettings(area)).toEqual({ enabled: true, lastError: null });
  });
});
