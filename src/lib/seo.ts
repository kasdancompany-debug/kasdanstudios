import type { Metadata } from "next";
import { site } from "@content/site";
import { founderAwards } from "@content/recognition";

export function absoluteUrl(path = "/"): string {
  return new URL(path, site.url).toString();
}

type PageMetaInput = {
  title?: string;
  description?: string;
  path: string;
  /** Absolute or root-relative image; falls back to the route's opengraph-image. */
  image?: { url: string; width?: number; height?: number; alt?: string };
  noindex?: boolean;
  type?: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
};

export function pageMetadata({
  title,
  description = site.description,
  path,
  image,
  noindex,
  type = "website",
  publishedTime,
  modifiedTime,
}: PageMetaInput): Metadata {
  return {
    // Omit the key entirely when unset, so the layout default title applies.
    ...(title ? { title } : {}),
    description,
    alternates: { canonical: path },
    openGraph: {
      type,
      url: path,
      siteName: site.name,
      locale: site.locale,
      title: title ?? `${site.name} — ${site.tagline}`,
      description,
      ...(image ? { images: [image] } : {}),
      ...(type === "article" ? { publishedTime, modifiedTime } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: title ?? `${site.name} — ${site.tagline}`,
      description,
      ...(image ? { images: [image.url] } : {}),
    },
    ...(noindex ? { robots: { index: false, follow: false } } : {}),
  };
}

/* ------------------------------------------------------------------ */
/* Structured data                                                     */
/* ------------------------------------------------------------------ */

export const organizationId = `${site.url}/#organization`;

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": organizationId,
    name: site.name,
    url: site.url,
    slogan: site.tagline,
    description: site.description,
    parentOrganization: { "@type": "Organization", name: site.parent },
    address: {
      "@type": "PostalAddress",
      addressLocality: site.location.city,
      addressRegion: site.location.regionCode,
      addressCountry: site.location.countryCode,
    },
    areaServed: [
      { "@type": "City", name: "Sault Ste. Marie" },
      { "@type": "AdministrativeArea", name: "Northern Ontario" },
    ],
    founder: { "@id": `${site.url}/about#founder` },
    ...(site.email ? { email: site.email } : {}),
    sameAs: site.socials.map((s) => s.href).filter(Boolean),
  };
}

export function founderJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `${site.url}/about#founder`,
    name: site.founder.name,
    worksFor: { "@id": organizationId },
    award: founderAwards.map((a) => `${a.year} ${a.name} — ${a.organization}`),
  };
}

/** Serialise JSON-LD safely for a <script> tag. */
export function jsonLdString(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
