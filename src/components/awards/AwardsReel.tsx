"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cn } from "@/lib/cn";
import { useScrollRest } from "@/lib/motion/useScrollRest";
import { TrophySketch, type TrophyKind } from "./TrophySketch";

gsap.registerPlugin(ScrollTrigger);

export type ReelEntry = {
  year: number | null;
  name: string;
  sketch: TrophyKind;
};

// Each frame gets its own exposure: tungsten, safelight, cyan fringe, cream.
const LEAKS = [
  "radial-gradient(120% 90% at 85% 10%, rgba(255,150,70,0.38), transparent 60%)",
  "radial-gradient(110% 100% at 10% 90%, rgba(255,70,40,0.36), transparent 62%)",
  "radial-gradient(120% 80% at 90% 85%, rgba(120,200,210,0.22), transparent 60%)",
  "radial-gradient(130% 90% at 20% 15%, rgba(242,235,223,0.2), transparent 60%)",
];

/**
 * Awards & recognition as a reel of exposed 35 mm frames. The strip is
 * pinned and scrubbed sideways by vertical scroll, and bends with scroll
 * speed. Semantically it is an ordered list; without JS or with reduced
 * motion it becomes a native horizontal scroller.
 */
export function AwardsReel({ entries, id }: { entries: ReelEntry[]; id?: string }) {
  const section = useRef<HTMLElement>(null);
  const sticky = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLOListElement>(null);

  useLayoutEffect(() => {
    const el = section.current;
    const tr = track.current;
    if (!el || !tr || !sticky.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    el.dataset.pinned = "";
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const ctx = gsap.context(() => {
      const distance = () => Math.max(0, tr.scrollWidth - window.innerWidth);
      const skew = gsap.quickTo(tr, "skewX", { duration: 0.5, ease: "power3" });
      gsap.to(tr, {
        x: () => -distance(),
        ease: "none",
        scrollTrigger: {
          trigger: el,
          start: "top top",
          end: () => `+=${distance()}`,
          pin: sticky.current,
          // Lenis already smooths the scroll; a second easing layer here only adds lag.
          scrub: fine ? true : 0.4,
          invalidateOnRefresh: true,
          onUpdate: (self) => skew(gsap.utils.clamp(-6, 6, self.getVelocity() / -350)),
        },
      });
    }, el);
    return () => {
      ctx.revert();
      delete el.dataset.pinned;
    };
  }, []);

  // Rest with a whole frame aligned to the left margin, never half-cut at both edges.
  useScrollRest(
    true,
    () => {
      const el = section.current;
      const tr = track.current;
      if (!el || !tr || !("pinned" in el.dataset)) return null; // native scroller: nothing to settle
      return {
        top: el.getBoundingClientRect().top + window.scrollY,
        span: Math.max(0, tr.scrollWidth - window.innerWidth),
      };
    },
    () => {
      const tr = track.current;
      const items = tr ? Array.from(tr.children as HTMLCollectionOf<HTMLElement>) : [];
      const span = tr ? tr.scrollWidth - window.innerWidth : 0;
      if (!items.length || span <= 0) return [];
      const first = items[0].offsetLeft;
      const pts = items.map((li) => Math.min(1, (li.offsetLeft - first) / span));
      return [...new Set([...pts, 1])];
    },
  );

  return (
    <section ref={section} id={id} aria-labelledby="awards-title" className="group/reel relative">
      <div ref={sticky} className="flex min-h-[100svh] flex-col justify-center overflow-hidden py-16 md:py-20">
        <div className="shell flex items-end justify-between gap-6">
          <h2 id="awards-title" className="type-headline text-cream">
            Awards <span className="italic text-bone">&amp; recognition</span>
          </h2>
          <p className="type-label hidden text-mute md:block">Scroll →</p>
        </div>

        <ol
          ref={track}
          tabIndex={0}
          aria-label="Awards and recognition"
          className={cn(
            "mt-10 flex gap-5 px-5 will-change-transform md:mt-12 md:gap-6 md:px-10 xl:px-14",
            // Native horizontal scroll until the pinned version takes over
            "overflow-x-auto group-data-[pinned]/reel:overflow-visible",
          )}
        >
          {entries.map((a, i) => (
            // Sized from the viewport height so a whole frame always fits on screen
            <li key={a.name} className="w-[min(80vw,42svh)] shrink-0">
              <Frame entry={a} index={i} />
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function Frame({ entry, index }: { entry: ReelEntry; index: number }) {
  return (
    // Container queries: type inside the frame scales with the frame, never the viewport.
    <article className="@container relative bg-[#0f0d0b] px-3 py-9 md:px-4 md:py-10">
      {/* Sprocket rows */}
      <span aria-hidden className="sprockets absolute inset-x-3 top-3 h-4" />
      <span aria-hidden className="sprockets absolute inset-x-3 bottom-3 h-4" />

      <div className="relative flex aspect-[4/5] flex-col overflow-hidden bg-coal p-[7cqw]">
        <div aria-hidden className="absolute inset-0" style={{ background: LEAKS[index % LEAKS.length] }} />

        {/* No year until it's confirmed — nothing is shown rather than a placeholder */}
        {entry.year && (
          <span className="relative self-end font-display text-[15cqw] leading-[0.8] text-cream">{entry.year}</span>
        )}

        <div data-reveal="draw" className="relative min-h-0 flex-1 py-[3cqw]">
          <TrophySketch kind={entry.sketch} className="h-full w-full text-cream" />
        </div>

        <h3 className="relative font-display text-[11cqw] leading-[0.9] text-cream">{entry.name}</h3>
      </div>
    </article>
  );
}
