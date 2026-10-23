"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, ArrowRight, Check, ChevronLeft, ChevronRight, ChevronsUp, Package, RefreshCw, RotateCcw, Truck, X } from "lucide-react";
import { toast } from "sonner";
import type { OrderData, SelectedItem } from "@/lib/returns/types";
import type { CatalogProduct, OrderItem } from "@/lib/returns/order";
import { usePortal } from "../PortalContext";
import { Button, ProductImage } from "../ui";
import { MarketingBanner } from "../MarketingBanner";
import { ShipmentJourneySheet } from "../ShipmentJourneySheet";
import { ProductActionPanel, type ExchangeType } from "../ProductActionPanel";

type VariantChoice = { size?: string; color?: string };

type ItemState = {
  reason: string;
  details: string;
  subReason?: string;
  isExchange: boolean;
  exchangeType: ExchangeType;
  newVariant: VariantChoice;
  selectedCatalogProduct?: CatalogProduct | null;
  isSelected: boolean;
};

type SheetHeight = "default" | "expanded" | "closing";
const SHEET_HEIGHTS: Record<SheetHeight, string> = { default: "45vh", expanded: "70vh", closing: "0vh" };

const isInTransit = (item: OrderItem) =>
  item.eligibility === "return-in-transit" || item.eligibility === "exchange-in-transit";

/** The date line under the price in the item detail, for every eligibility state. */
function deadlineLine(item: OrderItem): string {
  switch (item.eligibility) {
    case "exchange-only":
      return item.returnDeadline ? `Exchange by ${item.returnDeadline}` : "Exchange only";
    case "yet-to-deliver":
      return item.deliveryDate ? `Arriving by ${item.deliveryDate}` : "On the way";
    case "final-sale":
      return "Final Sale";
    case "return-in-transit":
      return "Return in progress";
    case "exchange-in-transit":
      return "Exchange in progress";
    default:
      return item.returnDeadline ? `Return by ${item.returnDeadline}` : "";
  }
}

/** Short amber notice for items that can't be returned right now (null = none). */
function eligibilityNotice(item: OrderItem): React.ReactNode {
  switch (item.eligibility) {
    case "yet-to-deliver":
      return (
        <>
          <strong>Not delivered yet</strong>{" "}— returns &amp; exchanges open after delivery
        </>
      );
    case "final-sale":
      return (
        <>
          This item is <strong>Final Sale</strong> and not eligible for return or exchange
        </>
      );
    case "return-in-transit":
      return (
        <>
          A <strong>return</strong> is already in progress for this item
        </>
      );
    case "exchange-in-transit":
      return (
        <>
          An <strong>exchange</strong> is already in progress for this item
        </>
      );
    default:
      return null;
  }
}

function Stars() {
  const { accent } = usePortal();
  return (
    <div className="flex" style={{ color: accent }}>
      {[1, 2, 3, 4, 5].map((j) => (
        <svg key={j} className="w-3 h-3 fill-current" viewBox="0 0 24 24">
          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
        </svg>
      ))}
    </div>
  );
}

function useIsMobile() {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const update = () => setMobile(window.innerWidth < 768);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  return mobile;
}

