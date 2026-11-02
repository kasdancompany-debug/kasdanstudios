import "server-only";
import fs from "node:fs";
import path from "node:path";
import { cache } from "react";
import { z } from "zod";
import { projectSchema, type Project } from "./schemas";
import { isPreviewEnabled } from "./preview";

const PROJECTS_DIR = path.join(process.cwd(), "content", "projects");

/**
 * Reads every JSON file in /content/projects, validates it and returns the
 * full list (drafts included). Files starting with "_" are ignored, so
 * `_template.json` can live alongside real entries.
 *
 * Invalid files fail the build with a readable message rather than silently
 * rendering broken pages.
 */
const loadAll = cache((): Project[] => {
  if (!fs.existsSync(PROJECTS_DIR)) return [];
  const files = fs.readdirSync(PROJECTS_DIR).filter((f) => f.endsWith(".json") && !f.startsWith("_"));

  const projects = files.map((file) => {
    const raw = JSON.parse(fs.readFileSync(path.join(PROJECTS_DIR, file), "utf8"));
    const parsed = projectSchema.safeParse(raw);
    if (!parsed.success) {
      throw new Error(`Invalid project file content/projects/${file}:\n${z.prettifyError(parsed.error)}`);
    }
    if (`${parsed.data.slug}.json` !== file) {
      throw new Error(`content/projects/${file}: slug "${parsed.data.slug}" must match the file name`);
    }
    return parsed.data;
  });

  return projects.sort((a, b) => a.order - b.order || (b.year ?? 0) - (a.year ?? 0));
});

/** Projects visible on the site: published only, unless draft preview is on. */
export function getVisibleProjects(): Project[] {
  const all = loadAll();
  return isPreviewEnabled() ? all : all.filter((p) => p.status === "published");
}

export function getPublishedProjects(): Project[] {
  return loadAll().filter((p) => p.status === "published");
}

export function getProjectBySlug(slug: string): Project | undefined {
  return getVisibleProjects().find((p) => p.slug === slug);
}

/** Every project including drafts — used only for labelled "in preparation" slots. */
export function getAllProjectsIncludingDrafts(): Project[] {
  return loadAll();
}

export function getAdjacentProject(slug: string): Project | undefined {
  const list = getVisibleProjects();
  if (list.length < 2) return undefined;
  const i = list.findIndex((p) => p.slug === slug);
  return list[(i + 1) % list.length];
}
