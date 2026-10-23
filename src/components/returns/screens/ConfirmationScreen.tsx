"use client";

import { useState } from "react";
import { Check, CircleCheck, CreditCard, Gift, MapPin, Package, Printer, RefreshCw, Truck, Wallet } from "lucide-react";
import { usePortal } from "../PortalContext";
import { Button, ProductImage } from "../ui";
import { NpsWidget } from "../NpsWidget";
import type { ReturnData, SelectedItem } from "@/lib/returns/types";

function variantText(v: SelectedItem["exchangeVariant"]): string {
  return v ? [v.color, v.size].filter(Boolean).join(", ") : "";
}

function ItemCard({ item, onTrack, onLabel }: { item: SelectedItem; onTrack: () => void; onLabel: () => void }) {
  const { items } = usePortal();
  const product = items.find((i) => i.id === item.id);
  const title = product?.title ?? "Item";
  const variant = variantText(item.exchangeVariant) || item.exchangeProduct?.variant || "Original Variant";
  return (
    <div className="mb-4 overflow-hidden rounded-[4px] border border-slate-200 bg-white shadow-sm">
      <div className="flex gap-4 p-4">
        <div className="h-24 w-20 flex-shrink-0 overflow-hidden rounded-[4px] border border-slate-100 bg-slate-50">
          <ProductImage src={product?.image} alt={title} className="h-full w-full object-cover" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between">
            <div>
              <div className="mb-1 flex items-center gap-2">
                {item.isExchange ? (
                  <span className="inline-flex items-center gap-1 rounded-[4px] border border-[var(--portal-primary)]/10 bg-[var(--portal-primary)]/5 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[var(--portal-primary)]">
                    <RefreshCw className="h-3 w-3" /> Exchange
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-[4px] border border-slate-200 bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-600">
                    <Package className="h-3 w-3" /> Return
                  </span>
                )}
              </div>
              <h4 className="mb-0.5 font-serif font-bold text-slate-900">{title}</h4>
              <p className="mb-2 text-xs text-slate-500">{variant}</p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs text-slate-500">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--portal-primary)]" />
            {item.isExchange ? "Processing Exchange" : "Refund Initiated"}
          </div>
        </div>
      </div>
      <div className="flex gap-3 border-t border-slate-100 bg-slate-50 px-4 py-3">
        <Button
          variant="outline"
          size="sm"
          fullWidth
          className="h-9 rounded-[4px] bg-white text-xs text-slate-600 hover:!border-[var(--portal-primary)] hover:!text-[var(--portal-primary)]"
          style={{ borderColor: "#e2e8f0", color: "#475569" }}
          icon={<Truck className="h-3.5 w-3.5" />}
          onClick={onTrack}
        >
          Track
        </Button>
        <Button
          variant="primary"
          size="sm"
          fullWidth
          className="h-9 rounded-[4px] border-transparent text-xs text-white hover:brightness-90"
          icon={<Printer className="h-3.5 w-3.5" />}
          onClick={onLabel}
        >
          Get Label
        </Button>
      </div>
    </div>
  );
}

function VisaBadge() {
  return (
    <div className="flex h-7 w-10 flex-shrink-0 items-center justify-center rounded-[4px] border border-slate-200 bg-slate-100">
      <span className="text-[9px] font-black italic tracking-tighter text-[#1A1F71]">VISA</span>
    </div>
  );
}

const NEXT_STEPS = [
  { bold: "Download your labels", rest: " for each package from the buttons above." },
  { bold: "Pack items securely", rest: " using the original packaging if possible." },
  { bold: "Drop off within 7 days", rest: " to complete your return." },
];