export function ProductSelectScreen({
  orderData,
  selectedItems,
  onComplete,
  onBack,
}: {
  orderData?: OrderData;
  selectedItems: SelectedItem[];
  onComplete: (items: SelectedItem[]) => void;
  onBack: () => void;
}) {
  const { primary, accent, bg, name, items, money, orderId: portalOrderId } = usePortal();
  const orderId = orderData?.orderId || portalOrderId;

  const [activeId, setActiveId] = useState<string | null>(null);
  const [view, setView] = useState<"grid" | "detail">("grid");
  const [trackingOpen, setTrackingOpen] = useState(false);
  const [trackedId, setTrackedId] = useState<string | null>(null);
  const [state, setState] = useState<Record<string, ItemState>>({});
  const [sheetHeight, setSheetHeight] = useState<SheetHeight>("default");
  const scrollRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    const next: Record<string, ItemState> = {};
    items.forEach((item) => {
      next[item.id] = {
        reason: "",
        details: "",
        isExchange: item.eligibility === "returnable" || item.eligibility === "exchange-only",
        exchangeType: "variant",
        newVariant: { size: item.variant.size, color: item.variant.color },
        isSelected: false,
      };
    });
    selectedItems.forEach((s) => {
      next[s.id] = {
        reason: s.reason || "",
        details: s.details || "",
        isExchange: s.isExchange || false,
        exchangeType: "variant",
        newVariant: {},
        isSelected: true,
      };
    });
    setState(next);
    // Seed once from the incoming selection (matches the design).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openDetail = (id: string) => {
    setActiveId(id);
    setView("detail");
  };
  const switchDetail = (id: string) => {
    setActiveId(id);
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  };
  const update = <K extends keyof ItemState>(id: string, key: K, value: ItemState[K]) => {
    setState((s) => ({ ...s, [id]: { ...s[id], [key]: value } }));
  };
  const openTracking = (id: string | null) => {
    setTrackedId(id);
    setTrackingOpen(true);
  };

  const isSelected = (id: string) => state[id]?.isSelected ?? false;
  const chosen = items.filter((i) => isSelected(i.id));
  const count = chosen.length;
  const canContinue = count > 0;

  const handleContinue = () => {
    if (!canContinue) return;
    const result: SelectedItem[] = chosen.map((item) => {
      const s = state[item.id];
      const cp = s?.selectedCatalogProduct;
      return {
        id: item.id,
        quantity: item.quantity,
        reason: s?.reason,
        details: s?.details,
        isExchange: s?.isExchange || false,
        exchangeVariant: s?.newVariant,
        exchangeProduct: cp
          ? { id: cp.id, title: cp.title, price: cp.price, image: cp.image, variant: cp.variant }
          : undefined,
      };
    });
    onComplete(result);
  };

  const active = activeId ? items.find((i) => i.id === activeId) ?? null : null;
  const activeState = active ? state[active.id] : null;
  const exchangeCount = chosen.filter((i) => state[i.id]?.isExchange).length;
  const returnCount = count - exchangeCount;
  const exchangeBonus = chosen.reduce((sum, i) => sum + i.price * 0.15, 0);

  const eligible = items.filter((i) => i.eligibility !== "yet-to-deliver" && !isInTransit(i));
  const pending = items.filter((i) => i.eligibility === "yet-to-deliver");
  const inTransit = items.filter(isInTransit);
  const trackedProduct =
    (trackedId ? items.find((i) => i.id === trackedId) : null) ?? active ?? inTransit[0] ?? items[5] ?? null;

  const sheetHeightValue = isMobile ? SHEET_HEIGHTS[sheetHeight] : "100%";

  return (
    <div className="min-h-screen flex flex-col bg-background relative font-sans">
      <AnimatePresence>
        {view === "grid" && (
          <motion.div
            className="flex flex-col h-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="lg:hidden px-4 py-4 flex items-center gap-3 bg-white border-b border-slate-100">
              <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-slate-50 transition-colors">
                <ChevronLeft className="w-6 h-6 text-slate-900" />
              </button>
              <div>
                <h1 className="font-serif font-bold text-slate-900 text-lg">Select items</h1>
                <p className="text-xs text-slate-500">{items.length} Items</p>
              </div>
            </div>
            <div className="hidden lg:flex max-w-[1720px] mx-auto w-full px-4 pt-6 pb-2 items-center justify-between">
              <div>
                <button
                  onClick={onBack}
                  className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors hover:-translate-x-1 mb-2"
                >
                  <ChevronLeft className="w-5 h-5" />
                  <span className="font-medium">Back to Home</span>
                </button>
                <h1 className="font-serif font-bold text-slate-900 text-4xl">Select items</h1>
                <p className="text-slate-500 mt-1">Select the items you wish to return or exchange.</p>
              </div>
            </div>

            <div className="flex-1 p-3 pb-32 md:p-4 bg-background">
              <div className="max-w-[1720px] mx-auto flex flex-col">
                <div className="mb-6 lg:order-2 lg:mt-12">
                  <MarketingBanner />
                </div>

                <div className="lg:order-1">
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6 xl:gap-9">
                    {eligible.map((item) => {
                      const selected = isSelected(item.id);
                      const finalSale = item.eligibility === "final-sale";
                      const transit = isInTransit(item);
                      const btnStyle: React.CSSProperties = finalSale
                        ? {}
                        : transit
                          ? { backgroundColor: primary }
                          : selected
                            ? ({ color: primary, borderColor: primary, ["--hover-bg" as string]: primary } as React.CSSProperties)
                            : { backgroundColor: primary };
                      return (
                        <motion.div
                          key={item.id}
                          layoutId={`card-${item.id}`}
                          onClick={() => openDetail(item.id)}
                          className={`bg-white rounded-[4px] overflow-hidden border transition-all duration-300 flex flex-col relative group cursor-pointer ${
                            selected
                              ? "border-2 border-[color:var(--portal-primary)] shadow-md"
                              : "border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-1"
                          }`}
                        >
                          <div className="aspect-[4/5] relative overflow-hidden bg-[#f8f8fa]">
                            <motion.div layoutId={`image-${item.id}`} className="w-full h-full">
                              <ProductImage
                                src={item.image}
                                alt={item.title}
                                className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-105 ${
                                  selected ? "blur-[3px] scale-105" : ""
                                }`}
                              />
                            </motion.div>
                            <div className="absolute top-2 left-2 right-2 flex flex-col gap-1 md:top-3 md:left-3 md:right-3 md:gap-1.5">
                              {item.eligibility === "exchange-only" && (
                                <span
                                  className="text-white text-[10px] md:text-[11px] font-bold px-2.5 py-1 uppercase tracking-wider"
                                  style={{ backgroundColor: primary }}
                                >
                                  Only Exchange
                                </span>
                              )}
                              {finalSale && (
                                <span className="bg-slate-600 text-white text-[10px] md:text-[11px] font-bold px-2.5 py-1 uppercase tracking-wider">
                                  Final Sale
                                </span>
                              )}
                              {item.returnDeadline && !finalSale && !selected && (
                                <span className="bg-amber-500 text-white text-[10px] md:text-sm font-semibold px-2 py-1 md:px-3 md:py-1.5 ml-auto rounded-[2px]">
                                  {item.returnDeadline}
                                </span>
                              )}
                            </div>
                            {selected && (
                              <div
                                className="absolute inset-0 z-10 flex items-center justify-center backdrop-blur-[2px]"
                                style={{ backgroundColor: `${primary}2e` }}
                              >
                                <div
                                  className="bg-white rounded-[2px] px-3 py-1.5 shadow-lg flex items-center gap-2 md:px-5 md:py-2.5 md:gap-3"
                                  style={{ color: primary }}
                                >
                                  <div className="text-white rounded-full p-0.5 md:p-1" style={{ backgroundColor: primary }}>
                                    <Check className="w-3 h-3 md:w-4 md:h-4" strokeWidth={3} />
                                  </div>
                                  <span className="text-xs md:text-xl font-semibold tracking-[0.1em] md:tracking-[0.12em] uppercase">
                                    {state[item.id]?.isExchange ? "EXCHANGE" : "RETURN"}
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                          <div className="p-3 md:p-4 flex flex-col flex-1 text-center">
                            <div className="flex justify-center items-center gap-1 mb-2">
                              <Stars />
                              <span className="text-[10px] text-slate-400 font-medium">(2.4k)</span>
                            </div>
                            <h3 className="font-serif font-bold text-slate-900 text-sm md:text-base leading-tight mb-2 line-clamp-2">
                              {item.title}
                            </h3>
                            <div className="flex flex-wrap justify-center items-baseline gap-x-2 mb-3 md:mb-4">
                              <span className="text-base md:text-lg font-bold text-slate-900">{money(item.price)}</span>
                              {item.originalPrice > 0 && (
                                <span className="text-xs md:text-sm text-slate-400 line-through decoration-slate-400/50">
                                  {money(item.originalPrice)}
                                </span>
                              )}
                            </div>
                            <div className="mt-auto">
                              <button
                                onClick={(e) => {
                                  if (transit) {
                                    e.stopPropagation();
                                    openTracking(item.id);
                                  }
                                }}
                                className={`w-full py-2.5 px-2 md:px-4 rounded-[4px] font-bold text-[11px] md:text-xs uppercase whitespace-nowrap tracking-wider md:tracking-widest transition-all duration-200 ${
                                  finalSale
                                    ? "bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200"
                                    : transit
                                      ? "text-white hover:opacity-90 shadow-sm hover:shadow"
                                      : selected
                                        ? "bg-white border-2 hover:text-white"
                                        : "text-white hover:opacity-90 shadow-sm hover:shadow"
                                }`}
                                style={btnStyle}
                              >
                                {finalSale ? "NOT RETURNABLE" : transit ? "TRACK" : selected ? "EDIT" : "SELECT ITEM"}
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>

                {pending.length > 0 && (
                  <div className="mt-12 lg:order-3">
                    <div className="mb-4 flex items-center gap-2">
                      <Package className="w-5 h-5 text-amber-600" />
                      <h3 className="font-serif font-bold text-slate-900 text-lg">Yet to Deliver</h3>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                      {pending.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => openDetail(item.id)}
                          className="bg-white rounded-[4px] overflow-hidden border border-amber-200 shadow-sm relative cursor-pointer hover:shadow-md transition-shadow group"
                        >
                          <div className="aspect-[4/5] relative overflow-hidden" style={{ backgroundColor: bg }}>
                            <ProductImage
                              src={item.image}
                              alt={item.title}
                              className="w-full h-full object-cover grayscale opacity-80 group-hover:scale-105 transition-transform duration-700"
                            />
                            <div className="absolute top-2 left-0 right-0 flex flex-col gap-1">
                              <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-1 uppercase tracking-wider">
                                On The Way
                              </span>
                            </div>
                            <div className="absolute inset-0 bg-white/20 backdrop-blur-[1px] flex items-center justify-center p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                              <div className="bg-white/95 rounded-[4px] px-3 py-2 shadow-lg text-center">
                                <Package className="w-5 h-5 text-amber-600 mx-auto mb-1" />
                                <p className="text-xs font-bold text-slate-900">View Details</p>
                              </div>
                            </div>
                          </div>
                          <div className="p-3 md:p-4 flex flex-col flex-1 text-center">
                            <h3 className="font-serif font-bold text-slate-600 text-base leading-tight mb-2 line-clamp-2">
                              {item.title}
                            </h3>
                            <div className="flex justify-center items-center gap-2 mb-4">
                              <span className="text-lg font-bold text-slate-500">{money(item.price)}</span>
                            </div>
                            <div className="mt-auto">
                              <div className="w-full py-2.5 px-4 rounded-[4px] font-bold text-xs uppercase tracking-widest bg-slate-100 text-slate-400 border border-slate-200">
                                Not Yet Delivered
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 bg-amber-50 border border-amber-200 rounded-[4px] p-4 flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <h4 className="font-semibold text-amber-900 text-sm mb-1">Items pending delivery</h4>
                        <p className="text-sm text-amber-700">
                          These items are on their way to you. You&apos;ll be able to return or exchange them once delivered.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {inTransit.length > 0 && (
                  <div className="mt-12 lg:order-4">
                    <div className="mb-4 flex items-center gap-2">
                      <Truck className="w-5 h-5" style={{ color: primary }} />
                      <h3 className="font-serif font-bold text-slate-900 text-lg">Track Your Return/Exchange</h3>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                      {inTransit.map((item) => (
                        <div
                          key={item.id}
                          className="bg-white rounded-[4px] overflow-hidden border shadow-sm relative group"
                          style={{ borderColor: `${primary}33` }}
                        >
                          <div className="aspect-[4/5] relative overflow-hidden" style={{ backgroundColor: bg }}>
                            <ProductImage
                              src={item.image}
                              alt={item.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                            />
                            <div className="absolute top-2 left-0 right-0 flex flex-col gap-1">
                              <span
                                className="text-white text-[10px] font-bold px-2 py-1 uppercase tracking-wider"
                                style={{ backgroundColor: item.eligibility === "exchange-in-transit" ? accent : primary }}
                              >
                                {item.eligibility === "exchange-in-transit" ? "Exchanging" : "Returning"}
                              </span>
                            </div>
                          </div>
                          <div className="p-3 md:p-4 flex flex-col flex-1 text-center">
                            <h3 className="font-serif font-bold text-slate-900 text-sm md:text-base leading-tight mb-2 line-clamp-2">
                              {item.title}
                            </h3>
                            <div className="flex flex-wrap justify-center items-baseline gap-x-2 mb-3 md:mb-4">
                              <span className="text-base md:text-lg font-bold text-slate-900">{money(item.price)}</span>
                              {item.originalPrice > 0 && (
                                <span className="text-xs md:text-sm text-slate-400 line-through decoration-slate-400/50">
                                  {money(item.originalPrice)}
                                </span>
                              )}
                            </div>
                            <div className="mt-auto">
                              <button
                                onClick={() => openTracking(item.id)}
                                className="w-full py-2.5 px-4 rounded-[4px] font-bold text-xs uppercase tracking-widest text-white hover:opacity-90 transition-opacity shadow-sm"
                                style={{ backgroundColor: primary }}
                              >
                                Track
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div
                      className="mt-4 rounded-[4px] p-4 flex items-start gap-3 border"
                      style={{ backgroundColor: `${primary}08`, borderColor: `${primary}20` }}
                    >
                      <Truck className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: primary }} />
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm mb-1" style={{ color: primary }}>
                          Shipment in progress
                        </h4>
                        <p className="text-sm" style={{ color: `${primary}99` }}>
                          These items are already on their way back. Tap Track to follow your shipment&apos;s journey.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {view === "detail" && active && (
          <motion.div
            className="fixed inset-0 z-50 bg-black/90 flex flex-col md:bg-black/80 md:backdrop-blur-sm md:items-center md:justify-center md:p-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            <div className="w-full h-full md:max-w-5xl md:h-[85vh] md:bg-white md:rounded-[4px] md:overflow-hidden md:flex md:flex-row md:shadow-2xl md:relative bg-transparent flex flex-col">
              <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-start z-20 md:bg-none md:h-auto md:p-6 pointer-events-none">
                <div className="w-10 h-10" />
                <div className="flex gap-3 pointer-events-auto" />
              </div>

              <div
                className="h-[60vh] w-full relative flex items-center justify-center overflow-hidden md:h-full md:w-1/2 md:!bg-slate-50"
                style={{ backgroundColor: bg }}
              >
                <button
                  onClick={() => setView("grid")}
                  className="absolute top-4 left-4 z-20 w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center text-slate-900 hover:bg-slate-50 transition-colors"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <div className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 z-20 flex-col items-center gap-2 p-2 bg-white/80 backdrop-blur-md border border-slate-200/50 shadow-xl rounded-full">
                  {items.map((item) => {
                    const current = item.id === active.id;
                    const sel = isSelected(item.id);
                    return (
                      <button
                        key={item.id}
                        onClick={() => switchDetail(item.id)}
                        className={`w-10 h-10 rounded-full overflow-hidden border-2 transition-all duration-300 relative ${
                          current ? "scale-110 shadow-sm" : "border-transparent opacity-60 hover:opacity-100"
                        }`}
                        style={current ? { borderColor: primary } : {}}
                      >
                        <ProductImage src={item.image} alt={item.title} className="w-full h-full object-cover" />
                        {sel && (
                          <div
                            className="absolute inset-0 flex items-center justify-center"
                            style={{ backgroundColor: `${primary}60` }}
                          >
                            <Check className="w-4 h-4 text-white" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
                <ProductImage
                  src={active.image}
                  alt={active.title}
                  imgClassName="w-full h-full object-contain p-8 md:object-cover md:p-0"
                />
                <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2 md:bottom-8">
                  <div className="w-2 h-2 rounded-full bg-slate-900" />
                  <div className="w-2 h-2 rounded-full bg-slate-300" />
                  <div className="w-2 h-2 rounded-full bg-slate-300" />
                </div>
              </div>

              <motion.div
                className="absolute bottom-0 left-0 right-0 z-30 flex flex-col md:relative md:flex-1 md:mt-0 md:w-1/2 md:z-10"
                drag={isMobile ? "y" : false}
                dragConstraints={{ top: 0, bottom: 0 }}
                dragElastic={0.1}
                onDragEnd={(_, info) => {
                  const vy = info.velocity.y;
                  if (info.offset.y > 100 || vy > 500) {
                    if (sheetHeight === "expanded") setSheetHeight("default");
                    else setView("grid");
                  } else if ((info.offset.y < -100 || vy < -500) && sheetHeight === "default") {
                    setSheetHeight("expanded");
                  }
                }}
                style={{ height: sheetHeightValue }}
                animate={{ height: sheetHeightValue }}
                transition={{ type: "spring", damping: 30, stiffness: 300 }}
              >
                <AnimatePresence>
                  {sheetHeight === "default" && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute -top-12 left-0 right-0 flex justify-center items-center pb-2 pointer-events-none md:hidden z-40"
                    >
                      <motion.div
                        animate={{ y: [0, -10, 0] }}
                        transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                        className="text-white drop-shadow-md opacity-90"
                      >
                        <ChevronsUp className="w-10 h-10" />
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="bg-white rounded-t-[2rem] flex flex-col overflow-hidden h-full shadow-[0_-10px_40px_rgba(0,0,0,0.2)] md:rounded-none md:shadow-none w-full">
                  <div className="w-full flex flex-col items-center justify-center pt-3 pb-1 md:hidden cursor-grab active:cursor-grabbing relative bg-white">
                    <motion.div
                      className="w-10 h-1 rounded-full bg-slate-300"
                      animate={{
                        width: sheetHeight === "expanded" ? 40 : 32,
                        backgroundColor: sheetHeight === "expanded" ? primary : "#CBD5E1",
                      }}
                      transition={{ duration: 0.2 }}
                    />
                  </div>

                  <div
                    ref={scrollRef}
                    className={`flex-1 overflow-y-auto px-5 pt-2 hide-scrollbar md:px-8 md:pt-16 md:pb-24 ${
                      sheetHeight === "expanded" ? "pb-32" : "pb-48"
                    }`}
                  >
                    <div className="mb-6">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div>
                          <div className="flex items-center gap-2 text-[10px] font-bold tracking-wider text-slate-500 uppercase mb-1">
                            <span>Order #{orderId}</span>
                            <span>•</span>
                            <span>{active.purchaseDate}</span>
                          </div>
                          <h2 className="text-xl font-serif font-bold text-slate-900 leading-tight md:text-3xl">
                            {active.title}
                          </h2>
                        </div>
                      </div>
                      <p className="text-sm text-slate-500 mb-4 md:text-base">
                        {active.variant.size}
                        {active.variant.color ? ` • ${active.variant.color}` : ""}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-xl font-bold text-slate-900 md:text-2xl">{money(active.price)}</span>
                          {active.originalPrice > 0 && (
                            <span className="text-sm text-slate-400 line-through">{money(active.originalPrice)}</span>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-slate-500 font-medium mt-2 md:text-base">{deadlineLine(active)}</p>
                    </div>

                    <div className="border border-slate-100 rounded-[4px] p-3 mb-6" style={{ backgroundColor: bg }}>
                      <div className="text-xs font-semibold text-slate-400 mb-1 flex items-center gap-1">
                        {name} Rewards <ChevronRight className="w-3 h-3" />
                      </div>
                      <div className="font-bold text-slate-900 text-sm">Earn 50 points with this exchange</div>
                    </div>

                    <div className="border-t border-slate-100 my-4" />

                    {/* Compact eligibility notice (exchange-only items get theirs inside the action panel). */}
                    {eligibilityNotice(active) && (
                      <div className="mb-4 flex items-center gap-2 rounded-[4px] border border-amber-200 bg-amber-50 p-3">
                        <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-amber-100">
                          {active.eligibility === "final-sale" ? (
                            <AlertCircle className="h-4 w-4 text-amber-600" />
                          ) : active.eligibility === "yet-to-deliver" ? (
                            <Package className="h-4 w-4 text-amber-600" />
                          ) : (
                            <Truck className="h-4 w-4 text-amber-600" />
                          )}
                        </div>
                        <p className="text-xs font-medium text-amber-800">{eligibilityNotice(active)}</p>
                      </div>
                    )}

                    {active.eligibility === "yet-to-deliver" || isInTransit(active) ? (
                      <div className="space-y-6 py-4">
                        {active.eligibility === "yet-to-deliver" ? (
                          <>
                            <div className="bg-amber-50 border border-amber-200 rounded-[4px] p-5 flex items-start gap-4">
                              <div className="p-2 bg-amber-100 rounded-full flex-shrink-0 text-amber-600">
                                <Package className="w-6 h-6" />
                              </div>
                              <div>
                                <h4 className="font-bold text-amber-900 text-lg mb-1">Item On The Way</h4>
                                <p className="text-sm text-amber-800 leading-relaxed">
                                  This item is currently in transit. You will be able to initiate a return or exchange once it
                                  has been delivered.
                                </p>
                                <div className="mt-3 flex items-center gap-2 text-xs font-bold text-amber-800 uppercase tracking-wider opacity-75">
                                  <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                                  Estimated Delivery: {active.deliveryDate}
                                </div>
                              </div>
                            </div>
                            <Button size="lg" fullWidth variant="secondary" className="font-bold mt-4" onClick={() => setView("grid")}>
                              Got It
                            </Button>
                          </>
                        ) : (
                          <div
                            className="rounded-[4px] p-5"
                            style={{ backgroundColor: `${primary}08`, border: "1px solid", borderColor: `${primary}30` }}
                          >
                            <div className="flex items-start gap-4 mb-4">
                              <div
                                className="p-2 rounded-full flex-shrink-0"
                                style={{ backgroundColor: `${primary}15`, color: primary }}
                              >
                                <Truck className="w-6 h-6" />
                              </div>
                              <div>
                                <h4 className="font-bold text-lg mb-1" style={{ color: primary }}>
                                  {active.eligibility === "return-in-transit" ? "Return In Transit" : "Exchange In Transit"}
                                </h4>
                                <p className="text-sm leading-relaxed text-slate-700">
                                  {active.eligibility === "return-in-transit"
                                    ? "Your return is on its way to us. We'll process your refund once we receive it."
                                    : "Your exchange is being processed and will ship soon."}
                                </p>
                              </div>
                            </div>
                            {active.eligibility === "exchange-in-transit" && active.exchangingFor && (
                              <div className="bg-white rounded-[4px] p-4 border border-slate-100 mb-4">
                                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-3">Exchanging For</p>
                                <div className="flex items-center gap-3">
                                  <div className="w-14 h-14 rounded-[4px] overflow-hidden flex-shrink-0 bg-slate-50 border border-slate-100">
                                    <ProductImage
                                      src={active.exchangingFor.image}
                                      alt={active.exchangingFor.title}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                  <div>
                                    <p className="font-bold text-slate-900 text-sm">{active.exchangingFor.title}</p>
                                    <p className="text-xs text-slate-500 mt-0.5">Qty: {active.exchangingFor.quantity}</p>
                                    <p className="font-bold mt-1" style={{ color: primary }}>
                                      {money(active.exchangingFor.price)}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}
                            <button
                              onClick={() => openTracking(active.id)}
                              className="w-full py-3 rounded-[4px] text-sm font-bold text-white uppercase tracking-widest transition-all hover:opacity-90"
                              style={{ backgroundColor: primary }}
                            >
                              Track Shipment
                            </button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {active.eligibility !== "final-sale" && activeState && (
                          <>
                            <ProductActionPanel
                              product={active}
                              isExchange={activeState.isExchange}
                              onToggleExchange={(v) => update(active.id, "isExchange", v)}
                              reason={activeState.reason}
                              details={activeState.details}
                              exchangeType={activeState.exchangeType}
                              onExchangeTypeChange={(t) => update(active.id, "exchangeType", t)}
                              onReasonChange={(r) => update(active.id, "reason", r)}
                              onDetailsChange={(d) => update(active.id, "details", d)}
                              subReason={activeState.subReason}
                              onSubReasonChange={(s) => update(active.id, "subReason", s)}
                              selectedVariant={activeState.newVariant}
                              onVariantChange={(v) => update(active.id, "newVariant", v)}
                              selectedCatalogProduct={activeState.selectedCatalogProduct}
                              onCatalogProductChange={(p) => update(active.id, "selectedCatalogProduct", p)}
                              variant="inline"
                            />
                            <div className="pt-4 border-t border-slate-100 space-y-3">
                              {activeState.isSelected ? (
                                // Already in the request (as in the design): save edits, or reset the item.
                                <div className="space-y-3">
                                  <Button
                                    variant="primary"
                                    size="lg"
                                    fullWidth
                                    onClick={() => {
                                      if (!activeState.reason) {
                                        toast.error("Please select a reason first.");
                                        return;
                                      }
                                      toast.success(`${active.title} updated.`);
                                      setView("grid");
                                    }}
                                  >
                                    Confirm Selection
                                  </Button>
                                  <Button
                                    variant="secondary"
                                    size="lg"
                                    fullWidth
                                    className="!text-red-700"
                                    onClick={() => {
                                      setState((s) => ({
                                        ...s,
                                        [active.id]: {
                                          reason: "",
                                          details: "",
                                          subReason: "",
                                          isExchange:
                                            active.eligibility === "returnable" || active.eligibility === "exchange-only",
                                          exchangeType: "variant",
                                          newVariant: { size: active.variant.size, color: active.variant.color },
                                          selectedCatalogProduct: null,
                                          isSelected: false,
                                        },
                                      }));
                                      toast("Selection reset");
                                    }}
                                  >
                                    Reset
                                  </Button>
                                </div>
                              ) : (
                                <Button
                                  variant="primary"
                                  size="lg"
                                  fullWidth
                                  onClick={() => {
                                    if (!activeState.reason) {
                                      toast.error("Please select a reason first.");
                                      return;
                                    }
                                    update(active.id, "isSelected", true);
                                    toast.success(`${active.title} added to your request.`);
                                    setView("grid");
                                  }}
                                >
                                  {activeState.isExchange ? "Confirm Exchange" : "Confirm Return"}
                                </Button>
                              )}
                            </div>
                          </>
                        )}
                        {active.eligibility === "final-sale" && (
                          <div className="bg-slate-50 border border-slate-200 rounded-[4px] p-6 text-center space-y-3">
                            <div className="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center mx-auto">
                              <X className="w-6 h-6 text-slate-500" />
                            </div>
                            <h4 className="font-bold text-slate-900">Final Sale Item</h4>
                            <p className="text-sm text-slate-500">
                              This item was purchased as final sale and is not eligible for returns or exchanges.
                            </p>
                            <Button variant="secondary" size="sm" fullWidth onClick={() => setView("grid")}>
                              Back to Items
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {view === "grid" && count > 0 && (
          // Once something is selected (as in the design): a floating summary card.
          <motion.div
            key="selected-bar"
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-3 left-3 right-3 z-40 mx-auto max-w-[860px] rounded-[4px] border border-slate-200 bg-white p-3 shadow-[0_20px_50px_-12px_rgba(15,23,42,0.25)] md:bottom-4 md:left-4 md:right-4 md:p-5"
          >
            <div className="flex items-center gap-3 md:gap-4">
              {/* Phones: one thumbnail with a +N badge. Larger screens: a stack of up to 3. */}
              {(() => {
                const sel = items.filter((i) => isSelected(i.id));
                const first = sel[0];
                return first ? (
                  <div className="relative h-11 w-11 flex-shrink-0 overflow-hidden rounded-[4px] bg-slate-50 md:hidden">
                    <ProductImage src={first.image} alt={first.title} className="h-full w-full object-cover" />
                    {sel.length > 1 && (
                      <span className="absolute inset-0 flex items-center justify-center bg-slate-900/55 text-sm font-bold text-white">
                        +{sel.length - 1}
                      </span>
                    )}
                  </div>
                ) : null;
              })()}
              <div className="hidden -space-x-3 md:flex">
                {items
                  .filter((i) => isSelected(i.id))
                  .slice(0, 3)
                  .map((i) => (
                    <div
                      key={i.id}
                      className="h-12 w-12 overflow-hidden rounded-[4px] border-2 border-white bg-slate-50 shadow-sm md:h-14 md:w-14"
                    >
                      <ProductImage src={i.image} alt={i.title} className="h-full w-full object-cover" />
                    </div>
                  ))}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-serif text-[13px] font-bold text-slate-900 sm:text-sm md:text-lg">
                  {count} Item{count > 1 ? "s" : ""} Selected
                </p>
                <div className="mt-1 flex items-center gap-2">
                  {exchangeCount > 0 && (
                    <span
                      className="inline-flex items-center gap-1 rounded-[4px] border px-2 py-0.5 text-xs font-bold"
                      style={{ color: primary, backgroundColor: `${primary}12`, borderColor: `${primary}33` }}
                      title="Exchanges"
                    >
                      <RefreshCw className="h-3.5 w-3.5" /> {exchangeCount}
                    </span>
                  )}
                  {returnCount > 0 && (
                    <span
                      className="inline-flex items-center gap-1 rounded-[4px] border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-bold text-slate-600"
                      title="Returns"
                    >
                      <RotateCcw className="h-3.5 w-3.5" /> {returnCount}
                    </span>
                  )}
                </div>
              </div>
              <Button variant="primary" size="md" onClick={handleContinue} className="flex-shrink-0 !gap-1.5 !px-3 !py-2.5 text-[13px] !tracking-wider md:!gap-2 md:!px-5 md:!py-3 md:text-base md:!tracking-widest">
                Continue <ArrowRight className="h-4 w-4 md:h-5 md:w-5" />
              </Button>
            </div>
          </motion.div>
        )}
        {view === "grid" && count === 0 && (
          <motion.div
            key="empty-bar"
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-0 left-0 right-0 z-40 p-4 bg-white/95 backdrop-blur-md border-t border-slate-100 shadow-lg"
          >
            <div className="max-w-7xl mx-auto flex items-center gap-4">
              <div className="flex-1">
                {count > 0 ? (
                  <div>
                    <p className="font-bold text-slate-900 text-sm">
                      {count} item{count > 1 ? "s" : ""} selected
                      {exchangeCount > 0 && ` · ${exchangeCount} exchange`}
                      {returnCount > 0 && ` · ${returnCount} return`}
                    </p>
                    {exchangeCount > 0 && (
                      <p className="text-xs text-slate-500">Save ~{money(exchangeBonus)} with exchange bonus</p>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 sm:text-sm">Select items to continue</p>
                )}
              </div>
              <Button
                variant="primary"
                size="md"
                disabled={!canContinue}
                onClick={handleContinue}
                icon={<ArrowRight className="w-5 h-5" />}
                className="flex-shrink-0"
              >
                Continue
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {trackingOpen && (
        <ShipmentJourneySheet isOpen={trackingOpen} onClose={() => setTrackingOpen(false)} product={trackedProduct} />
      )}
    </div>
  );
}
