/**
 * Vertical-aware copy for the returns portal. The two reference designs are the
 * same flow skinned for an apparel brand (Manymoons) and a beauty brand (GoPure);
 * the store's catalog decides which content set a demo gets.
 */
import type { Product } from "@/lib/site";

export type Vertical = "apparel" | "footwear" | "beauty" | "general";

export type Option = { value: string; label: string };

export type SizeGuideRow = { label: string; detail: string; note?: string };

export type VerticalContent = {
  vertical: Vertical;
  /** Top-level return reasons ("" = placeholder). */
  reasons: Option[];
  /** Follow-up reasons keyed by the top-level value. */
  subReasons: Record<string, Option[]>;
  /** Reasons where a photo is required to process the return. */
  photoRequired: string[];
  /** Variant axis used when exchanging for a different size. */
  sizeLabel: string;
  sizeOptions: string[];
  colorOptions: string[];
  sizeGuide: { title: string; description: string; rows: SizeGuideRow[] };
  /** "styles" for fashion, "products" otherwise ("Search styles...", "No styles found"). */
  noun: string;
  nounPlural: string;
  /** Catalog modal heading ("Style Exchange" / "Product Exchange"). */
  catalogTitle: string;
  loginTagline: string;
  loginSubline: string;
  bannerEyebrow: string;
  bannerTitle: string;
  bannerCta: string;
};

const APPAREL: VerticalContent = {
  vertical: "apparel",
  reasons: [
    { value: "", label: "Select a reason" },
    { value: "wrong-size", label: "Wrong Size" },
    { value: "doesnt-fit", label: "Doesn't Fit as Expected" },
    { value: "not-as-described", label: "Not as Described" },
    { value: "quality", label: "Quality Issue" },
    { value: "damaged", label: "Damaged in Shipping" },
    { value: "changed-mind", label: "Changed Mind" },
    { value: "other", label: "Other" },
  ],
  subReasons: {
    "wrong-size": [
      { value: "too-large", label: "Too large" },
      { value: "too-small", label: "Too small" },
      { value: "sizing-inconsistent", label: "Sizing inconsistent with guide" },
    ],
    "doesnt-fit": [
      { value: "too-long-short", label: "Too long / too short" },
      { value: "too-loose-tight", label: "Too loose / too tight" },
      { value: "style-not-flattering", label: "Style not flattering on me" },
    ],
    "not-as-described": [
      { value: "color-different", label: "Color looks different in person" },
      { value: "fabric-different", label: "Fabric feel is different" },
      { value: "photos-misleading", label: "Photos were misleading" },
    ],
    quality: [
      { value: "fabric-defect", label: "Fabric defect / snag" },
      { value: "stitching-issue", label: "Stitching / seam issue" },
      { value: "print-faded", label: "Print or color faded" },
    ],
    damaged: [
      { value: "torn-ripped", label: "Torn / ripped" },
      { value: "stain-mark", label: "Stain / mark" },
      { value: "damaged-packaging", label: "Damaged packaging" },
    ],
    "changed-mind": [
      { value: "better-price", label: "Found better price elsewhere" },
      { value: "dont-need", label: "No longer needed" },
      { value: "ordered-mistake", label: "Ordered by mistake" },
    ],
    other: [
      { value: "gift", label: "Gift return" },
      { value: "unsatisfied", label: "General dissatisfaction" },
    ],
  },
  photoRequired: ["quality", "damaged"],
  sizeLabel: "Size",
  sizeOptions: ["XS", "S", "M", "L", "XL"],
  colorOptions: ["Original", "Black", "White", "Navy", "Sand"],
  sizeGuide: {
    title: "Size Guide",
    description: "Apparel size guide with measurements.",
    rows: [
      { label: "XS", detail: "Bust: 31–32\" · Waist: 24–25\"", note: "US 0–2" },
      { label: "S", detail: "Bust: 33–34\" · Waist: 26–27\"", note: "US 4–6" },
      { label: "M", detail: "Bust: 35–36\" · Waist: 28–29\"", note: "US 8–10" },
      { label: "L", detail: "Bust: 37–39\" · Waist: 30–32\"", note: "US 12–14" },
      { label: "XL", detail: "Bust: 40–42\" · Waist: 33–35\"", note: "US 16" },
    ],
  },
  noun: "style",
  nounPlural: "styles",
  catalogTitle: "Style Exchange",
  loginTagline: "Easy returns, effortless style.",
  loginSubline: "Start your return or exchange in just a few steps.",
  bannerEyebrow: "New Arrivals",
  bannerTitle: "The New Collection",
  bannerCta: "Explore More Styles →",
};

