"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Plus } from "lucide-react";
import type { Recommendation } from "@/lib/returns/order";
import { usePortal } from "./PortalContext";
import { ProductImage } from "./ui";

export function RecommendationCarousel({
  products,
  onAdd,
}: {
  products: Recommendation[];
  onAdd?: (p: Recommendation) => void;
}) {
  const { primary, money } = usePortal();
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const update = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    setCanPrev(el.scrollLeft > 1);
    setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  }, []);

  useEffect(() => {
    update();
    const el = scrollerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [update, products.length]);

  const scrollBy = (dir: -1 | 1) => {
    const el = scrollerRef.current;
    if (!el) return;
    const slide = el.querySelector<HTMLElement>("[data-slide]");
    el.scrollBy({ left: dir * (slide?.offsetWidth ?? el.clientWidth * 0.4), behavior: "smooth" });
  };

  return (
    <div className="py-2">
      <div className="relative w-full" role="region" aria-roledescription="carousel">
        <div className="overflow-hidden">
          <div
            ref={scrollerRef}
            onScroll={update}
            className="-ml-2 flex snap-x snap-mandatory overflow-x-auto"
            style={{ scrollbarWidth: "none" }}
          >
            {products.map((a) => (
              <div
                key={a.id}
                data-slide
                role="group"
                aria-roledescription="slide"
                className="min-w-0 shrink-0 grow-0 snap-start basis-[40%] pl-2 sm:basis-[30%] lg:basis-[20%]"
              >
                <div className="group flex h-full flex-col overflow-hidden rounded-sm border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md">
                  <div className="relative aspect-square bg-slate-100">
                    <ProductImage src={a.image} alt={a.title} className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        onAdd?.(a);
                      }}
                      style={{ backgroundColor: primary }}
                      className="absolute bottom-1.5 right-1.5 z-10 flex h-6 w-6 items-center justify-center rounded-sm text-white opacity-0 shadow-lg transition-all hover:scale-110 active:scale-95 group-hover:opacity-100"
                      aria-label={`Add ${a.title}`}
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="flex flex-1 flex-col justify-between p-2">
                    <h4 className="mb-1 line-clamp-1 text-xs font-medium leading-tight text-slate-900">{a.title}</h4>
                    <p className="text-xs font-semibold text-slate-500">{money(a.price)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="hidden md:block">
          <CarouselButton direction="prev" disabled={!canPrev} onClick={() => scrollBy(-1)} className="-left-2" />
          <CarouselButton direction="next" disabled={!canNext} onClick={() => scrollBy(1)} className="-right-2" />
        </div>
      </div>
    </div>
  );
}

function CarouselButton({
  direction,
  disabled,
  onClick,
  className,
}: {
  direction: "prev" | "next";
  disabled: boolean;
  onClick: () => void;
  className: string;
}) {
  const Icon = direction === "prev" ? ArrowLeft : ArrowRight;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`absolute top-1/2 inline-flex size-8 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-xs transition-all hover:bg-slate-50 disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 ${className}`}
    >
      <Icon />
      <span className="sr-only">{direction === "prev" ? "Previous slide" : "Next slide"}</span>
    </button>
  );
}
