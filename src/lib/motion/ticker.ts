import gsap from "gsap";

/**
 * One clock for the whole site. Smooth scroll, scroll-driven timelines and
 * the WebGL canvas all advance inside the same animation frame, in a fixed
 * order, so the 3D layer always draws against this frame's scroll position
 * (separate rAF loops let it lag a frame behind, which reads as flicker and
 * text that swims against the page).
 *
 *   scroll → Lenis integrates the wheel, ScrollTrigger applies timelines
 *   render → WebGL reads DOM rects and draws
 */
type Phase = "scroll" | "render";
type Fn = (time: number, deltaMs: number) => void;

const phases: Record<Phase, Set<Fn>> = { scroll: new Set(), render: new Set() };
let started = false;

function tick(time: number, deltaMs: number) {
  phases.scroll.forEach((f) => f(time, deltaMs));
  phases.render.forEach((f) => f(time, deltaMs));
}

export function onFrame(phase: Phase, fn: Fn) {
  if (!started) {
    started = true;
    // Never "catch up" after a stall: that is what makes a scrub jump.
    gsap.ticker.lagSmoothing(0);
    gsap.ticker.add(tick);
  }
  phases[phase].add(fn);
  return () => {
    phases[phase].delete(fn);
  };
}
