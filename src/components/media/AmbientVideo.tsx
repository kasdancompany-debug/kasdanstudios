"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/cn";

type Props = {
  src: string;
  /** Optional lighter file for narrow viewports. */
  mobileSrc?: string | null;
  poster: string;
  className?: string;
  /** Accessible description; ambient loops are otherwise decorative. */
  label?: string;
};

function shouldStream() {
  if (typeof window === "undefined") return false;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  const conn = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
  if (conn?.saveData) return false;
  if (conn?.effectiveType && /(^|-)2g$/.test(conn.effectiveType)) return false;
  return true;
}

/**
 * Silent, looping background video.
 * - Renders the poster on the server; the video source is attached only on
 *   the client when motion and data constraints allow.
 * - Pauses when offscreen or when the tab is hidden.
 * - Never plays audio.
 */
export function AmbientVideo({ src, mobileSrc, poster, className, label }: Props) {
  const ref = useRef<HTMLVideoElement>(null);
  // The source is attached imperatively so the server render (and any
  // reduced-motion / data-saver visitor) only ever loads the poster.
  useEffect(() => {
    const el = ref.current;
    if (!el || !shouldStream()) return;
    const narrow = window.matchMedia("(max-width: 767px)").matches;
    el.src = narrow && mobileSrc ? mobileSrc : src;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !document.hidden) el.play().catch(() => {});
        else el.pause();
      },
      { threshold: 0.05 },
    );
    io.observe(el);
    const onVis = () => (document.hidden ? el.pause() : el.play().catch(() => {}));
    document.addEventListener("visibilitychange", onVis);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [src, mobileSrc]);

  return (
    <video
      ref={ref}
      className={cn("h-full w-full object-cover", className)}
      poster={poster}
      muted
      loop
      playsInline
      preload="none"
      aria-hidden={label ? undefined : true}
      aria-label={label}
      disablePictureInPicture
    />
  );
}
