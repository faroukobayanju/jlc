import { useState } from 'react';

// Samples the dominant saturated colour of a loaded product image.
// Cross-origin images taint the canvas and throw; they fall back to the neutral swatch.
const cache = new Map();

function hsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b), l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const dlt = max - min;
  const s = l > 0.5 ? dlt / (2 - max - min) : dlt / (max + min);
  const h = max === r ? ((g - b) / dlt + (g < b ? 6 : 0)) / 6 : max === g ? ((b - r) / dlt + 2) / 6 : ((r - g) / dlt + 4) / 6;
  return [h, s, l];
}

function sample(img) {
  try {
    const size = 16;
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(img, 0, 0, size, size);
    const d = ctx.getImageData(0, 0, size, size).data;
    // Weight vivid pixels hard so the product beats the hand holding it and the shelf behind it.
    let x = 0, y = 0, weight = 0, light = 0;
    for (let i = 0; i < d.length; i += 4) {
      const [h, s, l] = hsl(d[i], d[i + 1], d[i + 2]);
      if (l < 0.12 || l > 0.92 || s < 0.25) continue;
      const w = s ** 4;
      x += Math.cos(h * 2 * Math.PI) * w; y += Math.sin(h * 2 * Math.PI) * w;
      light += l * w; weight += w;
    }
    if (weight < 0.5) return null;
    const hue = ((Math.atan2(y, x) / (2 * Math.PI)) * 360 + 360) % 360;
    const l = Math.min(0.7, Math.max(0.55, light / weight));
    return `hsl(${Math.round(hue)} 72% ${Math.round(l * 100)}%)`;
  } catch {
    return null;
  }
}

export function useSwatch(key) {
  const [swatch, setSwatch] = useState(() => cache.get(key) || null);
  function onLoad(e) {
    if (cache.has(key)) return;
    const color = sample(e.currentTarget);
    cache.set(key, color);
    setSwatch(color);
  }
  return [swatch, onLoad];
}
