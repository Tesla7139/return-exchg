"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown, ChevronUp } from "lucide-react";
import { usePortal } from "./PortalContext";

export function NpsWidget() {
  const { primary, accent } = usePortal();
  const [rating, setRating] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [hovered, setHovered] = useState<number | null>(null);
  const [expanded, setExpanded] = useState(false);

  const shell = {
    borderColor: `${primary}33`,
    backgroundImage: `linear-gradient(to bottom right, ${primary}0d, ${accent}1a)`,
  };

  if (submitted) {
    return (
      <div
        className="relative mx-auto w-full max-w-[360px] overflow-hidden rounded-2xl border p-8 text-center shadow-sm backdrop-blur-sm"
        style={shell}
      >
        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--portal-primary)]/10">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke={primary}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-check"
            >
              <path d="M20 6 9 17l-5-5" />
            </svg>
          </div>
          <h3 className="font-serif text-2xl font-bold" style={{ color: primary }}>
            Thank You!
          </h3>
          <p className="text-sm font-medium text-slate-600">Your feedback helps us improve.</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      layout
      className="relative mx-auto w-full max-w-[380px] overflow-hidden rounded-2xl border shadow-sm backdrop-blur-sm transition-all"
      style={shell}
    >
      {!expanded && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setExpanded(true)}
          className="cursor-pointer p-4 transition-colors hover:bg-[var(--portal-primary)]/5"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[var(--portal-primary)]/10">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke={primary}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <div>
                <h3 className="font-serif text-sm font-bold text-[#2D2D2D]">Rate your experience</h3>
                <p className="text-xs text-slate-500">Help us improve our service</p>
              </div>
            </div>
            <ChevronDown className="h-5 w-5 text-[#A89F91]" />
          </div>
        </motion.div>
      )}
      {expanded && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-6">
          <div className="mb-4 flex items-start justify-between">
            <h3 className="flex-1 font-serif text-lg font-bold leading-tight text-[#2D2D2D]">
              How likely are you to recommend us to a friend or colleague?
            </h3>
            <button
              onClick={() => setExpanded(false)}
              className="ml-2 flex-shrink-0 rounded p-1 transition-colors hover:bg-[var(--portal-primary)]/10"
              aria-label="Collapse"
            >
              <ChevronUp className="h-5 w-5 text-slate-700" />
            </button>
          </div>
          <div className="mb-2 flex items-center justify-between px-1" onMouseLeave={() => setHovered(null)}>
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => {
              const selected = rating === n;
              const hover = hovered === n;
              return (
                <button
                  key={n}
                  onClick={() => setRating(n)}
                  onMouseEnter={() => setHovered(n)}
                  className={`relative flex h-9 items-center justify-center rounded-lg border border-transparent text-xs font-bold transition-all duration-200 ${
                    n >= 10 ? "w-8" : "w-7"
                  } ${
                    selected
                      ? "z-10 -translate-y-1 bg-[var(--portal-primary)] text-white shadow-md"
                      : hover
                        ? "z-10 -translate-y-1 bg-[var(--portal-primary)]/80 text-white"
                        : "bg-white/60 text-slate-600 hover:bg-[var(--portal-primary)]/10"
                  } ${!selected && !hover ? "border-[var(--portal-primary)]/5" : ""}`}
                  aria-label={`Rate ${n} out of 10`}
                >
                  {n}
                </button>
              );
            })}
          </div>
          <div className="mb-6 flex justify-between px-1 font-sans text-[10px] font-bold uppercase tracking-wider text-[var(--portal-primary)]/60">
            <span>Not Likely</span>
            <span>Very Likely</span>
          </div>
          <div className="flex h-[40px] items-center justify-center">
            <button
              onClick={() => rating !== null && setSubmitted(true)}
              disabled={rating === null}
              className={`transform rounded-full px-8 py-2 font-serif text-sm font-semibold transition-all duration-300 ${
                rating !== null
                  ? "translate-y-0 bg-[var(--portal-primary)] text-white opacity-100 shadow-lg hover:brightness-90"
                  : "pointer-events-none translate-y-4 bg-slate-200 text-slate-400 opacity-0"
              }`}
            >
              Submit Feedback
            </button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
