import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo";
import { isProductionDeployment } from "@/lib/content/preview";

/** Preview and development deployments are never crawled. */
export default function robots(): MetadataRoute.Robots {
  if (!isProductionDeployment()) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/api/"] },
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
