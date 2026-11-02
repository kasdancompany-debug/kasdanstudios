import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { formatDate, getPostBySlug, getRelatedPosts, getVisiblePosts, renderMarkdown } from "@/lib/content/journal";
import { journalLabels } from "@/lib/content/schemas";
import { CtaSection } from "@/components/sections/CtaSection";
import { Label } from "@/components/ui/Label";
import { JsonLd } from "@/components/seo/JsonLd";
import { absoluteUrl, organizationId, pageMetadata } from "@/lib/seo";
import { site } from "@content/site";

export const dynamicParams = false;

export function generateStaticParams() {
  return getVisiblePosts().map((p) => ({ slug: p.slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};
  return pageMetadata({
    title: post.title,
    description: post.description,
    path: `/journal/${post.slug}`,
    type: "article",
    publishedTime: post.publishedAt,
    modifiedTime: post.updatedAt ?? post.publishedAt,
    image: post.cover
      ? { url: post.cover.src, width: post.cover.width, height: post.cover.height, alt: post.cover.alt }
      : undefined,
    noindex: post.status !== "published",
  });
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const related = getRelatedPosts(post);
  const isDraft = post.status !== "published";
  const html = renderMarkdown(post.body);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    url: absoluteUrl(`/journal/${post.slug}`),
    mainEntityOfPage: absoluteUrl(`/journal/${post.slug}`),
    datePublished: post.publishedAt,
    dateModified: post.updatedAt ?? post.publishedAt,
    author: { "@type": post.author === site.name ? "Organization" : "Person", name: post.author },
    publisher: { "@id": organizationId },
    articleSection: journalLabels[post.category],
    keywords: post.tags.join(", "),
    ...(post.cover ? { image: absoluteUrl(post.cover.src) } : {}),
  };

  return (
    <>
      {isDraft && (
        <div className="fixed inset-x-0 bottom-0 z-[70] bg-gold px-4 py-2 text-center text-ink">
          <p className="type-label">Draft preview — not published and not indexed</p>
        </div>
      )}
      <article>
        <header className="shell pt-36 md:pt-52">
          <Link href="/journal" className="type-label link-line pb-1 text-mute hover:text-cream">
            ← Journal
          </Link>
          <div className="mt-10 grid gap-10 md:grid-cols-12 md:gap-x-8">
            <div className="md:col-span-3">
              <Label tone="gold">{journalLabels[post.category]}</Label>
              <p className="type-label mt-3 text-mute">
                {post.publishedAt ? (
                  <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
                ) : (
                  "Unpublished draft"
                )}
              </p>
              <p className="type-label mt-1 text-mute">{post.readingMinutes} min read</p>
              <p className="type-label mt-1 text-mute">By {post.author}</p>
            </div>
            <h1 className="type-headline text-cream md:col-span-8 md:col-start-5">{post.title}</h1>
          </div>
        </header>

        {post.cover && (
          <div className="shell mt-16 md:mt-24">
            <Image
              src={post.cover.src}
              alt={post.cover.alt}
              width={post.cover.width}
              height={post.cover.height}
              priority
              sizes="100vw"
              className="h-auto w-full"
            />
          </div>
        )}

        <div className="shell mt-16 grid pb-24 md:mt-24 md:grid-cols-12 md:gap-x-8 md:pb-36">
          <div className="prose-editorial md:col-span-7 md:col-start-5" dangerouslySetInnerHTML={{ __html: html }} />
          {post.tags.length > 0 && (
            <ul className="mt-16 flex flex-wrap gap-2 md:col-span-7 md:col-start-5" aria-label="Tags">
              {post.tags.map((t) => (
                <li key={t} className="type-label border border-line px-3 py-2 text-mute">
                  {t}
                </li>
              ))}
            </ul>
          )}
        </div>
      </article>

      {related.length > 0 && (
        <aside aria-labelledby="related-title" className="border-t border-line">
          <div className="shell py-20 md:py-28">
            <h2 id="related-title" className="type-label text-mute">
              Related
            </h2>
            <ul className="mt-10 grid gap-10 md:grid-cols-2 md:gap-x-8">
              {related.map((r) => (
                <li key={r.slug}>
                  <Link href={`/journal/${r.slug}`} className="group block border-t border-line pt-6">
                    <p className="type-label text-gold">{journalLabels[r.category]}</p>
                    <p className="type-title mt-4 text-cream">
                      <span className="link-line pb-1">{r.title}</span>
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      )}

      <CtaSection />
      {!isDraft && <JsonLd data={jsonLd} />}
    </>
  );
}
