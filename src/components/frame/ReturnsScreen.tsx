"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { BatteryFull, ChevronDown, ChevronRight, Signal, Wifi } from "lucide-react";
import type { Brand } from "@/lib/site";
import { FEATURES, FRAME_ID, MOBILE_TOUR_STEPS, firstSectionStepForCard } from "@/lib/tour";
import { BRAND_STORAGE_KEY } from "@/lib/returns/types";
import { TourOverlay, type TargetRect } from "./TourOverlay";

const CALENDLY = "https://calendly.com/jatin-trighatia-clickpost/30min";

function cleanDomain(url: string | null) {
  return (url || "").replace(/^https?:\/\//, "").replace(/^www\./, "").split("/")[0];
}

/**
 * Frames the branded returns portal (an iframe of /portal) on a soft backdrop, with
 * a guided tour and a desktop/mobile preview toggle, centered and near full-window.
 * One iframe is kept across view switches, so toggling never resets the shopper's
 * progress — only its width changes, and the portal's own breakpoints respond.
 */
export function ReturnsScreen({ brand }: { brand: Brand }) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [ready, setReady] = useState(false);
  const [step, setStep] = useState<number | null>(null);
  const [preview, setPreview] = useState<number | null>(null);
  const [rect, setRect] = useState<TargetRect | null>(null);
  const [view, setView] = useState<"desktop" | "mobile">("desktop");
  const [compact, setCompact] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // Hand the resolved brand to the portal iframe (same origin) before it mounts.
  useEffect(() => {
    try {
      sessionStorage.setItem(BRAND_STORAGE_KEY, JSON.stringify(brand));
    } catch {
      /* storage blocked — the portal re-fetches from ?store= */
    }
    setReady(true);
  }, [brand]);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1023px)");
    const sync = () => setCompact(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  // No side feature panel, so the tour only walks the live portal.
  const steps = MOBILE_TOUR_STEPS;
  const stepsRef = useRef(steps);
  useEffect(() => {
    stepsRef.current = steps;
  }, [steps]);

  const gotoPortal = useCallback((portalStep: number) => {
    iframeRef.current?.contentWindow?.postMessage({ type: "cp-goto", step: portalStep }, window.location.origin);
  }, []);

  const measure = useCallback((index: number) => {
    const s = stepsRef.current[index];
    if (!s) return;
    let ticks = 0;
    const tick = () => {
      const el = document.getElementById(s.target);
      const r = el?.getBoundingClientRect();
      setRect(r && r.width > 0 && r.height > 0 ? { top: r.top, left: r.left, width: r.width, height: r.height } : null);
      if (ticks++ < 6) window.setTimeout(tick, 70);
    };
    window.setTimeout(tick, 40);
  }, []);

  useEffect(() => {
    const onStart = () => {
      setPreview(null);
      setStep(0);
    };
    const onPreview = (e: Event) => {
      const card = (e as CustomEvent<{ card?: number }>).detail?.card ?? 0;
      setStep(null);
      setPreview(firstSectionStepForCard(card, stepsRef.current));
    };
    window.addEventListener("cp:start-tour", onStart);
    window.addEventListener("cp:preview-feature", onPreview as EventListener);
    return () => {
      window.removeEventListener("cp:start-tour", onStart);
      window.removeEventListener("cp:preview-feature", onPreview as EventListener);
    };
  }, []);

  const activeIndex = step ?? preview;
  const isPreview = step === null && preview !== null;

  // Drive the portal to the active step's screen, then spotlight its target.
  useEffect(() => {
    if (activeIndex === null) return;
    const s = steps[activeIndex];
    if (s?.portalStep) gotoPortal(s.portalStep);
    measure(activeIndex);
    const onResize = () => measure(activeIndex);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [activeIndex, steps, gotoPortal, measure]);

  const endTour = useCallback(() => {
    setStep(null);
    setPreview(null);
    setRect(null);
  }, []);

  const src = `/portal?store=${encodeURIComponent(cleanDomain(brand.url) || brand.brandName)}`;
  const iframe = ready ? (
    <iframe
      ref={iframeRef}
      src={src}
      title={`${brand.brandName} returns portal`}
      className="h-full w-full border-0 bg-white"
    />
  ) : null;

  const tour =
    activeIndex !== null && steps[activeIndex] ? (
      <TourOverlay
        rect={rect}
        title={steps[activeIndex].title}
        desc={steps[activeIndex].desc}
        step={activeIndex}
        total={steps.length}
        preview={isPreview}
        nextLabel="Next"
        onNext={() => setStep((s) => (s === null ? s : Math.min(s + 1, steps.length - 1)))}
        onBack={() => setStep((s) => (s === null ? s : Math.max(s - 1, 0)))}
        onClose={endTour}
      />
    ) : null;

  // Real phones: full-screen portal under a slim control bar.
  if (compact) {
    return (
      <div className="fixed inset-0 flex flex-col overflow-hidden bg-white">
        <div className="flex flex-wrap items-center gap-2 border-b border-border/60 bg-white px-3 py-2 pr-14">
          <div className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen((o) => !o)}
              className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1.5 text-[13px] font-semibold text-slate-900 shadow-md ring-1 ring-black/5"
            >
              Features
              <ChevronDown className={`size-3.5 transition-transform ${menuOpen ? "rotate-180" : ""}`} />
            </button>
            {menuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                <div className="absolute left-0 top-full z-50 mt-1.5 w-64 overflow-hidden rounded-2xl bg-white p-1.5 shadow-xl ring-1 ring-black/10">
                  {FEATURES.map((f, i) => (
                    <button
                      key={f.title}
                      type="button"
                      onClick={() => {
                        window.dispatchEvent(new CustomEvent("cp:preview-feature", { detail: { card: i } }));
                        setMenuOpen(false);
                      }}
                      className="flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-left text-[14px] font-medium text-slate-800 hover:bg-slate-50"
                    >
                      {f.title}
                      <ChevronRight className="size-4 shrink-0 text-slate-400" />
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
          <a
            href={CALENDLY}
            target="_blank"
            rel="noreferrer"
            className="rounded-full bg-primary px-3 py-1.5 text-[13px] font-semibold text-white shadow-md"
          >
            Book a demo
          </a>
        </div>
        <div id={FRAME_ID} className="relative min-h-0 flex-1">
          {iframe}
        </div>
        {tour}
      </div>
    );
  }

  const seg = "rounded-full px-4 py-1 text-[13px] transition-all";
  const isMobileView = view === "mobile";

  return (
    <div
      className="fixed inset-0 flex items-center justify-center overflow-hidden px-3 pb-3 pt-2 sm:px-5 sm:pb-4"
      style={{ background: "radial-gradient(130% 120% at 50% -10%, #f6fbff 0%, #e6f4ff 55%, #d3ecff 100%)" }}
    >
      {/* Centered, near full-window portal; one slim control row above it. */}
      <div className="flex h-full w-full min-w-0 max-w-[1680px] flex-col gap-2">
        {/* Controls (right side leaves room for the close X) */}
        <div className="relative flex min-w-0 shrink-0 items-center pr-12">
          <a
            href={CALENDLY}
            target="_blank"
            rel="noreferrer"
            className="order-last ml-auto rounded-full bg-primary px-4 py-1.5 text-[13px] font-semibold text-white shadow-md transition-transform hover:-translate-y-0.5"
          >
            Book a free demo
          </a>
          <div className="absolute left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full bg-slate-100 p-1 shadow-md ring-1 ring-black/5">
            {(["desktop", "mobile"] as const).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setView(v)}
                className={`${seg} ${
                  view === v
                    ? "bg-white font-semibold text-slate-900 shadow-sm"
                    : "font-medium text-slate-500 hover:text-slate-700"
                }`}
              >
                {v === "desktop" ? "Desktop" : "Mobile"}
              </button>
            ))}
          </div>
        </div>

        {/* Screen: the same iframe, framed as a browser window or as a phone */}
        <div className="flex min-h-0 flex-1 items-center justify-center">
          <motion.div
            layout
            transition={{ type: "spring", stiffness: 200, damping: 26 }}
            className={
              isMobileView
                ? "relative flex h-full max-h-[860px] w-[360px] max-w-full flex-col overflow-hidden rounded-[2.8rem] bg-neutral-900 p-[9px] shadow-[0_45px_130px_-25px_rgba(0,0,0,0.75)] ring-1 ring-black/40"
                : "relative flex h-full w-full flex-col overflow-hidden rounded-lg bg-white shadow-[0_40px_120px_-20px_rgba(0,0,0,0.45)] ring-[3px] ring-neutral-900"
            }
          >
            {isMobileView && (
              <div className="relative z-20 flex h-9 shrink-0 items-center justify-between rounded-t-[2.3rem] bg-white px-6 text-[12px] font-semibold text-neutral-900">
                <span className="tabular-nums">9:41</span>
                <span className="absolute left-1/2 top-2 h-5 w-24 -translate-x-1/2 rounded-full bg-black" />
                <span className="flex items-center gap-1.5">
                  <Signal className="size-3.5" />
                  <Wifi className="size-3.5" />
                  <BatteryFull className="size-5" />
                </span>
              </div>
            )}
            <div
              id={FRAME_ID}
              className={`relative min-h-0 flex-1 overflow-hidden bg-white ${isMobileView ? "rounded-b-[2.3rem]" : ""}`}
            >
              {iframe}
            </div>
          </motion.div>
        </div>
      </div>

      {tour}
    </div>
  );
}

