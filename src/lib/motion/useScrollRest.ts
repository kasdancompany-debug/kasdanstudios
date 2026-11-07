"use client";

import { useEffect, useRef } from "react";
import { lenisStore } from "./lenis-store";

type Geometry = { top: number; span: number };

/**
 * Scroll-driven sequences should never come to rest mid-transition. When a
 * scroll gesture ends inside a sequence, this eases the page to a composed
 * frame:
 * - a deliberate move carries on to the next frame in its direction (or
 *   settles back if it only just overshot one);
 * - a nudge falls back to the frame it started from.
 *
 * Progress is 0..1 through the sequence: `geometry()` gives its start (page
 * Y) and length in px; `rest()` the progress values of its composed frames.
 */
export function useScrollRest(
  enabled: boolean,
  geometry: () => Geometry | null,
  rest: () => number[],
) {
  // Latest callbacks without re-binding listeners every render.
  const geo = useRef(geometry);
  const pts = useRef(rest);
  useEffect(() => {
    geo.current = geometry;
    pts.current = rest;
  });

  useEffect(() => {
    if (!enabled) return;
    let timer = 0;
    let touching = false;
    let origin: number | null = null; // progress where the current gesture began
    let settlingUntil = 0; // our own settle animation's scroll events are ignored until then
    let lastWheel = 0;

    const progressAt = (y: number) => {
      const g = geo.current();
      return g && g.span > 0 ? (y - g.top) / g.span : null;
    };
    const schedule = (ms: number) => {
      window.clearTimeout(timer);
      timer = window.setTimeout(settle, ms);
    };
    const begin = () => {
      if (origin === null) origin = progressAt(window.scrollY);
    };

    function settle() {
      if (touching) return;
      const wait = settlingUntil - performance.now();
      if (wait > 0) return schedule(wait + 30);
      const from = origin;
      origin = null;
      const g = geo.current();
      if (!g || g.span <= 0) return;
      const REST = pts.current();
      if (!REST.length) return;
      // Where the page is heading: Lenis's target while it glides, else where it is.
      const lenis = lenisStore.get();
      const p = ((lenis?.targetScroll ?? window.scrollY) - g.top) / g.span;
      if (p <= 0.002 || p >= 0.998) return; // outside the sequence, or on an end frame
      if (REST.some((r) => Math.abs(r - p) < 0.003)) return; // already resting on a frame

      const nearest = (x: number) => REST.reduce((b, r) => (Math.abs(r - x) < Math.abs(b - x) ? r : b), REST[0]);
      const travel = from === null ? 0 : p - from;
      let target: number;
      if (from === null || Math.abs(travel) < 0.02) {
        target = nearest(from ?? p);
      } else {
        const fwd = travel > 0;
        const ahead = fwd ? REST.find((r) => r >= p) : [...REST].reverse().find((r) => r <= p);
        const behind = fwd ? [...REST].reverse().find((r) => r <= p) : REST.find((r) => r >= p);
        target = behind !== undefined && Math.abs(p - behind) < 0.03 ? behind : (ahead ?? nearest(p));
      }
      const y = g.top + target * g.span;
      const dist = Math.abs(y - window.scrollY);
      if (dist < 2) return;
      const duration = Math.min(1.2, 0.55 + (dist / window.innerHeight) * 0.35);
      settlingUntil = performance.now() + duration * 1000;
      if (lenis) lenis.scrollTo(y, { duration, easing: (t) => 1 - Math.pow(1 - t, 3) });
      else window.scrollTo({ top: y, behavior: "smooth" });
    }

    // Wheel: act as soon as the wheel goes quiet, steering Lenis's glide.
    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey) return; // pinch-zoom
      settlingUntil = 0; // the visitor's gesture always wins over a settle in progress
      lastWheel = performance.now();
      begin();
      schedule(150);
    };
    // Keyboard, scrollbar, touch momentum: act once the page stops moving.
    const onScroll = () => {
      const now = performance.now();
      if (now < settlingUntil || now - lastWheel < 400) return;
      begin();
      schedule(180);
    };
    const onTouchStart = () => {
      touching = true;
      settlingUntil = 0;
      window.clearTimeout(timer);
      begin();
    };
    const onTouchEnd = () => {
      touching = false;
      schedule(250);
    };

    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    window.addEventListener("touchcancel", onTouchEnd, { passive: true });
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("touchcancel", onTouchEnd);
    };
  }, [enabled]);
}