const FOOTWEAR: VerticalContent = {
  ...APPAREL,
  vertical: "footwear",
  subReasons: {
    ...APPAREL.subReasons,
    "wrong-size": [
      { value: "too-large", label: "Too big" },
      { value: "too-small", label: "Too small" },
      { value: "too-narrow", label: "Too narrow / too wide" },
    ],
    "doesnt-fit": [
      { value: "heel-slip", label: "Heel slips" },
      { value: "pinches", label: "Pinches the toes" },
      { value: "uncomfortable", label: "Uncomfortable to walk in" },
    ],
    quality: [
      { value: "sole-defect", label: "Sole defect / peeling" },
      { value: "stitching-issue", label: "Stitching / seam issue" },
      { value: "material-defect", label: "Scuffed or creased material" },
    ],
  },
  sizeOptions: ["6", "7", "8", "9", "10", "11"],
  sizeGuide: {
    title: "Size Guide",
    description: "Footwear size guide with foot length.",
    rows: [
      { label: "6", detail: "Foot length: 9.25\"", note: "EU 39 · UK 5.5" },
      { label: "7", detail: "Foot length: 9.625\"", note: "EU 40 · UK 6.5" },
      { label: "8", detail: "Foot length: 9.9375\"", note: "EU 41 · UK 7.5" },
      { label: "9", detail: "Foot length: 10.25\"", note: "EU 42 · UK 8.5" },
      { label: "10", detail: "Foot length: 10.5625\"", note: "EU 43 · UK 9.5" },
      { label: "11", detail: "Foot length: 10.9375\"", note: "EU 44 · UK 10.5" },
    ],
  },
  loginTagline: "Easy returns, every step of the way.",
};

const BEAUTY: VerticalContent = {
  vertical: "beauty",
  reasons: [
    { value: "", label: "Select a reason" },
    { value: "quality", label: "Quality Issue" },
    { value: "damaged", label: "Damaged in Shipping" },
    { value: "allergic", label: "Allergic Reaction" },
    { value: "scent", label: "Scent / Texture" },
    { value: "wrong", label: "Wrong Item Received" },
    { value: "changed-mind", label: "Changed Mind" },
    { value: "other", label: "Other" },
  ],
  subReasons: {
    quality: [
      { value: "expired", label: "Product is expired" },
      { value: "consistency", label: "Consistency is off" },
      { value: "packaging", label: "Packaging is defective" },
      { value: "not-effective", label: "Product not effective" },
    ],
    damaged: [
      { value: "broken-seal", label: "Seal broken" },
      { value: "broken-container", label: "Container broken/leaking" },
      { value: "box-crushed", label: "Box crushed" },
    ],
    allergic: [
      { value: "rash", label: "Caused rash/redness" },
      { value: "breakout", label: "Caused breakout" },
      { value: "irritation", label: "General irritation" },
      { value: "eye-irritation", label: "Eye irritation" },
    ],
    scent: [
      { value: "too-strong", label: "Scent is too strong" },
      { value: "bad-smell", label: "Smells bad/off" },
      { value: "too-greasy", label: "Too greasy/oily" },
      { value: "too-dry", label: "Too drying" },
      { value: "texture-grit", label: "Texture is gritty" },
    ],
    wrong: [
      { value: "wrong-item", label: "Entirely wrong item" },
      { value: "wrong-shade", label: "Wrong shade sent" },
      { value: "missing-parts", label: "Missing parts" },
    ],
    "changed-mind": [
      { value: "better-price", label: "Found better price" },
      { value: "dont-need", label: "No longer needed" },
      { value: "ordered-mistake", label: "Ordered by mistake" },
      { value: "arrived-late", label: "Arrived too late" },
    ],
    other: [
      { value: "gift", label: "Gift return" },
      { value: "unsatisfied", label: "General dissatisfaction" },
    ],
  },
  photoRequired: ["quality", "damaged", "allergic", "wrong"],
  sizeLabel: "Size",
  sizeOptions: ["Trial / Travel", "Standard Monthly", "Best Value", "Pro Size"],
  colorOptions: ["Original", "Fragrance-free", "New Type / Color"],
  sizeGuide: {
    title: "Size Guide",
    description: "Guide to help you choose the right product size based on duration and usage.",
    rows: [
      { label: "Trial / Travel", detail: "15ml · Typically lasts 1–2 weeks" },
      { label: "Standard Monthly", detail: "50ml · Typically lasts 4–6 weeks" },
      { label: "Best Value", detail: "100ml · Typically lasts 2–3 months", note: "Get a free pouch of 5ml lotion" },
      { label: "Pro Size", detail: "200ml · Typically lasts 4–6 months" },
    ],
  },
  noun: "product",
  nounPlural: "products",
  catalogTitle: "Product Exchange",
  loginTagline: "Easy returns, radiant results.",
  loginSubline: "Start your return or exchange in just a few steps.",
  bannerEyebrow: "Bestsellers",
  bannerTitle: "Bundles & Sets",
  bannerCta: "Shop Bundles →",
};

