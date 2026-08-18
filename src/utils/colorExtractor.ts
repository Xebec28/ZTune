/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { DynamicThemeColors } from '../types';

// Default Fallback Theme (ZTune Electric Indigo)
export const DEFAULT_THEME: DynamicThemeColors = {
  primary: '#6366f1',
  primaryHex: '#6366f1',
  primaryRgb: '99, 102, 241',
  secondary: '#a855f7',
  secondaryRgb: '168, 85, 247',
  glow: 'rgba(99, 102, 241, 0.45)',
  subtle: 'rgba(99, 102, 241, 0.12)',
  border: 'rgba(99, 102, 241, 0.3)',
  darkBg: 'linear-gradient(135deg, #0e0a24 0%, #080514 50%, #050505 100%)',
  lightAccent: '#c7d2fe',
};

// Cache extracted themes by image URL to prevent redundant processing
const themeCache = new Map<string, DynamicThemeColors>();

/**
 * Extract dominant vibrant color from an image URL and return complete theme palette
 */
export async function extractDominantColor(imageUrl?: string, fallbackSeed = ''): Promise<DynamicThemeColors> {
  if (!imageUrl) {
    return generateFallbackTheme(fallbackSeed);
  }

  if (themeCache.has(imageUrl)) {
    return themeCache.get(imageUrl)!;
  }

  try {
    const rgb = await getDominantRgbFromImage(imageUrl);
    if (!rgb) {
      return generateFallbackTheme(fallbackSeed);
    }

    const theme = createThemeFromRgb(rgb.r, rgb.g, rgb.b);
    themeCache.set(imageUrl, theme);
    return theme;
  } catch (err) {
    console.warn('Color extraction failed, using seed fallback:', err);
    return generateFallbackTheme(fallbackSeed);
  }
}

/**
 * Load image onto an offscreen canvas and compute dominant vibrant color
 */
function getDominantRgbFromImage(url: string): Promise<{ r: number; g: number; b: number } | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    const safeUrl = url.startsWith('http') && !url.includes(window.location.host)
      ? `/api/image/proxy?url=${encodeURIComponent(url)}`
      : url;

    img.src = safeUrl;

    const timeout = setTimeout(() => {
      resolve(null);
    }, 2500);

    img.onload = () => {
      clearTimeout(timeout);
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(null);
          return;
        }

        const size = 32;
        canvas.width = size;
        canvas.height = size;
        ctx.drawImage(img, 0, 0, size, size);

        const imgData = ctx.getImageData(0, 0, size, size).data;
        const colorBuckets: { r: number; g: number; b: number; score: number; count: number }[] = [];

        for (let i = 0; i < imgData.length; i += 4) {
          const r = imgData[i];
          const g = imgData[i + 1];
          const b = imgData[i + 2];
          const a = imgData[i + 3];

          if (a < 128) continue; // Skip transparent

          // Calculate brightness and saturation
          const max = Math.max(r, g, b);
          const min = Math.min(r, g, b);
          const delta = max - min;
          const lightness = (max + min) / (2 * 255);
          const saturation = max === 0 ? 0 : delta / max;

          // Filter out pure black, pure white, and dull washed-out grays
          if (lightness < 0.12 || lightness > 0.90 || saturation < 0.18) {
            continue;
          }

          // Score vibrant colorful pixels higher
          const vibrancyScore = saturation * 2 + (1 - Math.abs(lightness - 0.5));

          let found = false;
          for (const bucket of colorBuckets) {
            const dr = bucket.r - r;
            const dg = bucket.g - g;
            const db = bucket.b - b;
            const dist = Math.sqrt(dr * dr + dg * dg + db * db);

            if (dist < 40) {
              bucket.r = Math.round((bucket.r * bucket.count + r) / (bucket.count + 1));
              bucket.g = Math.round((bucket.g * bucket.count + g) / (bucket.count + 1));
              bucket.b = Math.round((bucket.b * bucket.count + b) / (bucket.count + 1));
              bucket.score += vibrancyScore;
              bucket.count += 1;
              found = true;
              break;
            }
          }

          if (!found) {
            colorBuckets.push({ r, g, b, score: vibrancyScore, count: 1 });
          }
        }

        if (colorBuckets.length === 0) {
          resolve(null);
          return;
        }

        // Sort by highest vibrancy and occurrence score
        colorBuckets.sort((a, b) => b.score - a.score);
        const top = colorBuckets[0];
        resolve({ r: top.r, g: top.g, b: top.b });
      } catch (err) {
        console.warn('Canvas reading error:', err);
        resolve(null);
      }
    };

    img.onerror = () => {
      clearTimeout(timeout);
      resolve(null);
    };
  });
}

