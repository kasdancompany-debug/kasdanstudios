import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/cn";
import { Magnetic } from "./Magnetic";

type Variant = "solid" | "outline" | "text";

type ButtonLinkProps = {
  href: string;
  children: ReactNode;
  variant?: Variant;
  className?: string;
  external?: boolean;
  magnetic?: boolean;
  /** Plays the optional UI tick when sound is enabled. */
  sound?: boolean;
};

const base =
  "group/btn relative inline-flex items-center gap-3 type-nav whitespace-nowrap transition-colors duration-500 ease-[var(--ease-cinema)]";

const variants: Record<Variant, string> = {
  solid: "bg-cream text-ink px-6 py-4 md:px-7 md:py-[1.15rem] hover:bg-gold focus-visible:bg-gold",
  outline:
    "border border-line-strong text-cream px-6 py-4 md:px-7 md:py-[1.15rem] hover:border-cream focus-visible:border-cream",
  text: "text-cream py-2",
};

export function ButtonLink({
  href,
  children,
  variant = "solid",
  className,
  external,
  magnetic = false,
  sound = false,
}: ButtonLinkProps) {
  const Icon = external ? ArrowUpRight : ArrowRight;
  const content = (
    <>
      <span className={cn(variant === "text" && "link-line pb-1")}>{children}</span>
      <Icon
        aria-hidden
        strokeWidth={1.25}
        className="size-4 shrink-0 transition-transform duration-500 ease-[var(--ease-cinema)] group-hover/btn:translate-x-1"
      />
    </>
  );

  const cls = cn(base, variants[variant], className);
  const dataSound = sound ? { "data-sound": "tick" } : {};

  const link = external ? (
    <a href={href} className={cls} target="_blank" rel="noopener noreferrer" {...dataSound}>
      {content}
      <span className="sr-only">(opens in a new tab)</span>
    </a>
  ) : (
    <Link href={href} className={cls} {...dataSound}>
      {content}
    </Link>
  );

  return magnetic ? <Magnetic>{link}</Magnetic> : link;
}
