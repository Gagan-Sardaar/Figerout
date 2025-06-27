// A simple mapping of hex codes to color names.
const colorMap: { [hex: string]: string } = {
  '#FF0000': 'Red',
  '#00FF00': 'Green',
  '#0000FF': 'Blue',
  '#FFFF00': 'Yellow',
  '#FF00FF': 'Magenta',
  '#00FFFF': 'Cyan',
  '#000000': 'Black',
  '#FFFFFF': 'White',
  '#808080': 'Gray',
  '#FFC0CB': 'Pink',
  '#FFA500': 'Orange',
  '#A52A2A': 'Brown',
  '#800080': 'Purple',
  '#4B0082': 'Indigo',
  '#EE82EE': 'Violet',
  '#DC143C': 'Crimson',
  '#4169E1': 'Royal Blue',
  '#50C878': 'Emerald Green',
  '#FFD700': 'Gold',
  '#4A148C': 'Deep Purple',
  '#673AB7': 'Blue-Purple',
  '#F0F0F0': 'Light Gray',
  '#263238': 'Dark Blue-Gray',
  '#F2BFC8': 'Pastel Pink',
  '#C3C7A6': 'Sage Green',
  '#6A1910': 'Russet',
  '#37251B': 'Seal Brown',
  '#C3B9B3': 'Pale Taupe',
  '#80A6CB': 'Dusty Blue',
  '#E9CFD3': 'Powder Pink',
  '#A794BB': 'Lavender Gray',
  '#EED137': 'Goldenrod',
  '#596E73': 'Steel Gray',
};

// Helper function to convert a hex color to an [r, g, b] array.
function hexToRgb(hex: string): [number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16),
      ]
    : [0, 0, 0];
}

// Calculates the Euclidean distance between two RGB colors.
function colorDistance(rgb1: [number, number, number], rgb2: [number, number, number]): number {
  const [r1, g1, b1] = rgb1;
  const [r2, g2, b2] = rgb2;
  return Math.sqrt(
    Math.pow(r1 - r2, 2) + Math.pow(g1 - g2, 2) + Math.pow(b1 - b2, 2)
  );
}

/**
 * Finds the closest common color name for a given hex code.
 * @param hex The hex color string (e.g., "#RRGGBB").
 * @returns The name of the closest color.
 */
export function getColorName(hex: string): string {
  if (colorMap[hex.toUpperCase()]) {
    return colorMap[hex.toUpperCase()];
  }
  
  const inputRgb = hexToRgb(hex);
  let closestColor = '';
  let minDistance = Infinity;

  for (const [mapHex, mapName] of Object.entries(colorMap)) {
    const mapRgb = hexToRgb(mapHex);
    const distance = colorDistance(inputRgb, mapRgb);
    if (distance < minDistance) {
      minDistance = distance;
      closestColor = mapName;
    }
  }

  return closestColor;
}

/**
 * Generates lighter and darker shades of a given color.
 * @param hex The base hex color string.
 * @param count The number of shades to generate on each side (lighter/darker).
 * @param step The percentage step for lightening/darkening.
 * @returns An object with `lighter` and `darker` arrays of hex strings.
 */
export function generateColorShades(hex: string, count = 4, step = 10) {
  const [r, g, b] = hexToRgb(hex);

  const toHsl = (r: number, g: number, b: number) => {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    return [h, s, l];
  };

  const toRgb = (h: number, s: number, l: number) => {
    let r, g, b;
    if (s === 0) {
      r = g = b = l;
    } else {
      const hue2rgb = (p: number, q: number, t: number) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
      };
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }
    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
  };

  const toHex = (rgb: number[]) => '#' + rgb.map(c => c.toString(16).padStart(2, '0')).join('');
  
  const [h, s, l] = toHsl(r, g, b);
  
  const shades = { lighter: [] as string[], darker: [] as string[] };

  for (let i = 1; i <= count; i++) {
    const lighterL = Math.min(1, l + (i * step / 100));
    const darkerL = Math.max(0, l - (i * step / 100));
    shades.lighter.push(toHex(toRgb(h, s, lighterL)));
    shades.darker.unshift(toHex(toRgb(h, s, darkerL)));
  }

  return shades;
}
