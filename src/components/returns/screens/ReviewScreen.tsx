"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import {
  ArrowRight,
  Check,
  CheckCircle,
  ChevronDown,
  ChevronLeft,
  CreditCard,
  DollarSign,
  Gift,
  MapPin,
  Package,
  RefreshCw,
  Wallet,
} from "lucide-react";
import type { ReturnData } from "@/lib/returns/types";
import { cn } from "@/lib/utils";
import { usePortal } from "../PortalContext";
import { Button, ProductImage } from "../ui";

type SectionId = "returns" | "exchanges" | "shipping" | "refund" | "payment" | "refund-mode";

function Checkbox({ className, ...props }: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "peer size-4 shrink-0 rounded-[4px] border border-slate-300 bg-white shadow-xs transition-shadow outline-none focus-visible:ring-[3px] focus-visible:ring-slate-300/50 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-[color:var(--portal-primary)] data-[state=checked]:border-[color:var(--portal-primary)] data-[state=checked]:text-white",
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="flex items-center justify-center text-current transition-none"
      >
        <Check className="size-3.5" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

function Label({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      data-slot="label"
      className={cn(
        "flex items-center gap-2 text-sm leading-none font-medium select-none peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
}

/** Viewport width, 0 until mounted (so SSR and first paint behave like mobile). */
function useViewportWidth(): number {
  const [w, setW] = useState(0);
  useEffect(() => {
    const update = () => setW(window.innerWidth);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  return w;
}

type Variant = { size?: string; color?: string } | string | undefined;
const formatVariant = (v: Variant) =>
  typeof v === "string" ? v : v ? [v.color, v.size].filter(Boolean).join(", ") : "";

export function ReviewScreen({
  returnData,
  onComplete,
  onBack,
}: {
  returnData: ReturnData;
  onComplete: () => void;
  onBack: () => void;
}) {
  const { items, money, content } = usePortal();
  const width = useViewportWidth();
  const desktop = width >= 1024;

  const [expanded, setExpanded] = useState<Set<SectionId>>(
    new Set(["returns", "exchanges", "shipping", "refund", "payment", "refund-mode"])
  );
  const [submitting, setSubmitting] = useState(false);
  const [shipConfirmed, setShipConfirmed] = useState(false);
  const [policyConfirmed, setPolicyConfirmed] = useState(false);

  const toggle = (id: SectionId) => {
    if (window.innerWidth >= 1280) return;
    const next = new Set(expanded);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setExpanded(next);
  };

  const lines = returnData.selectedItems.map((s) => {
    const item = items.find((i) => i.id === s.id);
    return {
      ...s,
      title: item?.title ?? "",
      image: item?.image ?? null,
      variant: item?.variant,
      price: item?.price ?? 0,
      totalPrice: (item?.price ?? 0) * s.quantity,
    };
  });
  const returns = lines.filter((l) => !l.isExchange);
  const exchanges = lines.filter((l) => l.isExchange);
  const heading = returns.length === 0 ? "Review Exchange" : exchanges.length === 0 ? "Review Return" : "Review Request";
  const returnTotal = returns.reduce((sum, l) => sum + l.totalPrice, 0);
  const toPay = exchanges.reduce((sum, l) => {
    const diff = (l.exchangeProduct?.price ?? l.price) - l.price;
    return sum + (diff > 0 ? diff : 0);
  }, 0);
  const exchangeRefund = exchanges.reduce((sum, l) => {
    const diff = l.price - (l.exchangeProduct?.price ?? l.price);
    return sum + (diff > 0 ? diff : 0);
  }, 0);
  const refundTotal = returnTotal + exchangeRefund;

  const reasonLabel = (r?: string) => {
    if (!r) return "";
    const all = [...content.reasons, ...Object.values(content.subReasons).flat()];
    return all.find((o) => o.value === r)?.label || r;
  };

  const handleSubmit = () => {
    setSubmitting(true);
    setTimeout(() => onComplete(), 1500);
  };

  const canSubmit = shipConfirmed && policyConfirmed;
  const open = (id: SectionId) => expanded.has(id) || desktop;

  const submitClass =
    "rounded-[4px] text-white shadow-lg h-12 text-sm uppercase tracking-widest font-bold hover:brightness-90 disabled:bg-slate-300 disabled:cursor-not-allowed";
  const submitStyle = canSubmit ? undefined : { backgroundColor: "#cbd5e1" };

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
        <h2 className="text-slate-900 font-serif font-bold text-xl">{heading}</h2>
        <p className="text-sm text-slate-500 mt-1">Double check everything looks good.</p>
      </div>

      <div className="hidden lg:block pt-6 pb-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors hover:-translate-x-1"
        >
          <ChevronLeft className="w-5 h-5" />
          <span className="font-medium">Back to Shipping</span>
        </button>
      </div>

      <div className="px-5 py-6 space-y-4 lg:px-0 lg:py-0 lg:flex lg:gap-12 lg:items-start">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="lg:flex-1 space-y-6"
        >
          <div className="hidden lg:block mb-2">
            <h2 className="text-3xl font-serif font-bold text-slate-900 tracking-tight">{heading}</h2>
            <p className="text-slate-500 mt-2 text-lg">You&apos;re almost done! Please review your {returns.length === 0 ? "exchange" : exchanges.length === 0 ? "return" : "request"} details.</p>
          </div>

          {returns.length > 0 && (
            <Section
              id="returns"
              icon={<Package className="w-5 h-5" />}
              title="Return Summary"
              subtitle={`${returns.length} item${returns.length === 1 ? "" : "s"} to return`}
              expanded={expanded.has("returns")}
              open={open("returns")}
              onToggle={toggle}
              duration={0.3}
              bodyClassName="border-t border-slate-100 px-5 pb-5 pt-6"
            >
              <div className="space-y-6">
                {returns.map((l) => (
                  <div key={l.id} className="flex gap-4 group">
                    <div className="w-20 h-24 bg-slate-50 rounded-md overflow-hidden flex-shrink-0 border border-slate-100 relative">
                      <ProductImage src={l.image} alt={l.title} className="w-full h-full object-cover" />
                      {l.quantity > 1 && (
                        <div className="absolute top-2 left-2 bg-slate-900/80 text-white text-xs font-bold px-2 py-0.5 rounded-md backdrop-blur-sm">
                          x{l.quantity}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col">
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <h4 className="font-serif font-bold text-slate-900 mb-0.5 line-clamp-1">{l.title}</h4>
                          <p className="text-xs text-slate-500 mb-2">{formatVariant(l.variant)}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-slate-900">{money(l.totalPrice)}</p>
                        </div>
                      </div>
                      <div className="mt-auto flex justify-between items-end border-t border-slate-100 pt-2">
                        <div className="text-xs text-slate-500">
                          <span className="font-medium text-slate-700">Reason:</span> {reasonLabel(l.reason)}
                        </div>
                        <div className="text-xs font-semibold text-[color:var(--portal-primary)]">
                          Refundable: {money(l.totalPrice)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {exchanges.length > 0 && (
            <Section
              id="exchanges"
              icon={<RefreshCw className="w-5 h-5" />}
              iconClassName="bg-[color:var(--portal-primary)]/10 text-[color:var(--portal-primary)]"
              title="Exchange Summary"
              subtitle={`${exchanges.length} item${exchanges.length === 1 ? "" : "s"} to exchange`}
              expanded={expanded.has("exchanges")}
              open={open("exchanges")}
              onToggle={toggle}
              duration={0.3}
              bodyClassName="border-t border-slate-100 px-5 pb-5 pt-6"
            >
              <div className="space-y-8">
                {exchanges.map((l) => {
                  const newPrice = l.exchangeProduct?.price ?? l.price;
                  const diff = newPrice - l.price;
                  const due = Math.max(0, diff);
                  return (
                    <div key={l.id} className="relative pl-4 border-l-2 border-[color:var(--portal-primary)]/20">
                      <div className="flex gap-4 mb-4 opacity-60">
                        <div className="w-12 h-16 bg-slate-50 rounded-md overflow-hidden flex-shrink-0 border border-slate-100">
                          <ProductImage src={l.image} alt={l.title} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Returning</p>
                          <h4 className="font-serif font-bold text-slate-700 text-sm">{l.title}</h4>
                          <p className="text-xs text-slate-500">{formatVariant(l.variant)}</p>
                          <p className="text-xs text-slate-600 mt-1">Original Price: {money(l.price)}</p>
                        </div>
                      </div>
                      <div className="absolute left-[-9px] top-1/2 -translate-y-1/2 bg-white text-[color:var(--portal-primary)] border border-[color:var(--portal-primary)]/20 rounded-full p-1 z-10">
                        <RefreshCw className="w-3 h-3" />
                      </div>
                      <div className="flex gap-4">
                        <div className="w-16 h-20 bg-slate-50 rounded-md overflow-hidden flex-shrink-0 border border-[color:var(--portal-primary)]/30 shadow-sm relative">
                          <ProductImage
                            src={l.exchangeProduct?.image || l.image}
                            alt={l.exchangeProduct?.title || l.title}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 border-2 border-[color:var(--portal-primary)]/20 rounded-md pointer-events-none" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs font-bold text-[color:var(--portal-primary)] uppercase tracking-wide mb-1">
                            Exchange For
                          </p>
                          <h4 className="font-serif font-bold text-slate-900 text-sm">{l.exchangeProduct?.title || l.title}</h4>
                          <p className="text-xs text-slate-600 mb-2">{formatVariant(l.exchangeVariant)}</p>
                          <div className="flex items-center gap-4 text-xs bg-slate-50 p-2 rounded-md">
                            <div>
                              <span className="block text-slate-400">New Price</span>
                              <span className="font-semibold text-slate-900">{money(newPrice)}</span>
                            </div>
                            <div className="w-px h-6 bg-slate-200" />
                            <div>
                              <span className="block text-slate-400">Difference</span>
                              <span
                                className={`font-semibold ${diff > 0 ? "text-[color:var(--portal-primary)]" : "text-green-600"}`}
                              >
                                {diff > 0 ? "+" : diff < 0 ? "−" : ""}
                                {money(Math.abs(diff))}
                              </span>
                            </div>
                            <div className="w-px h-6 bg-slate-200" />
                            <div>
                              <span className="block text-slate-400">To Pay</span>
                              <span className="font-semibold text-slate-900">{money(due)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Section>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="space-y-4 lg:w-[400px] lg:shrink-0"
        >
          <Section
            id="shipping"
            icon={<MapPin className="w-5 h-5" />}
            title="Drop-off Location"
            subtitle={returnData.shippingMethod === "drop-off" ? "Selected Location" : "Self-shipping"}
            expanded={expanded.has("shipping")}
            open={open("shipping")}
            onToggle={toggle}
            bodyClassName="border-t border-slate-100 px-5 pb-5 pt-4"
          >
            {returnData.shippingMethod === "drop-off" ? (
              <div>
                <p className="font-semibold text-slate-900 mb-1">{returnData.dropOffLocation}</p>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[color:var(--portal-primary)]/10 text-[color:var(--portal-primary)] rounded-md text-xs font-semibold uppercase tracking-wide mt-2">
                  <CheckCircle className="w-3.5 h-3.5" /> Free Shipping
                </div>
              </div>
            ) : (
              <div>
                <p className="font-semibold text-slate-900 mb-1">Self-ship with prepaid label</p>
                <p className="text-sm text-slate-600 mb-3">A prepaid shipping label will be sent to your email.</p>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[color:var(--portal-primary)]/10 text-[color:var(--portal-primary)] rounded-md text-xs font-semibold uppercase tracking-wide">
                  <CheckCircle className="w-3.5 h-3.5" /> Free Shipping
                </div>
              </div>
            )}
          </Section>

          {returns.length > 0 && (
          <Section
            id="refund-mode"
            icon={<Wallet className="w-5 h-5" />}
            title="Refund Mode"
            subtitle="Method of refund"
            expanded={expanded.has("refund-mode")}
            open={open("refund-mode")}
            onToggle={toggle}
            bodyClassName="border-t border-slate-100 px-5 pb-5 pt-4"
          >
            {returnData.paymentMethod === "store-credit" && (
              <div className="flex items-center gap-3">
                <div className="w-10 h-7 bg-[color:var(--portal-primary)]/10 rounded-[4px] flex items-center justify-center flex-shrink-0">
                  <Wallet className="w-4 h-4 text-[color:var(--portal-primary)]" />
                </div>
                <div>
                  <p className="font-bold text-slate-900 text-sm">Store Credit</p>
                  <p className="text-xs text-[color:var(--portal-primary)] font-medium">+10% Bonus Applied</p>
                </div>
              </div>
            )}
            {returnData.paymentMethod === "credit-card" && (
              <div className="flex items-center gap-3">
                <VisaBadge />
                <div>
                  <p className="font-bold text-slate-900 text-sm">Original Payment</p>
                  <p className="text-xs text-slate-500">Visa ending in 4242</p>
                </div>
              </div>
            )}
            {returnData.paymentMethod === "gift-card" && (
              <div className="flex items-center gap-3">
                <div className="w-10 h-7 bg-[color:var(--portal-primary)]/10 rounded-[4px] flex items-center justify-center flex-shrink-0">
                  <Gift className="w-4 h-4 text-[color:var(--portal-primary)]" />
                </div>
                <div>
                  <p className="font-bold text-slate-900 text-sm">Gift Card</p>
                  <p className="text-xs text-slate-500">Sent to email</p>
                </div>
              </div>
            )}
          </Section>
          )}

          {toPay > 0 && (
            <Section
              id="payment"
              icon={<CreditCard className="w-5 h-5" />}
              title="Payment Mode"
              subtitle="For exchange difference"
              expanded={expanded.has("payment")}
              open={open("payment")}
              onToggle={toggle}
              bodyClassName="border-t border-slate-100 px-5 pb-5 pt-4"
            >
              <div className="flex items-center gap-3">
                <VisaBadge />
                <div>
                  <p className="font-bold text-slate-900 text-sm">Visa **** 4242</p>
                  <p className="text-xs text-slate-500">Charged for difference</p>
                </div>
              </div>
            </Section>
          )}

          <Section
            id="refund"
            icon={<DollarSign className="w-5 h-5" />}
            title="Total"
            subtitle="Summary"
            expanded={expanded.has("refund")}
            open={open("refund")}
            onToggle={toggle}
            bodyClassName="border-t border-slate-100 px-5 pb-5 pt-4"
          >
            <div className="space-y-3">
              {returns.length > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">Total Refund</span>
                  <span className="font-medium text-slate-900">{money(refundTotal)}</span>
                </div>
              )}
              {toPay > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">Total To Pay</span>
                  <span className="font-medium text-[color:var(--portal-primary)]">{money(toPay)}</span>
                </div>
              )}
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">Shipping Fee</span>
                <span className="text-[color:var(--portal-primary)] font-medium">Waived</span>
              </div>
              {refundTotal > 0 && (
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="font-bold text-slate-900">Refund Amount</span>
                  <span className="text-xl font-bold text-green-600">{money(refundTotal)}</span>
                </div>
              )}
              {toPay > 0 && (
                <div className={`pt-3 ${refundTotal > 0 ? "" : "border-t border-slate-100"} flex items-center justify-between`}>
                  <span className="font-bold text-slate-900">Amount To Pay</span>
                  <span className="text-xl font-bold text-[color:var(--portal-primary)]">{money(toPay)}</span>
                </div>
              )}
            </div>
          </Section>

          <div className="bg-white rounded-[4px] shadow-sm border border-slate-200 overflow-hidden p-5">
            <h3 className="font-serif font-bold text-slate-900 mb-3 border-b border-slate-100 pb-2">Review Policy</h3>
            <div className="bg-slate-50 p-4 rounded-[4px] text-sm text-slate-600 leading-relaxed mb-4">
              We will hold your return/exchange order for 14 days. If we don&apos;t receive your package within that time, your
              return/exchange order will be canceled. Since there can be transit delays, we recommend you ship your
              return/exchange package immediately. If your return/exchange is canceled, you&apos;ll receive a cancelation email.
            </div>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Checkbox
                  id="ship-confirm"
                  checked={shipConfirmed}
                  onCheckedChange={(v) => setShipConfirmed(v === true)}
                  className="mt-0.5"
                />
                <Label htmlFor="ship-confirm" className="text-sm font-medium text-slate-700 leading-snug cursor-pointer">
                  Yes, I will ship the original items that I am returning/exchanging within 14 days.
                </Label>
              </div>
              <div className="flex items-start gap-3">
                <Checkbox
                  id="policy-confirm"
                  checked={policyConfirmed}
                  onCheckedChange={(v) => setPolicyConfirmed(v === true)}
                  className="mt-0.5"
                />
                <Label htmlFor="policy-confirm" className="text-sm font-medium text-slate-700 leading-snug cursor-pointer">
                  Yes, I agree to the returns &amp; exchanges policy for this order.
                </Label>
              </div>
            </div>
          </div>

          <div className="hidden lg:block pt-2">
            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={handleSubmit}
              isLoading={submitting}
              disabled={!canSubmit}
              icon={<ArrowRight className="w-5 h-5" />}
              className={submitClass}
              style={submitStyle}
            >
              {toPay > 0 ? "Proceed to payment" : "Continue"}
            </Button>
          </div>
        </motion.div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-100 lg:hidden z-20 safe-area-bottom">
        <div className="max-w-xl mx-auto">
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={handleSubmit}
            isLoading={submitting}
            disabled={!canSubmit}
            className={submitClass}
            style={submitStyle}
          >
            {toPay > 0 ? "Proceed to payment" : "Continue"}
          </Button>
        </div>
      </div>
      <div className="h-24 lg:h-12" />
    </div>
  );
}

function VisaBadge() {
  return (
    <div className="w-10 h-7 bg-slate-100 rounded-[4px] flex items-center justify-center border border-slate-200 flex-shrink-0">
      <span className="text-[9px] font-black text-[#1A1F71] tracking-tighter italic">VISA</span>
    </div>
  );
}

function Section({
  id,
  icon,
  iconClassName = "bg-slate-100 text-slate-600",
  title,
  subtitle,
  expanded,
  open,
  onToggle,
  duration,
  bodyClassName,
  children,
}: {
  id: SectionId;
  icon: React.ReactNode;
  iconClassName?: string;
  title: string;
  subtitle: string;
  expanded: boolean;
  open: boolean;
  onToggle: (id: SectionId) => void;
  duration?: number;
  bodyClassName: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-[4px] shadow-sm border border-slate-200 overflow-hidden">
      <button
        onClick={() => onToggle(id)}
        className="w-full flex items-center justify-between p-5 hover:bg-slate-50 transition-colors lg:cursor-default lg:hover:bg-white"
      >
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${iconClassName}`}>{icon}</div>
          <div className="text-left">
            <span className="block font-semibold text-slate-900">{title}</span>
            <span className="text-sm text-slate-500">{subtitle}</span>
          </div>
        </div>
        <div className="lg:hidden">
          <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown className="w-5 h-5 text-slate-400" />
          </motion.div>
        </div>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={duration ? { duration } : undefined}
            className="lg:block"
          >
            <div className={bodyClassName}>{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
