import type { Variants, Transition } from "framer-motion";

// Premium entrance easing (see BUILD_SPEC.txt §5)
export const easeOutExpo: Transition["ease"] = [0.16, 1, 0.3, 1];

export const transitions = {
  enter: { duration: 0.6, ease: easeOutExpo } as Transition,
  fast: { duration: 0.22, ease: easeOutExpo } as Transition,
  spring: { type: "spring", stiffness: 260, damping: 26 } as Transition,
};

// Fade + rise, used by AnimatedReveal and most sections
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: transitions.enter },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: transitions.enter },
};

// Stagger container: children cascade in
export const staggerContainer = (stagger = 0.08, delayChildren = 0): Variants => ({
  hidden: {},
  show: {
    transition: { staggerChildren: stagger, delayChildren },
  },
});

// Shared viewport config for whileInView
export const viewportOnce = { once: true, margin: "-80px" } as const;
