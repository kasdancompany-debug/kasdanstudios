import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/** Film-credit style metadata label. */
export function Label({
  children,
  className,
  tone = "mute",
  as: Tag = "p",
}: {
  children: ReactNode;
  className?: string;
  tone?: "mute" | "gold" | "cream";
  as?: "p" | "span" | "h2" | "h3" | "dt" | "div";
}) {
  return (
    <Tag
      className={cn(
        "type-label",
        tone === "gold" && "text-gold",
        tone === "mute" && "text-mute",
        tone === "cream" && "text-cream",
        className,
      )}
    >
      {children}
    </Tag>
  );
}

/** Section marker: "(01) Selected Work" — numbered like a reel. */
export function SectionMarker({
  index,
  children,
  className,
}: {
  index?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-baseline gap-4", className)}>
      {index && <span className="type-label text-gold">({index})</span>}
      <span className="type-label text-mute">{children}</span>
    </div>
  );
}
