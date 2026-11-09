"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, type ReactNode } from "react";
import { useGL } from "./useGL";
import type { MediaInput } from "./views/MediaView";
import { cn } from "@/lib/cn";

const MediaView = dynamic(() => import("./views/MediaView"), { ssr: false });

/**
 * Wraps an image or placeholder. With WebGL on, a shader plane takes over
 * the same rectangle (burn-in reveal, cursor ripple, scroll smear); the DOM
 * image underneath stays for alt text, SEO and the no-WebGL fallback.
 */
export function GLMedia({
  src,
  focus,
  label,
  hint = "",
  className,
  children,
}: {
  /** Image path, or omit for a labelled production-slate placeholder. */
  src?: string | null;
  /** Focal point for cropping, as object-position fractions (x from left, y from top). */
  focus?: [number, number];
  label: string;
  hint?: string;
  className?: string;
  children: ReactNode;
}) {
  const { enabled } = useGL();
  const wrap = useRef<HTMLDivElement>(null);
  const input = useRef<MediaInput>({ hover: 0, px: 0.5, py: 0.5 });

  const onMove = (e: React.PointerEvent) => {
    const r = wrap.current?.getBoundingClientRect();
    if (!r) return;
    input.current.px = (e.clientX - r.left) / r.width;
    input.current.py = (e.clientY - r.top) / r.height;
  };

  const onReady = useCallback(() => {
    wrap.current?.setAttribute("data-gl-media-ready", "");
  }, []);

  // Held hidden while the GL copy loads (see globals.css); give up after a while.
  useEffect(() => {
    if (!enabled) return;
    const node = wrap.current;
    const t = window.setTimeout(() => {
      if (node && !node.hasAttribute("data-gl-media-ready")) node.setAttribute("data-gl-fail", "");
    }, 3500);
    return () => window.clearTimeout(t);
  }, [enabled]);

  return (
    <div
      ref={wrap}
      data-gl-media=""
      className={cn("relative", className)}
      onPointerEnter={() => (input.current.hover = 1)}
      onPointerLeave={() => (input.current.hover = 0)}
      onPointerMove={onMove}
    >
      {children}
      {enabled && <MediaView src={src} focus={focus} label={label} hint={hint} input={input} onReady={onReady} />}
    </div>
  );
}
