"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, ChevronLeft, CircleCheck, Clock, CreditCard, Gift, Info, MapPin, Package, Wallet } from "lucide-react";
import type { PaymentMethod, SelectedItem, ShippingMethod } from "@/lib/returns/types";
import { usePortal } from "../PortalContext";
import { Button, ProductImage } from "../ui";

export function ShippingScreen({
  onComplete,
  onBack,
  refundTotal,
  selectedItems,
}: {
  /** Paid price of the items being returned (exchanges excluded). */
  refundTotal: number;
  /** Decides the copy: a return-only, exchange-only or mixed request. */
  selectedItems: SelectedItem[];
  onComplete: (shippingMethod: ShippingMethod, dropOffLocation: string | undefined, paymentMethod: PaymentMethod) => void;
  onBack: () => void;
}) {
  const { primary, locale, money } = usePortal();
  const exchangeCount = selectedItems.filter((s) => s.isExchange).length;
  const mode: "return" | "exchange" | "mixed" =
    exchangeCount === 0 ? "return" : exchangeCount === selectedItems.length ? "exchange" : "mixed";
  const copy = COPY[mode];
  const dropOffs = locale.dropOffs;

  const [method, setMethod] = useState<"drop-off" | "self-ship">("drop-off");
  const [selectedLocation, setSelectedLocation] = useState(dropOffs[0]?.id ?? "");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("store-credit");
  const [zip, setZip] = useState(locale.postalExample);
  const [editingZip, setEditingZip] = useState(false);
  const [zipDraft, setZipDraft] = useState("");

  const selected = dropOffs.find((l) => l.id === selectedLocation);

  const startEditZip = () => {
    setZipDraft(zip);
    setEditingZip(true);
  };
  const saveZip = () => {
    setZip(zipDraft);
    setEditingZip(false);
  };
  const handleContinue = () => {
    if (method === "drop-off") onComplete(method, selected?.name, paymentMethod);
    else onComplete(method, undefined, paymentMethod);
  };

  const tint = (on: boolean) => (on ? { borderColor: primary } : {});
  const chip =
    "bg-[color:var(--portal-primary)]/10 text-[color:var(--portal-primary)] font-bold rounded-md border border-[color:var(--portal-primary)]/10";
  const radioOuter = (on: boolean) =>
    `mt-3.5 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${on ? "border-[color:var(--portal-primary)] bg-white" : "border-slate-300"}`;
  const iconTile = (on: boolean) =>
    `w-10 h-10 md:w-12 md:h-12 rounded-md flex items-center justify-center flex-shrink-0 transition-colors ${on ? "bg-[color:var(--portal-primary)]/10 text-[color:var(--portal-primary)]" : "bg-slate-100 text-slate-500"}`;
  const cardClass = (on: boolean) =>
    `p-4 md:p-5 rounded-[4px] border-2 cursor-pointer transition-all duration-200 relative overflow-hidden group ${on ? "bg-[color:var(--portal-primary)]/5 shadow-sm" : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"}`;
  const titleClass = (on: boolean) => (on ? "text-[color:var(--portal-primary)]" : "text-slate-900");

  return (
    <div className="min-h-screen lg:min-h-0 bg-transparent font-sans">
      <div className="sticky top-[73px] z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 px-5 py-4 lg:hidden">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-3 transition-colors active:scale-95 origin-left"
        >
          <ChevronLeft className="w-5 h-5" />
          <span className="font-medium">Back</span>
        </button>
        <h2 className="text-slate-900 font-serif font-bold text-xl">{copy.mobileTitle}</h2>
        <p className="text-sm text-slate-500 mt-1">Choose the most convenient option for you.</p>
      </div>

      <div className="hidden lg:block pt-6 pb-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors hover:-translate-x-1"
        >
          <ChevronLeft className="w-5 h-5" />
          <span className="font-medium">Back to Selection</span>
        </button>
      </div>

      {/* One page, two columns on desktop (as in the design): return method | refund preference. */}
      <div className="px-5 py-6 lg:px-0 lg:py-0 grid gap-10 lg:grid-cols-2 lg:gap-16">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-5"
            >
              <div className="hidden lg:block">
                <h2 className="text-2xl lg:text-4xl font-serif font-bold text-slate-900 tracking-tight">{copy.leftTitle}</h2>
                <p className="text-slate-500 mt-2 lg:mt-4 lg:text-lg">{copy.leftSub}</p>
              </div>
              <div className="bg-white rounded-[4px] border border-slate-200 shadow-sm overflow-hidden">
                <div className="bg-slate-100/80 p-1.5 flex gap-1 relative z-0">
                  <MethodTab
                    active={method === "drop-off"}
                    onClick={() => setMethod("drop-off")}
                    icon={MapPin}
                    label="Drop Off"
                    primary={primary}
                  />
                  <MethodTab
                    active={method === "self-ship"}
                    onClick={() => setMethod("self-ship")}
                    icon={Package}
                    label="Self-Ship"
                    primary={primary}
                  />
                </div>

                <div className="pt-5 px-5 pb-5">
                  {method === "drop-off" ? (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25 }}
                      className="space-y-4"
                    >
                      <div className="flex items-start gap-3 mb-2">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: `${primary}18`, color: primary }}
                        >
                          <MapPin className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-serif font-bold text-slate-900 text-lg">Drop off nearby</h3>
                          <p className="text-sm text-slate-500">No printer needed. Just show the QR code.</p>
                        </div>
                      </div>

                          <div className="pt-2 flex flex-col gap-2">
                            <p className="text-sm font-bold text-slate-900 uppercase tracking-wide">Nearby locations</p>
                            {editingZip ? (
                              <div className="flex items-center gap-2 animate-fade-in">
                                <span className="text-slate-500 font-normal text-base whitespace-nowrap">{locale.postalLabel}:</span>
                                <div className="relative flex-1 max-w-[140px]">
                                  <input
                                    type="text"
                                    value={zipDraft}
                                    onChange={(e) => setZipDraft(e.target.value)}
                                    className="w-full text-base font-semibold text-slate-900 border-b-2 focus:outline-none bg-transparent px-1 py-0.5"
                                    style={{ borderColor: primary }}
                                    autoFocus
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter") saveZip();
                                      if (e.key === "Escape") setEditingZip(false);
                                    }}
                                  />
                                </div>
                                <button
                                  onClick={saveZip}
                                  className="p-1.5 rounded-full text-white hover:opacity-80 transition-colors"
                                  style={{ backgroundColor: primary }}
                                >
                                  <CircleCheck className="w-4 h-4" />
                                </button>
                              </div>
                            ) : (
                              <div
                                className="flex items-center gap-2 cursor-pointer hover:underline self-start py-1 rounded-md"
                                style={{ color: primary }}
                                onClick={startEditZip}
                              >
                                <span className="text-slate-500 font-normal text-base">{locale.postalLabel}:</span>
                                <span className="text-base text-slate-900">{zip}</span>
                                <div
                                  className="p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors ml-1"
                                  style={{ color: primary }}
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  >
                                    <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
                                  </svg>
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="space-y-3 mt-3 max-h-[380px] overflow-y-auto pr-2 custom-scrollbar">
                            {dropOffs.map((loc) => {
                              const on = selectedLocation === loc.id;
                              return (
                                <div
                                  key={loc.id}
                                  onClick={() => setSelectedLocation(loc.id)}
                                  className={`p-4 rounded-[4px] border-2 cursor-pointer transition-all duration-200 group ${on ? "bg-[color:var(--portal-primary)]/5" : "border-slate-100 bg-white hover:border-slate-300"}`}
                                  style={tint(on)}
                                >
                                  <div className="flex items-start gap-3">
                                    <div
                                      className={`mt-1 w-5 h-5 rounded-full border-2 flex-shrink-0 transition-colors flex items-center justify-center ${on ? "" : "border-slate-300 bg-white group-hover:border-slate-400"}`}
                                      style={on ? { borderColor: primary, backgroundColor: primary } : {}}
                                    >
                                      {on && <div className="w-2 h-2 rounded-full bg-white" />}
                                    </div>
                                    <div className="flex-1">
                                      <h4 className={`text-base md:text-lg font-medium mb-0.5 ${titleClass(on)}`}>{loc.name}</h4>
                                      <p className="text-sm text-slate-500 mb-2">{loc.address}</p>
                                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 whitespace-nowrap text-xs font-medium text-slate-400">
                                        <span className="flex items-center gap-1">
                                          <MapPin className="w-3 h-3" />
                                          {loc.distance}
                                        </span>
                                        <span className="flex items-center gap-1">
                                          <Clock className="w-3 h-3" />
                                          {loc.hours}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25 }}
                      className="space-y-4"
                    >
                      <div className="flex items-start gap-3 mb-4">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: `${primary}18`, color: primary }}
                        >
                          <Package className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-serif font-bold text-slate-900 text-lg">Ship it yourself</h3>
                          <p className="text-sm text-slate-500">Use our prepaid label or your own courier.</p>
                        </div>
                      </div>
                      <div className="bg-slate-50 rounded-[4px] p-5 border border-slate-100">
                        <h4 className="font-bold text-slate-900 mb-2 text-sm uppercase tracking-wide">Return Address</h4>
                        <div className="bg-white p-4 rounded-[4px] border border-slate-200 shadow-sm">
                          <p className="text-sm text-slate-600 leading-relaxed font-mono">
                            Returns Processing Center
                            <br />
                            1234 Warehouse Drive
                            <br />
                            {`Distribution Park, ${locale.city} ${locale.postalExample}`}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2.5 bg-blue-50 p-3 rounded-lg border border-blue-100 items-start">
                        <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                        <p className="text-xs font-medium text-blue-800 leading-snug">
                          We&apos;ll email you a prepaid label instantly. Just print and attach it to your package!
                        </p>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.08 }}
              className="space-y-5"
            >
              <div className="flex items-center gap-3 lg:hidden">
                <div className="h-px flex-1 bg-slate-200" />
                <span className="rounded-[4px] bg-white px-4 py-1 text-xs font-bold uppercase tracking-widest text-slate-400">
                  {copy.divider}
                </span>
                <div className="h-px flex-1 bg-slate-200" />
              </div>
              <div>
                <h2 className="text-2xl lg:text-4xl font-serif font-bold text-slate-900 tracking-tight">{copy.rightTitle}</h2>
                <p className="hidden text-slate-500 lg:mt-4 lg:block lg:text-lg">{copy.rightSub}</p>
              </div>
              {mode === "exchange" ? (
                <ExchangeSummary selectedItems={selectedItems} />
              ) : (
              <div className="space-y-4">

                {(() => {
                  const on = paymentMethod === "store-credit";
                  return (
                    <div onClick={() => setPaymentMethod("store-credit")} className={cardClass(on)} style={tint(on)}>
                      <div className="flex items-start gap-3 md:gap-4 relative z-10">
                        <div className={radioOuter(on)}>
                          {on && <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: primary }} />}
                        </div>
                        <div className={iconTile(on)}>
                          <Wallet className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className={`font-bold text-base md:text-lg lg:text-xl ${titleClass(on)}`}>Store Credit</h4>
                            <span
                              className="whitespace-nowrap bg-[color:var(--portal-primary)]/10 text-[10px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wide border border-[color:var(--portal-primary)]/20"
                              style={{ color: primary }}
                            >
                              +10% Bonus
                            </span>
                          </div>
                          <p className="text-sm text-slate-500 mb-3 leading-snug">Instant credit plus 10% bonus</p>
                          <div className="flex flex-wrap items-center justify-between gap-y-2 pt-2">
                            <div className="flex items-baseline gap-2">
                              <span className="text-sm text-slate-500">Refund:</span>
                              <span className="text-sm text-slate-400 line-through">{money(refundTotal)}</span>
                            </div>
                            <div className="flex items-baseline gap-1.5 ml-auto">
                              <span className="text-lg font-bold" style={{ color: primary }}>
                                {money(refundTotal * 1.1)}
                              </span>
                              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                                +{money(refundTotal * 0.1).replace(/\.00$/, "")}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {(() => {
                  const on = paymentMethod === "credit-card";
                  return (
                    <div onClick={() => setPaymentMethod("credit-card")} className={cardClass(on)} style={tint(on)}>
                      <div className="flex items-start gap-3 md:gap-4 relative z-10">
                        <div className={radioOuter(on)}>
                          {on && <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: primary }} />}
                        </div>
                        <div className={iconTile(on)}>
                          <CreditCard className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                          <h4 className={`font-bold text-base md:text-lg lg:text-xl mb-1 ${titleClass(on)}`}>Original Payment Method</h4>
                          <p className="text-sm text-slate-500 mb-3 leading-snug">
                            Refund to original payment within 5–7 business days
                          </p>
                          <span className={`inline-block text-xs px-2.5 py-1 ${chip}`} style={{ color: primary }}>
                            Visa •••• 1234
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {(() => {
                  const on = paymentMethod === "gift-card";
                  return (
                    <div onClick={() => setPaymentMethod("gift-card")} className={cardClass(on)} style={tint(on)}>
                      <div className="flex items-start gap-3 md:gap-4 relative z-10">
                        <div
                          className={`mt-3.5 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${on ? "" : "border-slate-300"}`}
                          style={on ? { borderColor: primary, backgroundColor: primary } : {}}
                        >
                          {on && <div className="w-2 h-2 rounded-full bg-white" />}
                        </div>
                        <div className={iconTile(on)}>
                          <Gift className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                          <h4 className={`font-bold text-base md:text-lg lg:text-xl mb-1 ${titleClass(on)}`}>Gift Card</h4>
                          <p className="text-sm text-slate-500 mb-3 leading-snug">Digital gift card via email</p>
                          <div className="flex gap-2">
                            <span className={`text-xs px-2 py-1 ${chip}`} style={{ color: primary }}>
                              Shareable
                            </span>
                            <span className={`text-xs px-2 py-1 ${chip}`} style={{ color: primary }}>
                              No Expiry
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
              )}

              <div className="bg-blue-50 border border-blue-100 rounded-[4px] p-5 flex gap-4 items-start">
                <div className="bg-white p-1.5 rounded-full shadow-sm text-blue-600 mt-0.5">
                  <CircleCheck className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-base text-blue-900 font-medium">{copy.freeTitle}</p>
                  <p className="text-base text-blue-700 mt-0.5">{copy.freeShipping}</p>
                </div>
              </div>

              <div className="pt-4 hidden lg:block">
                <Button variant="primary" size="lg" fullWidth onClick={handleContinue} className="rounded-[4px] text-lg">
                  {copy.cta}
                </Button>
              </div>
            </motion.div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-slate-200 p-4 shadow-lg lg:hidden z-30 safe-area-bottom">
        <div className="max-w-md mx-auto">
          <Button variant="primary" size="lg" fullWidth onClick={handleContinue} className="rounded-[4px]">
            {copy.cta}
          </Button>
        </div>
      </div>
      <div className="h-24 lg:h-12" />
    </div>
  );
}

function MethodTab({
  active,
  onClick,
  icon: Icon,
  label,
  primary,
}: {
  active: boolean;
  onClick: () => void;
  icon: typeof MapPin;
  label: string;
  primary: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 py-2.5 px-4 rounded-[4px] flex items-center justify-center gap-2 font-bold text-sm relative z-10 transition-colors duration-300 ${active ? "text-white" : "text-slate-600 hover:text-slate-900"}`}
    >
      {active && (
        <motion.div
          layoutId="methodTab"
          className="absolute inset-0 rounded-[4px] shadow-md z-[-1]"
          style={{ backgroundColor: primary }}
          transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
        />
      )}
      <Icon className={`w-4 h-4 relative z-10 transition-colors duration-300 ${active ? "text-white" : "text-slate-400"}`} />
      <span className="relative z-10">{label}</span>
    </button>
  );
}

const COPY = {
  return: {
    leftTitle: "Return Method",
    leftSub: "We make returns easy. Choose what works best for you.",
    rightTitle: "Refund Preference",
    rightSub: "Choose how you'd like to receive your refund.",
    freeTitle: "Free Returns",
    freeShipping: "Your return is eligible for free shipping. No hidden fees.",
    cta: "Review Return",
    mobileTitle: "How would you like to return?",
    divider: "Refund Details",
  },
  exchange: {
    leftTitle: "Exchange Method",
    leftSub: "Send your item back — we'll ship the replacement as soon as it's scanned.",
    rightTitle: "Exchange Summary",
    rightSub: "Here's what you're sending back and what you'll get.",
    freeTitle: "Free Exchange Shipping",
    freeShipping: "Both the return and your replacement ship free. No hidden fees.",
    cta: "Review Exchange",
    mobileTitle: "How would you like to send it back?",
    divider: "Exchange Details",
  },
  mixed: {
    leftTitle: "Return & Exchange Method",
    leftSub: "One drop-off covers everything you're sending back.",
    rightTitle: "Refund Preference",
    rightSub: "For the items you're returning. Exchanges ship automatically.",
    freeTitle: "Free Returns & Exchanges",
    freeShipping: "Your request is eligible for free shipping. No hidden fees.",
    cta: "Review Request",
    mobileTitle: "How would you like to send items back?",
    divider: "Refund Details",
  },
} as const;

/** Exchange-only requests: old → new per item, and the price difference, instead of refund options. */
function ExchangeSummary({ selectedItems }: { selectedItems: SelectedItem[] }) {
  const { items, money, primary } = usePortal();
  const rows = selectedItems
    .filter((s) => s.isExchange)
    .map((s) => {
      const item = items.find((i) => i.id === s.id);
      if (!item) return null;
      const target = s.exchangeProduct;
      const newPrice = target?.price ?? item.price;
      const from = [item.variant.size, item.variant.color].filter(Boolean).join(" / ");
      const to = target
        ? target.title
        : [s.exchangeVariant?.size || item.variant.size, s.exchangeVariant?.color || item.variant.color]
            .filter(Boolean)
            .join(" / ");
      return { id: s.id, item, from, to, diff: (newPrice - item.price) * s.quantity };
    })
    .filter((r): r is NonNullable<typeof r> => r !== null);
  const total = rows.reduce((sum, r) => sum + r.diff, 0);

  return (
    <div className="space-y-4">
      {rows.map((r) => (
        <div key={r.id} className="flex items-center gap-4 rounded-[4px] border-2 bg-white p-5" style={{ borderColor: `${primary}33` }}>
          <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-[4px] bg-slate-50">
            <ProductImage src={r.item.image} alt={r.item.title} className="h-full w-full object-cover" />
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="truncate font-bold text-lg text-slate-900">{r.item.title}</h4>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-sm">
              <span className="text-slate-500">{r.from || "Original"}</span>
              <ArrowRight className="h-4 w-4 text-slate-400" />
              <span className="font-semibold" style={{ color: primary }}>
                {r.to || "Same item"}
              </span>
            </div>
          </div>
          <span className={`text-sm font-semibold ${r.diff > 0 ? "text-slate-900" : "text-emerald-600"}`}>
            {r.diff > 0 ? `+${money(r.diff)}` : r.diff < 0 ? `−${money(-r.diff)}` : "No change"}
          </span>
        </div>
      ))}
      <div className="flex items-center justify-between rounded-[4px] border border-slate-200 bg-slate-50 p-5">
        <span className="font-medium text-slate-700">Price difference</span>
        <span className="text-lg font-bold" style={{ color: primary }}>
          {total > 0 ? `${money(total)} to pay` : total < 0 ? `${money(-total)} back as credit` : `Even swap · ${money(0)}`}
        </span>
      </div>
    </div>
  );
}
