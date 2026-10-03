// Stable alternate palettes keep saved shinies identical in the sea and aquarium.
const palettes = [
  ['#e879f9', '#fae8ff', '#a855f7'],
  ['#2dd4bf', '#ccfbf1', '#0f766e'],
  ['#818cf8', '#e0e7ff', '#4338ca'],
  ['#fb7185', '#ffe4e6', '#be185d'],
];
export function shinyPalette(id) {
  let hash = 0;
  for (const char of id) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return palettes[hash % palettes.length];
}

export function reserveGold(color, legendary) {
  if (legendary || !/^#[\da-f]{6}$/i.test(color || '')) return color;
  const value = parseInt(color.slice(1), 16);
  const r = value >> 16, g = value >> 8 & 255, b = value & 255;
  return r > 170 && g > 110 && g < r * 1.06 && b < g * .72 ? '#c084fc' : color;
}