/**
 * Generate complete dynamic theme from an RGB value
 */
export function createThemeFromRgb(r: number, g: number, b: number): DynamicThemeColors {
  // Boost vibrancy if too dark or too desaturated
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let adjustedR = r;
  let adjustedG = g;
  let adjustedB = b;

  if (max < 140) {
    const factor = 170 / (max || 1);
    adjustedR = Math.min(255, Math.round(r * factor));
    adjustedG = Math.min(255, Math.round(g * factor));
    adjustedB = Math.min(255, Math.round(b * factor));
  }

  const primaryHex = rgbToHex(adjustedR, adjustedG, adjustedB);
  const primaryRgb = `${adjustedR}, ${adjustedG}, ${adjustedB}`;
  
  // Create harmonic secondary color by shifting hue (approx 40 deg)
  const secondaryR = Math.min(255, Math.round((adjustedB * 0.7 + adjustedR * 0.3)));
  const secondaryG = Math.min(255, Math.round((adjustedR * 0.5 + adjustedG * 0.5)));
  const secondaryB = Math.min(255, Math.round((adjustedG * 0.4 + adjustedB * 0.6)));
  const secondary = rgbToHex(secondaryR, secondaryG, secondaryB);
  const secondaryRgb = `${secondaryR}, ${secondaryG}, ${secondaryB}`;

  // Dark ambient gradient background
  const darkR = Math.max(4, Math.round(adjustedR * 0.12));
  const darkG = Math.max(4, Math.round(adjustedG * 0.12));
  const darkB = Math.max(6, Math.round(adjustedB * 0.16));

  const darkBg = `linear-gradient(135deg, rgb(${darkR + 8}, ${darkG + 4}, ${darkB + 14}) 0%, rgb(${darkR}, ${darkG}, ${darkB}) 50%, #050505 100%)`;

  return {
    primary: primaryHex,
    primaryHex,
    primaryRgb,
    secondary,
    secondaryRgb,
    glow: `rgba(${primaryRgb}, 0.45)`,
    subtle: `rgba(${primaryRgb}, 0.12)`,
    border: `rgba(${primaryRgb}, 0.32)`,
    darkBg,
    lightAccent: `rgb(${Math.min(255, adjustedR + 60)}, ${Math.min(255, adjustedG + 60)}, ${Math.min(255, adjustedB + 60)})`,
  };
}

/**
 * Apply CSS custom properties to the document root
 */
export function applyThemeToCssVariables(theme: DynamicThemeColors): void {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.style.setProperty('--theme-primary', theme.primary);
  root.style.setProperty('--theme-primary-hex', theme.primaryHex);
  root.style.setProperty('--theme-primary-rgb', theme.primaryRgb);
  root.style.setProperty('--theme-secondary', theme.secondary);
  root.style.setProperty('--theme-secondary-rgb', theme.secondaryRgb);
  root.style.setProperty('--theme-glow', theme.glow);
  root.style.setProperty('--theme-subtle', theme.subtle);
  root.style.setProperty('--theme-border', theme.border);
  root.style.setProperty('--theme-light-accent', theme.lightAccent);
}

function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => {
    const h = Math.max(0, Math.min(255, Math.round(n))).toString(16);
    return h.length === 1 ? '0' + h : h;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function generateFallbackTheme(seed: string): DynamicThemeColors {
  if (!seed) return DEFAULT_THEME;

  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }

  const h = Math.abs(hash) % 360;
  const rgb = hslToRgb(h / 360, 0.75, 0.55);
  return createThemeFromRgb(rgb.r, rgb.g, rgb.b);
}

function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
  let r: number, g: number, b: number;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
}
