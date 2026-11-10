"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { lenisStore } from "@/lib/motion/lenis-store";
import { SoundToggle } from "./SoundToggle";

type NavItem = { label: string; href: string };

export function SiteHeader({ nav, location }: { nav: NavItem[]; location: string }) {
  const pathname = usePathname();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);

  // Solid background after scrolling; tuck away on scroll down, return on scroll up.
  useEffect(() => {
    let lastY = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 24);
      setHidden(y > 320 && y > lastY + 2);
      if (y < lastY - 2) setHidden(false);
      lastY = y;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the menu after navigation.
  useEffect(() => {
    dialogRef.current?.close();
  }, [pathname]);

  const openMenu = () => {
    dialogRef.current?.showModal();
    lenisStore.stop();
  };
  const closeMenu = () => dialogRef.current?.close();

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-[transform,background-color,border-color] duration-700 ease-[var(--ease-cinema)]",
          scrolled ? "border-b border-line bg-ink/92" : "border-b border-transparent bg-transparent",
          hidden && "-translate-y-full",
        )}
        // Keep the header reachable for keyboard users even while tucked away
        onFocusCapture={() => setHidden(false)}
      >
        <div className="shell flex h-16 items-center justify-between md:h-20">
          <Link href="/" className="group flex items-baseline gap-3" aria-label="kasdan studios — home">
            <span className="text-[0.82rem] font-medium tracking-[0.32em] text-cream">kasdan</span>
            <span className="type-label brand-case hidden text-mute transition-colors group-hover:text-gold sm:inline">
              studios
            </span>
          </Link>

          <nav aria-label="Primary" className="hidden items-center gap-9 lg:flex">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive(item.href) ? "page" : undefined}
                className={cn(
                  "type-nav link-line pb-1 transition-colors",
                  isActive(item.href) ? "text-cream" : "text-mute hover:text-cream",
                )}
              >
                {item.label}
              </Link>
            ))}
            <span aria-hidden className="h-4 w-px bg-line-strong" />
            <SoundToggle />
          </nav>

          <button
            type="button"
            onClick={openMenu}
            aria-haspopup="dialog"
            aria-controls="site-menu"
            className="type-nav -mr-2 flex items-center gap-3 p-2 text-cream lg:hidden"
          >
            Menu
            <span aria-hidden className="flex w-5 flex-col gap-[5px]">
              <span className="h-px w-full bg-cream" />
              <span className="h-px w-3/5 self-end bg-cream" />
            </span>
          </button>
        </div>
      </header>

      <dialog
        ref={dialogRef}
        id="site-menu"
        aria-label="Site menu"
        className="menu-dialog lg:hidden"
        onClose={() => lenisStore.start()}
      >
        <div className="shell flex h-full flex-col">
          <div className="flex h-16 items-center justify-between">
            <span className="text-[0.82rem] font-medium tracking-[0.32em] text-cream">kasdan</span>
            <button type="button" onClick={closeMenu} className="type-nav -mr-2 p-2 text-cream" autoFocus>
              Close
            </button>
          </div>
          <nav aria-label="Mobile" className="flex flex-1 flex-col justify-center">
            <ul className="space-y-1">
              <li>
                <Link
                  href="/"
                  className="block py-1 font-display text-[3.25rem] leading-none text-cream"
                  onClick={closeMenu}
                >
                  Index
                </Link>
              </li>
              {nav.map((item, i) => (
                <li key={item.href} className="flex items-baseline gap-4">
                  <span className="type-label w-6 text-gold-soft">{String(i + 1).padStart(2, "0")}</span>
                  <Link
                    href={item.href}
                    onClick={closeMenu}
                    aria-current={isActive(item.href) ? "page" : undefined}
                    className={cn(
                      "block py-1 font-display text-[3.25rem] leading-none",
                      isActive(item.href) ? "text-gold" : "text-cream",
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="flex items-center justify-between border-t border-line py-6">
            <span className="type-label text-mute">{location}</span>
            <SoundToggle />
          </div>
        </div>
      </dialog>
    </>
  );
}
