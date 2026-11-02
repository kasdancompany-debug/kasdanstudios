import type { CSSProperties, ElementType, ReactNode } from "react";

type RevealProps = {
  as?: ElementType;
  /** fade: rise + fade. mask: line wipe for headlines. frame: aperture crop for media. */
  variant?: "fade" | "mask" | "frame";
  delay?: number;
  className?: string;
  children: ReactNode;
  id?: string;
};

/**
 * Server-rendered reveal wrapper. Content is visible by default; the
 * animation only applies once JS has loaded (see `.js [data-reveal]` in
 * globals.css and RevealObserver), so nothing is hidden from crawlers or
 * no-JS visitors.
 */
export function Reveal({ as: Tag = "div", variant = "fade", delay = 0, className, children, id }: RevealProps) {
  return (
    <Tag
      id={id}
      data-reveal={variant}
      // RevealObserver adds "is-in" on the client, possibly before this
      // segment hydrates; that class change is expected.
      suppressHydrationWarning
      className={className}
      style={delay ? ({ "--reveal-delay": `${delay}ms` } as CSSProperties) : undefined}
    >
      {children}
    </Tag>
  );
}
