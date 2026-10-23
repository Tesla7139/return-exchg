"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronUp,
  Clock,
  FileText,
  Mail,
  MapPin,
  Package,
  Phone,
  Plus,
  Star,
  Truck,
  X,
} from "lucide-react";
import { usePortal } from "../PortalContext";
import { BrandLogo, ProductImage } from "../ui";
import { OrderDetailsSheet } from "./OrderDetailsSheet";
import type { ReturnData } from "@/lib/returns/types";

const MAP_IMAGE = "https://images.unsplash.com/photo-1569336415962-a4bd9f69cd83?auto=format&fit=crop&q=80&w=300";

type IconProps = { className?: string };
const svgProps = {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};
function Facebook({ className }: IconProps) {
  return (
    <svg {...svgProps} className={className}>
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}
function Twitter({ className }: IconProps) {
  return (
    <svg {...svgProps} className={className}>
      <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
    </svg>
  );
}
function Instagram({ className }: IconProps) {
  return (
    <svg {...svgProps} className={className}>
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function fmt(daysFromNow: number, opts: Intl.DateTimeFormatOptions): string {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d.toLocaleDateString("en-US", opts);
}

/* ------------------------------ Shipment journey sheet ------------------------------ */

function JourneyStep({ title, date, isPending = false }: { title: string; date?: string; isPending?: boolean }) {
  return (
    <div className="relative pl-10">
      <div className="absolute left-0 top-0 z-10">
        {isPending ? (
          <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-slate-200 bg-white ring-4 ring-white">
            <div className="h-2.5 w-2.5 rounded-full bg-slate-200" />
          </div>
        ) : (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--portal-primary)] ring-4 ring-white">
            <Check className="h-4 w-4 text-white" strokeWidth={3} />
          </div>
        )}
      </div>
      <div className={`pt-1.5 ${isPending ? "opacity-50" : ""}`}>
        <h3 className={`font-serif text-base font-bold ${isPending ? "text-slate-400" : "text-slate-900"}`}>{title}</h3>
        {date && <p className="mt-1 text-xs text-slate-500">{date}</p>}
      </div>
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 text-slate-400">{icon}</div>
      <div className="flex-1">
        <div className="mb-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</div>
        <div className="text-sm font-medium text-slate-900">{value}</div>
      </div>
    </div>
  );
}

function ShipmentJourneySheet({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { primary, locale, name } = usePortal();
  const [detailed, setDetailed] = useState(true);
  const city = locale.city;
  const placed = fmt(-2, { weekday: "short", day: "numeric", month: "short" });
  const transit = fmt(-1, { weekday: "short", day: "numeric", month: "short" });
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 flex max-h-[85vh] flex-col overflow-hidden rounded-t-[24px] bg-white shadow-2xl md:mx-auto md:max-w-md"
          >
            <div className="flex w-full cursor-grab justify-center pb-2 pt-3 active:cursor-grabbing" onClick={onClose}>
              <div className="h-1.5 w-12 rounded-full bg-slate-200" />
            </div>
            <div className="flex items-center justify-between border-b border-slate-100 px-6 pb-4">
              <h2 className="font-serif text-xl font-bold text-slate-900">Shipment Journey</h2>
              <button
                onClick={onClose}
                className="-mr-2 rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="overflow-y-auto p-6 pb-12">
              <div className="relative">
                <div className="absolute bottom-2 left-[15px] top-2 w-0.5 bg-slate-100" />
                <div className="relative space-y-8">
                  <JourneyStep title="Return Initiated" date={`${city}, ${placed}, 4:00 PM`} />
                  <JourneyStep title="Picked Up" date={`${city}, ${placed}, 5:00 PM`} />
                  <div className="relative pl-10">
                    <div className="absolute left-0 top-0 z-10">
                      <div
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--portal-primary)] shadow-lg ring-4 ring-white"
                        style={{ boxShadow: `0 10px 15px -3px ${primary}33` }}
                      >
                        <Check className="h-4 w-4 text-white" strokeWidth={3} />
                      </div>
                    </div>
                    <div className="pt-1">
                      <div className="mb-1 flex items-start justify-between">
                        <h3 className="font-serif text-base font-bold text-slate-900">In Transit</h3>
                        <span className="rounded-[4px] bg-[var(--portal-primary)]/10 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[var(--portal-primary)]">
                          Current
                        </span>
                      </div>
                      <p className="mb-4 text-xs text-slate-500">
                        {locale.carrier} {city} Hub, {transit}, 8:00 PM
                      </p>
                      {detailed && (
                        <>
                          <div className="space-y-3 rounded-[4px] border border-slate-100 bg-slate-50 p-4">
                            <InfoRow icon={<MapPin className="h-3.5 w-3.5" />} label="Location" value={city} />
                            <InfoRow icon={<Clock className="h-3.5 w-3.5" />} label="Time" value={`${transit}, 8:00 PM`} />
                            <InfoRow
                              icon={<FileText className="h-3.5 w-3.5" />}
                              label="Remarks"
                              value={`Received at ${city} Hub`}
                            />
                          </div>
                          <div className="mt-3 space-y-3 rounded-[4px] border border-slate-100 bg-slate-50 p-4 opacity-60">
                            <InfoRow icon={<MapPin className="h-3.5 w-3.5" />} label="Location" value={city} />
                            <InfoRow icon={<Clock className="h-3.5 w-3.5" />} label="Time" value="2:00 PM" />
                            <InfoRow
                              icon={<FileText className="h-3.5 w-3.5" />}
                              label="Remarks"
                              value={`Scanned at ${locale.carrier} facility`}
                            />
                          </div>
                        </>
                      )}
                      <button
                        onClick={() => setDetailed((v) => !v)}
                        className="mt-4 flex items-center gap-2 text-xs font-bold text-[var(--portal-primary)] hover:underline"
                      >
                        <span className="uppercase tracking-wider">
                          {detailed ? "Close Detailed Journey" : "View Detailed Journey"}
                        </span>
                        {detailed ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                      </button>
                    </div>
                  </div>
                  <JourneyStep title="Out For Delivery" isPending />
                  <JourneyStep title={`Delivered to ${name}`} isPending />
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/* ------------------------------ Screen ------------------------------ */

export function TrackingScreen({ onBack, returnData }: { onBack: () => void; returnData: ReturnData }) {
  const { primary, accent, bg, name, items, recommendations, content, locale, money, supportEmail, orderId } =
    usePortal();
  const [journeyOpen, setJourneyOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const hasExchange = returnData.selectedItems.some((i) => i.isExchange);
  const eta = fmt(hasExchange ? 6 : 2, { weekday: "short", month: "short", day: "numeric" });
  const status = hasExchange ? "On the Way" : "In Transit";
  const lastUpdate = `${fmt(-1, { weekday: "short", day: "numeric", month: "short" })}, 12 PM`;
  const selected = returnData.selectedItems;

  const returning = items.find((i) => i.id === selected[0]?.id) ?? items[0];
  const suggestion = recommendations[0];
  const explore = recommendations.slice(0, 4);
  const plural = content.nounPlural.charAt(0).toUpperCase() + content.nounPlural.slice(1);
  const tint = { backgroundColor: `${primary}15`, color: primary };

  return (
    <div className="relative flex min-h-screen flex-col pb-0 font-sans" style={{ backgroundColor: bg }}>
      <div className="absolute left-0 right-0 top-0 z-20 flex items-center justify-between px-4 py-3">
        <button
          onClick={onBack}
          className="inline-flex size-9 shrink-0 items-center justify-center rounded-[4px] text-white transition-all hover:bg-white/20 hover:text-white"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <BrandLogo height={24} light />
        <div className="w-10" />
      </div>

      <div className="flex-1 overflow-y-auto pb-0">
        <div
          className="relative rounded-b-[24px] px-6 pb-32 pt-24 shadow-lg"
          style={{
            background: `linear-gradient(to bottom, ${primary}, color-mix(in srgb, ${primary} 85%, white), ${primary})`,
          }}
        >
          <div className="flex flex-col items-center space-y-6 text-center">
            <div className="flex items-center gap-4">
              <div className="-rotate-3 transform rounded-[4px] bg-white p-2 shadow-sm">
                <div className="h-24 w-16 overflow-hidden rounded-[4px]">
                  <ProductImage src={returning?.image} alt={returning?.title ?? "Returning"} className="h-full w-full object-cover" />
                </div>
              </div>
              <div className="text-white/80">
                <Plus className="h-6 w-6" strokeWidth={3} />
              </div>
              <div className="relative rotate-3 transform rounded-[4px] bg-white p-2 shadow-sm">
                <div
                  className="absolute -top-3 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-full px-2 py-0.5 text-[10px] font-bold text-white shadow-sm"
                  style={{ backgroundColor: accent }}
                >
                  You may love
                </div>
                <div className="h-24 w-16 overflow-hidden rounded-[4px]">
                  <ProductImage src={suggestion?.image} alt={suggestion?.title ?? "Suggestion"} className="h-full w-full object-cover" />
                </div>
              </div>
            </div>
            {suggestion && (
              <>
                <div className="space-y-2">
                  <h2 className="font-serif text-xl font-bold !text-white">{suggestion.title}</h2>
                  <div className="mx-auto flex max-w-xs items-start gap-2 rounded-[4px] border border-white/20 bg-white/10 p-3 text-left backdrop-blur-md">
                    <Star className="mt-0.5 h-4 w-4 flex-shrink-0 text-yellow-300" fill="currentColor" />
                    <p className="text-xs leading-relaxed text-white">
                      <span className="font-bold">You might love this:</span> A favourite that pairs beautifully with your{" "}
                      {hasExchange ? "exchange selection" : "order"}.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4 rounded-[4px] border border-white/10 bg-white/10 px-4 py-2 backdrop-blur-sm">
                  <button
                    className="inline-flex h-8 items-center justify-center rounded-[4px] bg-white px-4 text-xs font-bold transition-all"
                    style={{ color: primary }}
                  >
                    Add to Cart
                  </button>
                  <span className="text-sm font-bold text-white">{money(suggestion.price)}</span>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="relative z-10 -mt-24 mb-8 px-5">
          <div className="space-y-6 rounded-[24px] bg-white p-6 shadow-xl">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[4px]" style={tint}>
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <div className="mb-1 text-xs font-medium text-slate-500">Estimated Delivery</div>
                <div className="font-serif text-xl font-bold" style={{ color: primary }}>
                  {eta}
                </div>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[4px]" style={tint}>
                <Truck className="h-5 w-5" />
              </div>
              <div>
                <div className="mb-1 text-xs font-medium text-slate-500">Current Status</div>
                <div className="font-serif text-xl font-bold" style={{ color: primary }}>
                  {status}
                </div>
              </div>
              <div className="relative ml-auto h-16 w-24 overflow-hidden rounded-[4px] border border-slate-200 bg-slate-100">
                {/* eslint-disable-next-line @next/next/no-img-element -- static map thumbnail */}
                <img src={MAP_IMAGE} className="h-full w-full object-cover opacity-80" alt="Map" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-2 w-2 animate-ping rounded-full" style={{ backgroundColor: primary }} />
                </div>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[4px]" style={tint}>
                <MapPin className="h-5 w-5" />
              </div>
              <div>
                <div className="mb-1 text-xs font-medium text-slate-500">Latest Update</div>
                <div className="font-serif text-xl font-bold" style={{ color: primary }}>
                  {locale.city}
                </div>
                <div className="mt-1 text-xs text-slate-400">{lastUpdate}</div>
              </div>
            </div>
            <div className="space-y-3 pt-2">
              <button
                onClick={() => setJourneyOpen(true)}
                className="h-12 w-full rounded-[16px] text-sm font-bold uppercase tracking-widest text-white shadow-lg transition-all hover:opacity-90"
                style={{ background: `linear-gradient(135deg, ${primary}, ${accent})` }}
              >
                Track Package
              </button>
              <button
                onClick={() => setDetailsOpen(true)}
                className="h-12 w-full rounded-[16px] border-2 border-slate-200 text-sm font-bold uppercase tracking-widest text-slate-600 hover:bg-slate-50"
              >
                Order Details
              </button>
            </div>
          </div>
        </div>

        <ShipmentJourneySheet isOpen={journeyOpen} onClose={() => setJourneyOpen(false)} />
        <OrderDetailsSheet
          isOpen={detailsOpen}
          onClose={() => setDetailsOpen(false)}
          orderId={returnData.orderData?.orderId || orderId}
        />

        {selected.length > 0 && (
          <div className="mb-8 px-5">
            <div className="mb-4 flex items-center gap-2">
              <Package className="h-5 w-5" style={{ color: primary }} />
              <h3 className="font-serif text-lg font-bold text-slate-900">My Order Items ({selected.length})</h3>
            </div>
            <div className="-mx-5 flex gap-4 overflow-x-auto px-5 pb-4">
              {selected.map((s, idx) => {
                const item = items.find((i) => i.id === s.id);
                const title = item?.title ?? "Item";
                return (
                  <div
                    key={`${s.id}-${idx}`}
                    className="flex min-w-[280px] items-start gap-3 rounded-[4px] border border-slate-100 bg-white p-3 shadow-sm"
                  >
                    <div className="h-24 w-20 shrink-0 overflow-hidden rounded-[4px] bg-slate-50">
                      <ProductImage src={item?.image} alt={title} className="h-full w-full object-cover" />
                    </div>
                    <div className="flex h-24 flex-1 flex-col justify-between py-1">
                      <div>
                        <h4 className="mb-1 line-clamp-2 font-serif text-sm font-bold leading-tight text-slate-900">{title}</h4>
                        <span className="rounded-[4px] bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-500">
                          Qty: {s.quantity || 1}
                        </span>
                      </div>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-sm font-bold text-slate-900">{s.isExchange ? "Exchange" : "Return"}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {explore.length > 0 && (
          <div className="mb-12 px-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-serif text-lg font-bold text-slate-900">Explore New {plural}</h3>
              <button className="text-sm font-medium" style={{ color: primary }}>
                View all
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {explore.map((p) => (
                <div key={p.id} className="group overflow-hidden rounded-[4px] border border-slate-100 bg-white shadow-sm">
                  <div className="relative aspect-[4/5] overflow-hidden bg-slate-50">
                    <ProductImage
                      src={p.image}
                      alt={p.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <button className="absolute bottom-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-white text-slate-900 shadow-md transition-colors hover:bg-[var(--portal-primary)] hover:text-white">
                      <Plus className="h-5 w-5" />
                    </button>
                  </div>
                  <div className="p-3">
                    <h4 className="mb-1 line-clamp-2 min-h-[2.5em] font-serif text-sm font-bold leading-tight text-slate-900">
                      {p.title}
                    </h4>
                    <p className="text-sm font-bold" style={{ color: primary }}>
                      {money(p.price)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="border-t border-slate-100 bg-white px-6 pb-12 pt-10">
          <div className="mb-10 grid grid-cols-2 gap-8">
            <div>
              <h4 className="mb-4 font-bold text-slate-900">Policy</h4>
              <ul className="space-y-3 text-sm text-slate-500">
                {["Privacy Policy", "Return Policy", "Refund Policy", "Terms & Conditions"].map((l) => (
                  <li key={l}>
                    <a href="#" className="hover:text-slate-700">
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="mb-4 font-bold text-slate-900">Contact Us</h4>
              <ul className="space-y-3 text-sm text-slate-500">
                <li className="flex items-center gap-2 break-all">
                  <Mail className="h-4 w-4 shrink-0" /> {supportEmail}
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="h-4 w-4" /> +1 (800) 123-4567
                </li>
                <li className="mt-2 text-xs opacity-70">Mon – Fri 9am – 5pm</li>
              </ul>
            </div>
          </div>
          <div className="flex flex-col items-center gap-6">
            <div className="flex gap-4">
              {[Facebook, Twitter, Instagram].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-50 text-slate-600 transition-colors hover:bg-[var(--portal-primary)] hover:text-white"
                >
                  <Icon className="h-5 w-5" />
                </a>
              ))}
            </div>
            <p className="text-xs text-slate-400">
              © {new Date().getFullYear()} {name}. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
