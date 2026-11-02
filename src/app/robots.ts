import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo";
import { isIndexable } from "@/lib/content/preview";

/** Nothing is crawled until launch: production deploy + ALLOW_INDEXING=true. */
export default function robots(): MetadataRoute.Robots {
  if (!isIndexable()) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/api/"] },
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
