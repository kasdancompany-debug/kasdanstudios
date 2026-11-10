"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLayoutEffect, useRef, useSyncExternalStore, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGL } from "@/components/gl/useGL";
import { studio } from "@/components/studio/store";
import type { ScreenProject } from "@/components/studio/scene/StudioScene";
import { useScrollRest } from "@/lib/motion/useScrollRest";
import { sound } from "@/lib/sound";

gsap.registerPlugin(ScrollTrigger);

const ReelView = dynamic(() => import("@/components/gl/views/ReelScene"), { ssr: false });

const CHAPTERS = [
  { at: 0.22, kicker: "01 / Marketing · Meta ads · Lead generation", a: "Ideas that", b: "bring people in." },
  { at: 0.44, kicker: "02 / Branding · Graphic design · Web", a: "A brand that looks", b: "like it means it." },
  { at: 0.64, kicker: "03 / Social · Content · Film", a: "Every frame", b: "is a decision." },
];

/** Chapter timing (fractions of the story's scroll). */
const IN = 0.08; // a title starts arriving this far before its mark
const OUT = 0.1; // …and starts leaving this far after it
const HOLD = 0.04; // the middle of its readable hold, relative to the mark

/**
 * Composed frames the story comes to rest on. When the visitor stops
 * scrolling between two of them, the page eases to the nearer one (biased
 * towards the direction of travel), so it never settles on a half-dissolved
 * title or a camera mid-move.
 */
const REST = [0, ...CHAPTERS.map((c) => c.at + HOLD), 1];

// A pinned stage needs room: on very short screens (landscape phones) the
// hero scrolls as a normal page instead of being clipped to one screen.
const TALL = "(min-height: 500px)";
const subscribeTall = (cb: () => void) => {
  const mq = window.matchMedia(TALL);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};
const useTall = () =>
  useSyncExternalStore(
    subscribeTall,
    () => window.matchMedia(TALL).matches,
    () => true,
  );

/**
 * The homepage opening. With WebGL: a sticky stage where the 3D reel, the
 * running film and the project screens play out over ~4 screens of scroll,
 * with the hero copy and chapter titles choreographed by one ScrollTrigger.
 * Without WebGL: just the hero. The DOM structure is the same either way, so
 * the hero is never torn down and rebuilt when WebGL switches on.
 */
export function ReelStory({
  projects,
  slots,
  children,
}: {
  projects: ScreenProject[];
  /** What each empty project slot will hold, shown until case studies are published. */
  slots: string[];
  children: ReactNode;
}) {
  const gl = useGL();
  const tall = useTall();
  const enabled = gl.enabled && tall;
  const tier = gl.tier;
  const section = useRef<HTMLElement>(null);
  const hero = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useLayoutEffect(() => {
    const el = section.current;
    if (!enabled || !el || !hero.current) return;
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
        // Quick in, long readable hold, quick out.
        tl.fromTo(node, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.02 }, at - IN)
          .fromTo(
            lines,
            { yPercent: 130, rotate: 2 },
            { yPercent: 0, rotate: 0, duration: 0.04, stagger: 0.01, ease: "power3.out" },
            at - IN,
          )
          .to(lines, { yPercent: -130, duration: 0.035, stagger: 0.008, ease: "power2.in" }, at + OUT)
          .to(node, { autoAlpha: 0, duration: 0.02 }, at + OUT + 0.03);
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
  }, [enabled]);

  // Never come to rest mid-transition: settle on the hero, a chapter, or the screens.
  useScrollRest(
    enabled,
    () => {
      const el = section.current;
      if (!el) return null;
      return { top: el.getBoundingClientRect().top + window.scrollY, span: el.offsetHeight - window.innerHeight };
    },
    () => REST,
  );

  const openProject = (e: React.MouseEvent<HTMLAnchorElement>, slug: string) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    sound.tick();
    router.push(`/work/${slug}`);
  };

  return (
    <section
      ref={section}
      aria-label="Kasdan Studios — opening reel"
      className={enabled ? "relative h-[440svh]" : "relative"}
    >
      <div className={enabled ? "sticky top-0 h-[100svh] overflow-hidden" : undefined}>
        {enabled ? <ReelView tier={tier} projects={projects} /> : null}

        <div ref={hero} className="relative h-full">
          {children}
        </div>

        {enabled &&
          CHAPTERS.map((c) => (
            <div
              key={c.kicker}
              data-chapter
              className="invisible absolute inset-0 flex flex-col justify-center bg-[radial-gradient(75%_65%_at_22%_50%,rgba(11,10,9,0.78),rgba(11,10,9,0.35)_55%,transparent_80%)] opacity-0"
            >
              <div className="shell">
                <p className="type-label overflow-hidden py-1 text-gold">
                  <span data-line className="block">
                    {c.kicker}
                  </span>
                </p>
                <p className="type-display mt-6 max-w-[18ch] text-cream">
                  <span className="-my-[0.15em] block overflow-hidden py-[0.15em]">
                    <span data-line className="block">
                      {c.a}
                    </span>
                  </span>
                  <span className="-mt-[0.15em] -mb-[0.25em] block overflow-hidden pt-[0.15em] pb-[0.25em]">
                    <span data-line className="block italic text-bone">
                      {c.b}
                    </span>
                  </span>
                </p>
              </div>
            </div>
          ))}

        {enabled && (
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
                            <span className="type-title block pb-1 text-bone">{slots[i] ?? "Coming soon"}</span>
                            <span className="type-label text-dim">Case study in preparation</span>
                          </span>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
