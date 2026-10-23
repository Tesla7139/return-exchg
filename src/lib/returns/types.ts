/** Data passed between portal screens (mirrors the reference design's App state). */

export type OrderData = {
  orderId: string;
  email?: string;
  phone?: string;
  zipCode?: string;
};

export type SelectedItem = {
  id: string;
  quantity: number;
  reason?: string;
  details?: string;
  isExchange: boolean;
  exchangeVariant?: { size?: string; color?: string };
  exchangeProduct?: { id: string; title: string; price: number; image: string | null; variant: string };
};

export type ShippingMethod = "drop-off" | "pickup" | string;
export type PaymentMethod = "store-credit" | "original" | string;

export type ReturnData = {
  orderData?: OrderData;
  selectedItems: SelectedItem[];
  shippingMethod?: ShippingMethod;
  dropOffLocation?: string;
  paymentMethod?: PaymentMethod;
};

export type Step = { label: string; number: number };

/** sessionStorage key the demo frame writes the resolved brand to before mounting the portal iframe. */
export const BRAND_STORAGE_KEY = "cp-returns-brand";

/** postMessage the demo frame sends to jump the portal to a step (guided tour). */
export type GotoMessage = { type: "cp-goto"; step: number };
