"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence, MotionConfig } from "framer-motion";
import { ArrowRight, Check, X } from "lucide-react";
import type { Brand } from "@/lib/site";
import { ReturnsScreen } from "./ReturnsScreen";

type Status = "idle" | "loading" | "ready";

const WARM = "#f0502e"; // "building" accent
const READY = "#10b981"; // "ready" accent

function cleanDomain(url: string) {
  return url.replace(/^https?:\/\//, "").replace(/^www\./, "").split("/")[0] || url;
}

/**
 * The launch flow shown after a store URL is submitted:
 * loading screen → laptop "welcome" splash → (click) zoom → the framed returns portal.
 */
export function LaunchExperience({
  status,
  brand,
  submittedUrl,
  onReset,
}: {
  status: Status;
  brand: Brand | null;
  submittedUrl: string;
  onReset: () => void;
}) {
  const [minElapsed, setMinElapsed] = useState(false);
  const [step, setStep] = useState<"welcome" | "portal">("welcome");

  useEffect(() => {
    const t = setTimeout(() => setMinElapsed(true), 4200);
    return () => clearTimeout(t);
  }, []);

  const domain = cleanDomain(submittedUrl);
  const ready = status === "ready" && minElapsed && !!brand;

  return (
    // Force animations to always run, even if the OS/browser has "reduce motion" on.
    <MotionConfig reducedMotion="never">
    <div className="fixed inset-0 z-[100] bg-white">
      <button
        onClick={onReset}
        aria-label="Close"
        className="fixed right-4 top-4 z-[120] flex size-9 items-center justify-center rounded-full border border-border bg-white text-foreground shadow-soft-md transition-colors hover:bg-neutral-50"
      >
        <X className="size-5" />
      </button>

      <AnimatePresence mode="wait">
        {!ready ? (
          <LoadingView key="loading" label={domain} />
        ) : step === "welcome" ? (
          <WelcomeView
            key="welcome"
            brand={brand!}
            domain={domain}
            onContinue={() => setStep("portal")}
          />
        ) : (
          <motion.div key="portal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full">
            <ReturnsScreen brand={brand!} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
    </MotionConfig>
  );
}

/* ----------------------------- Loading ----------------------------- */

const STEPS = [
  "Fetching brand identity & colors",
  "Importing your product catalog",
  "Setting return & exchange eligibility",
  "Tailoring return reasons to your category",
  "Finding local drop-off points",
  "Building exchange offers & store credit",
];

function LoadingView({ label }: { label: string }) {
  const [done, setDone] = useState(false);
  const accent = done ? READY : WARM;

  useEffect(() => {
    const t = setTimeout(() => setDone(true), 3600);
    return () => clearTimeout(t);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex h-full overflow-hidden bg-background"
    >
      {/* left skeleton */}
      <aside className="hidden w-[300px] shrink-0 flex-col gap-3 bg-background-muted/60 p-5 md:flex">
        <div className="rounded-2xl bg-white p-4 shadow-soft-md">
          <div
            className="text-[11px] font-bold uppercase tracking-[0.14em]"
            style={{ color: done ? READY : "#8a8fb3" }}
          >
            {done ? "Ready" : "Personalizing"}
          </div>
          <div className="mt-1 flex items-center gap-2">
            <span
              className={`size-2.5 shrink-0 rounded-full ${done ? "" : "animate-pulse"}`}
              style={{ background: accent }}
            />
            <span className="truncate text-[15px] font-bold text-foreground">
              {done ? `${label} is ready` : `Building ${label}`}
            </span>
          </div>
        </div>
        <div className="my-1 h-px bg-black/[0.06]" />
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-12 animate-pulse rounded-2xl bg-black/[0.04]"
            style={{ animationDelay: `${i * 90}ms` }}
          />
        ))}
      </aside>

      {/* right panel */}
      <main className="flex-1 p-4 md:p-6">
        <div className="flex h-full flex-col overflow-hidden rounded-3xl border border-border bg-white p-7 shadow-soft-md md:p-10">
          <span
            className="inline-flex w-fit items-center gap-2 rounded-full px-3.5 py-1.5 text-[13px] font-bold transition-colors duration-300"
            style={{ background: `${accent}1a`, color: accent }}
          >
            {done ? (
              <Check className="size-3.5" strokeWidth={3} />
            ) : (
              <span className="size-2 animate-pulse rounded-full" style={{ background: accent }} />
            )}
            {done ? "Your returns portal is ready" : "Personalizing your experience"}
          </span>

          <h2 className="mt-7 text-4xl font-bold tracking-tight text-foreground md:text-5xl">
            {done ? `${label} is ready` : `Preparing your ${label} demo`}
          </h2>
          <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-muted-foreground md:text-base">
            {done
              ? "All set. Opening your branded returns portal now."
              : "We're tailoring the portal to your brand, your catalog, and your shoppers' market."}
          </p>

          <div className="mt-7 h-3 w-full shrink-0 overflow-hidden rounded-full bg-neutral-200 ring-1 ring-black/5">
            <motion.div
              initial={{ width: "8%" }}
              animate={{ width: done ? "100%" : "84%" }}
              transition={{ duration: done ? 0.4 : 2.6, ease: "easeInOut" }}
              className="h-full rounded-full"
              style={{ background: accent, boxShadow: `0 0 12px ${accent}80` }}
            />
          </div>

          <div className="mt-8 flex-1">
            <p className="mb-2.5 text-[11px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
              Personalizing your returns portal
            </p>
            <div
              className="relative h-[calc(100%-2rem)] min-h-[180px] overflow-hidden"
              style={{
                maskImage: "linear-gradient(to bottom, transparent, black 10%, black 90%, transparent)",
                WebkitMaskImage: "linear-gradient(to bottom, transparent, black 10%, black 90%, transparent)",
              }}
            >
              <motion.div
                className="flex w-full shrink-0 flex-col gap-2.5"
                animate={{ y: ["0%", "-50%"] }}
                transition={{ duration: 9, ease: "linear", repeat: Infinity }}
              >
                {[...STEPS, ...STEPS].map((s, i) => (
                  <div
                    key={i}
                    aria-hidden={i >= STEPS.length}
                    className="flex items-center gap-2.5 rounded-xl bg-background-muted/70 px-4 py-2.5"
                  >
                    <Check className="size-4 shrink-0" style={{ color: READY }} strokeWidth={3} />
                    <span className="truncate text-[13px] font-semibold text-foreground">{s}</span>
                  </div>
                ))}
              </motion.div>
            </div>
          </div>
        </div>
      </main>
    </motion.div>
  );
}

/* ----------------------------- Welcome (laptop) ----------------------------- */

function WelcomeView({
  brand,
  domain,
  onContinue,
}: {
  brand: Brand;
  domain: string;
  onContinue: () => void;
}) {
  const [entering, setEntering] = useState(false);
  const name = brand.brandName;
  const dom = domain || `${name.toLowerCase().replace(/[^a-z0-9]+/g, "")}.com`;

  // Scale the headline down for long names so it never spills onto the laptop.
  const nameSize =
    name.length > 22
      ? "text-2xl md:text-3xl"
      : name.length > 16
      ? "text-3xl md:text-4xl"
      : name.length > 11
      ? "text-4xl md:text-5xl"
      : "text-5xl md:text-6xl";

  // Initials for the monogram fallback (up to 2 letters).
  const initials =
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0])
      .join("")
      .toUpperCase() || "?";

  const enter = () => {
    if (entering) return;
    setEntering(true);
    window.setTimeout(onContinue, 700);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="relative h-full overflow-hidden bg-white"
    >
      <button
        onClick={enter}
        className="relative flex h-full w-full cursor-pointer flex-col items-center justify-center gap-10 px-6 py-14 lg:flex-row lg:gap-16 lg:px-16"
      >
        {/* text */}
        <motion.div
          animate={entering ? { opacity: 0, y: -14 } : { opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="w-full max-w-md text-center lg:text-left"
        >
          <span className="text-xl font-medium tracking-wide text-muted-foreground sm:text-2xl">
            Welcome to
          </span>
          <div
            className={`mt-1 font-extrabold leading-[0.95] tracking-tight text-foreground break-words ${nameSize}`}
          >
            {name}
          </div>
          <p className="mt-3 text-base text-muted-foreground sm:text-lg">your branded returns portal</p>
          <span
            className="mt-7 inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-base font-semibold text-white shadow-lg transition-transform hover:-translate-y-0.5"
            style={{ background: brand.brandColor }}
          >
            Click anywhere to explore <ArrowRight className="size-4" />
          </span>
        </motion.div>

        {/* laptop mockup */}
        <motion.div
          animate={entering ? { scale: 9 } : { scale: 1 }}
          transition={{ duration: 0.7, ease: [0.6, 0, 0.75, 0] }}
          style={{ transformOrigin: "50% 42%" }}
          className="w-full max-w-2xl"
        >
          <div className="rounded-t-2xl border border-b-0 border-neutral-800 bg-neutral-900 p-2.5 shadow-2xl sm:p-3">
            <div className="overflow-hidden rounded-lg bg-white">
              {/* browser bar */}
              <div className="flex items-center gap-2 border-b border-neutral-200 bg-neutral-50 px-3 py-2">
                {brand.logo ? (
                  // eslint-disable-next-line @next/next/no-img-element -- remote brand logo
                  <img
                    src={brand.logo}
                    alt=""
                    className="size-[30px] shrink-0 rounded object-contain"
                    referrerPolicy="no-referrer"
                    onError={(e) => (e.currentTarget.style.display = "none")}
                  />
                ) : (
                  <span
                    className="flex size-[30px] shrink-0 items-center justify-center rounded-md text-[13px] font-bold text-white"
                    style={{ background: brand.brandColor }}
                  >
                    {initials}
                  </span>
                )}
                <span className="mx-auto flex max-w-[70%] items-center truncate rounded-md bg-white px-3 py-1 text-[12.5px] font-medium text-neutral-700 ring-1 ring-neutral-200">
                  <span className="truncate">{dom}/returns</span>
                </span>
              </div>
              {/* Inside the screen: the store's banner/hero image (a real preview),
                  falling back to the logo, then a monogram lockup. */}
              <div
                className="relative flex aspect-[16/10] w-full items-center justify-center overflow-hidden"
                style={{ background: `linear-gradient(135deg, ${brand.brandColor}14, ${brand.brandColor}33)` }}
              >
                {brand.bannerImage || brand.products.find((p) => p.image)?.image || brand.ogImage ? (
                  // eslint-disable-next-line @next/next/no-img-element -- remote brand banner
                  <img
                    src={(brand.bannerImage || brand.products.find((p) => p.image)?.image || brand.ogImage) as string}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover"
                    referrerPolicy="no-referrer"
                    onError={(e) => (e.currentTarget.style.display = "none")}
                  />
                ) : brand.logo ? (
                  // eslint-disable-next-line @next/next/no-img-element -- remote brand logo
                  <img
                    src={brand.logo}
                    alt={name}
                    className="max-h-[60%] max-w-[70%] object-contain"
                    referrerPolicy="no-referrer"
                    onError={(e) => (e.currentTarget.style.display = "none")}
                  />
                ) : (
                  // Monogram lockup: accent badge with initials + the brand name.
                  <div className="flex flex-col items-center gap-3">
                    <span
                      className="flex size-20 items-center justify-center rounded-2xl text-3xl font-extrabold text-white"
                      style={{ background: brand.brandColor }}
                    >
                      {initials}
                    </span>
                    <span className="max-w-full break-words text-center text-2xl font-bold tracking-tight text-foreground">
                      {name}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
          {/* laptop base */}
          <div className="relative left-1/2 h-3 w-[112%] -translate-x-1/2 rounded-b-xl bg-gradient-to-b from-neutral-300 to-neutral-400 shadow-lg" />
          <div className="relative left-1/2 mx-auto h-1 w-[46%] -translate-x-1/2 rounded-b-md bg-neutral-400/70" />
        </motion.div>
      </button>
    </motion.div>
  );
}
