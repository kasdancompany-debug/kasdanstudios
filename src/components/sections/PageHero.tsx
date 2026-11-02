import type { ReactNode } from "react";
import { Reveal } from "@/components/ui/Reveal";
import { SectionMarker } from "@/components/ui/Label";
import { GLText } from "@/components/gl/GLText";

/** Editorial page opener for inner pages: marker, oversized headline, lede. */
export function PageHero({
  marker,
  title,
  lede,
  children,
}: {
  marker: string;
  title: ReactNode;
  lede?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <section className="shell pt-36 pb-16 md:pt-52 md:pb-24">
      <Reveal>
        <SectionMarker>{marker}</SectionMarker>
      </Reveal>
      <GLText as="h1" className="type-display mt-8 max-w-[14ch] text-cream md:mt-10">
        <Reveal as="span" variant="mask" className="block">
          {title}
        </Reveal>
      </GLText>
      {lede && (
        <div className="mt-12 grid md:mt-16 md:grid-cols-12">
          <Reveal delay={120} className="type-lede text-bone md:col-span-6 md:col-start-7">
            {lede}
          </Reveal>
        </div>
      )}
      {children}
    </section>
  );
}
