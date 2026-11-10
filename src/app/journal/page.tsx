import Image from "next/image";
import Link from "next/link";
import { formatDate, getVisiblePosts } from "@/lib/content/journal";
import { journalLabels } from "@/lib/content/schemas";
import { PageHero } from "@/components/sections/PageHero";
import { ButtonLink } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { pageMetadata } from "@/lib/seo";

export function generateMetadata() {
  const hasPosts = getVisiblePosts().length > 0;
  return pageMetadata({
    title: "Journal",
    path: "/journal",
    description:
      "Notes from kasdan studios on filmmaking, brand building and content for businesses in Sault Ste. Marie and Northern Ontario.",
    // An empty journal shouldn't be indexed as thin content.
    noindex: !hasPosts,
  });
}

export default function JournalPage() {
  const posts = getVisiblePosts();

  return (
    <>
      <PageHero
        marker="Journal"
        title={
          <>
            Notes from <span className="italic text-bone">the studio.</span>
          </>
        }
        lede="Thinking on film, brand and content — and what we've learned building a business of our own."
      />

      <section className="shell pb-32 md:pb-48">
        {posts.length === 0 ? (
          <div className="border-t border-line pt-14">
            <p className="type-title max-w-[28ch] text-cream">The first entries are being written.</p>
            <p className="mt-5 max-w-[48ch] text-mute">Check back soon, or start a conversation in the meantime.</p>
            <div className="mt-10">
              <ButtonLink href="/contact" variant="outline">
                Get in touch
              </ButtonLink>
            </div>
          </div>
        ) : (
          <ol className="border-t border-line">
            {posts.map((post, i) => (
              <Reveal as="li" key={post.slug} delay={i * 60} className="border-b border-line">
                <Link
                  href={`/journal/${post.slug}`}
                  className="group grid gap-6 py-10 md:grid-cols-12 md:gap-x-8 md:py-14"
                >
                  <div className="md:col-span-3">
                    <p className="type-label text-gold">{journalLabels[post.category]}</p>
                    <p className="type-label mt-2 text-mute">
                      {post.publishedAt ? formatDate(post.publishedAt) : "Draft"} · {post.readingMinutes} min read
                    </p>
                  </div>
                  <div className="md:col-span-6">
                    <h2 className="type-title text-cream">
                      <span className="link-line pb-1">{post.title}</span>
                    </h2>
                    <p className="mt-4 max-w-[56ch] text-mute">{post.description}</p>
                  </div>
                  {post.cover && (
                    <div className="media-zoom relative aspect-[3/2] overflow-hidden md:col-span-3">
                      <Image
                        src={post.cover.src}
                        alt={post.cover.alt}
                        fill
                        sizes="(min-width: 768px) 25vw, 100vw"
                        className="object-cover"
                      />
                    </div>
                  )}
                </Link>
              </Reveal>
            ))}
          </ol>
        )}
      </section>
    </>
  );
}
