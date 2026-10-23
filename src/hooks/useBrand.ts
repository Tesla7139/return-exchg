"use client";

import { useCallback, useState } from "react";
import { DEFAULT_BRAND, type Brand, type Product } from "@/lib/site";

type Status = "idle" | "loading" | "ready";

type BrandResponse = Partial<Brand> & { products?: Product[] };

/**
 * Data seam for the branded tracking page. `submit(url)` POSTs the entered site
 * to /api/brand and merges the real branding over a derived fallback, so it never
 * hard-fails: an unreachable/garbage domain still yields a domain-derived brand.
 */
export function useBrand() {
  const [status, setStatus] = useState<Status>("idle");
  const [brand, setBrand] = useState<Brand | null>(null);
  const [submittedUrl, setSubmittedUrl] = useState("");

  const submit = useCallback(async (url: string) => {
    const trimmed = url.trim();
    if (!trimmed) return;
    setSubmittedUrl(trimmed);
    setStatus("loading");

    let data: BrandResponse | null = null;
    try {
      const res = await fetch("/api/brand", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: trimmed }),
      });
      if (res.ok) data = (await res.json()) as BrandResponse;
    } catch {
      data = null;
    }

    setBrand({
      brandName: data?.brandName || deriveBrandName(trimmed) || DEFAULT_BRAND.brandName,
      brandColor: data?.brandColor || DEFAULT_BRAND.brandColor,
      logo: data?.logo || null,
      ogImage: data?.ogImage || null,
      bannerImage: data?.bannerImage || null,
      url: data?.url || (trimmed.startsWith("http") ? trimmed : `https://${trimmed}`),
      currency: data?.currency ?? DEFAULT_BRAND.currency,
      country: data?.country ?? DEFAULT_BRAND.country,
      city: data?.city ?? DEFAULT_BRAND.city,
      lat: data?.lat ?? DEFAULT_BRAND.lat,
      lon: data?.lon ?? DEFAULT_BRAND.lon,
      timezone: data?.timezone ?? DEFAULT_BRAND.timezone,
      products: data?.products ?? [],
    });
    setStatus("ready");
  }, []);

  const reset = useCallback(() => {
    setStatus("idle");
    setBrand(null);
    setSubmittedUrl("");
  }, []);

  return { status, brand, submittedUrl, submit, reset };
}

function deriveBrandName(url: string): string | null {
  try {
    const clean = url.replace(/^https?:\/\//, "").replace(/^www\./, "");
    const base = clean.split("/")[0].split(".")[0];
    if (!base) return null;
    return base.charAt(0).toUpperCase() + base.slice(1);
  } catch {
    return null;
  }
}
