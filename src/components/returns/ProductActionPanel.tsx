"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, ArrowRight, Camera, Check, Loader2, Package, RefreshCw, RotateCcw, ShoppingBag, Sparkles, X } from "lucide-react";
import type { CatalogProduct, OrderItem, Recommendation } from "@/lib/returns/order";
import { usePortal } from "./PortalContext";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, Dropdown, ProductImage } from "./ui";
import { CatalogModal } from "./CatalogModal";
import { RecommendationCarousel } from "./RecommendationCarousel";

export type ExchangeType = "variant" | "catalog";

export type ProductActionPanelProps = {
  product: OrderItem;
  isExchange: boolean;
  onToggleExchange: (isExchange: boolean) => void;
  reason: string;
  details: string;
  exchangeType: ExchangeType;
  onExchangeTypeChange: (t: ExchangeType) => void;
  onReasonChange: (reason: string) => void;
  onDetailsChange: (details: string) => void;
  subReason?: string;
  onSubReasonChange?: (sub: string) => void;
  selectedVariant?: { size?: string; color?: string };
  onVariantChange?: (v: { size?: string; color?: string }) => void;
  selectedCatalogProduct?: CatalogProduct | null;
  onCatalogProductChange?: (p: CatalogProduct | null) => void;
  variant?: "full" | "inline";
};

const NUDGE = {
  enabled: true,
  title: "Wait—keep the love going ❤️",
  description: "Switch to an exchange or store credit and we'll add an extra",
  buttonText: "Switch to Exchange & Save",
  returnHeader: "Why are you returning this?",
  offerType: "discount_percent" as "discount_percent" | "flat_amount" | "store_credit",
  offerValue: 15,
};

type UploadedPhoto = {
  id: string;
  url: string;
  name: string;
  size: number;
  uploadProgress?: number;
  uploadStatus: "uploading" | "success" | "error";
  errorMessage?: string;
};

const SWATCHES: Record<string, string> = {
  natural: "#F5F0E8",
  black: "#1F2937",
  white: "#FFFFFF",
  navy: "#1E3A5F",
  sand: "#D6C6A8",
  "fragrance-free": "#EEF2F1",
};

function luminance(hex: string): number {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h.slice(0, 6);
  const n = parseInt(full, 16);
  if (Number.isNaN(n)) return 1;
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}

/** Fixed grid classes so Tailwind can see them. */
function sizeGridClass(options: string[]): string {
  const short = options.every((o) => o.length <= 3);
  if (!short) return "grid-cols-2";
  return (
    { 1: "grid-cols-1", 2: "grid-cols-2", 3: "grid-cols-3", 4: "grid-cols-4", 5: "grid-cols-5", 6: "grid-cols-6" }[
      Math.min(options.length, 6)
    ] ?? "grid-cols-5"
  );
}

