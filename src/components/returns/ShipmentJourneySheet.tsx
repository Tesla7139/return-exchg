"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronUp, Clock, FileText, MapPin, X } from "lucide-react";
import type { OrderItem } from "@/lib/returns/order";
import { usePortal } from "./PortalContext";

function parseDate(s: string | undefined): Date | null {
  if (!s) return null;
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d;
}

function at(base: Date, dayOffset: number, hour: number): Date {
  const d = new Date(base);
  d.setDate(d.getDate() + dayOffset);
  d.setHours(hour, 0, 0, 0);
  return d;
}

/** "Thu 13 Dec, 4:00 PM" (or just the time). */
function stamp(d: Date, withDay = true): string {
  const time = d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  if (!withDay) return time;
  const wd = d.toLocaleDateString("en-US", { weekday: "short" });
  const mo = d.toLocaleDateString("en-US", { month: "short" });
  return `${wd} ${d.getDate()} ${mo}, ${time}`;
}

export function ShipmentJourneySheet({
  isOpen,
  onClose,
  product,
}: {
  isOpen: boolean;
  onClose: () => void;
  product: OrderItem | null;
}) {
  const { primary, locale, name } = usePortal();
  const [expanded, setExpanded] = useState(true);

  const journey = useMemo(() => {
    // Shipment starts two days after the item's purchase date, never later than yesterday.
    const purchased = parseDate(product?.purchaseDate);
    const latest = at(new Date(), -1, 16);
    let start = purchased ? at(purchased, 2, 16) : at(new Date(), -2, 16);
    if (start > latest) start = latest;
    const dispatched = at(start, 0, 17);
    const transit = at(start, 1, 20);
    const earlier = at(start, 1, 14);
    return {
      placed: `${name} Warehouse, ${stamp(start)}`,
      dispatched: `${locale.city}, ${stamp(dispatched)}`,
      transitLine: `${locale.city}, ${stamp(transit)}`,
      transitTime: stamp(transit),
      earlierTime: stamp(earlier, false),
    };
  }, [product?.purchaseDate, locale.city, name]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm"
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 bg-white z-50 rounded-t-[24px] shadow-2xl overflow-hidden max-h-[85vh] flex flex-col md:max-w-md md:mx-auto"
          >
            <div className="w-full flex justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing" onClick={onClose}>
              <div className="w-12 h-1.5 bg-slate-200 rounded-full" />
            </div>
            <div className="px-6 pb-4 border-b border-slate-100 flex items-center justify-between">
              <div className="min-w-0">
                <h2 className="font-serif font-bold text-xl text-slate-900">Shipment Journey</h2>
                {product && (
                  <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                    {product.title} · {locale.carrier}
                  </p>
                )}
              </div>
              <button
                onClick={onClose}
                className="p-2 -mr-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-50 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="overflow-y-auto p-6 pb-12">
              <div className="relative">
                <div className="absolute left-[15px] top-2 bottom-2 w-0.5 bg-slate-100" />
                <div className="space-y-8 relative">
                  <JourneyStep title="Order Placed" date={journey.placed} />
                  <JourneyStep title="Dispatched" date={journey.dispatched} />
                  <div className="relative pl-10">
                    <div className="absolute left-0 top-0 z-10">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center shadow-lg ring-4 ring-white"
                        style={{ backgroundColor: primary, boxShadow: `0 10px 15px -3px ${primary}33` }}
                      >
                        <Check className="w-4 h-4 text-white" strokeWidth={3} />
                      </div>
                    </div>
                    <div className="pt-1">
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="font-serif font-bold text-slate-900 text-base">In Transit</h3>
                        <span
                          className="text-[10px] font-bold px-2 py-1 rounded-[4px] uppercase tracking-wider"
                          style={{ color: primary, backgroundColor: `${primary}1a` }}
                        >
                          Current
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mb-4">{journey.transitLine}</p>
                      {expanded && (
                        <>
                          <div className="bg-slate-50 rounded-[4px] p-4 border border-slate-100 space-y-3">
                            <InfoRow icon={<MapPin className="w-3.5 h-3.5" />} label="Location" value={locale.city} />
                            <InfoRow icon={<Clock className="w-3.5 h-3.5" />} label="Time" value={journey.transitTime} />
                            <InfoRow
                              icon={<FileText className="w-3.5 h-3.5" />}
                              label="Remarks"
                              value={`Received at ${locale.city} ${locale.carrier} Hub`}
                            />
                          </div>
                          <div className="mt-3 bg-slate-50 rounded-[4px] p-4 border border-slate-100 space-y-3 opacity-60">
                            <InfoRow icon={<MapPin className="w-3.5 h-3.5" />} label="Location" value={locale.city} />
                            <InfoRow icon={<Clock className="w-3.5 h-3.5" />} label="Time" value={journey.earlierTime} />
                            <InfoRow
                              icon={<FileText className="w-3.5 h-3.5" />}
                              label="Remarks"
                              value={`Received at ${locale.carrier} Sort Facility`}
                            />
                          </div>
                        </>
                      )}
                      <button
                        onClick={() => setExpanded(!expanded)}
                        className="flex items-center gap-2 text-xs font-bold mt-4 hover:underline"
                        style={{ color: primary }}
                      >
                        <span className="uppercase tracking-wider">
                          {expanded ? "Close Detailed Journey" : "View Detailed Journey"}
                        </span>
                        <ChevronUp className={`w-3 h-3 transition-transform ${expanded ? "" : "rotate-180"}`} />
                      </button>
                    </div>
                  </div>
                  <JourneyStep title="Out For Delivery" isPending />
                  <JourneyStep title="Delivered" isPending />
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function JourneyStep({ title, date, isPending = false }: { title: string; date?: string; isPending?: boolean }) {
  const { primary } = usePortal();
  return (
    <div className="relative pl-10">
      <div className="absolute left-0 top-0 z-10">
        {isPending ? (
          <div className="w-8 h-8 rounded-full bg-white border-2 border-slate-200 flex items-center justify-center ring-4 ring-white">
            <div className="w-2.5 h-2.5 rounded-full bg-slate-200" />
          </div>
        ) : (
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center ring-4 ring-white"
            style={{ backgroundColor: primary }}
          >
            <Check className="w-4 h-4 text-white" strokeWidth={3} />
          </div>
        )}
      </div>
      <div className={`pt-1.5 ${isPending ? "opacity-50" : ""}`}>
        <h3 className={`font-serif font-bold text-base ${isPending ? "text-slate-400" : "text-slate-900"}`}>{title}</h3>
        {date && <p className="text-xs text-slate-500 mt-1">{date}</p>}
      </div>
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 text-slate-400">{icon}</div>
      <div className="flex-1">
        <div className="text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-0.5">{label}</div>
        <div className="text-sm font-medium text-slate-900">{value}</div>
      </div>
    </div>
  );
}
