"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/cn";

/**
 * A ticker of giant outlined type that speeds up with scroll velocity and
 * reverses when you scroll back. Decorative: hidden from assistive tech,
 * static under reduced motion.
 */
export function Marquee({ items, className }: { items: string[]; className?: string }) {
  const track = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = track.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const anim = el.getAnimations()[0];
    if (!anim) return;
    let lastY = window.scrollY;
    let rate = 1;
    let target = 1;
    let raf = 0;
    const onScroll = () => {
      const dy = window.scrollY - lastY;
      lastY = window.scrollY;
      target = Math.sign(dy || 1) * Math.min(8, 1 + Math.abs(dy) * 0.25);
    };
    const loop = () => {
      rate += (target - rate) * 0.08;
      target += ((Math.sign(target) || 1) - target) * 0.04;
      anim.playbackRate = rate;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  const run = [...items, ...items];
  return (
    <div aria-hidden className={cn("overflow-hidden border-y border-line py-4 md:py-6", className)}>
      <div ref={track} className="marquee-track">
        {[0, 1].map((k) => (
          <div key={k} className="flex shrink-0 items-center">
            {run.map((t, i) => (
              <span key={`${k}-${i}`} className="flex items-center">
                <span
                  className={cn(
                    "px-6 font-display text-[clamp(3.5rem,11vw,10rem)] leading-none md:px-10",
                    i % 2 === 0 ? "type-outline" : "text-cream",
                  )}
                >
                  {t}
                </span>
                <span className="size-3 rounded-full bg-gold md:size-4" />
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
