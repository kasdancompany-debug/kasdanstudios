import { ButtonLink } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { Label } from "@/components/ui/Label";
import { GLText } from "@/components/gl/GLText";
import { GLStage } from "@/components/gl/GLStage";

/**
 * Closing call to action. A single key light falls on the type, like a
 * stage before the camera rolls. On the homepage the WebGL studio set
 * renders behind it (see [data-studio-cta]).
 */
export function CtaSection({
  title = "Have something worth making?",
  cta = "Let's Talk",
  eyebrow = "Start a project",
  studio = false,
}: {
  title?: string;
  cta?: string;
  eyebrow?: string;
  studio?: boolean;
}) {
  return (
    <section
      {...(studio ? { "data-studio-cta": "" } : {})}
      className="relative isolate overflow-hidden border-t border-line"
      aria-labelledby="cta-title"
    >
      <div
        aria-hidden
        data-hero-media
        className="absolute inset-0 -z-10 transition-opacity duration-700"
        style={{
          background:
            "radial-gradient(60% 75% at 50% -5%, rgba(238,231,218,0.10) 0%, rgba(199,170,118,0.05) 35%, transparent 70%)",
        }}
      />
      {studio && (
        <div aria-hidden className="absolute inset-0 -z-10">
          <GLStage />
        </div>
      )}
      <div className="shell flex min-h-[80svh] flex-col justify-center py-28 md:min-h-[92svh]">
        <Reveal>
          <Label tone="gold">{eyebrow}</Label>
        </Reveal>
        <GLText as="h2" id="cta-title" className="type-mega mt-8 text-cream">
          <Reveal as="span" variant="mask" className="block">
            {title.split(" ").slice(0, 2).join(" ")}
          </Reveal>
          <Reveal as="span" variant="mask" delay={120} className="block italic text-bone">
            {title.split(" ").slice(2).join(" ")}
          </Reveal>
        </GLText>
        <Reveal delay={240} className="mt-14">
          <ButtonLink href="/contact" magnetic sound>
            {cta}
          </ButtonLink>
        </Reveal>
      </div>
    </section>
  );
}
