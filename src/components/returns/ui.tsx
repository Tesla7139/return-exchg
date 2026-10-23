"use client";

/**
 * Portal primitives ported from the reference design's re-components
 * (Button, Input, Dropdown) and its shadcn dialog, re-themed by the brand primary.
 */
import { forwardRef, useState } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { AlertCircle, ChevronDown, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePortal } from "./PortalContext";

/* ------------------------------ Button ------------------------------ */

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
  /** Override the brand primary (rarely needed). */
  customColor?: string;
};

export function Button({
  children,
  variant = "primary",
  size = "md",
  isLoading = false,
  icon,
  fullWidth = false,
  className = "",
  disabled,
  customColor,
  style,
  ...rest
}: ButtonProps) {
  const { primary } = usePortal();
  const c = customColor || primary;
  const base =
    "inline-flex items-center justify-center font-bold uppercase tracking-widest transition-all duration-200 rounded-[4px] focus:outline-none focus:ring-4 disabled:opacity-50 disabled:cursor-not-allowed";
  const v = {
    primary: {
      className: "text-white shadow-sm hover:shadow-md active:scale-[0.98]",
      style: { backgroundColor: c, ["--tw-ring-color" as string]: `${c}30` },
    },
    secondary: { className: "bg-slate-100 text-slate-700 hover:bg-slate-200 active:scale-[0.98] focus:ring-slate-100", style: {} },
    ghost: { className: "text-slate-600 hover:bg-slate-100 active:scale-[0.98] focus:ring-slate-100", style: {} },
    outline: {
      className: "border-2 bg-transparent active:scale-[0.98]",
      style: { borderColor: c, color: c, ["--tw-ring-color" as string]: `${c}30` },
    },
  }[variant];
  const sizes = { sm: "px-3 py-2 text-sm gap-1.5", md: "px-5 py-3 gap-2", lg: "px-6 py-4 gap-2" };
  return (
    <button
      className={cn(base, v.className, sizes[size], fullWidth && "w-full", className)}
      style={{ ...v.style, ...style }}
      disabled={disabled || isLoading}
      {...rest}
    >
      {isLoading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Loading...</span>
        </>
      ) : (
        <>
          {icon && <span className="hidden flex-shrink-0 md:inline-flex">{icon}</span>}
          {children}
        </>
      )}
    </button>
  );
}

/* ------------------------------ Input ------------------------------ */

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
  helperText?: string;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, helperText, className = "", onFocus, onBlur, style, ...rest },
  ref
) {
  const { primary } = usePortal();
  const [focused, setFocused] = useState(false);
  return (
    <div className="w-full">
      {label && <label className="mb-2 block text-sm font-medium text-slate-700">{label}</label>}
      <div className="relative">
        <input
          ref={ref}
          className={cn(
            "w-full rounded-[4px] border bg-white px-4 py-3 transition-all duration-200 placeholder:text-slate-400 focus:outline-none",
            error
              ? "border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-50"
              : focused
                ? "ring-4"
                : "border-slate-200 hover:border-slate-300",
            className
          )}
          style={
            focused && !error
              ? { borderColor: primary, ["--tw-ring-color" as string]: `${primary}1a`, ...style }
              : style
          }
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          {...rest}
        />
        {error && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <AlertCircle className="h-5 w-5 text-red-500" />
          </div>
        )}
      </div>
      {error && <p className="mt-2 flex items-center gap-1 text-sm text-red-600">{error}</p>}
      {helperText && !error && <p className="mt-2 text-sm text-slate-500">{helperText}</p>}
    </div>
  );
});

/* ------------------------------ Dropdown ------------------------------ */

type DropdownProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  options: { value: string; label: string }[];
  error?: string;
};