const GENERAL: VerticalContent = {
  vertical: "general",
  reasons: [
    { value: "", label: "Select a reason" },
    { value: "not-as-described", label: "Not as Described" },
    { value: "quality", label: "Quality Issue" },
    { value: "damaged", label: "Damaged in Shipping" },
    { value: "wrong", label: "Wrong Item Received" },
    { value: "changed-mind", label: "Changed Mind" },
    { value: "other", label: "Other" },
  ],
  subReasons: {
    "not-as-described": [
      { value: "looks-different", label: "Looks different in person" },
      { value: "smaller-larger", label: "Smaller / larger than expected" },
      { value: "photos-misleading", label: "Photos were misleading" },
    ],
    quality: [
      { value: "defective", label: "Defective / doesn't work" },
      { value: "poor-finish", label: "Poor finish or materials" },
      { value: "stopped-working", label: "Stopped working after use" },
    ],
    damaged: [
      { value: "broken", label: "Arrived broken" },
      { value: "scratched", label: "Scratched / dented" },
      { value: "damaged-packaging", label: "Damaged packaging" },
    ],
    wrong: [
      { value: "wrong-item", label: "Entirely wrong item" },
      { value: "wrong-variant", label: "Wrong color / variant" },
      { value: "missing-parts", label: "Missing parts" },
    ],
    "changed-mind": [
      { value: "better-price", label: "Found better price elsewhere" },
      { value: "dont-need", label: "No longer needed" },
      { value: "ordered-mistake", label: "Ordered by mistake" },
    ],
    other: [
      { value: "gift", label: "Gift return" },
      { value: "unsatisfied", label: "General dissatisfaction" },
    ],
  },
  photoRequired: ["quality", "damaged", "wrong"],
  sizeLabel: "Option",
  sizeOptions: ["Standard", "Large", "Bundle"],
  colorOptions: ["Original", "Black", "White", "Natural"],
  sizeGuide: {
    title: "Product Guide",
    description: "Compare product options before you exchange.",
    rows: [
      { label: "Standard", detail: "Our most popular option" },
      { label: "Large", detail: "More capacity, same great quality" },
      { label: "Bundle", detail: "Best value — save on multiples" },
    ],
  },
  noun: "product",
  nounPlural: "products",
  catalogTitle: "Product Exchange",
  loginTagline: "Easy returns, zero hassle.",
  loginSubline: "Start your return or exchange in just a few steps.",
  bannerEyebrow: "New Arrivals",
  bannerTitle: "Just Landed",
  bannerCta: "Explore More →",
};

