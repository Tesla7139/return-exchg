/** Tiny color helpers for deriving the portal palette from one brand color. */

function toRgb(hex: string): [number, number, number] | null {
  const h = hex.trim().replace(/^#/, "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h.slice(0, 6);
  if (!/^[0-9a-f]{6}$/i.test(full)) return null;
  return [parseInt(full.slice(0, 2), 16), parseInt(full.slice(2, 4), 16), parseInt(full.slice(4, 6), 16)];
}

function toHex([r, g, b]: [number, number, number]): string {
  return `#${[r, g, b].map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, "0")).join("")}`;
}

/** Mix `a` toward `b` by `t` (0 = a, 1 = b). Non-hex input returns `a`. */
export function mix(a: string, b: string, t: number): string {
  const x = toRgb(a);
  const y = toRgb(b);
  if (!x || !y) return a;
  return toHex([x[0] + (y[0] - x[0]) * t, x[1] + (y[1] - x[1]) * t, x[2] + (y[2] - x[2]) * t]);
}

export function luminance(hex: string): number {
  const c = toRgb(hex);
  if (!c) return 0.3;
  const [r, g, b] = c.map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * A primary safe for white text on it and for brand-colored text on white: very
 * light brand colors are darkened until they read.
 */
export function usablePrimary(color: string | null | undefined): string {
  let c = color && toRgb(color) ? color : "#1f2937";
  let guard = 0;
  while (luminance(c) > 0.32 && guard++ < 10) c = mix(c, "#000000", 0.18);
  return c;
}
