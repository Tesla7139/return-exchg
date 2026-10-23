"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, CreditCard, Lock, ShieldCheck } from "lucide-react";
import { usePortal } from "../PortalContext";
import { Button, Input } from "../ui";

type Method = "card" | "paypal" | "venmo";

function Radio({ active }: { active: boolean }) {
  return (
    <div
      className={`flex h-5 w-5 items-center justify-center rounded-full border-2 transition-colors ${
        active ? "border-[var(--portal-primary)]" : "border-slate-300"
      }`}
    >
      {active && <motion.div layoutId="payment-indicator" className="h-2.5 w-2.5 rounded-full bg-[var(--portal-primary)]" />}
    </div>
  );
}

function CardBadge({ label }: { label: string }) {
  return (
    <div className="flex h-5 w-8 items-center justify-center rounded-[2px] border border-slate-200 bg-slate-100">
      <span className="text-[8px] font-bold text-slate-600">{label}</span>
    </div>
  );
}

/** Demo-only card form: values stay in local state and are never sent anywhere. */
export function PaymentScreen({
  amountToPay,
  onComplete,
  onBack,
}: {
  amountToPay: number;
  onComplete: () => void;
  onBack: () => void;
}) {
  const { primary, money } = usePortal();
  const [method, setMethod] = useState<Method>("card");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [holder, setHolder] = useState("");
  const [loading, setLoading] = useState(false);

  const pay = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onComplete();
    }, 1500);
  };

  const amount = money(amountToPay);

  return (
    <motion.div
      initial={{ opacity: 0, x: "100%" }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: "-100%" }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="min-h-screen bg-transparent font-sans xl:min-h-0"
    >
      <div className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 px-5 py-4 backdrop-blur-md lg:hidden">
        <button
          onClick={onBack}
          className="mb-3 flex origin-left items-center gap-2 text-slate-600 transition-colors hover:text-slate-900 active:scale-95"
        >
          <ChevronLeft className="h-5 w-5" />
          <span className="font-medium">Back</span>
        </button>
        <h2 className="font-serif text-xl font-bold text-slate-900">Payment</h2>
        <p className="mt-1 text-sm text-slate-500">Complete your exchange.</p>
      </div>

      <div className="hidden pb-4 pt-6 lg:block">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-slate-500 transition-colors hover:-translate-x-1 hover:text-slate-900"
        >
          <ChevronLeft className="h-5 w-5" />
          <span className="font-medium">Back to Review</span>
        </button>
      </div>

      <div className="mx-auto max-w-2xl px-5 py-6 lg:px-0 lg:py-0">
        <div className="mb-6 overflow-hidden rounded-[4px] border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 bg-slate-50/50 p-6">
            <div className="flex items-end justify-between">
              <div>
                <p className="mb-1 text-sm font-medium uppercase tracking-wide text-slate-500">Total to Pay</p>
                <h1 className="font-serif text-4xl font-bold" style={{ color: primary }}>
                  {amount}
                </h1>
              </div>
              <div className="flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
                <ShieldCheck className="h-3.5 w-3.5" />
                Secure Payment
              </div>
            </div>
            <p className="mt-2 text-sm text-slate-500">
              Exchange difference: <span className="font-medium text-slate-900">{amount}</span>
            </p>
          </div>

          <div className="space-y-6 p-6">
            <h3 className="font-serif text-lg font-bold text-slate-900">Select method</h3>
            <div className="space-y-4">
              <div
                className={`overflow-hidden rounded-[4px] border transition-all duration-200 ${
                  method === "card" ? "border-slate-300 ring-1 ring-slate-300" : "border-slate-200"
                }`}
              >
                <div
                  className="flex cursor-pointer items-center justify-between p-4 transition-colors hover:bg-slate-50"
                  onClick={() => setMethod("card")}
                >
                  <div className="flex items-center gap-3">
                    <Radio active={method === "card"} />
                    <span className="font-bold text-slate-900">New Credit or Debit Card</span>
                  </div>
                  <div className="flex gap-1">
                    <CardBadge label="VISA" />
                    <CardBadge label="MC" />
                    <CardBadge label="AMEX" />
                  </div>
                </div>
                <AnimatePresence>
                  {method === "card" && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="space-y-5 border-t border-slate-100 bg-white px-4 pb-6 pt-2">
                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                          <div className="md:col-span-1">
                            <label className="mb-1.5 block text-sm font-semibold text-slate-700">Card number</label>
                            <div className="relative">
                              <Input
                                placeholder="1234 3213 2313 3213"
                                value={cardNumber}
                                onChange={(e) => setCardNumber(e.target.value)}
                                autoComplete="off"
                                className="border-slate-200 bg-slate-50 pl-10 font-mono focus:bg-white"
                              />
                              <CreditCard className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            </div>
                          </div>
                          <div className="md:col-span-1">
                            <label className="mb-1.5 block text-sm font-semibold text-slate-700">Expiration date</label>
                            <div className="relative">
                              <Input
                                placeholder="MM/YY"
                                value={expiry}
                                onChange={(e) => setExpiry(e.target.value)}
                                autoComplete="off"
                                className="border-slate-200 bg-slate-50 pl-4 font-mono focus:bg-white"
                              />
                            </div>
                          </div>
                          <div className="md:col-span-1">
                            <label className="mb-1.5 block text-sm font-semibold text-slate-700">Security code</label>
                            <div className="relative flex items-center">
                              <Input
                                placeholder="CVV/CVC"
                                value={cvv}
                                onChange={(e) => setCvv(e.target.value)}
                                autoComplete="off"
                                className="w-full border-slate-200 bg-slate-50 pr-10 font-mono focus:bg-white"
                              />
                              <div className="absolute right-3 flex h-4 w-6 items-center justify-center rounded-[2px] border border-slate-300 bg-slate-100">
                                <span className="text-[6px] font-bold text-slate-500">123</span>
                              </div>
                            </div>
                          </div>
                          <div className="md:col-span-1">
                            <label className="mb-1.5 block text-sm font-semibold text-slate-700">Cardholder name</label>
                            <Input
                              placeholder="Cardholder name"
                              value={holder}
                              onChange={(e) => setHolder(e.target.value)}
                              autoComplete="off"
                              className="border-slate-200 bg-slate-50 focus:bg-white"
                            />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div
                className={`flex cursor-pointer items-center justify-between rounded-[4px] border p-4 transition-all hover:bg-slate-50 ${
                  method === "paypal" ? "border-slate-300 bg-slate-50/50 ring-1 ring-slate-300" : "border-slate-200"
                }`}
                onClick={() => setMethod("paypal")}
              >
                <div className="flex items-center gap-3">
                  <Radio active={method === "paypal"} />
                  <span className="font-bold text-slate-900">PayPal</span>
                </div>
                <div className="flex h-5 items-center">
                  <span className="mr-0.5 font-bold italic text-[#003087]">Pay</span>
                  <span className="font-bold italic text-[#009cde]">Pal</span>
                </div>
              </div>

              <div
                className={`flex cursor-pointer items-center justify-between rounded-[4px] border p-4 transition-all hover:bg-slate-50 ${
                  method === "venmo" ? "border-slate-300 bg-slate-50/50 ring-1 ring-slate-300" : "border-slate-200"
                }`}
                onClick={() => setMethod("venmo")}
              >
                <div className="flex items-center gap-3">
                  <Radio active={method === "venmo"} />
                  <span className="font-bold text-slate-900">Venmo</span>
                </div>
                <div className="rounded-[3px] bg-[#3D95CE] px-2 py-0.5 text-[10px] font-bold text-white">venmo</div>
              </div>
            </div>

            <div className="flex gap-3 rounded-[4px] bg-slate-50 p-4 text-xs text-slate-500">
              <Lock className="h-4 w-4 flex-shrink-0 text-slate-400" />
              <p>Your payment information is encrypted and secure. We never store your full card details.</p>
            </div>

            <Button variant="primary" size="lg" fullWidth onClick={pay} isLoading={loading} className="rounded-[4px]">
              Pay {amount} &amp; Submit
            </Button>
          </div>
        </div>
      </div>

      <div className="safe-area-bottom fixed bottom-0 left-0 right-0 z-30 border-t border-slate-200 bg-white/90 p-4 shadow-lg backdrop-blur-md lg:hidden">
        <div className="mx-auto max-w-md">
          <Button variant="primary" size="lg" fullWidth onClick={pay} isLoading={loading} className="rounded-[4px]">
            Pay {amount} &amp; Submit
          </Button>
        </div>
      </div>
      <div className="h-24 lg:h-12" />
    </motion.div>
  );
}