const KEYWORDS: [Vertical, RegExp][] = [
  [
    "beauty",
    /\b(serum|cream|lotion|moistur|cleanser|toner|spf|sunscreen|mask|masque|lip|lipstick|mascara|foundation|concealer|blush|skin|skincare|face|facial|shampoo|conditioner|hair ?oil|body wash|soap|fragrance|perfume|parfum|eau de|cologne|deodorant|nail|polish|retinol|vitamin c|balm|scrub|exfoliat|makeup|cosmetic|beauty|gummies|supplement)\b/i,
  ],
  ["footwear", /\b(shoe|shoes|sneaker|sneakers|boot|boots|sandal|sandals|slide|slides|loafer|loafers|heel|heels|trainer|trainers|clog|clogs|mule|mules|slipper|slippers|footwear)\b/i],
  [
    "apparel",
    /\b(dress|dresses|shirt|t-shirt|tee|top|tops|blouse|skirt|pant|pants|jean|jeans|denim|short|shorts|jacket|coat|hoodie|sweater|sweatshirt|cardigan|jumpsuit|romper|kurta|saree|sari|legging|leggings|bra|bralette|lingerie|underwear|brief|briefs|boxer|sock|socks|swim|swimsuit|bikini|tunic|kaftan|kimono|blazer|vest|tank|polo|trouser|trousers|jogger|joggers|apparel|clothing|outfit|pajama|pyjama|nightwear|activewear|onesie|bodysuit)\b/i,
  ],
];

/** Guess the store vertical from its product titles/types (majority keyword vote). */
export function detectVertical(products: Product[]): Vertical {
  const score: Record<Vertical, number> = { apparel: 0, footwear: 0, beauty: 0, general: 0 };
  for (const p of products) {
    const text = `${p.title} ${p.type ?? ""}`;
    for (const [v, re] of KEYWORDS) {
      if (re.test(text)) {
        score[v] += 1;
        break;
      }
    }
  }
  const best = (Object.keys(score) as Vertical[])
    .filter((v) => v !== "general")
    .sort((a, b) => score[b] - score[a])[0];
  // Need a real signal (at least 2 products, or a third of the catalog) to commit.
  const min = Math.max(2, Math.ceil(products.length / 4));
  return score[best] >= min || (products.length > 0 && score[best] === products.length) ? best : "general";
}

export function contentFor(v: Vertical): VerticalContent {
  return v === "beauty" ? BEAUTY : v === "apparel" ? APPAREL : v === "footwear" ? FOOTWEAR : GENERAL;
}

// ---- Locale: carriers, postal-code naming and drop-off points by market ----

export type DropOffLocation = {
  id: string;
  name: string;
  address: string;
  distance: string;
  hours: string;
};

export type Locale = {
  postalLabel: string; // "Zip Code" / "PIN Code" / "Postcode"
  postalPlaceholder: string;
  postalExample: string;
  postalPattern: RegExp;
  phonePlaceholder: string;
  carrier: string; // primary return carrier (labels / tracking)
  dropOffs: DropOffLocation[];
  distanceUnit: "miles" | "km";
  city: string;
};

const usDrop = (city: string): DropOffLocation[] => [
  { id: "1", name: "FedEx Office - Downtown", address: `123 Main St, ${city}`, distance: "0.3 miles", hours: "Open until 8:00 PM" },
  { id: "2", name: "UPS Store - River Plaza", address: "456 River Road", distance: "0.7 miles", hours: "Open until 7:00 PM" },
  { id: "3", name: "USPS - Central Station", address: "789 Central Avenue", distance: "1.2 miles", hours: "Open until 6:00 PM" },
  { id: "4", name: "FedEx Office - Westside", address: "2341 West Blvd", distance: "2.1 miles", hours: "Open until 9:00 PM" },
  { id: "5", name: "The UPS Store - Shopping Mall", address: "8800 Mall Drive", distance: "3.4 miles", hours: "Open until 8:00 PM" },
  { id: "6", name: "Walgreens FedEx OnSite", address: "7788 Pharmacy Blvd", distance: "4.0 miles", hours: "Open until 10:00 PM" },
];

