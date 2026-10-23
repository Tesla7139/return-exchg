import { Container } from "@/components/primitives/Container";

export function Navbar({ onProductTour }: { onProductTour?: () => void }) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-white/90 backdrop-blur-xl">
      <Container className="flex items-center justify-between py-4">
        {/* Wordmark */}
        <span className="text-2xl font-extrabold tracking-tight">
          <span className="text-primary">CLICK</span>
          <span className="text-foreground">POST</span>
        </span>

        {/* Right: link + CTA */}
        <div className="flex items-center gap-6">
          <button
            type="button"
            onClick={onProductTour}
            className="hidden text-sm font-medium text-foreground/80 transition-colors hover:text-foreground md:inline"
          >
            Product Tour
          </button>
          <a
            href="https://calendly.com/jatin-trighatia-clickpost/30min"
            target="_blank"
            rel="noreferrer"
            className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-all hover:brightness-110 active:scale-[0.98]"
          >
            Book a free demo
          </a>
        </div>
      </Container>
    </header>
  );
}
