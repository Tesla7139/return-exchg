"use client";

import { HelpCircle, Mail, MapPin, Search } from "lucide-react";
import { usePortal } from "./PortalContext";
import { BrandLogo } from "./ui";

const HOVER = "hover:bg-[color-mix(in_srgb,var(--portal-primary)_8%,transparent)]";
const NAV_LINK = `items-center gap-1.5 px-3 py-1.5 rounded-[4px] text-xs font-medium tracking-wide uppercase transition-colors ${HOVER}`;

export function PortalHeader() {
  const { primary, bg, domain, supportEmail } = usePortal();
  const site = `https://${domain}`;
  return (
    <header className="w-full border-b" style={{ backgroundColor: bg, borderColor: `${primary}22` }}>
      <div className="mx-auto flex h-14 max-w-[1280px] items-center justify-between gap-6 px-6 lg:px-8">
        <a href={`${site}/`} target="_blank" rel="noopener noreferrer" className="flex shrink-0 items-center">
          <BrandLogo height={20} />
        </a>
        <nav className="flex shrink-0 items-center gap-1">
          <a
            href={`${site}/pages/faq`}
            target="_blank"
            rel="noopener noreferrer"
            className={`hidden sm:flex ${NAV_LINK}`}
            style={{ color: primary }}
          >
            <HelpCircle className="h-3.5 w-3.5" />
            Help
          </a>
          <a
            href={`${site}/pages/track-order`}
            target="_blank"
            rel="noopener noreferrer"
            className={`hidden md:flex ${NAV_LINK}`}
            style={{ color: primary }}
          >
            <MapPin className="h-3.5 w-3.5" />
            Track Order
          </a>
          <a href={`mailto:${supportEmail}`} className={`hidden lg:flex ${NAV_LINK}`} style={{ color: primary }}>
            <Mail className="h-3.5 w-3.5" />
            Contact Us
          </a>
          <span className="mx-1 hidden h-4 w-px sm:block" style={{ backgroundColor: `${primary}30` }} />
          <button
            type="button"
            aria-label="Search"
            className={`flex h-8 w-8 items-center justify-center rounded-[4px] transition-colors ${HOVER}`}
            style={{ color: primary }}
          >
            <Search className="h-4 w-4" />
          </button>
        </nav>
      </div>
    </header>
  );
}