export function localeFor(country: string | null | undefined, city: string | null | undefined): Locale {
  const c = (country || "").toLowerCase();
  const town = city || "New York";
  if (c.includes("india")) {
    return {
      postalLabel: "PIN Code",
      postalPlaceholder: "Shipping PIN Code",
      postalExample: "110001",
      postalPattern: /^\d{6}$/,
      phonePlaceholder: "98765 43210",
      carrier: "Delhivery",
      distanceUnit: "km",
      city: town,
      dropOffs: [
        { id: "1", name: "Delhivery Service Point - Central", address: `12 MG Road, ${town}`, distance: "0.6 km", hours: "Open until 8:00 PM" },
        { id: "2", name: "Blue Dart Express - City Centre", address: "45 Park Street", distance: "1.1 km", hours: "Open until 7:00 PM" },
        { id: "3", name: "India Post - Head Post Office", address: "1 GPO Road", distance: "1.8 km", hours: "Open until 6:00 PM" },
        { id: "4", name: "Ekart Drop Point - Market", address: "88 Station Road", distance: "2.4 km", hours: "Open until 9:00 PM" },
        { id: "5", name: "DTDC Express - Mall Kiosk", address: "Phoenix Mall, Ground Floor", distance: "3.2 km", hours: "Open until 9:30 PM" },
      ],
    };
  }
  if (c.includes("united kingdom") || c === "uk" || c.includes("britain")) {
    return {
      postalLabel: "Postcode",
      postalPlaceholder: "Shipping Postcode",
      postalExample: "SW1A 1AA",
      postalPattern: /^[A-Z]{1,2}\d[A-Z\d]? ?\d[A-Z]{2}$/i,
      phonePlaceholder: "07700 900123",
      carrier: "Royal Mail",
      distanceUnit: "miles",
      city: town,
      dropOffs: [
        { id: "1", name: "Post Office - High Street", address: `21 High Street, ${town}`, distance: "0.3 miles", hours: "Open until 5:30 PM" },
        { id: "2", name: "InPost Locker - Tesco Express", address: "90 King's Road", distance: "0.6 miles", hours: "Open 24 Hours" },
        { id: "3", name: "Evri ParcelShop - Newsagent", address: "14 Market Place", distance: "0.9 miles", hours: "Open until 9:00 PM" },
        { id: "4", name: "DPD Pickup - Co-op", address: "3 Station Approach", distance: "1.5 miles", hours: "Open until 10:00 PM" },
        { id: "5", name: "Royal Mail Customer Service Point", address: "Mount Pleasant", distance: "2.2 miles", hours: "Open until 6:00 PM" },
      ],
    };
  }
  if (c.includes("canada")) {
    return {
      postalLabel: "Postal Code",
      postalPlaceholder: "Shipping Postal Code",
      postalExample: "M5V 2T6",
      postalPattern: /^[A-Z]\d[A-Z] ?\d[A-Z]\d$/i,
      phonePlaceholder: "(416) 555-0123",
      carrier: "Canada Post",
      distanceUnit: "km",
      city: town,
      dropOffs: [
        { id: "1", name: "Canada Post - Shoppers Drug Mart", address: `200 Queen St W, ${town}`, distance: "0.5 km", hours: "Open until 10:00 PM" },
        { id: "2", name: "Purolator Shipping Centre", address: "55 King St E", distance: "1.2 km", hours: "Open until 7:00 PM" },
        { id: "3", name: "UPS Access Point - Staples", address: "375 University Ave", distance: "1.9 km", hours: "Open until 8:00 PM" },
        { id: "4", name: "FedEx Office - Downtown", address: "459 Bloor St W", distance: "2.8 km", hours: "Open until 9:00 PM" },
      ],
    };
  }
  if (c.includes("australia")) {
    return {
      postalLabel: "Postcode",
      postalPlaceholder: "Shipping Postcode",
      postalExample: "2000",
      postalPattern: /^\d{4}$/,
      phonePlaceholder: "0412 345 678",
      carrier: "Australia Post",
      distanceUnit: "km",
      city: town,
      dropOffs: [
        { id: "1", name: "Australia Post - GPO", address: `1 Martin Place, ${town}`, distance: "0.4 km", hours: "Open until 5:30 PM" },
        { id: "2", name: "Parcel Locker - Central Station", address: "Eddy Avenue", distance: "1.1 km", hours: "Open 24 Hours" },
        { id: "3", name: "Sendle Drop Point - Newsagency", address: "88 George St", distance: "1.6 km", hours: "Open until 7:00 PM" },
        { id: "4", name: "StarTrack Business Centre", address: "12 Wharf Rd", distance: "3.0 km", hours: "Open until 6:00 PM" },
      ],
    };
  }
  return {
    postalLabel: "Zip Code",
    postalPlaceholder: "Shipping Zip Code",
    postalExample: "90001",
    postalPattern: /^\d{5}(-\d{4})?$/,
    phonePlaceholder: "(555) 123-4567",
    carrier: "UPS",
    distanceUnit: "miles",
    city: town,
    dropOffs: usDrop(town),
  };
}
