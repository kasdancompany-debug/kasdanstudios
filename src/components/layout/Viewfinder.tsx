"use client";

import { useEffect, useRef } from "react";

const FPS = 24;

/** Writes text without replacing the node (a characterData change, not a childList one). */
function setText(el: HTMLElement | null, text: string) {
  if (!el) return;
  if (el.firstChild && el.firstChild.nodeType === Node.TEXT_NODE) el.firstChild.nodeValue = text;
  else el.textContent = text;
}

function pad(n: number, l = 2) {
  return String(n).padStart(l, "0");
}

/**
 * Camera-viewfinder HUD framing every page: corner marks, a running SMPTE
 * timecode with REC tally, and a frame-counter gauge that tracks scroll.
 * Purely decorative — aria-hidden, no pointer events. Static when the
 * visitor prefers reduced motion.
 */
export function Viewfinder() {
  const tc = useRef<HTMLSpanElement>(null);
  const fr = useRef<HTMLSpanElement>(null);
  const needle = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const t0 = performance.now();
    let raf = 0;
    let last = -1;

    const tick = () => {
      const frames = Math.floor(((performance.now() - t0) / 1000) * FPS);
      if (frames !== last && tc.current) {
        last = frames;
        const f = frames % FPS;
        const s = Math.floor(frames / FPS);
        setText(tc.current, `${pad(Math.floor(s / 3600))}:${pad(Math.floor(s / 60) % 60)}:${pad(s % 60)}:${pad(f)}`);
      }
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? window.scrollY / max : 0;
      setText(fr.current, pad(Math.round(p * 2400), 4));
      if (needle.current) needle.current.style.transform = `translateY(${p * 100}%)`;
      if (!reduce) raf = requestAnimationFrame(tick);
    };
    tick();
    const onScroll = () => reduce && tick();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <div aria-hidden className="pointer-events-none">
      {/* Corner marks */}
      <span className="vf-corner top-3 left-3 border-t border-l md:top-4 md:left-4" />
      <span className="vf-corner top-3 right-3 border-t border-r md:top-4 md:right-4" />
      <span className="vf-corner bottom-3 left-3 border-b border-l md:bottom-4 md:left-4" />
      <span className="vf-corner right-3 bottom-3 border-r border-b md:right-4 md:bottom-4" />

      {/* Timecode + tally */}
      <div className="type-label fixed top-1/2 left-[1.15rem] z-[55] hidden origin-center -translate-x-1/2 -translate-y-1/2 -rotate-90 items-center gap-3 text-[0.55rem] whitespace-nowrap text-bone/80 md:flex">
        <span className="rec-dot inline-block size-2 rounded-full bg-gold" />
        <span className="text-gold">REC</span>
        <span ref={tc} className="tabular-nums">
          00:00:00:00
        </span>
        <span className="hidden text-dim sm:inline">24 FPS · 180°</span>
      </div>

      {/* Frame-counter gauge */}
      <div className="fixed top-1/2 right-6 z-[55] hidden h-[38vh] -translate-y-1/2 md:right-8 md:block">
        <div className="relative h-full w-3">
          {Array.from({ length: 25 }, (_, i) => (
            <span
              key={i}
              className="absolute right-0 h-px bg-bone/40"
              style={{ top: `${(i / 24) * 100}%`, width: i % 6 === 0 ? 12 : 6 }}
            />
          ))}
          <span ref={needle} className="absolute inset-x-0 top-0 block h-full">
            <span className="absolute -top-px right-0 h-[2px] w-5 bg-gold" />
          </span>
        </div>
        <span className="type-label absolute top-full right-0 mt-3 text-[0.55rem] whitespace-nowrap text-bone/80">
          FR <span ref={fr}>0000</span>
        </span>
      </div>
    </div>
  );
}
