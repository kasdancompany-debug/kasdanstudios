"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { lenisStore } from "@/lib/motion/lenis-store";
import { onFrame } from "@/lib/motion/ticker";
import { sound } from "@/lib/sound";
import { CustomCursor } from "./CustomCursor";

gsap.registerPlugin(ScrollTrigger);

/**
 * Client-only progressive enhancements, mounted once in the root layout:
 * - reveal-on-scroll for [data-reveal] elements
 * - Lenis smooth scrolling (fine pointers, motion allowed)
 * - optional UI sound for [data-sound] elements
 * - custom cursor (fine pointers only)
 */
export function Enhancements() {
  const pathname = usePathname();

  // Reveal observer — re-scans when the DOM changes (route changes, filters).
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // Masked elements start fully clipped, which Chrome treats as a zero
    // intersection — so we observe their parent and reveal on its behalf.
    const targets = new Map<Element, Set<HTMLElement>>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          targets.get(e.target)?.forEach((el) => el.classList.add("is-in"));
          targets.delete(e.target);
          io.unobserve(e.target);
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0 },
    );

    const scan = () => {
      document.querySelectorAll<HTMLElement>("[data-reveal]:not(.is-in)").forEach((el) => {
        if (reduce) {
          el.classList.add("is-in");
          return;
        }
        const observed = el.dataset.reveal === "mask" && el.parentElement ? el.parentElement : el;
        const set = targets.get(observed) ?? new Set<HTMLElement>();
        set.add(el);
        targets.set(observed, set);
        io.observe(observed);
      });
    };
    scan();

    // Coalesce bursts of mutations into one scan per frame. (Never cancel and
    // re-queue: a node that mutates every frame would starve the scan forever.)
    let raf = 0;
    let pending = false;
    const mo = new MutationObserver(() => {
      if (pending) return;
      pending = true;
      raf = requestAnimationFrame(() => {
        pending = false;
        scan();
      });
    });
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      io.disconnect();
      mo.disconnect();
      cancelAnimationFrame(raf);
    };
  }, []);

  // Smooth scroll
  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduce) return;

    // Driven from the shared clock (not its own rAF) and wired straight into
    // ScrollTrigger, so timelines and the WebGL layer see the same scroll
    // position in the same frame.
    const lenis = new Lenis({ lerp: 0.1, anchors: true, autoRaf: false });
    lenisStore.set(lenis);
    const offScroll = lenis.on("scroll", ScrollTrigger.update);
    const offFrame = onFrame("scroll", (time) => lenis.raf(time * 1000));
    return () => {
      offFrame();
      offScroll();
      lenis.destroy();
      lenisStore.set(null);
    };
  }, []);

  // Route change → top of page (Lenis keeps its own scroll target)
  useEffect(() => {
    lenisStore.get()?.scrollTo(0, { immediate: true, force: true });
  }, [pathname]);

  // Optional UI tick sound
  useEffect(() => {
    const onOver = (e: PointerEvent) => {
      const t = (e.target as HTMLElement | null)?.closest?.("[data-sound]");
      if (t && !t.contains(e.relatedTarget as Node | null)) sound.tick();
    };
    document.addEventListener("pointerover", onOver);
    return () => document.removeEventListener("pointerover", onOver);
  }, []);

  return <CustomCursor />;
}
