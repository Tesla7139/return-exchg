import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Drop products that are really the same item — store feeds return each colour/
 * variant as a separate entry (e.g. "Gully Number 001 – Baaz" and "… – Aaroh"),
 * which would show the same product twice in the cart/upsell. Keys on the BASE
 * name (the part before a " – "/" - "/" | "/": " variant suffix). Keeps the first
 * occurrence, preserves order.
 */
export function dedupeByTitle<T extends { title?: string }>(items: T[]): T[] {
  const seen = new Set<string>();
  return items.filter((p) => {
    const full = (p.title || "").toLowerCase().trim();
    const base = full.split(/\s+[–—|-]\s+|:\s+/)[0].trim() || full;
    if (!base || seen.has(base)) return false;
    seen.add(base);
    return true;
  });
}

/**
 * Drop only EXACT-title repeats — keeps colour/size variants as separate entries.
 * Use for cross-sell/upsell grids where variety (more products) is wanted.
 */
export function dedupeExactTitle<T extends { title?: string }>(items: T[]): T[] {
  const seen = new Set<string>();
  return items.filter((p) => {
    const t = (p.title || "").toLowerCase().trim();
    if (!t || seen.has(t)) return false;
    seen.add(t);
    return true;
  });
}

/**
 * A brand color safe to use as a button/fill background on a white surface.
 * If the store's brand is missing or too light (would be white-on-white),
 * fall back to a dark, readable color.
 */
export function readableBrand(color?: string | null): string {
  const fallback = "#1652f0";
  if (!color) return fallback;
  const h = color.trim().replace(/^#/, "");
  const hex = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  if (!/^[0-9a-fA-F]{6}$/.test(hex)) return color; // non-hex (rgb/named) — leave as-is
  const r = parseInt(hex.slice(0, 2), 16) / 255;
  const g = parseInt(hex.slice(2, 4), 16) / 255;
  const b = parseInt(hex.slice(4, 6), 16) / 255;
  const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return lum > 0.75 ? "#0f172a" : color; // too light on white → dark slate
}
