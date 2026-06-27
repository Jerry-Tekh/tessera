// Generates local placeholder hero SVGs for events (served locally per project rule).
// Replace these with real downloaded photography for production.
import { writeFileSync, mkdirSync } from 'node:fs';

const dir = new URL('../public/images/events/', import.meta.url);
mkdirSync(dir, { recursive: true });

const pairs = [
  ['#15151a', '#241c12'], ['#101a24', '#0b2530'], ['#1a1015', '#301020'],
  ['#101a14', '#0b3024'], ['#1a1410', '#302410'], ['#14101a', '#241030'],
  ['#1a1010', '#301414'], ['#101418', '#102430'],
];

function svg(a, b, label) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="600" viewBox="0 0 1200 600">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/>
  </linearGradient></defs>
  <rect width="1200" height="600" fill="url(#g)"/>
  <text x="48" y="64" fill="#c8a24a" font-family="system-ui,sans-serif" font-size="22" letter-spacing="4">TESSERA</text>
  <text x="48" y="540" fill="#f5f5f5" font-family="system-ui,sans-serif" font-size="64" font-weight="800">${label}</text>
</svg>`;
}

for (let i = 1; i <= pairs.length; i++) {
  const [a, b] = pairs[i - 1];
  writeFileSync(new URL(`hero-${i}.svg`, dir), svg(a, b, 'Live Event'));
}
writeFileSync(new URL('hero-fallback.svg', dir), svg('#15151a', '#2a2a30', 'Event'));
console.log(`wrote ${pairs.length} heroes + fallback`);
