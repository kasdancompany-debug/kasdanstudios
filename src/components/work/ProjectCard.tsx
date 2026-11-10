import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { categoryLabels, type Project } from "@/lib/content/schemas";
import { AssetPlaceholder } from "@/components/ui/AssetPlaceholder";
import { cn } from "@/lib/cn";
import { brandCase } from "@/lib/brand";

type Size = "feature" | "large" | "medium";

const ratio: Record<Size, string> = {
  feature: "aspect-[4/5] sm:aspect-[16/9] lg:aspect-[21/9]",
  large: "aspect-[4/5] md:aspect-[3/2]",
  medium: "aspect-[4/5]",
};

const sizes: Record<Size, string> = {
  feature: "100vw",
  large: "(min-width: 768px) 60vw, 100vw",
  medium: "(min-width: 768px) 40vw, 100vw",
};

/**
 * A project as a film frame: image first, credits underneath.
 * `index` is shown as a reel number to give the grid an editorial rhythm.
 */
export function ProjectCard({
  project,
  size = "large",
  index,
  priority = false,
  headingLevel = "h3",
}: {
  project: Project;
  size?: Size;
  index?: number;
  priority?: boolean;
  headingLevel?: "h2" | "h3";
}) {
  const Heading = headingLevel;
  const cats = project.categories.map((c) => categoryLabels[c]).join(" / ");
  const isDraft = project.status !== "published";

  return (
    <article className="group relative">
      <Link href={`/work/${project.slug}`} className="block" data-cursor="view">
        <div className={cn("letterbox media-zoom relative overflow-hidden bg-coal", ratio[size])}>
          {project.cover ? (
            <Image
              src={project.cover.src}
              alt={project.cover.alt}
              fill
              sizes={sizes[size]}
              priority={priority}
              className={project.coverFit === "contain" ? "object-contain" : "object-cover"}
            />
          ) : (
            <AssetPlaceholder fill label={`${project.title} — cover still`} hint="2400 × 1350 JPG" />
          )}
          {isDraft && (
            <span className="type-label absolute top-4 right-4 z-10 bg-gold px-2 py-1 text-ink">Draft preview</span>
          )}
        </div>

        <div className="mt-5 grid grid-cols-12 gap-x-4 md:mt-6">
          <div className="col-span-12 flex items-baseline gap-4 md:col-span-3">
            {index !== undefined && <span className="type-label text-gold">{String(index).padStart(2, "0")}</span>}
            <span className="type-label text-mute">
              {cats}
              {project.year ? ` — ${project.year}` : ""}
            </span>
          </div>
          <div className="col-span-12 mt-3 md:col-span-9 md:mt-0">
            <Heading
              className={cn(
                "flex items-start justify-between gap-6 font-display leading-[1.02] tracking-[-0.02em] text-cream",
                size === "feature" ? "text-[clamp(2rem,4.2vw,4rem)]" : "text-[clamp(1.6rem,2.6vw,2.5rem)]",
              )}
            >
              <span className="link-line pb-1">{brandCase(project.title)}</span>
              <ArrowUpRight
                aria-hidden
                strokeWidth={1}
                className="mt-1 size-6 shrink-0 text-mute transition-all duration-500 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-gold md:size-8"
              />
            </Heading>
            <p className="mt-3 max-w-[52ch] text-mute">{project.summary}</p>
          </div>
        </div>
      </Link>
    </article>
  );
}

/**
 * A labelled, non-linking slot used on the homepage until real case studies
 * are published. It never exposes draft content.
 */
export function ProjectSlot({ size = "large", index, label }: { size?: Size; index: number; label: string }) {
  return (
    <div className="relative">
      <div className={cn("relative overflow-hidden", ratio[size])}>
        <AssetPlaceholder fill tone="deep" label={label} hint="Case study in preparation" />
      </div>
      <div className="mt-5 flex items-baseline gap-4 md:mt-6">
        <span className="type-label text-gold">{String(index).padStart(2, "0")}</span>
        <span className="type-label text-mute">Unpublished — coming soon</span>
      </div>
    </div>
  );
}
