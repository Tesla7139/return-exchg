"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, Printer } from "lucide-react";
import { usePortal } from "../PortalContext";

const SHAD_BTN =
  "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium outline-none transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0";

export function PrintLabelScreen({ onBack, orderId }: { onBack: () => void; orderId?: string }) {
  const { primary, name, locale, orderId: portalOrderId } = usePortal();
  const labelRef = useRef<HTMLDivElement>(null);
  const ref = orderId || portalOrderId;
  const city = locale.city;
  const cityLine = `${city} ${locale.postalExample}`;

  return (
    <div className="relative flex min-h-screen flex-col bg-[#F9F9F9] font-sans">
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100/50 bg-white/80 px-4 py-3 backdrop-blur-md supports-[backdrop-filter]:bg-white/60 print:hidden">
        <button
          onClick={onBack}
          className={`${SHAD_BTN} flex h-auto items-center gap-1 py-2 pl-0 pr-3 text-slate-900 transition-colors hover:bg-[var(--portal-primary)]/5 hover:text-[var(--portal-primary)]`}
        >
          <ChevronLeft className="h-5 w-5" />
          <span className="text-sm font-bold">Back</span>
        </button>
        <div
          className="absolute left-1/2 -translate-x-1/2 font-serif text-xl font-bold tracking-tight"
          style={{ color: primary }}
        >
          {name}
        </div>
        <div className="w-12" />
      </div>

      <div className="mx-auto w-full max-w-lg flex-1 p-5 pb-24 print:w-full print:max-w-none print:p-0">
        <motion.div
          ref={labelRef}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="rounded-[4px] border border-slate-200 bg-white p-4 shadow-sm print:border-0 print:p-0 print:shadow-none"
        >
          <div className="relative flex aspect-[4/6] flex-col border border-black bg-white font-sans text-black print:aspect-auto print:h-full print:w-full">
            <div className="flex h-[15%] border-b border-black">
              <div className="w-1/2 border-r border-black p-2 text-[10px] font-bold uppercase leading-tight">
                <div>{name} Returns</div>
                <div>135 Commerce Park Rd</div>
                <div>{cityLine}</div>
              </div>
              <div className="relative w-1/2 p-2">
                <div className="absolute right-2 top-2 text-xs font-bold">4 LBS</div>
                <div className="absolute right-12 top-2 text-xs font-bold">1 OF 1</div>
                <div className="absolute bottom-2 right-2 text-4xl font-extrabold tracking-tighter">RS</div>
              </div>
            </div>

            <div className="h-[15%] border-b border-black p-3">
              <div className="mb-1 text-[10px] font-bold uppercase">Ship To:</div>
              <div className="ml-4 text-sm font-bold uppercase leading-tight">
                <div>{name} Returns Center</div>
                <div>3212 Logistics Hub Drive</div>
                <div className="text-lg">{cityLine}</div>
              </div>
            </div>

            <div className="flex h-[20%] items-center justify-between border-b border-black p-2">
              <div className="flex h-24 w-24 items-center justify-center bg-black/10">
                <div className="h-full w-full border border-black bg-white p-1">
                  <div className="h-full w-full bg-[url('https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=RETURN_LABEL_DATA')] bg-cover opacity-80 mix-blend-multiply contrast-200 grayscale" />
                </div>
              </div>
              <div className="ml-2 flex h-full flex-1 flex-col items-center justify-center">
                <div className="mb-1 text-3xl font-bold uppercase tracking-tighter">RT 402 9-04</div>
                <div className="h-12 w-full bg-[repeating-linear-gradient(90deg,black,black_2px,transparent_2px,transparent_4px)]" />
              </div>
            </div>

            <div className="flex h-[8%] items-center justify-between bg-black px-3 text-2xl font-bold uppercase tracking-tighter text-white">
              <span>{locale.carrier} Ground</span>
            </div>

            <div className="flex h-[25%] flex-col items-center justify-center border-b border-black p-2">
              <div className="mb-1 w-full text-left text-xs font-bold">TRACKING #: 1Z Y80 F34 90 0408 7450</div>
              <div className="h-20 w-full bg-[repeating-linear-gradient(90deg,black,black_3px,transparent_3px,transparent_5px,black_6px,black_9px,transparent_9px,transparent_11px)]" />
            </div>

            <div className="relative flex-1 p-2">
              <div className="text-[10px] font-bold uppercase">
                <div>Billing: P/P</div>
                <div>Desc: Return Shipment</div>
              </div>
              <div className="absolute bottom-2 right-2 flex w-24 flex-col items-center border border-black p-1">
                <div className="text-[8px] font-bold uppercase">Ref No: {ref}</div>
              </div>
              <div className="absolute bottom-2 left-2 h-10 w-32 bg-[repeating-linear-gradient(90deg,black,black_1px,transparent_1px,transparent_3px)]" />
            </div>
          </div>
        </motion.div>
      </div>

      <div className="safe-area-bottom fixed bottom-0 left-0 right-0 z-20 border-t border-slate-200/60 bg-white/80 p-4 shadow-[0_-4px_20px_-4px_rgba(0,0,0,0.05)] backdrop-blur-md print:hidden">
        <div className="mx-auto max-w-lg">
          <button
            className={`${SHAD_BTN} h-12 w-full rounded-[4px] px-4 py-2 text-lg font-bold text-white shadow-md hover:brightness-90`}
            style={{ backgroundColor: primary }}
            onClick={() => window.print()}
          >
            <Printer className="mr-2 h-5 w-5" />
            Save &amp; Print
          </button>
        </div>
      </div>
    </div>
  );
}
