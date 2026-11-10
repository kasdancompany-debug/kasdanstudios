import { getVisibleProjects } from "@/lib/content/projects";
import { founderAwards } from "@content/recognition";
import { PageHero } from "@/components/sections/PageHero";
import { CtaSection } from "@/components/sections/CtaSection";
import { WorkGrid } from "@/components/work/WorkGrid";
import { ProjectCard } from "@/components/work/ProjectCard";
import { ButtonLink } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { Label } from "@/components/ui/Label";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Work",
  path: "/work",
  description:
    "Campaigns, design, social content and film from Kasdan Studios, an independent creative and marketing studio in Sault Ste. Marie, Ontario.",
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
            The work, <span className="italic text-bone">frame by frame.</span>
          </>
        }
        lede="Campaigns, design, social content and film. Each case study covers the brief, the idea and how it was made."
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

      <CtaSection />
    </>
  );
}
