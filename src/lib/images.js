export const HERO_COUNT = 8;

// Stable, dependency-free hash → image index (1..HERO_COUNT).
export function heroFor(eventId) {
  let h = 0;
  for (let i = 0; i < eventId.length; i++) h = (h * 31 + eventId.charCodeAt(i)) >>> 0;
  const n = (h % HERO_COUNT) + 1;
  return `/images/events/hero-${n}.svg`;
}