export function ProductActionPanel({
  product,
  isExchange,
  onToggleExchange,
  reason,
  details,
  exchangeType,
  onExchangeTypeChange,
  onReasonChange,
  onDetailsChange,
  subReason,
  onSubReasonChange,
  selectedVariant = {},
  onVariantChange,
  selectedCatalogProduct,
  onCatalogProductChange,
  variant = "full",
}: ProductActionPanelProps) {
  const { primary, accent, bg, panel, name, catalog, recommendations, content, money } = usePortal();
  const [showNudge, setShowNudge] = useState(false);
  const [catalogOpen, setCatalogOpen] = useState(false);
  const [replaceMode, setReplaceMode] = useState(false);
  const [photos, setPhotos] = useState<UploadedPhoto[]>([]);
  const reasonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isExchange) {
      const t = setTimeout(() => {
        reasonRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 500);
      return () => clearTimeout(t);
    }
  }, [isExchange]);

  const v = primary;
  const D = accent;
  const inline = variant === "inline";
  const canChoose = product.eligibility === "returnable" || product.eligibility === "exchange-only";
  const exchangeOnly = product.eligibility === "exchange-only";
  const activeType: "variant" | "shop" | "replace" =
    exchangeType === "catalog" ? "shop" : replaceMode ? "replace" : "variant";
  const subOptions = reason ? content.subReasons[reason] : undefined;
  const photoRequired = !!reason && content.photoRequired.includes(reason);

  const colorways = content.colorOptions.map((c, i) => {
    const code = SWATCHES[c.toLowerCase()] ?? [panel, v, D][i % 3];
    return { name: c, colorCode: code, textColor: luminance(code) > 0.6 ? "#334155" : "#ffffff" };
  });
  const selectedSwatch = colorways.find((c) => c.name === selectedVariant?.color);
  const previewTint = selectedSwatch && selectedSwatch.name !== "Original" ? selectedSwatch.colorCode : "transparent";

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach((file) => {
      if (!file.type.startsWith("image/")) {
        setPhotos((p) => [
          ...p,
          { id: Math.random().toString(), url: "", name: file.name, size: file.size, uploadStatus: "error", errorMessage: "Only image files are allowed" },
        ]);
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setPhotos((p) => [
          ...p,
          { id: Math.random().toString(), url: "", name: file.name, size: file.size, uploadStatus: "error", errorMessage: "File size must be less than 5MB" },
        ]);
        return;
      }
      const reader = new FileReader();
      const id = Math.random().toString();
      setPhotos((p) => [...p, { id, url: "", name: file.name, size: file.size, uploadProgress: 0, uploadStatus: "uploading" }]);
      reader.onload = (ev) => {
        const url = typeof ev.target?.result === "string" ? ev.target.result : "";
        let progress = 0;
        const timer = setInterval(() => {
          progress += 20;
          setPhotos((p) => p.map((ph) => (ph.id === id ? { ...ph, uploadProgress: progress } : ph)));
          if (progress >= 100) {
            clearInterval(timer);
            setPhotos((p) => p.map((ph) => (ph.id === id ? { ...ph, url, uploadStatus: "success", uploadProgress: 100 } : ph)));
          }
        }, 200);
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (id: string) => setPhotos((p) => p.filter((ph) => ph.id !== id));

  const retryPhoto = (id: string) => {
    setPhotos((p) => p.map((ph) => (ph.id === id ? { ...ph, uploadStatus: "uploading", uploadProgress: 0, errorMessage: undefined } : ph)));
    let progress = 0;
    const timer = setInterval(() => {
      progress += 20;
      setPhotos((p) => p.map((ph) => (ph.id === id ? { ...ph, uploadProgress: progress } : ph)));
      if (progress >= 100) {
        clearInterval(timer);
        setPhotos((p) => p.map((ph) => (ph.id === id ? { ...ph, uploadStatus: "success", uploadProgress: 100 } : ph)));
      }
    }, 200);
  };

  const choose = (mode: "exchange" | "return") => {
    onToggleExchange(mode === "exchange");
    setShowNudge(mode === "return" && canChoose && NUDGE.enabled);
  };

  const setVariantField = (field: "size" | "color", value: string) => {
    onVariantChange?.({ ...selectedVariant, [field]: value });
  };

  const selectExchangeType = (t: "variant" | "shop" | "replace") => {
    if (t === "shop") {
      setReplaceMode(false);
      onExchangeTypeChange("catalog");
      return;
    }
    if (t === "replace") {
      // "Replace" = same item, same variant; modelled as a variant exchange with the original variant.
      setReplaceMode(true);
      onExchangeTypeChange("variant");
      onVariantChange?.({ size: product.variant.size, color: product.variant.color });
      return;
    }
    if (replaceMode) onVariantChange?.({});
    setReplaceMode(false);
    onExchangeTypeChange("variant");
  };

  const offerText = () => {
    switch (NUDGE.offerType) {
      case "discount_percent":
        return `${NUDGE.offerValue}% value`;
      case "flat_amount":
        return `${money(NUDGE.offerValue)} bonus`;
      case "store_credit":
        return `${money(NUDGE.offerValue)} store credit`;
      default:
        return "a bonus";
    }
  };

  const onAddRecommendation = (r: Recommendation) => {
    onCatalogProductChange?.({
      id: r.id,
      title: r.title,
      price: r.price,
      image: r.image,
      category: "Suggested",
      description: `Recommended ${content.noun}`,
      variant: "",
    });
  };

  const reasonDropdowns = (label: string) => (
    <>
      <Dropdown
        label={label}
        options={content.reasons}
        value={reason}
        onChange={(e) => {
          onReasonChange(e.target.value);
          onSubReasonChange?.("");
        }}
      />
      {reason && subOptions && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="overflow-hidden">
          <Dropdown
            label="Specific Reason"
            options={[{ value: "", label: "Select specific reason" }, ...subOptions]}
            value={subReason || ""}
            onChange={(e) => onSubReasonChange?.(e.target.value)}
          />
        </motion.div>
      )}
    </>
  );

  const typeButtonClass = (active: boolean) =>
    `flex flex-col items-center justify-center p-2 rounded-[4px] border-2 text-center transition-all aspect-square ${
      active ? "bg-white shadow-md scale-105" : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50"
    }`;
  const typeLabelClass = (active: boolean) =>
    `font-bold text-[10px] uppercase tracking-wide mt-1 ${active ? "text-slate-900" : "text-slate-500"}`;

  const collage = catalog.slice(0, 3);

  return (
    <div className={inline ? "" : "flex h-full flex-col bg-white"}>
      <div className={inline ? "space-y-6" : "flex-1 space-y-8 overflow-y-auto p-6"}>
        {!inline && (
          <div className="flex items-start gap-4 border-b border-slate-100 pb-6">
            <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-[4px] border border-slate-200" style={{ backgroundColor: bg }}>
              <ProductImage src={product.image} alt={product.title} className="h-full w-full object-cover" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold leading-snug text-slate-900">{product.title}</h3>
              <p className="mt-1 text-sm text-slate-500">
                {product.variant.color ? `${product.variant.color} • ${product.variant.size}` : product.variant.size}
              </p>
              <p className="mt-2 font-medium text-slate-900">{money(product.price)}</p>
            </div>
          </div>
        )}

        {canChoose && (
          <div className="space-y-4">
            {!exchangeOnly && <label className="text-xs font-bold uppercase tracking-wider text-slate-400">I want to</label>}
            {exchangeOnly ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 rounded-[4px] border border-amber-200 bg-amber-50 p-3">
                  <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-amber-100">
                    <Sparkles className="h-4 w-4 text-amber-600" />
                  </div>
                  <p className="text-xs font-medium text-amber-800">
                    This item is eligible for <strong>Exchange Only</strong>
                  </p>
                </div>
                <div className="relative rounded-[4px] border-2 p-4 shadow-sm" style={{ borderColor: v, backgroundColor: `${v}08` }}>
                  <div className="absolute -right-2 -top-2 rounded-[4px] px-2.5 py-1 text-white shadow-md" style={{ backgroundColor: v }}>
                    <span className="text-[10px] font-bold uppercase tracking-wider">15% OFF</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="rounded-[4px] p-2" style={{ backgroundColor: `${v}15`, color: v }}>
                      <RefreshCw className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="block font-bold" style={{ color: v }}>
                        Exchange
                      </span>
                      <span className="mt-0.5 block text-xs text-slate-500">Select a replacement option</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => choose("exchange")}
                  className={`relative flex flex-col items-start gap-3 rounded-[4px] border-2 p-4 text-left transition-all duration-200 ${
                    isExchange ? "scale-[1.02] shadow-sm" : "border-slate-200 bg-white hover:bg-slate-50"
                  }`}
                  style={isExchange ? { borderColor: v, backgroundColor: `${v}08` } : {}}
                >
                  <div className="absolute -right-2 -top-2 rounded-[4px] px-2.5 py-1 text-white shadow-md" style={{ backgroundColor: v }}>
                    <span className="text-[10px] font-bold uppercase tracking-wider">15% OFF</span>
                  </div>
                  <div
                    className="rounded-[4px] p-2"
                    style={isExchange ? { backgroundColor: `${v}15`, color: v } : { backgroundColor: "#f1f5f9", color: "#64748b" }}
                  >
                    <RefreshCw className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="block font-bold" style={isExchange ? { color: v } : { color: "#334155" }}>
                      Exchange
                    </span>
                    <span className="mt-0.5 block text-xs text-slate-500">or Replace Item</span>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => choose("return")}
                  className={`relative flex flex-col items-start gap-3 rounded-[4px] border-2 p-4 text-left transition-all duration-200 ${
                    isExchange ? "border-slate-200 bg-white hover:bg-slate-50" : "scale-[1.02] shadow-sm"
                  }`}
                  style={isExchange ? {} : { borderColor: v, backgroundColor: `${v}08` }}
                >
                  <div
                    className="rounded-[4px] p-2"
                    style={isExchange ? { backgroundColor: "#f1f5f9", color: "#64748b" } : { backgroundColor: `${v}15`, color: v }}
                  >
                    <Package className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="block font-bold" style={isExchange ? { color: "#334155" } : { color: v }}>
                      Return
                    </span>
                    <span className="mt-0.5 block text-xs text-slate-500">Get a refund</span>
                  </div>
                  {!isExchange && (
                    <div className="absolute right-3 top-3" style={{ color: v }}>
                      <Check className="h-5 w-5" />
                    </div>
                  )}
                </button>
              </div>
            )}
          </div>
        )}

        <AnimatePresence mode="wait">
          {isExchange ? (
            <motion.div
              key="exchange"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="space-y-4">{reasonDropdowns("Reason for Exchange")}</div>

              <div className="space-y-4">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Exchange Options</label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => selectExchangeType("variant")}
                    className={typeButtonClass(activeType === "variant")}
                    style={{ borderColor: activeType === "variant" ? v : undefined }}
                  >
                    <div
                      className="mb-1 flex h-12 w-12 items-center justify-center rounded-full"
                      style={activeType === "variant" ? { backgroundColor: `${v}15`, color: v } : { backgroundColor: "#f1f5f9", color: "#94a3b8" }}
                    >
                      <RefreshCw className="h-6 w-6" />
                    </div>
                    <h4 className={typeLabelClass(activeType === "variant")}>{content.sizeLabel}/Color</h4>
                  </button>
                  <button
                    type="button"
                    onClick={() => selectExchangeType("shop")}
                    className={typeButtonClass(activeType === "shop")}
                    style={{ borderColor: activeType === "shop" ? v : undefined }}
                  >
                    <div
                      className="mb-1 flex h-12 w-12 items-center justify-center rounded-full"
                      style={activeType === "shop" ? { backgroundColor: `${D}20`, color: D } : { backgroundColor: "#f1f5f9", color: "#94a3b8" }}
                    >
                      <ShoppingBag className="h-6 w-6" />
                    </div>
                    <h4 className={typeLabelClass(activeType === "shop")}>Shop Other</h4>
                  </button>
                  <button
                    type="button"
                    onClick={() => selectExchangeType("replace")}
                    className={typeButtonClass(activeType === "replace")}
                    style={{ borderColor: activeType === "replace" ? v : undefined }}
                  >
                    <div
                      className={`mb-1 flex h-12 w-12 items-center justify-center rounded-full ${
                        activeType === "replace" ? "bg-emerald-50 text-emerald-500" : "bg-slate-100 text-slate-400"
                      }`}
                    >
                      <RotateCcw className="h-6 w-6" />
                    </div>
                    <h4 className={typeLabelClass(activeType === "replace")}>Replace</h4>
                  </button>
                </div>

                <div className="pt-2">
                  {activeType === "variant" && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                      <div className="space-y-6 rounded-[4px] border border-slate-200 bg-white p-5 shadow-sm">
                        {product.variant.size && (
                          <div>
                            <div className="mb-3 flex items-center justify-between">
                              <label className="text-sm font-bold text-slate-900">New {content.sizeLabel}</label>
                              <Dialog>
                                <DialogTrigger asChild>
                                  <span className="cursor-pointer text-xs font-medium hover:underline" style={{ color: v }}>
                                    {content.sizeGuide.title}
                                  </span>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-md">
                                  <DialogHeader>
                                    <DialogTitle className="text-center font-serif text-xl">{content.sizeGuide.title}</DialogTitle>
                                    <DialogDescription className="sr-only">{content.sizeGuide.description}</DialogDescription>
                                  </DialogHeader>
                                  <div className="space-y-4 py-4">
                                    <div className="grid grid-cols-1 gap-3">
                                      {content.sizeGuide.rows.map((row) => (
                                        <div
                                          key={row.label}
                                          className="flex items-center justify-between gap-4 rounded-[4px] border border-slate-100 bg-slate-50 p-3"
                                        >
                                          <div>
                                            <span className="font-bold text-slate-900">{row.label}</span>
                                          </div>
                                          <div className="flex flex-col items-end gap-0.5 text-right text-xs text-slate-600">
                                            <strong>{row.detail}</strong>
                                            {row.note && <span className="text-slate-500">{row.note}</span>}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>
                            </div>
                            <div className={`grid gap-2 ${sizeGridClass(content.sizeOptions)}`}>
                              {content.sizeOptions.map((s) => {
                                const sel = selectedVariant?.size === s;
                                return (
                                  <button
                                    key={s}
                                    type="button"
                                    onClick={() => setVariantField("size", s)}
                                    className={`flex h-12 items-center justify-center rounded-[4px] border-2 px-2 text-center text-sm font-bold leading-tight transition-all ${
                                      sel
                                        ? "scale-105 border-transparent text-white shadow-md"
                                        : "border-slate-100 text-slate-600 hover:border-slate-200 hover:bg-slate-50"
                                    }`}
                                    style={sel ? { backgroundColor: v } : {}}
                                  >
                                    {s}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        <div>
                          <label className="mb-3 block text-sm font-bold text-slate-900">Colorway</label>
                          <div className="grid grid-cols-3 gap-3">
                            {colorways.map((c) => {
                              const sel = selectedVariant?.color === c.name;
                              return (
                                <button
                                  key={c.name}
                                  type="button"
                                  onClick={() => setVariantField("color", c.name)}
                                  className={`flex flex-col items-center justify-center rounded-[4px] border-2 px-1 py-3 transition-all ${
                                    sel ? "scale-105 border-transparent shadow-md" : "border-slate-100 hover:border-slate-200 hover:bg-slate-50"
                                  }`}
                                  style={sel ? { backgroundColor: c.colorCode, borderColor: c.colorCode } : {}}
                                >
                                  <div className="mb-2 h-6 w-6 rounded-full border border-black/10 shadow-sm" style={{ backgroundColor: c.colorCode }} />
                                  <span
                                    className={`text-center text-xs font-bold leading-tight ${sel ? "" : "text-slate-600"}`}
                                    style={sel ? { color: c.textColor } : {}}
                                  >
                                    {c.name}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        <div className="mt-2 rounded-[4px] border border-slate-200 bg-slate-50 p-4">
                          <label className="mb-3 block text-[10px] font-bold uppercase tracking-wider text-slate-400">Exchange Preview</label>
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex flex-row items-center gap-3 opacity-60">
                              <div className="h-12 w-12 flex-shrink-0 rounded-[4px] border border-slate-200 bg-white p-0.5">
                                <ProductImage src={product.image} alt={product.title} className="h-full w-full rounded-[4px] object-cover grayscale" />
                              </div>
                              <div className="text-left">
                                <span className="block text-[10px] font-bold uppercase text-slate-500">Current</span>
                                <span className="block text-xs font-medium leading-tight text-slate-700">
                                  {product.variant.size}
                                  <br />
                                  {product.variant.color || "Original"}
                                </span>
                              </div>
                            </div>
                            <ArrowRight className="h-4 w-4 flex-shrink-0 text-slate-400" />
                            <div className="flex flex-1 flex-row items-center gap-3 rounded-[4px] border bg-white p-2 shadow-sm" style={{ borderColor: v }}>
                              <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-[4px] border border-slate-100 bg-slate-50 p-0.5">
                                <ProductImage src={product.image} alt={product.title} className="h-full w-full rounded-[4px] object-cover" />
                                <div className="absolute inset-0 opacity-30 mix-blend-multiply" style={{ backgroundColor: previewTint }} />
                              </div>
                              <div className="text-left">
                                <span className="mb-0.5 block text-[10px] font-bold uppercase" style={{ color: v }}>
                                  New
                                </span>
                                <span className="block text-sm font-bold leading-tight text-slate-900">
                                  {selectedVariant?.size || "Select"}
                                  <span className="block text-xs font-normal text-slate-500">{selectedVariant?.color || "Select Color"}</span>
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {activeType === "shop" && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                      {selectedCatalogProduct ? (
                        <div className="group relative overflow-hidden rounded-[4px] border border-slate-200 bg-white p-4 shadow-sm">
                          <div className="absolute right-2 top-2 z-10">
                            <button
                              type="button"
                              onClick={() => onCatalogProductChange?.(null)}
                              className="rounded-full bg-slate-100 p-1.5 text-slate-400 transition-all hover:bg-red-50 hover:text-red-500"
                              aria-label="Remove selection"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                          <div className="flex items-start gap-4">
                            <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-[4px] border border-slate-100 bg-slate-50">
                              <ProductImage src={selectedCatalogProduct.image} alt={selectedCatalogProduct.title} className="h-full w-full object-cover" />
                            </div>
                            <div className="min-w-0 flex-1 pt-1">
                              <div className="mb-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">Exchanging For</div>
                              <h4 className="truncate font-bold text-slate-900">{selectedCatalogProduct.title}</h4>
                              <p className="mb-2 truncate text-sm text-slate-500">{selectedCatalogProduct.description}</p>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-900">{money(selectedCatalogProduct.price)}</span>
                                {selectedCatalogProduct.price > product.price && (
                                  <span className="rounded-[4px] bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-500">
                                    +{money(selectedCatalogProduct.price - product.price)}
                                  </span>
                                )}
                                {selectedCatalogProduct.price < product.price && (
                                  <span className="rounded-[4px] bg-emerald-50 px-1.5 py-0.5 text-[10px] font-medium text-emerald-600">
                                    -{money(product.price - selectedCatalogProduct.price)} refund
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setCatalogOpen(true)}
                            className="mt-4 w-full rounded-[4px] border border-slate-200 py-2 text-sm font-bold text-slate-600 transition-all hover:bg-slate-50"
                          >
                            Change Item
                          </button>
                        </div>
                      ) : (
                        <div
                          onClick={() => setCatalogOpen(true)}
                          className="group relative cursor-pointer overflow-hidden rounded-[4px] border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:shadow-md"
                          onMouseEnter={(e) => (e.currentTarget.style.borderColor = `${v}80`)}
                          onMouseLeave={(e) => (e.currentTarget.style.borderColor = "")}
                        >
                          <div className="flex flex-row items-center gap-4 p-5">
                            <div className="z-10 min-w-0 flex-1">
                              <div className="mb-2 flex items-center gap-2">
                                <span
                                  className="rounded-[4px] border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                                  style={{ backgroundColor: `${v}08`, color: v, borderColor: `${v}20` }}
                                >
                                  Full Collection
                                </span>
                              </div>
                              <h4 className="mb-1 font-serif text-lg font-bold leading-tight text-slate-900">{content.catalogTitle}</h4>
                              <p className="mb-4 truncate text-sm leading-tight text-slate-500">
                                Browse our complete collection for a new {content.noun}.
                              </p>
                              <div
                                className="inline-flex items-center justify-center rounded-[4px] px-6 py-3 text-xs font-bold uppercase tracking-widest text-white shadow-sm transition-all group-hover:scale-105 group-hover:shadow"
                                style={{ backgroundColor: v }}
                              >
                                Browse Collection
                              </div>
                            </div>
                            <div className="relative h-24 w-24 flex-shrink-0">
                              <div className="absolute inset-0 rotate-3 rounded-[4px] border border-slate-100 bg-slate-100 transition-transform group-hover:rotate-6" />
                              <div className="absolute inset-0 rotate-1 rounded-[4px] border border-slate-200 bg-slate-200 transition-transform group-hover:rotate-3" />
                              <div className="absolute inset-0 overflow-hidden rounded-[4px] border border-slate-100 bg-white shadow-sm">
                                <div className="grid h-full w-full grid-cols-2 gap-0.5 p-0.5">
                                  {[0, 1, 2].map((i) => {
                                    const p = collage[i];
                                    const corner = ["rounded-tl-md", "rounded-tr-md", "rounded-bl-md"][i];
                                    return p ? (
                                      <div key={p.id} className={`overflow-hidden ${corner}`}>
                                        <ProductImage src={p.image} alt={p.title} className="h-full w-full object-cover [&_span]:text-xs" />
                                      </div>
                                    ) : (
                                      <div key={`empty-${i}`} className={corner} style={{ backgroundColor: panel }} />
                                    );
                                  })}
                                  <div className="flex items-center justify-center rounded-br-md" style={{ backgroundColor: v }}>
                                    <span className="text-[10px] font-bold text-white">+{catalog.length}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {recommendations.length > 0 && (
                        <div>
                          <h4 className="mb-3 px-1 text-sm font-bold text-slate-900">Suggested for you</h4>
                          <RecommendationCarousel products={recommendations} onAdd={onAddRecommendation} />
                        </div>
                      )}
                    </motion.div>
                  )}

                  <CatalogModal
                    isOpen={catalogOpen}
                    onClose={() => setCatalogOpen(false)}
                    onSelect={(p) => {
                      onCatalogProductChange?.(p);
                      setCatalogOpen(false);
                    }}
                    originalPrice={product.price}
                  />

                  {activeType === "replace" && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                      <div className="flex items-start gap-4 rounded-[4px] border border-emerald-100 bg-emerald-50 p-6">
                        <div className="rounded-[4px] bg-emerald-100 p-2">
                          <RotateCcw className="h-6 w-6 text-emerald-600" />
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-lg font-bold text-emerald-900">Same Item Replacement</h4>
                          <p className="text-sm leading-relaxed text-emerald-700">
                            We will send you the exact same item (
                            {product.variant.color ? `${product.variant.color}, ${product.variant.size}` : product.variant.size}) as a
                            replacement.
                          </p>
                          <div className="pt-2 text-xs font-bold uppercase tracking-wide text-emerald-800 opacity-75">Best for defective items</div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="return"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {showNudge && NUDGE.enabled && (
                <div
                  className="relative transform overflow-hidden rounded-[4px] p-4 text-white shadow-xl transition-all"
                  style={{ background: `linear-gradient(135deg, ${v}, ${D})` }}
                >
                  <div className="relative z-10">
                    <h4 className="mb-1 flex items-center gap-2 text-lg font-bold">
                      <Sparkles className="h-5 w-5 text-white/90" />
                      {NUDGE.title}
                    </h4>
                    <p className="mb-3 text-sm font-medium leading-relaxed text-white/90">
                      {NUDGE.description} <strong>{offerText()}</strong>.
                    </p>
                    <button
                      type="button"
                      onClick={() => choose("exchange")}
                      className="w-full rounded-[4px] bg-white py-2 text-sm font-extrabold shadow-sm transition-all hover:bg-opacity-95 active:scale-95"
                      style={{ color: v }}
                    >
                      {NUDGE.buttonText}
                    </button>
                  </div>
                  <div className="absolute right-0 top-0 h-40 w-40 -translate-y-1/2 translate-x-1/2 rounded-full bg-white/10 blur-3xl" />
                </div>
              )}

              <div className="space-y-4" ref={reasonRef}>
                {reasonDropdowns(NUDGE.returnHeader)}
                {reason && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">Additional Comments (Optional)</label>
                      <textarea
                        value={details}
                        onChange={(e) => onDetailsChange(e.target.value)}
                        placeholder="Tell us more about the issue..."
                        className="h-24 w-full resize-none rounded-[4px] border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2"
                        style={{ ["--tw-ring-color" as string]: `${v}30` }}
                      />
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-slate-700">
                          Photos{" "}
                          {photoRequired ? (
                            <span className="font-normal text-red-500">(Required)</span>
                          ) : (
                            <span className="font-normal text-slate-400">(Optional)</span>
                          )}
                        </label>
                      </div>
                      {photoRequired && (
                        <p className="text-xs leading-relaxed text-slate-500">
                          Photos are required for this return reason to help us process your request faster.
                        </p>
                      )}
                      <label className="block cursor-pointer">
                        <div className="group rounded-[4px] border-2 border-dashed border-slate-200 p-6 text-center transition-all hover:border-slate-300 hover:bg-slate-50">
                          <div className="flex flex-col items-center gap-2">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 transition-colors group-hover:bg-slate-200">
                              <Camera className="h-5 w-5 text-slate-400" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-slate-700">Upload photos</p>
                              <p className="mt-0.5 text-xs text-slate-400">PNG, JPG up to 5MB</p>
                            </div>
                          </div>
                        </div>
                        <input type="file" accept="image/*" multiple className="hidden" onChange={handleFiles} />
                      </label>
                      {photos.length > 0 && (
                        <div className="grid grid-cols-3 gap-2">
                          {photos.map((ph) => (
                            <div key={ph.id} className="relative aspect-square overflow-hidden rounded-[4px] border border-slate-200 bg-slate-100">
                              {ph.uploadStatus === "uploading" && (
                                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/80">
                                  <Loader2 className="mb-2 h-5 w-5 animate-spin" style={{ color: v }} />
                                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200 px-3">
                                    <div
                                      className="h-full rounded-full transition-all duration-300"
                                      style={{ width: `${ph.uploadProgress || 0}%`, backgroundColor: v }}
                                    />
                                  </div>
                                </div>
                              )}
                              {ph.uploadStatus === "error" && (
                                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-red-50 p-2">
                                  <AlertCircle className="mb-1 h-5 w-5 text-red-500" />
                                  <p className="text-center text-[10px] leading-tight text-red-600">{ph.errorMessage}</p>
                                  <button type="button" onClick={() => retryPhoto(ph.id)} className="mt-1 text-[10px] text-red-700 underline">
                                    Retry
                                  </button>
                                </div>
                              )}
                              {ph.uploadStatus === "success" && ph.url && (
                                // eslint-disable-next-line @next/next/no-img-element -- local data URL preview
                                <img src={ph.url} alt={ph.name} className="h-full w-full object-cover" />
                              )}
                              <button
                                type="button"
                                onClick={() => removePhoto(ph.id)}
                                className="absolute right-1 top-1 z-20 flex h-5 w-5 items-center justify-center rounded-full bg-black/50 text-white transition-colors hover:bg-black/70"
                                aria-label="Remove photo"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="rounded-[4px] border border-slate-100 p-3" style={{ backgroundColor: bg }}>
          <div className="mb-1 flex items-center gap-1 text-xs font-semibold text-slate-400">{name} Rewards ✦</div>
          <div className="text-sm font-bold text-slate-900">Earn 50 points with this exchange</div>
        </div>
      </div>
    </div>
  );
}
