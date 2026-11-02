import type { Metadata, Viewport } from "next";
import { Big_Shoulders, Fraunces, Martian_Mono, Schibsted_Grotesk } from "next/font/google";
import { primaryNav, site } from "@content/site";
import { getPublishedPosts } from "@/lib/content/journal";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { Enhancements } from "@/components/layout/Enhancements";
import { Viewfinder } from "@/components/layout/Viewfinder";
import { GLRoot } from "@/components/gl/GLRoot";
import { Emulsion } from "@/components/gl/Emulsion";
import { JsonLd } from "@/components/seo/JsonLd";
import { organizationJsonLd } from "@/lib/seo";
import "./globals.css";

// Condensed poster capitals for display type
const display = Big_Shoulders({ variable: "--font-shoulders", subsets: ["latin"], axes: ["opsz"], display: "swap" });
// Soft, wonky italics that cut through the capitals
const accent = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  style: ["italic"],
  axes: ["SOFT", "WONK", "opsz"],
  display: "swap",
});
const sans = Schibsted_Grotesk({ variable: "--font-schibsted", subsets: ["latin"], display: "swap" });
// Camera-HUD readouts
const mono = Martian_Mono({ variable: "--font-martian", subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — ${site.tagline}`,
    template: `%s — ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  authors: [{ name: site.name }],
  creator: site.name,
  formatDetection: { telephone: false, email: false, address: false },
  openGraph: { siteName: site.name, locale: site.locale, type: "website" },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: "#0b0a09",
  colorScheme: "dark",
};

/**
 * Runs before first paint:
 * - flags JS so reveal animations can hide content that will animate in
 * - marks the homepage intro as pending (first visit per session, motion
 *   allowed, no data saver). The cover shows the intro's title and a
 *   working Skip immediately; the WebGL aperture fades in behind it once
 *   loaded. A failsafe removes the cover after 8s if it never does.
 */
const bootScript = `(function(){var d=document.documentElement;d.classList.add('js');try{
var m=window.matchMedia;if(location.pathname==='/'&&!sessionStorage.getItem('ks-intro-seen')&&localStorage.getItem('ks-immersive')!=='off'&&!m('(prefers-reduced-motion: reduce)').matches&&!(navigator.connection&&navigator.connection.saveData)){d.setAttribute('data-intro','pending');var skip=function(){try{sessionStorage.setItem('ks-intro-seen','1')}catch(e){}if(d.getAttribute('data-intro')==='pending')d.removeAttribute('data-intro')};
document.addEventListener('click',function(e){if(e.target&&e.target.closest&&e.target.closest('[data-intro-skip]'))skip()});
document.addEventListener('keydown',function(e){if(e.key==='Escape')skip()});
setTimeout(function(){if(d.getAttribute('data-intro')==='pending')d.removeAttribute('data-intro')},8000)}}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const nav = [...primaryNav] as { label: string; href: string }[];
  if (getPublishedPosts().length > 0) nav.splice(3, 0, { label: "Journal", href: "/journal" });
  const location = `${site.location.city}, ${site.location.regionCode}`;

  return (
    <html
      lang="en-CA"
      className={`${display.variable} ${accent.variable} ${sans.variable} ${mono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: bootScript }} />
      </head>
      <body>
        {/* Painted before hydration when the intro will run (see bootScript). Mirrors the
            intro's layout so there's no blank loading frame, and Skip works before React. */}
        <div className="intro-cover">
          {/* Academy-leader countdown while the lens loads — pure CSS, runs before hydration */}
          <div className="leader" aria-hidden>
            <span className="leader-cross" />
            <span className="leader-ring" />
            <span className="leader-ring leader-ring--inner" />
            <span className="leader-sweep" />
            <span className="leader-num">
              <span>3</span>
              <span>2</span>
              <span>1</span>
            </span>
          </div>
          <div className="relative flex h-full flex-col justify-between p-5 md:p-10 xl:p-14">
            <div className="flex items-start justify-between">
              <span className="font-display text-xl tracking-[0.2em] text-cream">Kasdan</span>
              <button type="button" data-intro-skip className="type-nav -mr-2 p-2 text-mute">
                Skip intro
              </button>
            </div>
            <p className="type-label text-center text-dim">Press Esc to skip</p>
          </div>
        </div>
        <a
          href="#main"
          className="type-nav fixed top-3 left-3 z-[110] -translate-y-24 bg-cream px-4 py-3 text-ink focus:translate-y-0"
        >
          Skip to content
        </a>
        <Emulsion />
        <SiteHeader nav={nav} location={location} />
        <main id="main" tabIndex={-1} className="outline-none">
          {children}
        </main>
        <SiteFooter nav={nav} />
        <Viewfinder />
        <div className="grain" aria-hidden />
        <Enhancements />
        <GLRoot />
        <JsonLd data={organizationJsonLd()} />
      </body>
    </html>
  );
}
