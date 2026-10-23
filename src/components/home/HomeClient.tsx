"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Loader2 } from "lucide-react";
import { Container } from "@/components/primitives/Container";
import { Navbar } from "@/components/layout/Navbar";
import { LaunchExperience } from "@/components/frame/LaunchExperience";
import { useBrand } from "@/hooks/useBrand";

/**
 * Home + demo launcher. When `initialStore` is provided (deep link like
 * `/gullylabs.com`), it auto-submits that store and jumps straight into the demo.
 */
// A valid store URL: no spaces, a real domain with a dot + TLD (protocol optional).
function isValidStoreUrl(v: string): boolean {
  const s = v.trim();
  if (!s || /\s/.test(s)) return false;
  const host = s.replace(/^https?:\/\//i, "").split(/[/?#]/)[0];
  return /^([a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,}$/i.test(host);
}

// Ping the salesperson's Slack/Discord (via /api/track) when a SHARED demo link is
// opened. Fires once per browser session per store, and never when `?noping` is set
// (so the owner can open their own links without alerting themselves). Fire-and-forget.
function notifyOpen(store: string): void {
  if (typeof window === "undefined") return;
  try {
    if (new URLSearchParams(window.location.search).has("noping")) return;
    const key = `cp-tracked:${store.toLowerCase()}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");
    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ store }),
      keepalive: true,
    }).catch(() => {});
  } catch {
    /* private mode / storage blocked — skip silently */
  }
}

export function HomeClient({ initialStore }: { initialStore?: string }) {
  const [value, setValue] = useState(initialStore ?? "");
  const [highlight, setHighlight] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { status, brand, submittedUrl, submit, reset } = useBrand();

  // Deep link: auto-open the demo for the store named in the URL — but only if it's
  // a valid store URL; otherwise show the home page with an error (no garbage launch).
  useEffect(() => {
    if (!initialStore) return;
    if (isValidStoreUrl(initialStore)) {
      submit(initialStore);
      notifyOpen(initialStore);
    } else {
      setError("That doesn't look like a valid store URL — e.g. yourstore.com (no spaces).");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep the address bar mirroring the current view: /<store> while a store's demo
  // is open (a shareable deep link), and / when back on the home input. Applies
  // however the store was opened (input or deep link), so going back always
  // restores the plain link.
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (status !== "idle" && submittedUrl) {
      const seg = submittedUrl
        .trim()
        .replace(/^https?:\/\//i, "")
        .replace(/^www\./i, "")
        .split(/[/?#]/)[0];
      const path = seg ? `/${encodeURIComponent(seg)}` : "/";
      if (window.location.pathname !== path) window.history.replaceState(null, "", path);
    } else if (status === "idle" && window.location.pathname !== "/") {
      window.history.replaceState(null, "", "/");
    }
  }, [status, submittedUrl]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidStoreUrl(value)) {
      setError("Please enter a valid store URL — e.g. yourstore.com (no spaces).");
      setHighlight(true);
      setTimeout(() => setHighlight(false), 1400);
      return;
    }
    setError(null);
    submit(value);
  };

  // "Product Tour" → focus + flash the store-URL box so it's clear where to start.
  const focusUrl = () => {
    inputRef.current?.focus();
    setHighlight(true);
    setTimeout(() => setHighlight(false), 1400);
  };

  // Once a store is submitted, hand off to the launch flow (loading → laptop → returns portal).
  if (status !== "idle") {
    return (
      <LaunchExperience
        status={status}
        brand={brand}
        submittedUrl={submittedUrl}
        onReset={() => {
          reset();
          setValue("");
        }}
      />
    );
  }

  const loading = false;

  return (
    <div className="min-h-svh w-full overflow-x-hidden bg-white">
      <Navbar onProductTour={focusUrl} />
      <Container className="flex min-h-[calc(100svh-73px)] flex-col items-center justify-center py-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto flex w-full max-w-3xl flex-col items-center"
        >
          <h1
            className="w-full max-w-full text-balance break-words font-medium text-[#0a0a0a]"
            style={{
              fontSize: "clamp(1.6rem, 4.5vw, 3.5rem)",
              lineHeight: 1.08,
              letterSpacing: "-0.022em",
            }}
          >
            Turn every <span className="text-primary">return</span> into an{" "}
            <span className="text-primary">exchange</span>
          </h1>
          <p
            className="mt-7 w-full max-w-xl text-muted-foreground"
            style={{ fontSize: "clamp(1rem, 1.5vw, 1.4rem)" }}
          >
            Enter your store URL to see your own branded returns & exchanges portal, built from your catalog.
          </p>

          <motion.form
            onSubmit={onSubmit}
            animate={highlight ? { x: [0, -7, 7, -5, 5, -2, 2, 0] } : { x: 0 }}
            transition={{ duration: 0.55, ease: "easeInOut" }}
            className={`mt-9 flex w-full max-w-2xl items-center gap-2 rounded-full border bg-white p-2 transition-all ${
              error
                ? "border-red-400 shadow-[0_18px_54px_-14px_rgba(239,68,68,0.35)] ring-4 ring-red-200"
                : highlight
                ? "border-primary shadow-[0_18px_54px_-14px_rgba(21,95,255,0.5)] ring-4 ring-primary/30"
                : "border-border shadow-[0_10px_36px_-14px_rgba(21,95,255,0.25)] focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/15"
            }`}
          >
            <input
              ref={inputRef}
              value={value}
              onChange={(e) => {
                setValue(e.target.value);
                if (error) setError(null);
              }}
              placeholder="Enter your store URL"
              autoFocus
              inputMode="url"
              disabled={loading}
              className="pill-input min-w-0 flex-1 bg-transparent px-6 text-base text-foreground outline-none placeholder:text-muted-foreground/60"
            />
            <button
              type="submit"
              disabled={loading || !value.trim()}
              className="flex shrink-0 items-center gap-2 rounded-full bg-primary px-7 py-3.5 font-semibold text-white transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> Loading
                </>
              ) : (
                <>
                  See it live <ArrowRight className="size-4" />
                </>
              )}
            </button>
          </motion.form>

          {error && (
            <p className="mt-3 text-sm font-medium text-red-500">{error}</p>
          )}
        </motion.div>
      </Container>
    </div>
  );
}
