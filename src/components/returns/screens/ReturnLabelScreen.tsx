"use client";

import { motion } from "framer-motion";
import { ChevronLeft, Download, Printer } from "lucide-react";
import { toast } from "sonner";
import { usePortal } from "../PortalContext";

const CHECK_CIRCLE_PATH =
  "M16 2.66667C8.64 2.66667 2.66667 8.64 2.66667 16C2.66667 23.36 8.64 29.3333 16 29.3333C23.36 29.3333 29.3333 23.36 29.3333 16C29.3333 8.64 23.36 2.66667 16 2.66667ZM13.3333 22.6667L6.66667 16L8.54667 14.12L13.3333 18.8933L23.4533 8.77333L25.3333 10.6667L13.3333 22.6667Z";

function DownloadToast() {
  return (
    <div className="flex w-full max-w-sm items-center gap-3 rounded-[4px] border border-slate-100 bg-white px-4 py-3 shadow-lg">
      <div className="flex flex-1 items-center gap-2">
        <div className="relative h-8 w-8 shrink-0">
          <svg className="block h-full w-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 32">
            <path d={CHECK_CIRCLE_PATH} fill="#0E8C3A" />
          </svg>
        </div>
        <div className="flex flex-col">
          <p className="text-sm font-bold text-[#0e8c3a]">File Downloaded</p>
          <p className="text-sm text-[#465a64]">3.4 MB</p>
        </div>
      </div>
      <button className="whitespace-nowrap text-sm font-bold text-[#3883ff] hover:underline">Open</button>
    </div>
  );
}

/** Base classes of the design's shadcn button. */
const SHAD_BTN =
  "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium outline-none transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0";

export function ReturnLabelScreen({
  onBack,
  onPrintLabel,
  orderId,
  userName = "Guest",
}: {
  onBack: () => void;
  onPrintLabel: () => void;
  orderId?: string;
  userName?: string;
}) {
  const { primary, bg, name, locale, items, orderId: portalOrderId } = usePortal();
  const id = orderId || portalOrderId;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(id)}&color=${primary.replace("#", "")}&bgcolor=ffffff`;
  const returnBy = items.find((i) => i.returnDeadline)?.returnDeadline ?? "";

  const download = async () => {
    try {
      const blob = await (await fetch(qrUrl)).blob();
      const href = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = href;
      a.download = `return-qr-${id}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(href);
      toast.custom(() => <DownloadToast />);
    } catch (err) {
      console.error("Download failed:", err);
      toast.error("Failed to download QR code");
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col font-sans" style={{ backgroundColor: bg }}>
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100/50 bg-white/80 px-4 py-3 backdrop-blur-md supports-[backdrop-filter]:bg-white/60">
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

      <div className="mx-auto w-full max-w-md flex-1 p-5 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-6"
        >
          <div className="space-y-2">
            <h1 className="font-serif text-3xl font-bold tracking-tight text-slate-900">Your return label</h1>
          </div>
          <div className="space-y-4 text-sm leading-relaxed text-slate-600">
            <p className="font-medium text-slate-900">Hi {userName},</p>
            <p>
              Take this QR Code to {locale.carrier} and they will print the label for you. Be ready to show it at the
              drop-off location.
            </p>
            <p
              className="rounded-[4px] border border-[var(--portal-primary)]/20 bg-[var(--portal-primary)]/8 p-3"
              style={{ color: `color-mix(in srgb, ${primary} 75%, black)` }}
            >
              Return the item by <span className="font-bold">{returnBy}</span>. If you would like to print a label, see
              options below.
            </p>
          </div>

          <div className="flex flex-col gap-6 overflow-hidden rounded-[4px] border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 bg-slate-50/50 px-6 pb-4 pt-6 text-center">
              <h4 className="font-serif text-lg font-bold leading-none text-slate-900">{locale.carrier} Label Broker ID</h4>
            </div>
            <div className="flex flex-col items-center justify-center space-y-6 bg-white p-8 pt-6">
              <div className="rounded-[4px] border border-slate-100 bg-white p-2 shadow-sm">
                {/* eslint-disable-next-line @next/next/no-img-element -- generated QR */}
                <img src={qrUrl} alt="Return QR Code" className="h-48 w-48 mix-blend-multiply" />
              </div>
              <div className="flex flex-col items-center gap-1">
                <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Code</span>
                <div className="rounded-[4px] border border-slate-200 bg-slate-100 px-4 py-1 font-mono text-2xl font-bold tracking-wider text-slate-900">
                  YCAAP9XE
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="safe-area-bottom fixed bottom-0 left-0 right-0 z-20 border-t border-slate-200/60 bg-white/80 p-4 shadow-[0_-4px_20px_-4px_rgba(0,0,0,0.05)] backdrop-blur-md">
        <div className="mx-auto flex max-w-md gap-3">
          <button
            className={`${SHAD_BTN} h-11 flex-1 rounded-[4px] px-4 py-2 font-semibold text-white shadow-md hover:brightness-90`}
            style={{ backgroundColor: primary }}
            onClick={download}
          >
            <Download className="mr-2 h-4 w-4" />
            Download QR
          </button>
          <button
            className={`${SHAD_BTN} h-11 flex-1 rounded-[4px] border border-slate-300 bg-white px-4 py-2 font-semibold text-slate-700 transition-all hover:border-[var(--portal-primary)] hover:bg-slate-50 hover:text-[var(--portal-primary)]`}
            onClick={onPrintLabel}
          >
            <Printer className="mr-2 h-4 w-4" />
            Print Label
          </button>
        </div>
      </div>
    </div>
  );
}
