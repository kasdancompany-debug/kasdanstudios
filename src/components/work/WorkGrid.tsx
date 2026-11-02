"use client";

import { useMemo, useState } from "react";
import { categoryLabels, projectCategories, type Project, type ProjectCategory } from "@/lib/content/schemas";
import { ProjectCard } from "./ProjectCard";
import { cn } from "@/lib/cn";

type Filter = "all" | ProjectCategory;

// Alternating editorial rhythm: wide frame, offset narrow frame, repeat.
const layout = [
  "md:col-span-7",
  "md:col-span-4 md:col-start-9 md:mt-40",
  "md:col-span-5 md:col-start-2",
  "md:col-span-6 md:col-start-7 md:mt-24",
];

/**
 * `featuredSlug` is shown above the grid on the page, so it is left out of
 * "All" but still appears when a category filter matches it.
 */
export function WorkGrid({ projects, featuredSlug }: { projects: Project[]; featuredSlug?: string }) {
  const [filter, setFilter] = useState<Filter>("all");

  const counts = useMemo(() => {
    const c = Object.fromEntries([
      ["all", projects.filter((p) => p.slug !== featuredSlug).length],
      ...projectCategories.map((k) => [k, 0]),
    ]) as Record<Filter, number>;
    projects.forEach((p) => p.categories.forEach((cat) => c[cat]++));
    return c;
  }, [projects, featuredSlug]);

  const visible =
    filter === "all"
      ? projects.filter((p) => p.slug !== featuredSlug)
      : projects.filter((p) => p.categories.includes(filter));
  const filters: Filter[] = ["all", ...projectCategories];
  const label = (f: Filter) => (f === "all" ? "All" : categoryLabels[f]);

  return (
    <div>
      <div
        role="group"
        aria-label="Filter projects by category"
        className="flex flex-wrap gap-x-7 gap-y-3 border-b border-line pb-6"
      >
        {filters.map((f) => (
          <button
            key={f}
            type="button"
            aria-pressed={filter === f}
            onClick={() => setFilter(f)}
            className={cn(
              "type-nav group inline-flex items-baseline gap-2 py-2 transition-colors",
              filter === f ? "text-cream" : "text-mute hover:text-cream",
            )}
          >
            <span className={cn("pb-1", filter === f ? "border-b border-gold" : "link-line")}>{label(f)}</span>
            <span className="type-label text-dim" aria-hidden>
              {String(counts[f]).padStart(2, "0")}
            </span>
            <span className="sr-only">({counts[f]} projects)</span>
          </button>
        ))}
      </div>

      <p className="sr-only" aria-live="polite">
        Showing {visible.length} {visible.length === 1 ? "project" : "projects"}
        {filter === "all" ? "" : ` in ${label(filter)}`}.
      </p>

      {visible.length > 0 ? (
        <ul className="mt-14 grid gap-20 md:mt-20 md:grid-cols-12 md:gap-x-8 md:gap-y-28">
          {visible.map((p, i) => (
            <li key={p.slug} className={layout[i % layout.length]}>
              <ProjectCard project={p} index={i + 1} size={i % 2 === 0 ? "large" : "medium"} headingLevel="h2" />
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-14 border border-line px-6 py-16 text-center md:py-24">
          <p className="font-display text-2xl text-cream">Nothing in {label(filter)} yet.</p>
          <button
            type="button"
            onClick={() => setFilter("all")}
            className="type-nav link-line mt-6 pb-1 text-mute hover:text-cream"
          >
            Show all work
          </button>
        </div>
      )}
    </div>
  );
}
