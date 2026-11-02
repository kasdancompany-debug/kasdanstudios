import "server-only";
import fs from "node:fs";
import path from "node:path";
import { cache } from "react";
import matter from "gray-matter";
import { marked } from "marked";
import { z } from "zod";
import { postFrontmatterSchema, type PostFrontmatter } from "./schemas";
import { isPreviewEnabled } from "./preview";

const JOURNAL_DIR = path.join(process.cwd(), "content", "journal");
const WORDS_PER_MINUTE = 230;

export type Post = PostFrontmatter & {
  slug: string;
  body: string;
  readingMinutes: number;
};

const loadAll = cache((): Post[] => {
  if (!fs.existsSync(JOURNAL_DIR)) return [];
  const files = fs.readdirSync(JOURNAL_DIR).filter((f) => f.endsWith(".md") && !f.startsWith("_"));

  const posts = files.map((file) => {
    const source = fs.readFileSync(path.join(JOURNAL_DIR, file), "utf8");
    const { data, content } = matter(source);
    const parsed = postFrontmatterSchema.safeParse(data);
    if (!parsed.success) {
      throw new Error(`Invalid frontmatter in content/journal/${file}:\n${z.prettifyError(parsed.error)}`);
    }
    const words = content.trim().split(/\s+/).filter(Boolean).length;
    return {
      ...parsed.data,
      slug: file.replace(/\.md$/, ""),
      body: content,
      readingMinutes: Math.max(1, Math.round(words / WORDS_PER_MINUTE)),
    };
  });

  return posts.sort((a, b) => (b.publishedAt ?? "").localeCompare(a.publishedAt ?? ""));
});

export function getVisiblePosts(): Post[] {
  const all = loadAll();
  return isPreviewEnabled() ? all : all.filter((p) => p.status === "published");
}

export function getPublishedPosts(): Post[] {
  return loadAll().filter((p) => p.status === "published");
}

export function getPostBySlug(slug: string): Post | undefined {
  return getVisiblePosts().find((p) => p.slug === slug);
}

export function getRelatedPosts(post: Post, limit = 2): Post[] {
  return getVisiblePosts()
    .filter((p) => p.slug !== post.slug)
    .map((p) => ({
      p,
      score: (p.category === post.category ? 2 : 0) + p.tags.filter((t) => post.tags.includes(t)).length,
    }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.p);
}

/**
 * Markdown is authored by the studio and committed to the repo, so it is
 * trusted input. Raw HTML in markdown is still stripped as a precaution.
 */
export function renderMarkdown(md: string): string {
  return marked.parse(md.replace(/<[^>]+>/g, ""), { async: false, gfm: true });
}

export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${iso}T00:00:00Z`));
}
