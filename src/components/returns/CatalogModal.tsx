"use client";

import { useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import type { CatalogProduct } from "@/lib/returns/order";
import { usePortal } from "./PortalContext";
import { Dialog, DialogContent, DialogDescription, DialogTitle, ProductImage } from "./ui";

type CatalogEntry = CatalogProduct & { outOfStock?: boolean };

export function CatalogModal({
  isOpen,
  onClose,
  onSelect,
  originalPrice = 0,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (p: CatalogProduct) => void;
  originalPrice?: number;
}) {
  const { primary, bg, catalog, content, money } = usePortal();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [searchOpen, setSearchOpen] = useState(false);

  const categories = ["All", ...Array.from(new Set(catalog.map((p) => p.category)))];
  const filtered = (catalog as CatalogEntry[]).filter((p) => {
    const matchesQuery = p.title.toLowerCase().includes(query.toLowerCase());
    const matchesCategory = category === "All" || p.category === category;
    return matchesQuery && matchesCategory;
  });

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="fixed bottom-0 left-0 right-0 top-auto flex h-[90vh] w-full max-w-full translate-x-0 translate-y-0 flex-col gap-0 overflow-hidden rounded-b-none rounded-t-[4px] border-0 bg-white p-0 shadow-2xl md:left-[50%] md:top-[50%] md:h-[90vh] md:max-w-md md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-[4px]">
        <DialogTitle className="sr-only">Browse Catalog</DialogTitle>
        <DialogDescription className="sr-only">
          Select a replacement item from our collection to exchange your product.
        </DialogDescription>

        <div className="z-10 flex items-center justify-between bg-white px-6 pb-2 pt-6">
          <div>
            <h2 className="font-serif text-xl font-bold text-slate-900">{content.catalogTitle}</h2>
            <p className="mt-1 text-sm text-slate-500">Choose from our collection</p>
          </div>
          <button
            type="button"
            onClick={() => setSearchOpen(!searchOpen)}
            className={`rounded-full p-2 transition-colors ${searchOpen ? "bg-slate-100 text-slate-900" : "text-slate-500 hover:bg-slate-50"}`}
            aria-label="Search"
          >
            <Search className="h-6 w-6" />
          </button>
        </div>

        {searchOpen && (
          <div className="px-6 pb-4 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                autoFocus
                type="text"
                placeholder={`Search ${content.nounPlural}...`}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full rounded-full border-none bg-slate-100 py-2 pl-9 pr-4 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-slate-200"
              />
            </div>
          </div>
        )}

        <div className="hide-scrollbar flex items-center gap-2 overflow-x-auto px-6 pb-4" style={{ scrollbarWidth: "none" }}>
          <div className="flex items-center gap-6 pr-4">
            {categories.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCategory(c)}
                className={`whitespace-nowrap border-b-2 pb-1 text-base font-bold transition-all ${
                  category === c ? "border-slate-900 text-slate-900" : "border-transparent text-slate-400 hover:text-slate-600"
                }`}
                style={category === c ? { color: primary, borderColor: primary } : {}}
              >
                {c}
              </button>
            ))}
          </div>
          <div className="sticky right-0 ml-auto border-l border-slate-100 bg-white pl-4">
            <button
              type="button"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-black text-white transition-colors hover:bg-slate-800"
              aria-label="Filters"
            >
              <SlidersHorizontal className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 pb-6 pt-2">
          {filtered.length > 0 ? (
            <div className="grid grid-cols-2 gap-x-4 gap-y-8">
              {filtered.map((p) => {
                const diff = p.price - originalPrice;
                const costsMore = diff > 0;
                const out = !!p.outOfStock;
                return (
                  <div
                    key={p.id}
                    className={`group flex flex-col ${out ? "" : "cursor-pointer"}`}
                    onClick={() => !out && onSelect(p)}
                  >
                    <div className="relative mb-3 aspect-[4/5] overflow-hidden rounded-[4px]" style={{ backgroundColor: bg }}>
                      <ProductImage
                        src={p.image}
                        alt={p.title}
                        className={`h-full w-full object-cover transition-transform duration-500 ${out ? "opacity-70 grayscale" : "group-hover:scale-105"}`}
                      />
                      {out && (
                        <div className="absolute inset-0 flex items-center justify-center bg-white/40 backdrop-blur-[1px]">
                          <span className="bg-slate-900 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-white shadow-sm">
                            Out of Stock
                          </span>
                        </div>
                      )}
                      {p.variant && (
                        <div className="absolute bottom-2 left-2">
                          <span className="rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-medium text-slate-600">{p.variant}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-1 flex-col">
                      <h3
                        className={`mb-1 line-clamp-2 min-h-[2.5em] font-serif text-sm font-medium leading-tight text-slate-900 ${out ? "text-slate-500" : ""}`}
                      >
                        {p.title}
                      </h3>
                      <p className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-500 opacity-80">{money(p.price)}</p>
                      {out ? (
                        <button
                          type="button"
                          className="mt-auto w-full rounded-[4px] bg-slate-200 px-2 py-2.5 text-xs font-bold uppercase tracking-widest text-slate-500 shadow-sm transition-all hover:bg-slate-800 hover:text-white active:scale-95 active:bg-slate-900"
                          onClick={(e) => e.stopPropagation()}
                        >
                          Notify Me
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="mt-auto w-full rounded-[4px] px-2 py-2.5 text-xs font-bold uppercase tracking-widest shadow-sm transition-all hover:shadow active:scale-95"
                          style={{ backgroundColor: primary, color: "white" }}
                        >
                          {costsMore ? `Add +${money(diff)}` : "Add"}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex h-48 flex-col items-center justify-center text-slate-500">
              <Search className="mb-3 h-10 w-10 opacity-20" />
              <p>No {content.nounPlural} found</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
