"use client";

import { usePortal } from "./PortalContext";

export function MarketingBanner() {
  const { primary, accent, heroImage, name, content } = usePortal();
  return (
    <div className="relative w-full overflow-hidden rounded-[4px] mb-6 group cursor-pointer">
      <div className="relative h-32 md:h-40 lg:h-48">
        {heroImage ? (
          // eslint-disable-next-line @next/next/no-img-element -- remote brand banner
          <img
            src={heroImage}
            alt={`${name} ${content.bannerTitle}`}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-top"
          />
        ) : (
          <div className="w-full h-full" style={{ background: `linear-gradient(120deg, ${primary}, ${accent})` }} />
        )}
        <div
          className="absolute inset-0"
          style={{ background: `linear-gradient(to right, ${primary}99, ${primary}33, transparent)` }}
        />
      </div>
      <div className="absolute inset-0 flex flex-col justify-center pl-6 md:pl-10">
        <p className="text-white/80 text-[10px] font-bold uppercase tracking-widest mb-1">{content.bannerEyebrow}</p>
        <h3 className="text-white font-serif font-bold text-lg md:text-xl leading-tight mb-3 drop-shadow-sm">
          {content.bannerTitle}
        </h3>
        <span
          className="bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-[4px] font-serif font-bold text-xs shadow-sm border w-fit group-hover:bg-white transition-colors"
          style={{ color: primary, borderColor: `${primary}1a` }}
        >
          {content.bannerCta}
        </span>
      </div>
    </div>
  );
}
