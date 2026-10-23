"use client";

import { createContext, useContext, useMemo } from "react";
import type { Brand } from "@/lib/site";
import { contentFor, detectVertical, localeFor, type Locale, type VerticalContent } from "@/lib/returns/content";
import { buildOrder, type CatalogProduct, type OrderItem, type Recommendation } from "@/lib/returns/order";
import { mix, usablePrimary } from "@/lib/returns/color";

/**
 * Everything a portal screen needs to render a specific store: the palette derived
 * from its brand color, its logo/imagery, the demo order built from its catalog, and
 * vertical/market-specific copy. Replaces the reference design's hard-coded
 * Manymoons constants (#6B7D6E / #D8A48F / #FAF9F6, logo, products).
 */
export type Portal = {
  brand: Brand;
  name: string;
  domain: string;
  supportEmail: string;
  /** Brand primary (buttons, headings, accents). Replaces #6B7D6E. */
  primary: string;
  /** Soft secondary accent (glows, highlights). Replaces #D8A48F. */
  accent: string;
  /** Page background. Replaces #FAF9F6. */
  bg: string;
  /** Slightly deeper panel tone. Replaces #F0EDE6. */
  panel: string;
  logo: string | null;
  /** Wide lifestyle image for the login hero + banners (falls back to a product image). */
  heroImage: string | null;
  orderId: string;
  items: OrderItem[];
  catalog: CatalogProduct[];
  recommendations: Recommendation[];
  content: VerticalContent;
  locale: Locale;
  /** Format an amount in the store's currency. */
  money: (n: number) => string;
};

const PortalCtx = createContext<Portal | null>(null);

export function usePortal(): Portal {
  const p = useContext(PortalCtx);
  if (!p) throw new Error("usePortal must be used inside <PortalProvider>");
  return p;
}

export function buildPortal(brand: Brand): Portal {
  const primary = usablePrimary(brand.brandColor);
  const vertical = detectVertical(brand.products);
  const content = contentFor(vertical);
  const order = buildOrder(brand.products, content, brand.brandName);
  const domain = (brand.url || "")
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .split("/")[0] || `${brand.brandName.toLowerCase().replace(/[^a-z0-9]+/g, "")}.com`;
  const currency = brand.currency || "USD";
  let fmt: Intl.NumberFormat;
  try {
    fmt = new Intl.NumberFormat("en-US", { style: "currency", currency, minimumFractionDigits: 2 });
  } catch {
    fmt = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
  }
  const firstImage = order.items.find((i) => i.image)?.image ?? null;
  return {
    brand,
    name: brand.brandName,
    domain,
    supportEmail: `support@${domain}`,
    primary,
    accent: mix(primary, "#ffffff", 0.45),
    bg: mix("#FAFAF8", primary, 0.035),
    panel: mix("#F1F0EC", primary, 0.07),
    logo: brand.logo,
    // og:image is often just a logo card, so a real product photo beats it.
    heroImage: brand.bannerImage || firstImage || brand.ogImage,
    orderId: order.orderId,
    items: order.items,
    catalog: order.catalog,
    recommendations: order.recommendations,
    content,
    locale: localeFor(brand.country, brand.city),
    money: (n: number) => fmt.format(n),
  };
}

export function PortalProvider({ brand, children }: { brand: Brand; children: React.ReactNode }) {
  const portal = useMemo(() => buildPortal(brand), [brand]);
  return <PortalCtx.Provider value={portal}>{children}</PortalCtx.Provider>;
}
