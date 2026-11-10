import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { getVisibleProjects } from "@/lib/content/projects";
import { process, services } from "@content/services";
import { founderAwards } from "@content/recognition";
import { PageHero } from "@/components/sections/PageHero";
import { CtaSection } from "@/components/sections/CtaSection";
import { WorkGrid } from "@/components/work/WorkGrid";
import { ProjectCard } from "@/components/work/ProjectCard";
import { ButtonLink } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { Label, SectionMarker } from "@/components/ui/Label";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Work",
  path: "/work",
  description:
    "Meta ad campaigns, graphic design, food photography, websites, social content and film from Kasdan Studios, a creative and marketing studio in Sault Ste. Marie, Ontario.",
});

export default function WorkPage() {
  const projects = getVisibleProjects();
  const featured = projects.find((p) => p.featured);

  return (
    <>
      <PageHero
        marker="Work"
        title={
          <>
            Work that <span className="italic text-bone">gets noticed.</span>
          </>
        }
        lede="Meta ad campaigns, posters and brand design, food photography, websites, social content and film. Each case study covers the brief, the idea and exactly what we delivered."
      />

      {projects.length === 0 ? (
        <section className="shell pb-32" aria-labelledby="empty-title">
          <div className="grid gap-12 border-t border-line pt-14 md:grid-cols-12">
            <div className="md:col-span-6">
              <Label tone="gold">In preparation</Label>
              <h2 id="empty-title" className="type-title mt-6 text-cream">
                Our first case studies are being prepared for publication.
              </h2>
              <p className="mt-6 max-w-[48ch] text-mute">
                We&apos;re assembling footage, credits and approvals so each project can be presented properly. If
                you&apos;d like to see relevant work in the meantime, ask — we&apos;ll share it directly.
              </p>
              <div className="mt-10">
                <ButtonLink href="/contact">Request a reel</ButtonLink>
              </div>
            </div>
            <div className="md:col-span-5 md:col-start-8">
              <Label>Founder recognition</Label>
              <ul className="mt-6 divide-y divide-line border-y border-line">
                {founderAwards.map((a) => (
                  <li key={a.name} className="flex items-baseline justify-between gap-6 py-5">
                    <span className="font-display text-xl text-cream">{a.name}</span>
                    <span className="type-label text-gold">{a.year}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      ) : (
        <>
          {featured && (
            <section className="shell pb-24 md:pb-36" aria-label="Featured project">
              <Reveal variant="frame">
                <ProjectCard project={featured} size="feature" priority headingLevel="h2" />
              </Reveal>
            </section>
          )}
          {projects.length > (featured ? 1 : 0) && (
            <section className="shell pb-32 md:pb-48" aria-label="All projects">
              <WorkGrid projects={projects} featuredSlug={featured?.slug} />
            </section>
          )}
        </>
      )}

      {/* What we offer + how it works */}
      <section aria-labelledby="offer-title" className="gl-clear border-t border-line bg-coal">
        <div className="shell py-28 md:py-40">
          <div className="grid gap-12 md:grid-cols-12 md:gap-x-8">
            <div className="md:col-span-5">
              <Reveal>
                <SectionMarker>What we can do for you</SectionMarker>
              </Reveal>
              <h2 id="offer-title" className="type-headline mt-6 text-cream">
                <Reveal as="span" variant="mask" className="block">
                  One studio, every piece of the campaign
                </Reveal>
              </h2>
              <Reveal as="p" delay={100} className="mt-8 max-w-[42ch] text-mute">
                The ads, the design, the photos, the website and the video are all made in-house, so they look like one
                brand and we can change any of them quickly when the numbers say so.
              </Reveal>
              <Reveal delay={160} className="mt-10">
                <ButtonLink href="/services" variant="outline">
                  See all services
                </ButtonLink>
              </Reveal>
            </div>
            <ul className="divide-y divide-line border-y border-line md:col-span-6 md:col-start-7">
              {services.map((s) => (
                <li key={s.id}>
                  <Link href={`/services#${s.id}`} className="group flex items-start gap-5 py-6">
                    <span className="type-label pt-1 text-gold">{s.index}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-display text-2xl text-cream transition-colors group-hover:text-gold">
                        {s.name}
                      </span>
                      <span className="mt-2 block text-mute">{s.summary}</span>
                    </span>
                    <ArrowUpRight
                      aria-hidden
                      strokeWidth={1}
                      className="mt-1 size-6 shrink-0 text-mute transition-all duration-500 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-gold"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <h3 className="type-label mt-24 text-mute md:mt-32">How it works</h3>
          <ol className="mt-8 grid gap-px bg-line sm:grid-cols-2 lg:grid-cols-4">
            {process.map((p, i) => (
              <Reveal as="li" key={p.name} delay={i * 80} className="bg-coal pt-8 pr-6 pb-10 lg:pl-6 lg:first:pl-0">
                <span className="type-label text-gold">{String(i + 1).padStart(2, "0")}</span>
                <p className="mt-6 font-display text-3xl text-cream">{p.name}</p>
                <p className="mt-4 max-w-[30ch] text-mute">{p.body}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      <CtaSection />
    </>
  );
}
