import { describe, it, expect } from 'vitest';
import { heroFor, HEROES } from './images';

describe('heroFor', () => {
  it('returns a local path to one of the downloaded hero photos', () => {
    const p = heroFor('any-id');
    expect(p.startsWith('/images/events/')).toBe(true);
    expect(HEROES).toContain(p.replace('/images/events/', ''));
  });
  it('is deterministic for the same id', () => {
    expect(heroFor('abc')).toBe(heroFor('abc'));
  });
  it('distributes across the available photos', () => {
    const seen = new Set(Array.from({ length: 50 }, (_, i) => heroFor(`evt-${i}`)));
    expect(seen.size).toBeGreaterThan(1);
  });
});
