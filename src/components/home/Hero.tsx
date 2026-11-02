import Image from "next/image";
import { site } from "@content/site";
import { founderAwards } from "@content/recognition";
import { ButtonLink } from "@/components/ui/Button";
import { AmbientVideo } from "@/components/media/AmbientVideo";
import { GLText } from "@/components/gl/GLText";

/**
 * Homepage hero. Server-rendered and complete on its own — the WebGL layer
 * (when it runs) replaces only the background behind it.
 */
export function Hero() {
  const reel = site.showreel;

  return (
    <section data-studio-hero aria-labelledby="hero-title" className="relative isolate flex min-h-[100svh] flex-col">
      {/* Background media */}
      <div data-hero-media aria-hidden className="absolute inset-0 -z-10 transition-opacity duration-1000">
        {reel.src && reel.poster ? (
          <AmbientVideo src={reel.src} mobileSrc={reel.mobileSrc} poster={reel.poster} />
        ) : reel.poster ? (
          <Image src={reel.poster} alt="" fill priority sizes="100vw" className="object-cover" />
        ) : (
          <div
            className="absolute inset-0 bg-ink"
            style={{
              background:
                "radial-gradient(70% 60% at 72% 30%, rgba(199,170,118,0.11) 0%, rgba(199,170,118,0.035) 40%, transparent 75%), radial-gradient(50% 50% at 15% 85%, rgba(238,231,218,0.04) 0%, transparent 70%), #0c0b09",
            }}
          />
        )}
        {/* Readability scrim — heavier at the bottom where the type sits */}
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(12,11,9,0.55)_0%,rgba(12,11,9,0.1)_35%,rgba(12,11,9,0.55)_70%,rgba(12,11,9,0.96)_100%)]" />
      </div>

      {!reel.src && !reel.poster && (
        <p data-hero-media className="type-label absolute top-24 right-5 text-dim md:top-28 md:right-10 xl:right-14">
          Showreel placeholder — awaiting footage
        </p>
      )}

      <div className="shell flex flex-1 flex-col justify-end pt-32 pb-10 md:pb-14">
        <p className="type-label text-gold" data-reveal="fade" suppressHydrationWarning>
          Kasdan Studios — {site.location.city}, {site.location.regionCode}
        </p>

        <GLText as="h1" id="hero-title" className="type-mega mt-6 text-cream md:mt-8">
          <span className="block">Ideas worth</span>
          <span className="block italic text-bone">watching.</span>
        </GLText>

        <div className="mt-10 grid gap-8 md:mt-14 md:grid-cols-12 md:items-end">
          <div
            className="md:col-span-5"
            data-reveal="fade"
            suppressHydrationWarning
            style={{ "--reveal-delay": "260ms" } as React.CSSProperties}
          >
            <p className="type-nav text-cream">Commercials. Web. Social. Design.</p>
            <p className="mt-3 max-w-[34ch] text-mute">
              An independent creative studio based in {site.location.regionLabel}.
            </p>
          </div>
          <div
            className="flex flex-wrap gap-3 md:col-span-7 md:justify-end"
            data-reveal="fade"
            suppressHydrationWarning
            style={{ "--reveal-delay": "360ms" } as React.CSSProperties}
          >
            <ButtonLink href="/work" magnetic sound>
              Explore Our Work
            </ButtonLink>
            <ButtonLink href="/contact" variant="outline" magnetic sound>
              Start a Project
            </ButtonLink>
          </div>
        </div>
      </div>

      {/* Recognition strip — founder honours, text only until logos are licensed */}
      <div className="border-t border-line/80 bg-ink/70">
        <div className="shell grid grid-cols-1 gap-y-4 py-5 md:grid-cols-12 md:items-center md:py-6">
          <p className="type-label text-mute md:col-span-3">
            Founder recognition
            <span
              className="block text-dim normal-case tracking-normal"
              style={{ fontFamily: "var(--font-sans)", fontSize: "0.8rem" }}
            >
              Awarded to {site.founder.name}
            </span>
          </p>
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-3 md:col-span-8 md:gap-8" aria-label="Founder awards">
            {founderAwards.map((a) => (
              <li key={a.name} className="flex items-baseline gap-3">
                <span className="type-label text-gold">{a.year}</span>
                <span className="font-display text-lg leading-tight text-cream md:text-xl">{a.name}</span>
              </li>
            ))}
          </ul>
          <a href="#awards" className="group hidden items-center justify-end gap-3 md:col-span-1 md:flex">
            <span className="type-label text-mute transition-colors group-hover:text-cream">All awards</span>
            <span aria-hidden className="relative h-10 w-px overflow-hidden bg-line">
              <span className="cue-line absolute inset-0 bg-gold" />
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}