export function ConfirmationScreen({
  returnData,
  onDone,
  onShowReturnLabel,
  onTrackOrder,
}: {
  returnData: ReturnData;
  onDone: () => void;
  onShowReturnLabel: () => void;
  onTrackOrder: () => void;
}) {
  const { name, locale, items } = usePortal();
  const [reference] = useState(() => {
    const prefix = name.replace(/[^a-z0-9]/gi, "").slice(0, 2).toUpperCase() || "RT";
    return `RET-${prefix}-${new Date().getFullYear()}-${Math.floor(Math.random() * 9000 + 1000)}`;
  });
  const returns = returnData.selectedItems.filter((i) => !i.isExchange);
  const exchanges = returnData.selectedItems.filter((i) => i.isExchange);
  const hasExchange = exchanges.length > 0;
  // Only charge a difference when an exchange is for something pricier.
  const owesDifference = exchanges.some(
    (e) => (e.exchangeProduct?.price ?? 0) > (items.find((i) => i.id === e.id)?.price ?? Infinity)
  );
  const dropOff =
    locale.dropOffs.find((d) => d.id === returnData.dropOffLocation)?.name ||
    returnData.dropOffLocation ||
    locale.dropOffs[0]?.name ||
    `${locale.carrier} Office`;

  return (
    <div className="relative flex min-h-screen flex-col items-center bg-background px-5 pb-12 pt-20 font-sans">
      <div className="w-full max-w-xl animate-fade-in space-y-8">
        <div className="space-y-4 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-[var(--portal-primary)]/10 bg-[var(--portal-primary)]/5 shadow-sm">
            <Check className="h-10 w-10 text-[var(--portal-primary)]" strokeWidth={3} />
          </div>
          <div>
            <h1 className="mb-2 font-serif text-3xl font-bold text-slate-900">Request confirmed</h1>
            <p className="font-medium text-slate-500">
              Reference: <span className="font-bold text-[var(--portal-primary)]">{reference}</span>
            </p>
          </div>
        </div>

        <div className="mx-auto w-fit">
          <NpsWidget />
        </div>

        {returns.length > 0 && (
          <div className="space-y-4">
            <h3 className="border-b border-slate-100 pb-2 font-serif text-lg font-bold text-slate-900">Track Your Return</h3>
            {returns.map((item) => (
              <ItemCard key={item.id} item={item} onTrack={onTrackOrder} onLabel={onShowReturnLabel} />
            ))}
          </div>
        )}
        {exchanges.length > 0 && (
          <div className="space-y-4">
            <h3 className="border-b border-slate-100 pb-2 font-serif text-lg font-bold text-slate-900">Track Your Exchange</h3>
            {exchanges.map((item) => (
              <ItemCard key={item.id} item={item} onTrack={onTrackOrder} onLabel={onShowReturnLabel} />
            ))}
          </div>
        )}

        <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-2">
          <div className="flex h-full flex-col space-y-3 rounded-[4px] border border-slate-200 bg-white p-5">
            <h3 className="flex items-center gap-2 font-serif text-lg font-bold text-slate-900">
              <MapPin className="h-4 w-4 text-[var(--portal-primary)]" />
              Drop-off Location
            </h3>
            <div className="flex flex-1 flex-col justify-center">
              {returnData.shippingMethod === "drop-off" ? (
                <div>
                  <p className="mb-1 font-serif text-lg font-bold text-slate-900">{dropOff}</p>
                  <p className="text-sm leading-snug text-slate-500">
                    Show the QR code in your email at the counter. No label needed.
                  </p>
                </div>
              ) : (
                <div>
                  <p className="mb-1 font-serif text-lg font-bold text-slate-900">Self-Ship</p>
                  <p className="text-sm leading-snug text-slate-500">
                    Use the prepaid label sent to your email to ship from any carrier location.
                  </p>
                </div>
              )}
            </div>
          </div>

          {returns.length > 0 && (
          <div className="flex h-full flex-col space-y-3 rounded-[4px] border border-slate-200 bg-white p-5">
            <h3 className="flex items-center gap-2 font-serif text-lg font-bold text-slate-900">
              <Wallet className="h-4 w-4 text-[var(--portal-primary)]" />
              Refund Mode
            </h3>
            <div className="flex flex-1 items-center">
              <div className="flex w-full items-center gap-3">
                {returnData.paymentMethod === "store-credit" ? (
                  <>
                    <div className="flex h-7 w-10 flex-shrink-0 items-center justify-center rounded-[4px] bg-[var(--portal-primary)]/10">
                      <Wallet className="h-4 w-4 text-[var(--portal-primary)]" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">Store Credit</p>
                      <p className="text-xs text-slate-500">Instant refund + 10% bonus</p>
                    </div>
                  </>
                ) : returnData.paymentMethod === "gift-card" ? (
                  <>
                    <div className="flex h-7 w-10 flex-shrink-0 items-center justify-center rounded-[4px] bg-[var(--portal-primary)]/10">
                      <Gift className="h-4 w-4 text-[var(--portal-primary)]" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">Gift Card</p>
                      <p className="text-xs text-slate-500">Sent to your email</p>
                    </div>
                  </>
                ) : (
                  <>
                    <VisaBadge />
                    <div>
                      <p className="font-bold text-slate-900">Original Payment</p>
                      <p className="text-xs text-slate-500">Visa ending in 4242</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
          )}

          {owesDifference && (
            <div className="flex h-full flex-col space-y-3 rounded-[4px] border border-slate-200 bg-white p-5 md:col-span-2">
              <h3 className="flex items-center gap-2 font-serif text-lg font-bold text-slate-900">
                <CreditCard className="h-4 w-4 text-[var(--portal-primary)]" />
                Payment Mode
              </h3>
              <div className="flex flex-1 items-center">
                <div className="flex items-center gap-3">
                  <VisaBadge />
                  <div>
                    <p className="font-bold text-slate-900">Visa **** 4242</p>
                    <p className="text-xs text-slate-500">Charged for exchange difference</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="rounded-[4px] border border-[var(--portal-primary)]/10 bg-[var(--portal-primary)]/5 p-5">
          <div className="mb-4 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--portal-primary)]">
              <CircleCheck className="h-4 w-4 text-white" />
            </div>
            <h3 className="font-serif text-lg font-bold text-slate-900">Next Steps</h3>
          </div>
          <div className="space-y-3">
            {NEXT_STEPS.map((s) => (
              <div key={s.bold} className="flex items-start gap-3">
                <div className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[var(--portal-primary)]" />
                <p className="text-sm leading-relaxed text-slate-700">
                  <span className="font-bold text-slate-900">{s.bold}</span>
                  {s.rest}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 hidden lg:block">
          <Button
            variant="primary"
            fullWidth
            size="lg"
            onClick={onDone}
            className="h-12 rounded-[4px] text-sm font-bold uppercase tracking-widest text-white shadow-none hover:brightness-90"
          >
            Back to Account
          </Button>
        </div>
        <div className="h-20 lg:h-0" />
      </div>

      <div className="safe-area-bottom fixed bottom-0 left-0 right-0 z-20 border-t border-slate-100 bg-white p-4 lg:hidden">
        <div className="mx-auto max-w-xl">
          <Button
            variant="primary"
            fullWidth
            size="lg"
            onClick={onDone}
            className="h-12 rounded-[4px] text-sm font-bold uppercase tracking-widest text-white shadow-lg hover:brightness-90"
          >
            Back to Account
          </Button>
        </div>
      </div>
    </div>
  );
}