export const Dropdown = forwardRef<HTMLSelectElement, DropdownProps>(function Dropdown(
  { label, options, error, className = "", ...rest },
  ref
) {
  return (
    <div className="w-full">
      {label && <label className="mb-2 block text-sm font-medium text-slate-700">{label}</label>}
      <div className="relative">
        <select
          ref={ref}
          className={cn(
            "w-full appearance-none rounded border bg-white px-4 py-3 text-slate-900 transition-all duration-200 focus:outline-none",
            error
              ? "border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-50"
              : "border-slate-200 hover:border-slate-300 focus:border-slate-400 focus:ring-4 focus:ring-slate-100",
            className
          )}
          {...rest}
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
          <ChevronDown className="h-5 w-5 text-slate-400" />
        </div>
      </div>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
});

/* ------------------------------ Dialog (shadcn-style) ------------------------------ */

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;

export const DialogContent = forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & { hideClose?: boolean }
>(function DialogContent({ className, children, hideClose, ...props }, ref) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="portal-fade fixed inset-0 z-50 bg-black/50" />
      <DialogPrimitive.Content
        ref={ref}
        className={cn(
          "portal-pop fixed left-[50%] top-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded border bg-white p-6 shadow-lg duration-200 sm:max-w-lg",
          className
        )}
        {...props}
      >
        {children}
        {!hideClose && (
          <DialogPrimitive.Close className="absolute right-4 top-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:outline-none">
            <X className="size-4" />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
});

export function DialogHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col gap-2 text-center sm:text-left", className)} {...props} />;
}

export const DialogTitle = forwardRef<
  HTMLHeadingElement,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(function DialogTitle({ className, ...props }, ref) {
  return <DialogPrimitive.Title ref={ref} className={cn("text-lg font-semibold leading-none", className)} {...props} />;
});

export const DialogDescription = forwardRef<
  HTMLParagraphElement,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(function DialogDescription({ className, ...props }, ref) {
  return <DialogPrimitive.Description ref={ref} className={cn("text-sm text-slate-500", className)} {...props} />;
});

/* ------------------------------ Brand imagery ------------------------------ */

/**
 * A product photo, or — when the store exposed no image — a branded tile with the
 * product's initials, so a card never shows a broken image.
 */
export function ProductImage({
  src,
  alt,
  className,
  imgClassName = "h-full w-full object-cover",
}: {
  src: string | null | undefined;
  alt: string;
  className?: string;
  imgClassName?: string;
}) {
  const { primary, accent } = usePortal();
  const [failed, setFailed] = useState(false);
  if (src && !failed) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- remote store image
      <img
        src={src}
        alt={alt}
        className={cn(imgClassName, className)}
        referrerPolicy="no-referrer"
        onError={() => setFailed(true)}
      />
    );
  }
  const initials =
    alt
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0])
      .join("")
      .toUpperCase() || "•";
  return (
    <div
      role="img"
      aria-label={alt}
      className={cn("flex h-full w-full items-center justify-center", className)}
      style={{ background: `linear-gradient(135deg, ${accent}55, ${primary}22)` }}
    >
      <span className="font-serif text-2xl font-bold" style={{ color: primary }}>
        {initials}
      </span>
    </div>
  );
}

/**
 * The store's logo. Square icons (apple-touch-icon/favicons) get the brand name set
 * beside them as a wordmark; wide logos render alone. Falls back to the name.
 */
export function BrandLogo({
  className,
  height = 28,
  light = false,
  showName,
}: {
  className?: string;
  height?: number;
  light?: boolean;
  /** Force the text wordmark on/off; default = auto (on for square icons). */
  showName?: boolean;
}) {
  const { logo, name, primary } = usePortal();
  const [ratio, setRatio] = useState<number | null>(null);
  const [failed, setFailed] = useState(false);
  const square = ratio !== null && ratio < 1.6;
  const withName = showName ?? (failed || !logo || square);
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)} style={{ height }}>
      {logo && !failed && (
        // eslint-disable-next-line @next/next/no-img-element -- remote brand logo
        <img
          src={logo}
          alt={withName ? "" : name}
          referrerPolicy="no-referrer"
          className={cn("h-full w-auto object-contain", square && "rounded-md")}
          style={light && !square ? { filter: "brightness(0) invert(1)" } : undefined}
          onLoad={(e) => {
            const img = e.currentTarget;
            if (img.naturalHeight) setRatio(img.naturalWidth / img.naturalHeight);
          }}
          onError={() => setFailed(true)}
        />
      )}
      {withName && (
        <span
          className="whitespace-nowrap font-serif font-bold leading-none tracking-tight"
          style={{ fontSize: Math.round(height * 0.78), color: light ? "#fff" : primary }}
        >
          {name}
        </span>
      )}
    </span>
  );
}
