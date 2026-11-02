"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { ArrowUpRight } from "lucide-react";
import { GLMorph } from "@/components/gl/GLMorph";
import { morph } from "@/components/gl/morphStore";

type Item = { id: string; index: string; name: string; summary: string; offerings: string[] };

/**
 * "What we do": four disciplines beside one morphing object. Hovering,
 * focusing or scrolling to a discipline changes the object's temperament.
 */
export function Disciplines({ items }: { items: Item[] }) {
  const list = useRef<HTMLOListElement>(null);

  // Scroll-linked: whichever row crosses the middle of the screen leads.
  useEffect(() => {
    const rows = list.current?.querySelectorAll<HTMLElement>("[data-row]");
    if (!rows) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) morph.active = Number((e.target as HTMLElement).dataset.row);
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    rows.forEach((r) => io.observe(r));
    return () => io.disconnect();
  }, []);

  return (
    <div className="grid gap-10 md:grid-cols-12 md:gap-x-8">
      <div className="md:col-span-5">
        <GLMorph className="relative mx-auto aspect-square w-full max-w-[22rem] md:sticky md:top-28 md:max-w-none" />
      </div>
      <ol ref={list} className="border-t border-line md:col-span-7">
        {items.map((s, i) => (
          <li key={s.id} data-row={i} className="border-b border-line">
            <Link
              href={`/services#${s.id}`}
              onMouseEnter={() => (morph.active = i)}
              onFocus={() => (morph.active = i)}
              className="group block py-9 md:py-12"
              data-sound="tick"
            >
              <div className="flex items-start justify-between gap-6">
                <div className="flex items-baseline gap-5">
                  <span className="type-label text-gold">{s.index}</span>
                  <span className="type-display text-cream transition-[color,transform] duration-700 ease-[var(--ease-cinema)] group-hover:translate-x-3 group-hover:text-gold">
                    {s.name}
                  </span>
                </div>
                <ArrowUpRight
                  aria-hidden
                  strokeWidth={1}
                  className="mt-2 size-8 shrink-0 text-mute transition-all duration-500 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-gold"
                />
              </div>
              <p className="mt-5 max-w-[46ch] pl-[3.25rem] text-mute">{s.summary}</p>
              <ul className="type-label mt-5 flex flex-wrap gap-x-4 gap-y-2 pl-[3.25rem] text-dim">
                {s.offerings.slice(0, 5).map((o) => (
                  <li key={o}>{o}</li>
                ))}
              </ul>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}
