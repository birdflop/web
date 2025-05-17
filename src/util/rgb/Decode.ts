
function hexToHSL(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return { h: 100, s: 100, l: 100 };
  const r = parseInt(result[1], 16) / 255;
  const g = parseInt(result[2], 16) / 255;
  const b = parseInt(result[3], 16) / 255;
  const max = Math.max(r, g, b),
    min = Math.min(r, g, b);
  let h = 0;
  let s,
    l = (max + min) / 2;
  if (max === min) {
    h = s = 0; // achromatic
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
    case r: h = (g - b) / d + (g < b ? 6 : 0); break;
    case g: h = (b - r) / d + 2; break;
    case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  h = Math.round(h * 360);
  s = Math.round(s * 100);
  l = Math.round(l * 100);

  return { h, s, l };
}

export function getSignificantPoints(gradient: string[], threshold: number) {
  // Convert all colors to HSL
  const hslColors = gradient.map(hexToHSL);

  // Calculate differences between consecutive colors
  const differences = [];
  for (let i = 1; i < hslColors.length; i++) {
    const hDiff = Math.abs(hslColors[i].h - hslColors[i - 1].h);
    const sDiff = Math.abs(hslColors[i].s - hslColors[i - 1].s);
    const lDiff = Math.abs(hslColors[i].l - hslColors[i - 1].l);

    // Weight hue, saturation, and lightness changes
    differences.push({
      index: i,
      change: hDiff * 2 + sDiff + lDiff, // Hue changes weighted more heavily
    });
  }

  // Identify significant points based on notable changes
  const significantPoints = [gradient[0]]; // Always include the first color

  // Iterate over differences to capture significant transitions
  for (let i = 1; i < differences.length; i++) {
    console.log(differences[i - 1].change);
    if (differences[i - 1].change > threshold) { // Dynamic threshold based on gradient characteristics
      significantPoints.push(gradient[differences[i - 1].index]);
    }
  }

  significantPoints.push(gradient[gradient.length - 1]); // Always include the last color

  return significantPoints;
}