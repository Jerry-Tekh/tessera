import { describe, it, expect } from 'vitest';
import { heroFor, HERO_COUNT } from './images';

describe('heroFor', () => {
  it('returns a path within the local events folder', () => {
    expect(heroFor('any-id')).toMatch(/^\/images\/events\/hero-\d+\.jpg$/);
  });
  it('is deterministic for the same id', () => {
    expect(heroFor('abc')).toBe(heroFor('abc'));
  });
  it('stays within the available image range', () => {
    const n = Number(heroFor('xyz').match(/hero-(\d+)/)[1]);
    expect(n).toBeGreaterThanOrEqual(1);
    expect(n).toBeLessThanOrEqual(HERO_COUNT);
  });
});
