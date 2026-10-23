/**
 * Builds the demo order shown in the returns portal from the store's real catalog.
 * Mirrors the reference design's 7 line items, one per eligibility state, so every
 * branch of the flow (returnable, exchange-only, final sale, in transit…) is visible.
 */
import type { Product } from "@/lib/site";
import { dedupeByTitle } from "@/lib/utils";
import type { VerticalContent } from "./content";

export type Eligibility =
  | "returnable"
  | "exchange-only"
  | "yet-to-deliver"
  | "final-sale"
  | "return-in-transit"
  | "exchange-in-transit";

export type OrderItem = {
  id: string;
  image: string | null;
  title: string;
  variant: { size: string; color: string };
  quantity: number;
  price: number;
  originalPrice: number;
  eligibility: Eligibility;
  purchaseDate: string;
  returnDeadline?: string;
  deliveryDate?: string;
  exchangingFor?: { title: string; price: number; quantity: number; image: string | null };
};

export type CatalogProduct = {
  id: string;
  title: string;
  price: number;
  category: string;
  description: string;
  variant: string;
  image: string | null;
};

export type Recommendation = { id: string; title: string; price: number; image: string | null };

// Grid order matches the GoPure design: 4 eligible cards, then 2 more on the next row.
const ORDER_SHAPE: Eligibility[] = [
  "returnable",
  "returnable",
  "exchange-only",
  "final-sale",
  "returnable",
  "returnable",
  "yet-to-deliver",
  "return-in-transit",
  "exchange-in-transit",
];

export function formatDate(d: Date): string {
  return d.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
}

function daysFromNow(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d;
}

/** Split a Shopify variant title ("S / Black", "50ml") into size + color. */
function splitVariant(v: string, content: VerticalContent, i: number): { size: string; color: string } {
  // Shopify joins options with " / " (spaced) — a bare "/" can be inside one ("122/128cm").
  const parts = (v || "")
    .split(/\s+\/\s+/)
    .map((s) => s.trim())
    .filter((s) => s && s !== "Default" && s !== "Default Title");
  const sizeLike = (s: string) =>
    /\d/.test(s) || /^(xxs|xs|s|m|l|xl|xxl|xxxl|one size|os|small|medium|large|x-large|petite|regular|tall)$/i.test(s);
  const size = parts.find(sizeLike) || content.sizeOptions[Math.min(1 + (i % 2), content.sizeOptions.length - 1)];
  const color = parts.find((p) => !sizeLike(p)) || (content.vertical === "beauty" ? "" : "Original");
  return { size, color };
}

/** Cycle through the catalog so even a tiny store fills every slot. */
function pick<T>(arr: T[], i: number): T | undefined {
  return arr.length ? arr[i % arr.length] : undefined;
}

export type DemoOrder = {
  orderId: string;
  items: OrderItem[];
  catalog: CatalogProduct[];
  recommendations: Recommendation[];
};

