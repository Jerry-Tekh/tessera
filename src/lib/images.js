// Local event imagery — real downloaded photos served from /public/images/events.
// Fewer photos than events is fine: they repeat deterministically across events.
export const HEROES = [
  'antenna-ohNCIiKVT1g-unsplash.jpg',
  'filip-rankovic-grobgaard-TVpMTnvJxlI-unsplash.jpg',
  'm-accelerator-yTsy3PYFPtc-unsplash.jpg',
  'nicholas-green-nPz8akkUmDI-unsplash.jpg',
  'priscilla-du-preez-Q7wGvnbuwj0-unsplash.jpg',
];
export const HERO_COUNT = HEROES.length;

// Stable, dependency-free hash → one of the local hero photos (deterministic per event id).
export function heroFor(eventId) {
  let h = 0;
  for (let i = 0; i < eventId.length; i++) h = (h * 31 + eventId.charCodeAt(i)) >>> 0;
  return `/images/events/${HEROES[h % HEROES.length]}`;
}
