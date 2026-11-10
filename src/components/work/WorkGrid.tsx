"use client";

import { useMemo, useState } from "react";
import { categoryLabels, projectCategories, type Project, type ProjectCategory } from "@/lib/content/schemas";
import { ProjectCard } from "./ProjectCard";
import { WorkWall } from "./WorkWall";
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
  const [view, setView] = useState<"wall" | "list">("wall");

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
  // The wall is an index of everything, featured project included.
  const wallProjects = filter === "all" ? projects : visible;
  // Only offer filters that have work behind them.
  const filters: Filter[] = ["all", ...projectCategories.filter((k) => counts[k] > 0)];
  const label = (f: Filter) => (f === "all" ? "All" : categoryLabels[f]);

  return (
    <div>
      <div className="flex flex-col gap-6 border-b border-line pb-6 lg:flex-row lg:items-baseline lg:justify-between">
        <div role="group" aria-label="Filter projects by category" className="flex flex-wrap gap-x-7 gap-y-3">
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
              <span className="sr-only">({counts[f]} projects)</span>
            </button>
          ))}
        </div>
        <div role="group" aria-label="Layout" className="flex shrink-0 gap-6">
          {(["wall", "list"] as const).map((v) => (
            <button
              key={v}
              type="button"
              aria-pressed={view === v}
              onClick={() => setView(v)}
              className={cn(
                "type-label py-2 transition-colors",
                view === v ? "text-gold" : "text-dim hover:text-cream",
              )}
            >
              {v === "wall" ? "Wall" : "List"}
            </button>
          ))}
        </div>
      </div>

      <p className="sr-only" aria-live="polite">
        Showing {visible.length} {visible.length === 1 ? "project" : "projects"}
        {filter === "all" ? "" : ` in ${label(filter)}`}.
      </p>

      {view === "wall" && wallProjects.length > 0 ? (
        <div className="mt-14 md:mt-20">
          <WorkWall projects={wallProjects} />
        </div>
      ) : visible.length > 0 ? (
        <ul className="mt-14 grid gap-20 md:mt-20 md:grid-cols-12 md:gap-x-8 md:gap-y-28">
          {visible.map((p, i) => (
            <li key={p.slug} className={layout[i % layout.length]}>
              <ProjectCard project={p} size={i % 2 === 0 ? "large" : "medium"} headingLevel="h2" />
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
