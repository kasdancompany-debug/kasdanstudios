import Link from "next/link";
import { services } from "@content/services";
import { awardsRoll, businessRecognition, kasdanCoFacts } from "@content/recognition";
import { getVisibleProjects } from "@/lib/content/projects";
import { Hero } from "@/components/home/Hero";
import { ImmersiveLayer } from "@/components/studio/ImmersiveLayer";
import { ReelStory } from "@/components/home/ReelStory";
import { Disciplines } from "@/components/home/Disciplines";
import { AwardsReel } from "@/components/awards/AwardsReel";
import { Marquee } from "@/components/ui/Marquee";
import { GLText } from "@/components/gl/GLText";
import { ProjectCard, ProjectSlot } from "@/components/work/ProjectCard";
import { CtaSection } from "@/components/sections/CtaSection";
import { AssetPlaceholder } from "@/components/ui/AssetPlaceholder";
import { ButtonLink } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { SectionMarker } from "@/components/ui/Label";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  path: "/",
  description:
    "Creative studio in Sault Ste. Marie, Ontario — commercials, real estate video, TikTok content, web design, graphic design and marketing.",
});

const slotLabels = ["Brand & social content", "Commercial film", "Recognized creative work"];

export default function HomePage() {
  const projects = getVisibleProjects();
  const featured = projects.find((p) => p.featured) ?? projects[0];
  const rest = projects.filter((p) => p !== featured).slice(0, 2);
  const shown = featured ? [featured, ...rest] : [];

  return (
    <>
      {/* Aperture intro (first visit) */}
      <ImmersiveLayer />

      {/* Hero → 3D reel → selected work, as one scroll-driven sequence when WebGL is on */}
      <ReelStory
        projects={shown.map((p) => ({
          slug: p.slug,
          title: p.title,
          discipline: p.disciplines[0] ?? "",
          cover: p.cover?.src ?? null,
        }))}
      >
        <Hero />
      </ReelStory>

      <Marquee
        items={["Commercials", "Real Estate", "TikTok", "Web Design", "Graphic Design", "Marketing"]}
        className="mt-24 md:mt-32"
      />

      {/* ------------------------------------------------------------ */}
      {/* Selected work                                                */}
      {/* ------------------------------------------------------------ */}
      <section id="selected-work" aria-labelledby="work-title" className="shell scroll-mt-24 pt-28 md:pt-44">
        <div className="flex items-end justify-between gap-6 border-b border-line pb-6">
          <div>
            <Reveal>
              <SectionMarker index="01">Selected work</SectionMarker>
            </Reveal>
            <GLText as="h2" id="work-title" className="type-display mt-6 text-cream">
              Recent <span className="italic text-bone">frames</span>
            </GLText>
          </div>
          {shown.length > 0 && (
            <ButtonLink href="/work" variant="text" className="hidden sm:inline-flex">
              All work
            </ButtonLink>
          )}
        </div>

        {shown.length > 0 ? (
          <div className="mt-14 md:mt-20">
            <Reveal variant="frame">
              <ProjectCard project={shown[0]} size="feature" index={1} headingLevel="h3" />
            </Reveal>
            {shown.length > 1 && (
              <div className="mt-20 grid gap-20 md:mt-32 md:grid-cols-12 md:gap-x-8">
                {shown[1] && (
                  <Reveal variant="frame" className="md:col-span-7">
                    <ProjectCard project={shown[1]} size="large" index={2} />
                  </Reveal>
                )}
                {shown[2] && (
                  <Reveal variant="frame" delay={120} className="md:col-span-4 md:col-start-9 md:mt-48">
                    <ProjectCard project={shown[2]} size="medium" index={3} />
                  </Reveal>
                )}
              </div>
            )}
            <div className="mt-16 sm:hidden">
              <ButtonLink href="/work" variant="text">
                All work
              </ButtonLink>
            </div>
          </div>
        ) : (
          <div className="mt-14 md:mt-20">
            <Reveal variant="frame">
              <ProjectSlot size="feature" index={1} label={slotLabels[0]} />
            </Reveal>
            <div className="mt-20 grid gap-20 md:mt-32 md:grid-cols-12 md:gap-x-8">
              <Reveal variant="frame" className="md:col-span-7">
                <ProjectSlot size="large" index={2} label={slotLabels[1]} />
              </Reveal>
              <Reveal variant="frame" delay={120} className="md:col-span-4 md:col-start-9 md:mt-48">
                <ProjectSlot size="medium" index={3} label={slotLabels[2]} />
              </Reveal>
            </div>
            <p className="mt-16 max-w-[52ch] text-mute">
              Case studies are being prepared for publication. In the meantime, we&apos;re happy to share relevant work
              directly —{" "}
              <Link
                href="/contact"
                className="text-cream underline decoration-gold-soft underline-offset-4 hover:decoration-gold"
              >
                get in touch
              </Link>
              .
            </p>
          </div>
        )}
      </section>

      {/* ------------------------------------------------------------ */}
      {/* Manifesto                                                    */}
      {/* ------------------------------------------------------------ */}
      <section aria-labelledby="manifesto-title" className="shell pt-36 md:pt-56">
        <div className="grid gap-12 md:grid-cols-12 md:gap-x-8">
          <div className="md:col-span-6">
            <Reveal>
              <SectionMarker index="02">The studio</SectionMarker>
            </Reveal>
            <GLText as="h2" id="manifesto-title" className="type-mega mt-8 text-cream">
              <span className="block">Small studio.</span>
              <span className="block italic text-bone">Big ideas.</span>
            </GLText>
          </div>
          <div className="space-y-6 text-bone md:col-span-5 md:col-start-8 md:pt-24">
            <Reveal as="p" className="type-lede text-cream">
              We&apos;re a deliberately small team. The people you meet at the first conversation are the people
              writing, shooting and cutting your film.
            </Reveal>
            <Reveal as="p" delay={100}>
              That keeps the thinking close to the craft. A good idea survives the trip from treatment to final grade
              because nobody hands it off along the way.
            </Reveal>
            <Reveal as="p" delay={180}>
              And because we also run a business of our own, we never lose sight of why the work exists: it has to mean
              something to the people watching, and it has to do something for the people paying for it.
            </Reveal>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------ */}
      {/* What we do                                                   */}
      {/* ------------------------------------------------------------ */}
      <section aria-labelledby="services-title" className="shell pt-36 md:pt-56">
        <div className="flex items-end justify-between gap-6">
          <div>
            <Reveal>
              <SectionMarker index="03">What we do</SectionMarker>
            </Reveal>
            <GLText as="h2" id="services-title" className="type-display mt-6 text-cream">
              Six disciplines. <span className="italic text-bone">One studio.</span>
            </GLText>
          </div>
        </div>

        <div className="mt-14 md:mt-20">
          <Disciplines
            items={services.map((s) => ({
              id: s.id,
              index: s.index,
              name: s.name,
              summary: s.summary,
              offerings: s.offerings,
            }))}
          />
        </div>
      </section>

      {/* ------------------------------------------------------------ */}
      {/* Awards & recognition                                         */}
      {/* ------------------------------------------------------------ */}
      <div className="pt-28 md:pt-40">
        <AwardsReel
          id="awards"
          entries={[
            ...awardsRoll,
            {
              year: null,
              name: businessRecognition.label.replace(" recognition", ""),
              organization: businessRecognition.detail,
              recipient: businessRecognition.recipient,
            },
          ]}
        />
      </div>

      {/* ------------------------------------------------------------ */}
      {/* The Kasdan difference                                        */}
      {/* ------------------------------------------------------------ */}
      <section aria-labelledby="difference-title" className="shell pt-36 pb-36 md:pt-56 md:pb-56">
        <div className="grid gap-14 md:grid-cols-12 md:gap-x-8">
          <Reveal variant="frame" className="md:col-span-5">
            <AssetPlaceholder
              ratio="4/5"
              label="Kasdan Co. café — interior or content shoot"
              hint="Portrait 4:5, 1600 × 2000"
            />
          </Reveal>
          <div className="md:col-span-6 md:col-start-7 md:pt-16">
            <Reveal>
              <SectionMarker index="04">The Kasdan difference</SectionMarker>
            </Reveal>
            <GLText as="h2" id="difference-title" className="type-display mt-8 text-cream">
              <span className="block">We don&apos;t just build brands.</span>
              <span className="block italic text-bone">We build businesses.</span>
            </GLText>
            <div className="mt-10 space-y-5 text-bone">
              <Reveal as="p">
                Kasdan Studios grew out of Kasdan Co., the café our founders run in Sault Ste. Marie. Every week we plan
                content, make it, post it and live with the result — the same loop our clients are in.
              </Reveal>
              <Reveal as="p" delay={80}>
                Running a storefront teaches things a brief can&apos;t: margins, staffing, slow Tuesdays, what a
                customer actually notices. That experience shapes how we approach every project.
              </Reveal>
            </div>

            <Reveal delay={140} className="mt-14 border-t border-line pt-8">
              <dl className="flex flex-col gap-2 sm:flex-row sm:items-end sm:gap-8">
                <dt className="sr-only">Kasdan Co. TikTok</dt>
                <dd className="font-display text-[clamp(5rem,13vw,11rem)] leading-[0.8] text-gold">
                  {kasdanCoFacts.tiktokViews}
                </dd>
                <dd className="max-w-[24ch] pb-2 text-mute">{kasdanCoFacts.tiktokViewsLabel}</dd>
              </dl>
            </Reveal>

            <Reveal delay={200} className="mt-12">
              <ButtonLink href="/about" variant="text">
                About the studio
              </ButtonLink>
            </Reveal>
          </div>
        </div>
      </section>

      <CtaSection studio />
    </>
  );
}
