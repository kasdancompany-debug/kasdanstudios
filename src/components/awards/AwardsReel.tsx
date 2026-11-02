"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cn } from "@/lib/cn";

gsap.registerPlugin(ScrollTrigger);

export type ReelEntry = {
  year: number | null;
  name: string;
  organization: string | null;
  recipient: string | null;
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
          scrub: 0.6,
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

  return (
    <section ref={section} id={id} aria-labelledby="awards-title" className="group/reel relative">
      <div ref={sticky} className="flex min-h-[100svh] flex-col justify-center overflow-hidden py-24">
        <div className="shell flex items-end justify-between gap-6">
          <h2 id="awards-title" className="type-headline text-cream">
            Awards <span className="italic text-bone">&amp; recognition</span>
          </h2>
          <p className="type-label hidden text-mute md:block">
            {String(entries.length).padStart(2, "0")} frames · scroll →
          </p>
        </div>

        <ol
          ref={track}
          tabIndex={0}
          aria-label="Awards and recognition"
          className={cn(
            "mt-12 flex gap-5 px-5 will-change-transform md:mt-16 md:gap-6 md:px-10 xl:px-14",
            // Native horizontal scroll until the pinned version takes over
            "overflow-x-auto group-data-[pinned]/reel:overflow-visible",
          )}
        >
          {entries.map((a, i) => (
            <li key={a.name} className="w-[82vw] shrink-0 sm:w-[60vw] lg:w-[40vw] xl:w-[34vw]">
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
    <article className="relative bg-[#0f0d0b] px-3 py-9 md:px-4 md:py-11">
      {/* Sprocket rows */}
      <span aria-hidden className="sprockets absolute inset-x-3 top-3 h-4" />
      <span aria-hidden className="sprockets absolute inset-x-3 bottom-3 h-4" />

      <div className="relative flex aspect-[4/5] flex-col justify-between overflow-hidden bg-coal p-6 sm:aspect-[5/6] md:p-8">
        <div aria-hidden className="absolute inset-0" style={{ background: LEAKS[index % LEAKS.length] }} />
        <div className="relative flex items-start justify-between gap-4">
          <span className="type-label text-gold">KS·AW {String(index + 1).padStart(2, "0")}</span>
          <span
            className={cn(
              "font-display text-[clamp(3.5rem,7vw,6.5rem)] leading-[0.8]",
              entry.year ? "text-cream" : "type-outline",
            )}
          >
            {entry.year ?? "——"}
          </span>
        </div>

        <div className="relative">
          <h3 className="type-headline text-cream">{entry.name}</h3>
          {entry.organization && <p className="type-label mt-4 text-bone">{entry.organization}</p>}
          {entry.recipient && <p className="mt-3 text-sm text-mute">Awarded to {entry.recipient}</p>}
        </div>
      </div>

      <span
        aria-hidden
        className="type-label absolute bottom-[1.15rem] left-1/2 -translate-x-1/2 text-[0.5rem] text-dim"
      >
        SAFETY FILM · {String(index + 1).padStart(3, "0")}A
      </span>
    </article>
  );
}
