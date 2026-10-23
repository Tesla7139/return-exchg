"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { DEFAULT_BRAND, type Brand } from "@/lib/site";
import { PortalProvider, usePortal } from "./PortalContext";
import { BRAND_STORAGE_KEY } from "@/lib/returns/types";
import { ReturnsApp } from "./ReturnsApp";

function readStoredBrand(): Brand | null {
  try {
    const raw = sessionStorage.getItem(BRAND_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Brand) : null;
  } catch {
    return null;
  }
}

export function PortalPage() {
  const [brand, setBrand] = useState<Brand | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const store = params.get("store");
    const stored = readStoredBrand();
    const storedHost = (stored?.url || "").replace(/^https?:\/\//, "").replace(/^www\./, "").split("/")[0];
    const wantHost = (store || "").replace(/^https?:\/\//, "").replace(/^www\./, "").split("/")[0];
    if (stored && (!store || storedHost === wantHost)) {
      setBrand(stored);
      return;
    }
    if (!store) {
      setBrand(DEFAULT_BRAND);
      return;
    }
    // Opened directly (not via the demo frame): resolve the brand ourselves.
    let cancelled = false;
    fetch("/api/brand", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: store }),
    })
      .then((r) => (r.ok ? r.json() : null))
      .catch(() => null)
      .then((d: Partial<Brand> | null) => {
        if (cancelled) return;
        setBrand({ ...DEFAULT_BRAND, ...(d || {}), brandName: d?.brandName || DEFAULT_BRAND.brandName, products: d?.products || [] });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!brand) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <Loader2 className="size-6 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <PortalProvider brand={brand}>
      <PortalRoot>
        <ReturnsApp />
      </PortalRoot>
    </PortalProvider>
  );
}

/** Exposes the palette as CSS variables (headings use --portal-primary; bg-background → portal bg). */
function PortalRoot({ children }: { children: React.ReactNode }) {
  const { primary, bg, name } = usePortal();
  useEffect(() => {
    document.title = `${name} · Returns & Exchanges`;
    // Set on <html> (not a wrapper) so Radix dialogs/sheets portalled into <body>
    // inherit the palette and heading styles too.
    const root = document.documentElement;
    root.classList.add("portal-root");
    root.style.setProperty("--portal-primary", primary);
    root.style.setProperty("--background", bg);
    root.style.background = bg;
  }, [name, bg, primary]);
  return <>{children}</>;
}
