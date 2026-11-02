"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLayoutEffect, useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGL } from "@/components/gl/useGL";
import { studio } from "@/components/studio/store";
import type { ScreenProject } from "@/components/studio/scene/StudioScene";
import { sound } from "@/lib/sound";

gsap.registerPlugin(ScrollTrigger);

const ReelView = dynamic(() => import("@/components/gl/views/ReelScene"), { ssr: false });

const CHAPTERS = [
  { at: 0.22, kicker: "01 / Commercials & film", a: "Every frame", b: "is a decision." },
  { at: 0.44, kicker: "02 / Real estate · TikTok · Social", a: "Listings, launches", b: "and the feed in between." },
  { at: 0.64, kicker: "03 / Web · Design · Marketing", a: "Made close to home.", b: "Built to be found." },
];

/**
 * The homepage opening. With WebGL: a sticky stage where the 3D reel, the
 * running film and the project screens play out over ~4 screens of scroll,
 * with the hero copy and chapter titles choreographed by one ScrollTrigger.
 * Without WebGL: just the hero.
 */
export function ReelStory({ projects, children }: { projects: ScreenProject[]; children: ReactNode }) {
  const { enabled, tier } = useGL();
  if (!enabled) return <>{children}</>;
  return (
    <Stage projects={projects} tier={tier}>
      {children}
    </Stage>
  );
}

function Stage({ projects, tier, children }: { projects: ScreenProject[]; tier: "high" | "low"; children: ReactNode }) {
  const section = useRef<HTMLElement>(null);
  const hero = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useLayoutEffect(() => {
    const el = section.current;
    if (!el || !hero.current) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: el,
          start: "top top",
          end: "bottom bottom",
          scrub: true,
          onUpdate: (self) => {
            studio.progress = self.progress;
          },
        },
      });

      tl.to(hero.current, { yPercent: -14, autoAlpha: 0, duration: 0.12 }, 0.03);

      el.querySelectorAll<HTMLElement>("[data-chapter]").forEach((node, i) => {
        const at = CHAPTERS[i].at;
        const lines = node.querySelectorAll("[data-line]");
        tl.fromTo(node, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.02 }, at - 0.07)
          .fromTo(
            lines,
            { yPercent: 105, rotate: 2 },
            { yPercent: 0, rotate: 0, duration: 0.07, stagger: 0.015, ease: "power3.out" },
            at - 0.07,
          )
          .to(lines, { yPercent: -105, duration: 0.06, stagger: 0.01, ease: "power2.in" }, at + 0.09)
          .set(node, { autoAlpha: 0 }, at + 0.16);
      });

      tl.fromTo(
        "[data-screens]",
        { autoAlpha: 0, y: 40 },
        { autoAlpha: 1, y: 0, duration: 0.08, ease: "power2.out" },
        0.84,
      );
      tl.set({}, {}, 1);
    }, el);

    const refresh = () => ScrollTrigger.refresh();
    document.fonts?.ready.then(refresh);
    return () => {
      ctx.revert();
      studio.progress = 0;
      studio.hovered = -1;
    };
  }, []);

  const openProject = (e: React.MouseEvent<HTMLAnchorElement>, slug: string) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    sound.tick();
    router.push(`/work/${slug}`);
  };

  return (
    <section ref={section} aria-label="Kasdan Studios — opening reel" className="relative h-[440svh]">
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <ReelView tier={tier} projects={projects} />

        <div ref={hero} className="relative h-full">
          {children}
        </div>

        {CHAPTERS.map((c) => (
          <div
            key={c.kicker}
            data-chapter
            className="invisible absolute inset-0 flex flex-col justify-center opacity-0"
          >
            <div className="shell">
              <p className="type-label overflow-hidden text-gold">
                <span data-line className="block">
                  {c.kicker}
                </span>
              </p>
              <p className="type-display mt-6 max-w-[18ch] text-cream">
                <span className="block overflow-hidden pb-[0.06em]">
                  <span data-line className="block">
                    {c.a}
                  </span>
                </span>
                <span className="block overflow-hidden pb-[0.1em]">
                  <span data-line className="block italic text-bone">
                    {c.b}
                  </span>
                </span>
              </p>
            </div>
          </div>
        ))}

        <div data-screens className="invisible absolute inset-x-0 bottom-0 opacity-0">
          <div className="shell pb-16 md:pb-20">
            <div className="flex items-end justify-between gap-6 border-b border-line pb-4">
              <p className="type-label text-gold">Selected work</p>
              <Link href="/work" className="type-label link-line pb-1 text-mute hover:text-cream">
                All work
              </Link>
            </div>
            <ul className="grid gap-1 pt-4 md:grid-cols-3 md:gap-6" onMouseLeave={() => (studio.hovered = -1)}>
              {[0, 1, 2].map((i) => {
                const p = projects[i];
                return (
                  <li key={i}>
                    {p ? (
                      <Link
                        href={`/work/${p.slug}`}
                        onClick={(e) => openProject(e, p.slug)}
                        onMouseEnter={() => (studio.hovered = i)}
                        onFocus={() => (studio.hovered = i)}
                        onBlur={() => (studio.hovered = -1)}
                        className="group flex items-baseline gap-4 py-2"
                      >
                        <span className="type-label text-gold">{String(i + 1).padStart(2, "0")}</span>
                        <span>
                          <span className="link-line type-title block pb-1 text-cream">{p.title}</span>
                          <span className="type-label text-mute">{p.discipline}</span>
                        </span>
                      </Link>
                    ) : (
                      <div className="flex items-baseline gap-4 py-2" onMouseEnter={() => (studio.hovered = i)}>
                        <span className="type-label text-gold-soft">{String(i + 1).padStart(2, "0")}</span>
                        <span>
                          <span className="type-title block pb-1 text-bone">In preparation</span>
                          <span className="type-label text-dim">Case study coming soon</span>
                        </span>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
