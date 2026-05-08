import { describe, it, expect } from 'vitest';
import { fetchTranslations } from '../translations';

describe('fetchTranslations()', () => {
  it('returns a translations object for locale "en"', async () => {
    const data = await fetchTranslations('en');
    expect(typeof data).toBe('object');
    expect(data).not.toBeNull();
    expect(Object.keys(data).length).toBeGreaterThan(0);
  });

  it('returns a translations object for locale "ro"', async () => {
    const data = await fetchTranslations('ro');
    expect(typeof data).toBe('object');
    expect(data).not.toBeNull();
    expect(Object.keys(data).length).toBeGreaterThan(0);
  });

  it('returns different translations for different locales', async () => {
    const en = await fetchTranslations('en');
    const ro = await fetchTranslations('ro');
    expect(JSON.stringify(en)).not.toBe(JSON.stringify(ro));
  });

  it('contains expected keys in English translations', async () => {
    const data = await fetchTranslations('en');
    expect(data).toHaveProperty('hello');
    expect(data).toHaveProperty('logout');
  });

  it('contains expected keys in Romanian translations', async () => {
    const data = await fetchTranslations('ro');
    expect(data).toHaveProperty('hello');
    expect(data).toHaveProperty('logout');
  });
});
