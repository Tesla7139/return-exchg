"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { AlertCircle, ArrowRight, ExternalLink, HelpCircle, Mail, MapPin, Package, Phone } from "lucide-react";
import type { OrderData } from "@/lib/returns/types";
import { usePortal } from "../PortalContext";
import {
  BrandLogo,
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Input,
} from "../ui";

type VerifyMethod = "email" | "phone" | "zipCode";
type FormErrors = Partial<Record<"orderId" | "email" | "phone" | "zipCode", string>>;
type FoundOrder = { orderId: string; date: string; total: string; status: string };

const INPUT_CLASS = "bg-slate-50 border-slate-200 focus:bg-white rounded-[4px]";

export function LoginScreen({ onComplete }: { onComplete: (d: OrderData) => void }) {
  const { primary, accent, bg, panel, name, heroImage, orderId, items, content, locale, money } = usePortal();

  const [form, setForm] = useState({ orderId, email: "", phone: locale.phonePlaceholder, zipCode: "" });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [method, setMethod] = useState<VerifyMethod>("phone");
  const [verifyFailed, setVerifyFailed] = useState(false);
  const [orders, setOrders] = useState<FoundOrder[]>([]);
  const [selectedOrder, setSelectedOrder] = useState("");

  const postalLower = locale.postalLabel.toLowerCase();

  const validate = () => {
    const e: FormErrors = {};
    if (!form.orderId.trim()) e.orderId = "Order ID is required";
    if (method === "email") {
      if (!form.email.trim()) e.email = "Email is required";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Please enter a valid email address";
    }
    if (method === "phone") {
      if (!form.phone.trim()) e.phone = "Phone number is required";
      else if (!/^\d{10,}$/.test(form.phone.replace(/\D/g, ""))) e.phone = "Please enter a valid phone number";
    }
    if (method === "zipCode") {
      if (!form.zipCode.trim()) e.zipCode = `${locale.postalLabel} is required`;
      else if (!locale.postalPattern.test(form.zipCode.trim())) e.zipCode = `Please enter a valid ${postalLower}`;
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const verified = (id: string): OrderData => ({
    orderId: id,
    email: method === "email" ? form.email : undefined,
    phone: method === "phone" ? form.phone : undefined,
    zipCode: method === "zipCode" ? form.zipCode : undefined,
  });

  const handleSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setVerifyFailed(false);
    setOrders([]);
    setTimeout(() => {
      // Demo hooks: "MULTI" lists several orders, "WRONGZIP" fails verification.
      if (form.orderId === "MULTI") {
        const base = Number(orderId) || 12345;
        const total = items.reduce((s, i) => s + i.price * i.quantity, 0) || 397.55;
        setOrders([
          { orderId, date: "Mar 15, 2026", total: money(total), status: "Delivered" },
          { orderId: String(base + 1), date: "Feb 28, 2026", total: money(94), status: "Delivered" },
          { orderId: String(base + 2), date: "Jan 12, 2026", total: money(154), status: "Delivered" },
        ]);
        setLoading(false);
        return;
      }
      if (form.orderId === "WRONGZIP") {
        setVerifyFailed(true);
        setLoading(false);
        return;
      }
      onComplete(verified(selectedOrder || form.orderId));
      setLoading(false);
    }, 800);
  };

  const switchMethod = (m: VerifyMethod) => {
    setMethod(m);
    setErrors({});
  };

  const continueWithSelected = () => {
    if (selectedOrder) onComplete(verified(selectedOrder));
  };

  return (
    <div className="flex min-h-screen w-full overflow-x-hidden font-sans" style={{ backgroundColor: bg }}>
      {/* Left hero panel */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="relative hidden w-1/2 overflow-hidden lg:flex"
        style={{ backgroundColor: panel }}
      >
        <div className="absolute inset-0">
          {heroImage ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element -- remote store image */}
              <img
                src={heroImage}
                alt={`${name} Collection`}
                referrerPolicy="no-referrer"
                className="h-full w-full object-cover opacity-90"
              />
              {/* As in the design: a soft fade into the page color at the bottom. */}
              <div
                className="absolute inset-0"
                style={{ background: `linear-gradient(to top, ${bg}f2 0%, ${bg}33 45%, transparent 100%)` }}
              />
            </>
          ) : (
            <div
              className="h-full w-full"
              style={{ background: `linear-gradient(135deg, ${accent}66 0%, ${panel} 55%, ${primary}22 100%)` }}
            />
          )}
          <div
            className="pointer-events-none absolute bottom-[-20%] left-[-20%] h-[800px] w-[800px] rounded-full opacity-[0.12] mix-blend-multiply blur-[150px]"
            style={{ backgroundColor: primary }}
          />
        </div>
        <div className="relative z-10 flex h-full w-full flex-col justify-between p-20">
          <div className="flex items-center gap-3">
            <BrandLogo height={28} />
          </div>
          <div className="flex flex-col gap-1">
            <h2
              className="font-serif text-2xl font-bold"
              style={{ color: heroImage ? bg : primary, textShadow: heroImage ? "0 1px 12px rgba(0,0,0,0.35)" : undefined }}
            >
              {content.loginTagline}
            </h2>
            <p
              className="text-sm"
              style={{
                color: heroImage ? "rgba(250,249,246,0.85)" : `${primary}b3`,
                textShadow: heroImage ? "0 1px 8px rgba(0,0,0,0.35)" : undefined,
              }}
            >
              {content.loginSubline}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Right form panel */}
      <div
        className="relative flex w-full flex-col items-center justify-start overflow-hidden px-5 pb-8 pt-8 lg:w-1/2 lg:justify-center lg:p-16"
        style={{ backgroundColor: bg }}
      >
        <div className="pointer-events-none absolute inset-0 z-0 hidden overflow-hidden lg:block">
          <div
            className="absolute right-[-10%] top-[-10%] h-[400px] w-[400px] rounded-full opacity-[0.08] mix-blend-multiply blur-[120px]"
            style={{ backgroundColor: primary }}
          />
          <div
            className="absolute bottom-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full opacity-[0.06] mix-blend-multiply blur-[140px]"
            style={{ backgroundColor: accent }}
          />
        </div>
        <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden lg:hidden">
          {heroImage ? (
            // eslint-disable-next-line @next/next/no-img-element -- remote store image
            <img src={heroImage} alt="" referrerPolicy="no-referrer" className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full" style={{ background: `linear-gradient(135deg, ${accent}55, ${primary}22)` }} />
          )}
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px]" />
          <div className="absolute inset-0 bg-gradient-to-b from-white/80 via-white/40 to-white/90" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 my-auto w-full max-w-md space-y-6 lg:space-y-8"
        >
          <div className="space-y-5 text-center lg:space-y-6 lg:text-left">
            <div className="flex items-center justify-center lg:hidden">
              <span className="inline-flex rounded-[4px] bg-white/90 px-4 py-2 shadow-sm">
                <BrandLogo height={26} />
              </span>
            </div>
            <div>
              <h3 className="mb-2 font-serif text-[28px] leading-tight lg:text-3xl" style={{ color: primary }}>
                Start your return &amp; exchange
              </h3>
              <p className="text-slate-600">Enter your details to find your order</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {verifyFailed && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-[4px] border border-amber-200 bg-amber-50 p-4"
              >
                <div className="flex items-start gap-3">
                  <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600" />
                  <div className="flex-1">
                    <h4 className="mb-1 font-semibold text-amber-900">Verification failed</h4>
                    <p className="mb-3 text-sm text-amber-700">
                      We found order <span className="font-mono font-semibold">#{form.orderId}</span>, but the details
                      don&apos;t match.
                    </p>
                    <div className="flex flex-col gap-2">
                      <button
                        type="button"
                        onClick={() => setMethod(method === "email" ? "zipCode" : "email")}
                        className="text-left text-sm font-medium text-amber-800 underline hover:text-amber-900"
                      >
                        Try verifying with {method === "email" ? postalLower : "email"} instead
                      </button>
                      <a
                        href="#support"
                        className="flex items-center gap-1 text-sm font-medium hover:opacity-80"
                        style={{ color: primary }}
                      >
                        Contact support for help
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {orders.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4 rounded-[4px] border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="flex items-start gap-3">
                  <Package className="mt-0.5 h-5 w-5 flex-shrink-0" style={{ color: primary }} />
                  <div>
                    <h4 className="mb-1 font-semibold text-slate-900">Multiple orders found</h4>
                    <p className="text-sm text-slate-600">We found {orders.length} orders. Please select one.</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {orders.map((o) => {
                    const sel = selectedOrder === o.orderId;
                    return (
                      <button
                        key={o.orderId}
                        type="button"
                        onClick={() => setSelectedOrder(o.orderId)}
                        className={`w-full rounded-[4px] border-2 p-4 text-left transition-all ${
                          sel ? "" : "border-slate-200 hover:border-slate-300"
                        }`}
                        style={sel ? { borderColor: primary, backgroundColor: `${primary}08` } : undefined}
                      >
                        <div className="mb-2 flex items-center justify-between">
                          <span className="font-mono font-semibold text-slate-900">Order #{o.orderId}</span>
                          <span
                            className={`rounded-[4px] px-2 py-1 text-xs font-medium ${
                              o.status === "Delivered" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"
                            }`}
                          >
                            {o.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-slate-600">
                          <span>{o.date}</span>
                          <span>•</span>
                          <span className="font-semibold text-slate-900">{o.total}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
                <Button
                  type="button"
                  variant="primary"
                  size="lg"
                  fullWidth
                  onClick={continueWithSelected}
                  disabled={!selectedOrder}
                  className="h-12 rounded-[4px] text-base"
                  icon={<ArrowRight className="h-5 w-5" />}
                >
                  Continue
                </Button>
              </motion.div>
            )}

            <div className="space-y-5 rounded-[4px] border border-white/50 bg-white/90 p-5 shadow-lg backdrop-blur-md lg:space-y-6 lg:p-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="orderId" className="text-sm font-semibold text-slate-700">
                    Order Number
                  </label>
                  <Dialog>
                    <DialogTrigger asChild>
                      <button
                        type="button"
                        className="flex items-center gap-1 text-xs font-medium hover:opacity-80"
                        style={{ color: primary }}
                      >
                        <HelpCircle className="h-3.5 w-3.5" />
                        Where to find this?
                      </button>
                    </DialogTrigger>
                    <DialogContent className="rounded-[4px]">
                      <DialogHeader>
                        <DialogTitle>Finding your Order ID</DialogTitle>
                        <DialogDescription>
                          You can find your order number in your confirmation email or on the packing slip.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="mt-4 flex items-center justify-center rounded-[4px] bg-slate-100 p-4">
                        <div className="w-full max-w-xs space-y-2 rounded-[4px] border border-slate-200 bg-white p-4 text-[10px] text-slate-400 shadow-sm">
                          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                            <div className="h-2 w-8 rounded bg-slate-200" />
                            <div className="h-2 w-12 rounded bg-slate-200" />
                          </div>
                          <div className="pt-2">
                            <div className="flex items-center gap-2 rounded-[4px] border border-yellow-100 bg-yellow-50 p-2">
                              <span className="font-bold text-slate-900">Order #{orderId}</span>
                              <div className="ml-auto h-2 w-2 rounded-full bg-yellow-400" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
                <Input
                  id="orderId"
                  placeholder={`#${orderId}`}
                  value={form.orderId}
                  onChange={(e) => setForm({ ...form, orderId: e.target.value })}
                  error={errors.orderId}
                  className={INPUT_CLASS}
                />
              </div>

              <div className="space-y-3">
                <label className="text-sm font-semibold text-slate-700">Verify with</label>
                <div className="flex rounded-[4px] bg-slate-100/80 p-1">
                  {(["email", "phone", "zipCode"] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => switchMethod(m)}
                      className={`flex flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-[4px] px-1 py-2 text-[13px] font-medium transition-all duration-200 sm:gap-2 sm:text-sm ${
                        method === m ? "bg-white shadow-sm" : "text-slate-500 hover:text-slate-700"
                      }`}
                      style={method === m ? { color: primary } : undefined}
                    >
                      {m === "email" && <Mail className="h-4 w-4" />}
                      {m === "phone" && <Phone className="h-4 w-4" />}
                      {m === "zipCode" && <MapPin className="h-4 w-4" />}
                      <span className="capitalize">{m === "zipCode" ? locale.postalLabel : m}</span>
                    </button>
                  ))}
                </div>
                <div className="pt-1">
                  {method === "email" && (
                    <Input
                      type="email"
                      placeholder="hello@example.com"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      error={errors.email}
                      className={`${INPUT_CLASS} animate-fade-in`}
                    />
                  )}
                  {method === "phone" && (
                    <Input
                      type="tel"
                      placeholder={locale.phonePlaceholder}
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      error={errors.phone}
                      className={`${INPUT_CLASS} animate-fade-in`}
                    />
                  )}
                  {method === "zipCode" && (
                    <Input
                      placeholder={locale.postalPlaceholder}
                      value={form.zipCode}
                      onChange={(e) => setForm({ ...form, zipCode: e.target.value })}
                      error={errors.zipCode}
                      className={`${INPUT_CLASS} animate-fade-in`}
                    />
                  )}
                </div>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  fullWidth
                  isLoading={loading}
                  className="h-12 rounded-[4px] text-base shadow-lg transition-all hover:-translate-y-0.5"
                  icon={<ArrowRight className="h-5 w-5" />}
                >
                  Find My Order
                </Button>
              </div>
            </div>
          </form>

          <div className="flex flex-col items-center gap-4 text-sm text-slate-500">
            <div className="my-2 w-full border-t border-slate-200/60" />
            <div className="flex gap-4 whitespace-nowrap text-xs text-slate-400 sm:gap-6">
              <a href="#" className="hover:text-slate-600">
                Privacy Policy
              </a>
              <a href="#" className="hover:text-slate-600">
                Terms of Service
              </a>
              <a href="#" className="hover:text-slate-600">
                Contact Support
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
