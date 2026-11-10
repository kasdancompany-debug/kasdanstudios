import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getAdjacentProject, getProjectBySlug, getVisibleProjects } from "@/lib/content/projects";
import { categoryLabels } from "@/lib/content/schemas";
import { AmbientVideo } from "@/components/media/AmbientVideo";
import { MediaBlock } from "@/components/media/MediaBlock";
import { AssetPlaceholder } from "@/components/ui/AssetPlaceholder";
import { CtaSection } from "@/components/sections/CtaSection";
import { Reveal } from "@/components/ui/Reveal";
import { Label } from "@/components/ui/Label";
import { JsonLd } from "@/components/seo/JsonLd";
import { absoluteUrl, organizationId, pageMetadata } from "@/lib/seo";
import { site } from "@content/site";
import { brandCase } from "@/lib/brand";

export const dynamicParams = false;

export function generateStaticParams() {
  return getVisibleProjects().map((p) => ({ slug: p.slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) return {};
  return pageMetadata({
    title: project.seo.title ?? project.title,
    description: project.seo.description ?? project.summary,
    path: `/work/${project.slug}`,
    image: project.cover
      ? { url: project.cover.src, width: project.cover.width, height: project.cover.height, alt: project.cover.alt }
      : undefined,
    noindex: project.status !== "published",
  });
}

function Narrative({ index, heading, body }: { index: string; heading: string; body: string[] }) {
  return (
    <section className="grid gap-8 border-t border-line pt-10 md:grid-cols-12 md:gap-x-8 md:pt-14">
      <div className="md:col-span-4">
        <Reveal className="flex items-baseline gap-4">
          <span className="type-label text-gold">{index}</span>
          <h2 className="type-label text-mute">{heading}</h2>
        </Reveal>
      </div>
      <div className="space-y-6 md:col-span-7 md:col-start-6">
        {body.map((p, i) => (
          <Reveal as="p" key={i} delay={i * 80} className={i === 0 ? "type-lede text-cream" : "text-bone"}>
            {p}
          </Reveal>
        ))}
      </div>
    </section>
  );
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) notFound();

  const next = getAdjacentProject(project.slug);
  const isDraft = project.status !== "published";
  const cats = project.categories.map((c) => categoryLabels[c]).join(" / ");

  const meta: { label: string; value: string }[] = [
    ...(project.client ? [{ label: "Client", value: project.client }] : []),
    ...(project.year ? [{ label: "Year", value: String(project.year) }] : []),
    { label: "Category", value: cats },
    { label: "Disciplines", value: project.disciplines.join(", ") },
  ];

  const chapters = [
    project.challenge && { heading: project.challenge.heading ?? "The challenge", body: project.challenge.body },
    project.idea && { heading: project.idea.heading ?? "The idea", body: project.idea.body },
    project.execution && { heading: project.execution.heading ?? "The execution", body: project.execution.body },
  ].filter(Boolean) as { heading: string; body: string[] }[];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: project.title,
    description: project.summary,
    url: absoluteUrl(`/work/${project.slug}`),
    ...(project.year ? { dateCreated: String(project.year) } : {}),
    ...(project.cover ? { image: absoluteUrl(project.cover.src) } : {}),
    creator: { "@id": organizationId },
    producer: { "@type": "Organization", name: site.name },
    genre: cats,
    ...(project.client ? { sponsor: { "@type": "Organization", name: project.client } } : {}),
    ...(project.awards.length ? { award: project.awards.map((a) => `${a.year} ${a.name} — ${a.organization}`) } : {}),
  };

  return (
    <article>
      {isDraft && (
        <div className="fixed inset-x-0 bottom-0 z-[70] bg-gold px-4 py-2 text-center text-ink">
          <p className="type-label">Draft preview — not published and not indexed</p>
        </div>
      )}

      {/* 1. Hero */}
      <header className="relative isolate flex min-h-[88svh] flex-col justify-end overflow-hidden md:min-h-[100svh]">
        <div aria-hidden={!project.cover} className="absolute inset-0 -z-10">
          {project.heroVideo ? (
            <AmbientVideo
              src={project.heroVideo.src}
              poster={project.heroVideo.poster}
              label={project.heroVideo.title}
            />
          ) : project.cover ? (
            <Image
              src={project.cover.src}
              alt={project.cover.alt}
              fill
              priority
              sizes="100vw"
              className={
                project.coverFit === "contain"
                  ? "object-contain object-top pt-20 md:object-right md:py-24 md:pr-[4vw]"
                  : "object-cover"
              }
            />
          ) : (
            <AssetPlaceholder
              fill
              tone="deep"
              label={`${project.title} — hero still or loop`}
              hint="2400 × 1350 JPG or silent MP4 loop"
            />
          )}
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(12,11,9,0.5)_0%,transparent_30%,rgba(12,11,9,0.6)_70%,rgba(12,11,9,0.97)_100%)]" />
        </div>

        <div className="shell pt-40 pb-12 md:pb-16">
          <Reveal>
            <Link href="/work" className="type-label link-line pb-1 text-mute hover:text-cream">
              ← All work
            </Link>
          </Reveal>
          <h1 className="type-display mt-8 max-w-[16ch] text-cream">
            <Reveal as="span" variant="mask" className="block">
              {brandCase(project.title)}
            </Reveal>
          </h1>
          <Reveal delay={120}>
            <p className="type-label mt-6 text-gold">{cats}</p>
          </Reveal>
        </div>
      </header>

      {/* 2–3. Overview + facts */}
      <section className="shell grid gap-14 py-20 md:grid-cols-12 md:gap-x-8 md:py-32">
        <Reveal as="p" className="type-title text-cream md:col-span-7">
          {project.overview}
        </Reveal>
        <dl className="grid grid-cols-2 gap-x-6 gap-y-8 self-start md:col-span-4 md:col-start-9 md:grid-cols-1">
          {meta.map((m) => (
            <Reveal key={m.label}>
              <Label as="dt">{m.label}</Label>
              <dd className="mt-2 text-bone">{m.value}</dd>
            </Reveal>
          ))}
          {project.link && (
            <Reveal>
              <Label as="dt">See more</Label>
              <dd className="mt-2">
                <a
                  href={project.link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cream underline decoration-gold-soft underline-offset-4 hover:decoration-gold"
                >
                  {project.link.label}
                </a>
              </dd>
            </Reveal>
          )}
        </dl>
      </section>

      {/* 4–6. Challenge, idea, execution */}
      {chapters.length > 0 && (
        <div className="shell space-y-20 pb-24 md:space-y-28 md:pb-36">
          {chapters.map((c, i) => (
            <Narrative key={c.heading} index={String(i + 1).padStart(2, "0")} heading={c.heading} body={c.body} />
          ))}
        </div>
      )}

      {/* 7. Film + gallery */}
      {(project.film || project.gallery.length > 0) && (
        <section aria-label="Film and gallery" className="gl-clear bg-coal py-20 md:py-32">
          <div className="shell space-y-14 md:space-y-24">
            {project.film && (
              <Reveal
                variant="frame"
                className={
                  project.film.type !== "video" && project.film.aspect === "9:16" ? "mx-auto max-w-sm" : undefined
                }
              >
                <MediaBlock media={project.film} sizes="100vw" />
              </Reveal>
            )}
            {project.gallery.length > 0 && project.galleryLayout === "grid" && (
              <div className="grid gap-10 sm:grid-cols-2 md:gap-8 lg:grid-cols-3">
                {project.gallery.map((m, i) => (
                  <Reveal key={i} variant="frame" delay={(i % 3) * 80}>
                    <MediaBlock media={m} sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" />
                  </Reveal>
                ))}
              </div>
            )}
            {project.gallery.length > 0 && project.galleryLayout === "editorial" && (
              <div className="grid gap-10 md:grid-cols-12 md:gap-8">
                {project.gallery.map((m, i) => (
                  <Reveal
                    key={i}
                    variant="frame"
                    className={
                      i % 3 === 0 ? "md:col-span-12" : i % 3 === 1 ? "md:col-span-7" : "md:col-span-5 md:mt-24"
                    }
                  >
                    <MediaBlock media={m} sizes={i % 3 === 0 ? "100vw" : "(min-width: 768px) 60vw, 100vw"} />
                  </Reveal>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* 8. Results — verified only */}
      {(project.results.length > 0 || project.awards.length > 0) && (
        <section className="shell py-24 md:py-36" aria-labelledby="results-title">
          <Label as="h2" tone="gold">
            <span id="results-title">Outcomes</span>
          </Label>
          {project.results.length > 0 && (
            <ul className="mt-10 grid gap-12 border-t border-line pt-10 sm:grid-cols-2 lg:grid-cols-3">
              {project.results.map((r) => (
                <Reveal as="li" key={r.label}>
                  <p className="font-display text-[clamp(3rem,6vw,5rem)] leading-none text-cream">{r.value}</p>
                  <p className="mt-3 text-bone">{r.label}</p>
                  <p className="type-label mt-2 text-dim">Source: {r.source}</p>
                </Reveal>
              ))}
            </ul>
          )}
          {project.awards.length > 0 && (
            <ul className="mt-14 divide-y divide-line border-y border-line">
              {project.awards.map((a) => (
                <li key={a.name} className="grid gap-2 py-5 md:grid-cols-12 md:items-baseline">
                  <span className="type-label text-gold md:col-span-2">{a.year}</span>
                  <span className="font-display text-xl text-cream md:col-span-5">{a.name}</span>
                  <span className="text-mute md:col-span-3">{a.organization}</span>
                  <span className="text-dim md:col-span-2">{a.recipient}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {/* 9. Credits */}
      {project.credits.length > 0 && (
        <section className="shell pb-24 md:pb-36" aria-labelledby="credits-title">
          <div className="grid gap-10 border-t border-line pt-10 md:grid-cols-12 md:gap-x-8">
            <h2 id="credits-title" className="type-label text-mute md:col-span-4">
              Credits
            </h2>
            <dl className="grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2 md:col-span-8">
              {project.credits.map((c) => (
                <div key={`${c.role}-${c.name}`} className="flex flex-col">
                  <dt className="type-label text-dim">{c.role}</dt>
                  <dd className="mt-1 text-cream">{c.name}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>
      )}

      {/* 10. Next project */}
      {next && (
        <nav aria-label="Next project" className="border-t border-line">
          <Link href={`/work/${next.slug}`} className="group shell block py-20 md:py-32" data-cursor="view">
            <Label>Next project</Label>
            <p className="type-display mt-6 text-cream transition-colors duration-500 group-hover:text-gold">
              {brandCase(next.title)}
            </p>
            <p className="type-label mt-6 text-mute">{next.categories.map((c) => categoryLabels[c]).join(" / ")}</p>
          </Link>
        </nav>
      )}

      {/* 11. Contact */}
      <CtaSection eyebrow="Like what you see?" />

      {!isDraft && <JsonLd data={jsonLd} />}
    </article>
  );
}
