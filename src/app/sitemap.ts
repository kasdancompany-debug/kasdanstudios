import type { MetadataRoute } from "next";
import { getPublishedProjects } from "@/lib/content/projects";
import { getPublishedPosts } from "@/lib/content/journal";
import { absoluteUrl } from "@/lib/seo";

/** Published content only — drafts are never listed, even in preview. */
export default function sitemap(): MetadataRoute.Sitemap {
  const projects = getPublishedProjects();
  const posts = getPublishedPosts();

  const pages: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), changeFrequency: "monthly", priority: 1 },
    { url: absoluteUrl("/work"), changeFrequency: "monthly", priority: 0.9 },
    { url: absoluteUrl("/services"), changeFrequency: "yearly", priority: 0.8 },
    { url: absoluteUrl("/about"), changeFrequency: "yearly", priority: 0.7 },
    { url: absoluteUrl("/contact"), changeFrequency: "yearly", priority: 0.7 },
    { url: absoluteUrl("/privacy"), changeFrequency: "yearly", priority: 0.2 },
  ];

  if (posts.length > 0) pages.push({ url: absoluteUrl("/journal"), changeFrequency: "weekly", priority: 0.6 });

  return [
    ...pages,
    ...projects.map((p) => ({
      url: absoluteUrl(`/work/${p.slug}`),
      changeFrequency: "yearly" as const,
      priority: 0.8,
    })),
    ...posts.map((p) => ({
      url: absoluteUrl(`/journal/${p.slug}`),
      lastModified: p.updatedAt ?? p.publishedAt,
      changeFrequency: "yearly" as const,
      priority: 0.5,
    })),
  ];
}
