/**
 * Central site configuration for the Clickpost post-purchase AI tracking demo.
 * Minimal content seam — copy strings + defaults live here.
 */
export const site = {
  name: "Clickpost",
  product: "AI Order Tracking",
  tagline: "A branded, personalized post-purchase tracking experience.",
};

/** A product pulled from the store's catalog. */
export type Product = {
  id: string;
  title: string;
  variant: string;
  price: number;
  qty: number;
  image: string | null;
  variants?: { title: string; price: number }[];
  /** Shopify product_type, when the store exposes it. */
  type?: string;
  /** Compare-at (pre-discount) price, when the store exposes it. */
  compareAt?: number;
};

// ---- Brand (fetched from /api/brand for any site using Clickpost) ----
export type Brand = {
  brandName: string;
  /** Hex accent color (from theme-color / logo), applied as the page accent. */
  brandColor: string;
  /** Absolute URL to the brand's logo/favicon (null → render a monogram fallback). */
  logo: string | null;
  /** Wide brand photo (og:image) for hero/promo imagery. */
  ogImage: string | null;
  /** Best-guess wide lifestyle/banner image from the homepage (preferred for the hero). */
  bannerImage: string | null;
  /** The store's homepage URL (for CTA links). */
  url: string | null;
  currency: string | null;
  country: string | null;
  city: string | null;
  lat: number | null;
  lon: number | null;
  timezone: string | null;
  products: Product[];
};

/** Default brand shown before a store resolves (keeps the page from ever looking empty). */
export const DEFAULT_BRAND: Brand = {
  brandName: "Your Store",
  brandColor: "#111111",
  logo: null,
  ogImage: null,
  bannerImage: null,
  url: null,
  currency: "USD",
  country: "United States",
  city: "New York",
  lat: 40.7128,
  lon: -74.006,
  timezone: "America/New_York",
  products: [],
};

/** Currency symbol for price formatting. */
export function currencySymbol(code: string | null | undefined): string {
  switch (code) {
    case "INR":
      return "₹";
    case "GBP":
      return "£";
    case "EUR":
      return "€";
    case "JPY":
      return "¥";
    case "AED":
      return "AED ";
    case "SAR":
      return "SAR ";
    case "TRY":
      return "₺";
    case "BRL":
      return "R$";
    case "ZAR":
      return "R";
    default:
      return "$";
  }
}

// ---- Personalization (location + weather) ----
export type GeoLocation = {
  city: string | null;
  region: string | null;
  country: string | null;
  countryCode: string | null;
  lat: number | null;
  lon: number | null;
  timezone: string | null;
};

export type Weather = {
  tempF: number;
  condition: string;
  /** Icon key for mapping to a UI icon: clear | cloudy | rain | snow | thunder | fog. */
  iconKey: WeatherIconKey;
  isDay: boolean;
  /** Relative humidity, percent (0–100). */
  humidity: number;
  /** Wind speed, miles per hour. */
  windMph: number;
};

export type WeatherIconKey = "clear" | "cloudy" | "rain" | "snow" | "thunder" | "fog";

/** Shown immediately so the widget never spins or reads "unavailable"; the real
 *  value from /api/weather replaces it in the background when it arrives. */
export const DEFAULT_WEATHER: Weather = {
  tempF: 74,
  condition: "Clear",
  iconKey: "clear",
  isDay: true,
  humidity: 50,
  windMph: 7,
};
