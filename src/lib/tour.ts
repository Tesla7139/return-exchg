// Guided product tour for the returns demo. Each step belongs to a feature card in
// the left panel and (optionally) jumps the embedded portal to the screen that shows
// that feature. The spotlight targets either the feature card or the portal frame.

export type TourStep = {
  /** DOM id (in the demo page) to spotlight: a feature card or the portal frame. */
  target: string;
  /** "feature" = a card in the left panel (intro); "section" = the live portal. */
  kind: "feature" | "section";
  /** Index of the FeaturePanel card this step belongs to. */
  card: number;
  /** Portal step to show (see ReturnsApp: 1 login, 2 items, 3 shipping, 4 review, 6 confirmation, 9 tracking). */
  portalStep?: number;
  title: string;
  desc: string;
};

export const FRAME_ID = "portal-frame";

export const FEATURES: { title: string; portalStep: number }[] = [
  { title: "Branded returns portal", portalStep: 1 },
  { title: "Exchange-first nudges", portalStep: 2 },
  { title: "Flexible return methods", portalStep: 3 },
  { title: "Instant refunds & credit", portalStep: 4 },
  { title: "Labels & live tracking", portalStep: 9 },
];

export const TOUR_STEPS: TourStep[] = [
  {
    card: 0,
    kind: "feature",
    target: "feature-card-0",
    title: "Branded returns portal",
    desc: "Clickpost gives every store a returns & exchanges portal in its own look and feel: logo, colors, imagery and catalog. Here it is for this store.",
  },
  {
    card: 0,
    kind: "section",
    target: FRAME_ID,
    portalStep: 1,
    title: "Self-serve order lookup",
    desc: "Shoppers find their order with an order number plus email, phone or postal code. No support ticket, no back-and-forth.",
  },
  {
    card: 1,
    kind: "feature",
    target: "feature-card-1",
    title: "Exchange-first nudges",
    desc: "Every return is a chance to keep the revenue. Clickpost steers shoppers toward exchanges and store credit at the moment they decide.",
  },
  {
    card: 1,
    kind: "section",
    target: FRAME_ID,
    portalStep: 2,
    title: "Smart item eligibility",
    desc: "Eligible, exchange-only, final-sale and in-transit items are handled automatically. Pick an item to see size and color swaps, the full catalog, reason codes, photo proof and a bonus-credit nudge.",
  },
  {
    card: 2,
    kind: "feature",
    target: "feature-card-2",
    title: "Flexible return methods",
    desc: "Drop-off at a nearby carrier point or schedule a pickup, whichever is easiest for the shopper and cheapest for you.",
  },
  {
    card: 2,
    kind: "section",
    target: FRAME_ID,
    portalStep: 3,
    title: "Nearby drop-off points",
    desc: "Local carrier locations with distance and opening hours, plus a refund preference: store credit with a bonus, or the original payment method.",
  },
  {
    card: 3,
    kind: "feature",
    target: "feature-card-3",
    title: "Instant refunds & credit",
    desc: "Transparent totals build trust: shoppers see exactly what comes back to them, and any exchange price difference is collected in the flow.",
  },
  {
    card: 3,
    kind: "section",
    target: FRAME_ID,
    portalStep: 4,
    title: "Clear review before submit",
    desc: "A single summary of returns, exchanges, method and refund, with policy acceptance, so there are no surprises after the box ships.",
  },
  {
    card: 4,
    kind: "feature",
    target: "feature-card-4",
    title: "Labels & live tracking",
    desc: "Once submitted, shoppers get a printable label or QR code and live tracking for the return and the outbound exchange.",
  },
  {
    card: 4,
    kind: "section",
    target: FRAME_ID,
    portalStep: 9,
    title: "Return & exchange tracking",
    desc: "Every scan of the return and the replacement shipment in one branded timeline, so customers never have to ask where their refund is.",
  },
];

// On real phones there's no feature panel, so the mobile tour walks the portal only.
export const MOBILE_TOUR_STEPS: TourStep[] = TOUR_STEPS.filter((s) => s.kind === "section");

/** First tour step index that belongs to a given feature card. */
export function firstStepForCard(card: number, steps: TourStep[] = TOUR_STEPS): number {
  const i = steps.findIndex((s) => s.card === card);
  return i === -1 ? 0 : i;
}

/** First on-portal SECTION step for a card — the target for the quick card-click preview. */
export function firstSectionStepForCard(card: number, steps: TourStep[] = TOUR_STEPS): number {
  const i = steps.findIndex((s) => s.card === card && s.kind === "section");
  return i === -1 ? firstStepForCard(card, steps) : i;
}
