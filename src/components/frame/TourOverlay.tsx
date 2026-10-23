"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, X } from "lucide-react";

export type TargetRect = { top: number; left: number; width: number; height: number };

const PAD = 10; // how far the spotlight extends past the target
const CARD_W = 300;

/**
 * Full-screen guided-tour layer: dims the page, cuts a spotlight hole over the
 * current target rect, and floats an explanation card near it. Rendered via a
 * portal to document.body so it sits above the framed screen and its zoom.
 */
export function TourOverlay({
  rect,
  title,
  desc,
  step,
  total,
  nextLabel = "Next",
  preview = false,
  onNext,
  onBack,
  onClose,
}: {
  rect: TargetRect | null;
  title: string;
  desc: string;
  step: number;
  total: number;
  nextLabel?: string;
  preview?: boolean;
  onNext: () => void;
  onBack: () => void;
  onClose: () => void;
}) {
  const [mounted, setMounted] = useState(false);
  const [vw, setVw] = useState(1200);
  const [vh, setVh] = useState(800);
  const [show, setShow] = useState(true);
  const [typed, setTyped] = useState("");
  const cardRef = useRef<HTMLDivElement>(null);
  const [cardH, setCardH] = useState(240);

  // Typewriter: reveal the description one character at a time when the step changes.
  useEffect(() => {
    setTyped("");
    let i = 0;
    const id = window.setInterval(() => {
      i += 1;
      setTyped(desc.slice(0, i));
      if (i >= desc.length) window.clearInterval(id);
    }, 15);
    return () => window.clearInterval(id);
  }, [desc, step]);
  const typing = typed.length < desc.length;

  useEffect(() => {
    setMounted(true);
    const update = () => {
      setVw(window.innerWidth);
      setVh(window.innerHeight);
    };
    update();
    window.addEventListener("resize", update);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") onNext();
      else if (e.key === "ArrowLeft") onBack();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose, onNext, onBack]);

  // Measure the card so the left/right placement can vertically center on the hole.
  useLayoutEffect(() => {
    if (cardRef.current) setCardH(cardRef.current.offsetHeight);
  }, [title, desc, step]);

  // Preview mode: show long enough to read, then fade the whole overlay out and close.
  useEffect(() => {
    if (!preview) return;
    setShow(true);
    const t = setTimeout(() => setShow(false), 4500);
    return () => clearTimeout(t);
  }, [preview, step]);

  if (!mounted) return null;

  const hole = rect
    ? {
        top: Math.max(rect.top - PAD, 0),
        left: Math.max(rect.left - PAD, 0),
        width: rect.width + PAD * 2,
        height: rect.height + PAD * 2,
      }
    : null;

  // Small screens: the card is full-width and docked to the bottom, so it never
  // overlaps the spotlighted section (which scrolls into view above it).
  const isMobile = vw < 640;
  const cardW = isMobile ? Math.min(vw - 24, 440) : CARD_W;

  // Placement: put the card on the side AWAY from the target so it never covers it.
  // A target on the left half (e.g. a feature card) pushes the card right; a target on
  // the right (a page section) pushes it into the left gutter. Fall back to below/above.
  const clampTop = (t: number) => Math.min(Math.max(t, 16), Math.max(vh - cardH - 16, 16));
  const clampLeft = (l: number) => Math.min(Math.max(l, 16), Math.max(vw - cardW - 16, 16));
  let cardLeft = clampLeft((vw - cardW) / 2);
  let cardTop = clampTop((vh - cardH) / 2);
  let placeBelow = true;
  if (isMobile) {
    cardLeft = (vw - cardW) / 2;
    cardTop = Math.max(vh - cardH - 16, 16);
    placeBelow = false;
  } else if (hole) {
    // Keep the card in the empty LEFT area so it never covers the demo screen/phone
    // (which sits center-right). A left-side target (feature card) gets the card BELOW
    // it; a right-side target (a section inside the screen) gets the left gutter.
    const holeCenterX = hole.left + hole.width / 2;
    const leftTarget = holeCenterX < vw * 0.5;
    cardLeft = clampLeft(16);
    if (leftTarget) {
      const belowRoom = vh - (hole.top + hole.height);
      if (belowRoom >= cardH + 24) {
        cardTop = hole.top + hole.height + 16; // below the highlighted card
        placeBelow = true;
      } else {
        cardTop = clampTop(hole.top - cardH - 16); // above if no room below
        placeBelow = false;
      }
    } else {
      cardTop = clampTop(hole.top + hole.height / 2 - cardH / 2); // vertically centered, left gutter
      placeBelow = false;
    }
  }
  const isLast = step === total - 1;

  return createPortal(
    <motion.div
      className="fixed inset-0 z-[100]"
      style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: show ? 1 : 0 }}
      transition={{ duration: 0.3 }}
      onAnimationComplete={() => {
        if (!show) onClose();
      }}
    >
      {/* Dim + spotlight hole (box-shadow fills the rest of the screen). Blocks page clicks. */}
      {hole && (
        <>
          <motion.div
            key={`hole-${step}`}
            initial={false}
            animate={{ top: hole.top, left: hole.left, width: hole.width, height: hole.height }}
            transition={{ type: "spring", stiffness: 260, damping: 30 }}
            className="absolute rounded-2xl"
            style={{ boxShadow: "0 0 0 9999px rgba(9, 20, 40, 0.62)" }}
          />
          {/* Static accent ring around the hole (no pulsing wave) */}
          <motion.div
            initial={false}
            animate={{ top: hole.top, left: hole.left, width: hole.width, height: hole.height }}
            transition={{ type: "spring", stiffness: 260, damping: 30 }}
            className="pointer-events-none absolute rounded-2xl ring-2 ring-white/90"
          />
        </>
      )}

      {/* Explanation card */}
      <AnimatePresence mode="wait">
        <motion.div
          ref={cardRef}
          key={`card-${step}`}
          initial={{ opacity: 0, y: placeBelow ? 10 : -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: placeBelow ? -6 : 6 }}
          transition={{ duration: 0.25 }}
          className="absolute rounded-2xl bg-white p-5 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.55)] ring-1 ring-black/10"
          style={{ top: cardTop, left: cardLeft, width: cardW }}
        >
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-lg font-bold leading-snug text-slate-900">{title}</h3>
            <button
              type="button"
              onClick={onClose}
              className="-mr-1 -mt-1 shrink-0 rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              aria-label="End tour"
            >
              <X className="size-4" />
            </button>
          </div>

          <p className="mt-1.5 text-[13px] leading-relaxed text-slate-600">
            {typed}
            {typing && (
              <span className="ml-px inline-block h-[1em] w-[2px] translate-y-[2px] animate-pulse bg-slate-400" />
            )}
            {/* keep the full text in layout (transparent) so the box height stays stable */}
            <span className="text-transparent">{desc.slice(typed.length)}</span>
          </p>

          {/* Preview mode = just the note (no navigation). Full tour = progress + Back/Next. */}
          {!preview && (
            <div className="mt-4 flex items-center justify-between">
              {/* Progress dots */}
              <div className="flex items-center gap-1.5">
                {Array.from({ length: total }).map((_, i) => (
                  <span
                    key={i}
                    className={
                      "h-1.5 rounded-full transition-all " +
                      (i === step ? "w-5 bg-primary" : "w-1.5 bg-slate-300")
                    }
                  />
                ))}
              </div>

              <div className="flex items-center gap-2">
                {step > 0 && (
                  <button
                    type="button"
                    onClick={onBack}
                    className="inline-flex items-center gap-1 rounded-full px-3 py-2 text-[13px] font-semibold text-slate-600 hover:bg-slate-100"
                  >
                    <ArrowLeft className="size-3.5" /> Back
                  </button>
                )}
                <button
                  type="button"
                  onClick={isLast ? onClose : onNext}
                  className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-[13px] font-semibold text-white shadow-sm hover:brightness-110"
                >
                  {isLast ? "Finish" : nextLabel}
                  {!isLast && <ArrowRight className="size-3.5" />}
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </motion.div>,
    document.body
  );
}