export function buildOrder(products: Product[], content: VerticalContent, brandName: string): DemoOrder {
  // Freebies, gift cards, shipping protection etc. never make a believable order line.
  const NOT_MERCH = /\b(free gift|mystery|gift card|e-?gift|sample|shipping|protection|insurance|route|warranty|donation|tip)\b/i;
  const pool = dedupeByTitle(products.filter((p) => p.price > 0 && p.title && !NOT_MERCH.test(p.title)));
  const source: Product[] = pool.length ? pool : fallbackProducts(content, brandName);

  const today = new Date();
  void today;
  const purchased = formatDate(daysFromNow(-12));
  const recent = formatDate(daysFromNow(-3));
  const eta = formatDate(daysFromNow(4));
  const older = formatDate(daysFromNow(-26));
  const transit = formatDate(daysFromNow(-8));

  const items: OrderItem[] = ORDER_SHAPE.map((eligibility, i) => {
    const p = pick(source, i)!;
    const originalPrice = p.compareAt && p.compareAt > p.price ? p.compareAt : Math.round(p.price * 1.25);
    const base: OrderItem = {
      id: String(i + 1),
      image: p.image,
      title: p.title,
      variant: splitVariant(p.variant, content, i),
      quantity: 1,
      price: p.price,
      originalPrice,
      eligibility,
      purchaseDate: purchased,
      // Staggered so each card shows its own return-by date.
      returnDeadline: formatDate(daysFromNow(18 + ((i * 5) % 11) - 5)),
    };
    if (eligibility === "yet-to-deliver") return { ...base, purchaseDate: recent, returnDeadline: undefined, deliveryDate: eta };
    if (eligibility === "final-sale") return { ...base, purchaseDate: older, returnDeadline: undefined };
    if (eligibility === "return-in-transit") return { ...base, purchaseDate: transit };
    if (eligibility === "exchange-in-transit") {
      const swap = pick(source, i + 3) || p;
      return {
        ...base,
        purchaseDate: transit,
        exchangingFor: { title: swap.title, price: swap.price, quantity: 1, image: swap.image },
      };
    }
    return base;
  });

  // Exchange catalog + recommendations come from the rest of the store's catalog
  // (falling back to the whole catalog for small stores).
  const rest = source.length > ORDER_SHAPE.length ? source.slice(ORDER_SHAPE.length) : source;
  const catalog: CatalogProduct[] = rest.slice(0, 14).map((p, i) => ({
    id: `cp${i + 1}`,
    title: p.title,
    price: p.price,
    category: categoryOf(p, content),
    description: p.variant ? `${p.variant}` : `${brandName} ${content.noun}`,
    variant: p.variant || content.sizeOptions[1] || "Standard",
    image: p.image,
  }));
  const recommendations: Recommendation[] = [...rest]
    .reverse()
    .slice(0, 6)
    .map((p, i) => ({ id: `r${i + 1}`, title: p.title, price: p.price, image: p.image }));

  return {
    orderId: String(10000 + (hash(brandName) % 89999)),
    items,
    catalog,
    recommendations,
  };
}

function categoryOf(p: Product, content: VerticalContent): string {
  if (p.type && p.type.trim()) return p.type.trim().replace(/\b\w/g, (c) => c.toUpperCase());
  return content.vertical === "beauty" ? "Skincare" : content.vertical === "apparel" ? "Clothing" : "Shop";
}

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

/** Used only when a store exposes no products at all (bot walls, non-commerce sites). */
function fallbackProducts(content: VerticalContent, brandName: string): Product[] {
  const names: Record<string, [string, number][]> = {
    apparel: [
      ["Linen Wrap Dress", 128], ["Everyday Cotton Tee", 38], ["Relaxed Wide-Leg Pant", 96], ["Ribbed Knit Cardigan", 112],
      ["Classic Denim Jacket", 148], ["Pleated Midi Skirt", 88], ["Oversized Poplin Shirt", 78], ["Weekend Hoodie", 84],
      ["Silk Slip Cami", 68], ["Tailored Blazer", 198], ["Lounge Jogger", 72], ["Merino Crew Sweater", 135],
    ],
    footwear: [
      ["Everyday Runner", 120], ["Classic Leather Sneaker", 135], ["Suede Chelsea Boot", 189], ["Trail Hiker", 160],
      ["Slip-On Loafer", 110], ["Court Classic", 95], ["Recovery Slide", 45], ["High-Top Canvas", 70],
      ["Strappy Sandal", 80], ["Weekend Mule", 98], ["Performance Trainer", 150], ["Wool Slipper", 65],
    ],
    beauty: [
      ["Vitamin C Glow Serum", 48], ["Hydrating Night Cream", 56], ["Gentle Foaming Cleanser", 24], ["Daily Mineral SPF 50", 34],
      ["Retinol Renewal Oil", 62], ["Balancing Toner", 28], ["Overnight Lip Mask", 18], ["Peptide Eye Cream", 44],
      ["Clay Detox Masque", 32], ["Barrier Repair Balm", 38], ["Brightening Essence", 40], ["Hyaluronic Mist", 26],
    ],
    general: [
      ["Signature Bundle", 89], ["Everyday Essential", 39], ["Premium Edition", 129], ["Starter Kit", 59],
      ["Travel Pack", 45], ["Deluxe Set", 149], ["Gift Box", 75], ["Refill Pack", 29],
      ["Limited Edition", 99], ["Classic", 49], ["Accessory Kit", 35], ["Mini Edition", 25],
    ],
  };
  return (names[content.vertical] || names.general).map(([title, price], i) => ({
    id: `f${i}`,
    title: `${title}`,
    variant: "",
    price,
    qty: 1,
    image: null,
    variants: [],
    type: brandName ? undefined : undefined,
  }));
}
