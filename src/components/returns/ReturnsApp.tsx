"use client";

import { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { Toaster } from "sonner";
import type { GotoMessage, ReturnData, Step } from "@/lib/returns/types";
import { usePortal } from "./PortalContext";
import { PortalFooter } from "./PortalFooter";
import { Stepper } from "./Stepper";
import { LoginScreen } from "./screens/LoginScreen";
import { ProductSelectScreen } from "./screens/ProductSelectScreen";
import { ShippingScreen } from "./screens/ShippingScreen";
import { ReviewScreen } from "./screens/ReviewScreen";
import { PaymentScreen } from "./screens/PaymentScreen";
import { ConfirmationScreen } from "./screens/ConfirmationScreen";
import { ReturnLabelScreen } from "./screens/ReturnLabelScreen";
import { PrintLabelScreen } from "./screens/PrintLabelScreen";
import { TrackingScreen } from "./screens/TrackingScreen";

const STEPS: Step[] = [
  { label: "Select Items", number: 1 },
  { label: "Shipping", number: 2 },
  { label: "Review", number: 3 },
];

/**
 * The returns portal flow (port of the reference design's App.tsx):
 * 1 login → 2 select items → 3 shipping & payment → 4 review → (5 pay difference)
 * → 6 confirmation → 7 return label → 8 print label / 9 tracking.
 */
export function ReturnsApp() {
  const { items, primary, bg, content, locale, orderId } = usePortal();
  const [step, setStep] = useState(1);
  const [data, setData] = useState<ReturnData>({ selectedItems: [] });

  // Exchanges for a pricier item owe the difference (paid on step 5).
  const amountToPay = data.selectedItems.reduce((sum, s) => {
    if (s.isExchange && s.exchangeProduct) {
      const paid = items.find((i) => i.id === s.id)?.price ?? 0;
      const diff = s.exchangeProduct.price - paid;
      return sum + (diff > 0 ? diff : 0);
    }
    return sum;
  }, 0);

  const go = (n: number) => {
    setStep(n);
    if (typeof window !== "undefined") window.scrollTo({ top: 0 });
  };

  // Refund preview on the shipping step: returns only (an exchange refunds nothing).
  const valueOf = (id: string, qty: number) => (items.find((i) => i.id === id)?.price ?? 0) * qty;
  const returnsValue = data.selectedItems.reduce((sum, s) => (s.isExchange ? sum : sum + valueOf(s.id, s.quantity)), 0);
  // Exchange-only requests still preview what store credit would be worth, never $0.
  const refundTotal =
    returnsValue || data.selectedItems.reduce((sum, s) => sum + valueOf(s.id, s.quantity), 0);

  // Guided tour: the demo frame jumps the portal to a screen. Later screens need a
  // selection to show, so seed a representative one (a return + an exchange).
  useEffect(() => {
    const onMessage = (e: MessageEvent<GotoMessage>) => {
      if (e.origin !== window.location.origin || e.data?.type !== "cp-goto") return;
      const target = e.data.step;
      if (target >= 3) {
        setData((d) =>
          d.selectedItems.length
            ? d
            : {
                ...d,
                orderData: d.orderData ?? { orderId },
                shippingMethod: d.shippingMethod ?? "drop-off",
                dropOffLocation: d.dropOffLocation ?? locale.dropOffs[0]?.name,
                paymentMethod: d.paymentMethod ?? "store-credit",
                selectedItems: [
                  { id: items[0].id, quantity: 1, reason: content.reasons[1]?.value, isExchange: false },
                  {
                    id: items[1].id,
                    quantity: 1,
                    reason: content.reasons[2]?.value,
                    isExchange: true,
                    exchangeVariant: { size: content.sizeOptions[2] ?? content.sizeOptions[0], color: items[1].variant.color },
                  },
                ],
              }
        );
      }
      go(target);
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [items, content, locale, orderId]);

  const back = () => {
    if (step === 9) return go(6);
    if (step === 8) return go(7);
    if (step === 7) return go(6);
    if (step > 1) go(step - 1);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: bg }}>
      <Toaster
        theme="light"
        position="top-center"
        className="toaster group !z-[9999]"
        toastOptions={{
          style: {
            background: primary,
            color: "#fff",
            border: "none",
            borderRadius: "12px",
            fontSize: "14px",
            fontWeight: 500,
            fontFamily: "inherit",
          },
          className: "font-sans",
        }}
      />
      {step === 1 ? (
        <LoginScreen
          onComplete={(orderData) => {
            setData((d) => ({ ...d, orderData }));
            go(2);
          }}
        />
      ) : (
        <div className="flex min-h-screen flex-col">
          {/* Frosted-glass stepper, full width and sticky; content scrolls under it. */}
          {step < 5 && (
            <div
              className="sticky top-0 z-50 border-b border-white/60 bg-white/50 shadow-[0_8px_32px_-16px_rgba(15,23,42,0.18)] backdrop-blur-xl backdrop-saturate-150 transition-all duration-300 lg:pb-2 lg:pt-6"
              style={{ backgroundImage: `linear-gradient(180deg, ${primary}0d, transparent)` }}
            >
              <div className="mx-auto max-w-md lg:max-w-6xl">
                <Stepper steps={STEPS} currentStep={step - 1} />
              </div>
            </div>
          )}
          <div className="mx-auto w-full flex-1 px-0 md:px-6 lg:max-w-[1760px] lg:px-10 lg:pt-8 xl:px-16">

            <div className="mx-auto max-w-md pb-8 md:max-w-2xl lg:mx-0 lg:max-w-none lg:pb-12">
              <AnimatePresence mode="wait">
                {step === 2 && (
                  <ProductSelectScreen
                    key="product-select"
                    orderData={data.orderData}
                    selectedItems={data.selectedItems}
                    onComplete={(selectedItems) => {
                      setData((d) => ({ ...d, selectedItems }));
                      go(3);
                    }}
                    onBack={back}
                  />
                )}
                {step === 3 && (
                  <ShippingScreen
                    key="shipping"
                    refundTotal={refundTotal}
                    selectedItems={data.selectedItems}
                    onComplete={(shippingMethod, dropOffLocation, paymentMethod) => {
                      setData((d) => ({ ...d, shippingMethod, dropOffLocation, paymentMethod }));
                      go(4);
                    }}
                    onBack={back}
                  />
                )}
                {step === 4 && (
                  <ReviewScreen
                    key="review"
                    returnData={data}
                    onComplete={() =>
                      data.selectedItems.some((s) => s.isExchange) && amountToPay > 0 ? go(5) : go(6)
                    }
                    onBack={back}
                  />
                )}
                {step === 5 && (
                  <PaymentScreen key="payment" amountToPay={amountToPay} onComplete={() => go(6)} onBack={back} />
                )}
                {step === 6 && (
                  <ConfirmationScreen
                    key="confirmation"
                    returnData={data}
                    onDone={() => {
                      setData({ selectedItems: [] });
                      go(1);
                    }}
                    onShowReturnLabel={() => go(7)}
                    onTrackOrder={() => go(9)}
                  />
                )}
                {step === 7 && (
                  <ReturnLabelScreen
                    key="return-label"
                    onBack={back}
                    onPrintLabel={() => go(8)}
                    orderId={data.orderData?.orderId}
                    userName={data.orderData?.email?.split("@")[0]}
                  />
                )}
                {step === 8 && <PrintLabelScreen key="print-label" onBack={back} orderId={data.orderData?.orderId} />}
                {step === 9 && <TrackingScreen key="tracking" onBack={back} returnData={data} />}
              </AnimatePresence>
            </div>
          </div>
          <PortalFooter />
        </div>
      )}
    </div>
  );
}
