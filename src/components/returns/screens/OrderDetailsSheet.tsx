"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { usePortal } from "../PortalContext";

function shortDate(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" }).replace(/^(\w+)/, "$1,");
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm font-medium text-slate-500">{label}:</span>
      <span className="text-sm font-bold text-slate-900">{value}</span>
    </div>
  );
}

export function OrderDetailsSheet({
  isOpen,
  onClose,
  orderId,
}: {
  isOpen: boolean;
  onClose: () => void;
  orderId?: string;
}) {
  const { locale, orderId: portalOrderId } = usePortal();
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
              <h2 className="font-serif text-xl font-bold text-slate-900">Order Details</h2>
              <button
                onClick={onClose}
                className="-mr-2 rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-6 overflow-y-auto p-6 pb-12">
              <DetailRow label="Order id" value={orderId || portalOrderId} />
              <DetailRow label="Tracking id" value="7578302288971" />
              <DetailRow label="Carrier partner" value={locale.carrier} />
              <div className="border-t border-slate-100" />
              <DetailRow label="Order type" value="Prepaid" />
              <DetailRow label="Order date" value={shortDate(12)} />
              <DetailRow label="Last update on" value={shortDate(11)} />
              <div className="border-t border-slate-100" />
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Shipping Address</h3>
                <p className="text-sm leading-relaxed text-slate-900">
                  Jane Doe
                  <br />
                  123 Main Street, Apt 4B
                  <br />
                  {locale.city} {locale.postalExample}
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
