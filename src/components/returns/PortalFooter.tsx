"use client";

import { Mail, ShieldCheck } from "lucide-react";
import { usePortal } from "./PortalContext";
import { BrandLogo } from "./ui";

// lucide-react no longer ships brand marks; these match its Instagram/Facebook glyphs.
function Instagram({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function Facebook({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

const HOVER = "hover:bg-[color-mix(in_srgb,var(--portal-primary)_8%,transparent)]";

export function PortalFooter() {
  const { primary, bg, name, domain, supportEmail } = usePortal();
  const site = `https://${domain}`;
  const handle = name.toLowerCase().replace(/[^a-z0-9]+/g, "");
  const policies = [
    { label: "Return Policy", href: `${site}/policies/refund-policy` },
    { label: "Refund Policy", href: `${site}/policies/refund-policy` },
    { label: "Terms & Conditions", href: `${site}/policies/terms-of-service` },
    { label: "Privacy Policy", href: `${site}/policies/privacy-policy` },
  ];
  const muted = `${primary}99`;
  const hoverOn = (e: React.MouseEvent<HTMLAnchorElement>) => (e.currentTarget.style.color = primary);
  const hoverOff = (e: React.MouseEvent<HTMLAnchorElement>) => (e.currentTarget.style.color = muted);

  return (
    <footer className="mt-auto w-full border-t" style={{ backgroundColor: bg, borderColor: `${primary}22` }}>
      <div className="mx-auto max-w-[1280px] px-6 py-10 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div className="col-span-2 flex flex-col gap-3 md:col-span-1">
            <BrandLogo height={20} className="self-start" />
            <p className="text-xs leading-relaxed" style={{ color: muted }}>
              {name} — thoughtfully made, easy to love.
            </p>
            <div className="mt-1 flex items-center gap-2">
              <a
                href={`https://www.instagram.com/${handle}/`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className={`flex h-7 w-7 items-center justify-center rounded-[4px] border transition-colors ${HOVER}`}
                style={{ borderColor: `${primary}30`, color: primary }}
              >
                <Instagram className="h-3.5 w-3.5" />
              </a>
              <a
                href={`https://www.facebook.com/${handle}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className={`flex h-7 w-7 items-center justify-center rounded-[4px] border transition-colors ${HOVER}`}
                style={{ borderColor: `${primary}30`, color: primary }}
              >
                <Facebook className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-semibold uppercase tracking-widest" style={{ color: primary }}>
              Policy
            </h4>
            <ul className="flex flex-col gap-2">
              {policies.map((p) => (
                <li key={p.label}>
                  <a
                    href={p.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs transition-colors hover:opacity-100"
                    style={{ color: muted }}
                    onMouseEnter={hoverOn}
                    onMouseLeave={hoverOff}
                  >
                    {p.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-semibold uppercase tracking-widest" style={{ color: primary }}>
              Contact Us
            </h4>
            <a
              href={`mailto:${supportEmail}`}
              className="group flex items-center gap-2 break-all text-xs transition-colors"
              style={{ color: muted }}
              onMouseEnter={hoverOn}
              onMouseLeave={hoverOff}
            >
              <Mail className="h-3.5 w-3.5 shrink-0" />
              {supportEmail}
            </a>
            <p className="text-xs" style={{ color: `${primary}70` }}>
              Mon–Fri, 9am–5pm
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <p className="text-xs font-medium" style={{ color: `${primary}80` }}>
              Powered By
            </p>
            {/* eslint-disable-next-line @next/next/no-img-element -- static wordmark */}
            <img src="/brand/logo.svg" alt="Clickpost" className="block h-4 w-auto self-start" />
          </div>
        </div>

        <div
          className="mt-8 flex flex-col items-center justify-between gap-3 border-t pt-6 sm:flex-row"
          style={{ borderColor: `${primary}18` }}
        >
          <p className="text-xs" style={{ color: `${primary}60` }}>
            © {new Date().getFullYear()} {name}. All rights reserved.
          </p>
          <div className="flex items-center gap-1.5" style={{ color: `${primary}50` }}>
            <ShieldCheck className="h-3 w-3" />
            <span className="text-xs">Secure &amp; encrypted portal</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
