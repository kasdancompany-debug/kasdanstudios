import Image from "next/image";
import { engagementModels, faqs, process, services } from "@content/services";
import { PageHero } from "@/components/sections/PageHero";
import { CtaSection } from "@/components/sections/CtaSection";
import { AssetPlaceholder } from "@/components/ui/AssetPlaceholder";
import { ButtonLink } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { Label, SectionMarker } from "@/components/ui/Label";
import { JsonLd } from "@/components/seo/JsonLd";
import { organizationId, pageMetadata } from "@/lib/seo";
import { cn } from "@/lib/cn";
import { GLMorph } from "@/components/gl/GLMorph";
import { MorphSync } from "@/components/gl/MorphSync";
import { Marquee } from "@/components/ui/Marquee";

export const metadata = pageMetadata({
  title: "Services",
  path: "/services",
  description:
    "Marketing strategy, Meta ads and lead generation, graphic design, social content, web design and film from Kasdan Studios in Sault Ste. Marie — by project or as an ongoing partner.",
});

export default function ServicesPage() {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };
  const servicesJsonLd = services.map((s) => ({
    "@context": "https://schema.org",
    "@type": "Service",
    name: s.name,
    description: s.summary,
    provider: { "@id": organizationId },
    areaServed: "Northern Ontario",
  }));

  return (
    <>
      <MorphSync />
      <div className="relative">
        <GLMorph className="absolute top-28 right-0 hidden aspect-square w-[42vw] max-w-[640px] lg:block xl:right-[4vw]" />
        <PageHero
          marker="Services"
          title={
            <>
              From the first idea <span className="italic text-bone">to the final frame.</span>
            </>
          }
          lede="Marketing, Meta ads and lead generation, branding and design, social, websites and film — on their own or joined up. Most projects start with a conversation about what the work needs to do, and we build the right plan from there."
        />
      </div>

      {/* Index of disciplines */}
      <nav aria-label="Services on this page" className="shell pb-10">
        <ul className="flex flex-wrap gap-x-8 gap-y-3 border-y border-line py-5">
          {services.map((s) => (
            <li key={s.id}>
              <a href={`#${s.id}`} className="type-nav group inline-flex gap-3 text-mute hover:text-cream">
                <span className="text-gold">{s.index}</span>
                <span className="link-line pb-1">{s.name}</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {/* Four editorial service sections */}
      <div className="shell space-y-32 py-20 md:space-y-48 md:py-32">
        {services.map((s, i) => {
          const flip = i % 2 === 1;
          return (
            <section key={s.id} id={s.id} data-morph={s.id} aria-labelledby={`${s.id}-title`} className="scroll-mt-28">
              <div className="grid gap-12 md:grid-cols-12 md:gap-x-8">
                <Reveal variant="frame" className={cn("md:col-span-6", flip && "md:order-2 md:col-start-7")}>
                  {s.image ? (
                    <Image
                      src={s.image.src}
                      alt={s.image.alt}
                      width={s.image.width}
                      height={s.image.height}
                      sizes="(min-width: 768px) 50vw, 100vw"
                      className="h-auto w-full"
                    />
                  ) : (
                    <AssetPlaceholder
                      ratio={i % 2 === 0 ? "4/5" : "4/5"}
                      label={`${s.name} — still`}
                      hint={s.imageHint}
                    />
                  )}
                </Reveal>

                <div className={cn("md:col-span-5 md:pt-10", flip ? "md:order-1 md:col-start-1" : "md:col-start-8")}>
                  <Reveal>
                    <span className="type-label text-gold">{s.index}</span>
                  </Reveal>
                  <h2 id={`${s.id}-title`} className="type-headline mt-6 text-cream">
                    <Reveal as="span" variant="mask" className="block">
                      {s.name}
                    </Reveal>
                  </h2>
                  <div className="mt-8 space-y-5 text-bone">
                    {s.description.map((p, j) => (
                      <Reveal as="p" key={j} delay={j * 80}>
                        {p}
                      </Reveal>
                    ))}
                  </div>

                  <div className="mt-12 grid grid-cols-1 gap-10 sm:grid-cols-2">
                    <Reveal>
                      <Label as="h3">What it covers</Label>
                      <ul className="mt-4 space-y-2 text-bone">
                        {s.offerings.map((o) => (
                          <li key={o}>{o}</li>
                        ))}
                      </ul>
                    </Reveal>
                    <Reveal delay={80}>
                      <Label as="h3">Typical deliverables</Label>
                      <ul className="mt-4 space-y-2 text-bone">
                        {s.deliverables.map((d) => (
                          <li key={d}>{d}</li>
                        ))}
                      </ul>
                    </Reveal>
                  </div>

                  <Reveal delay={120} className="mt-12">
                    <ButtonLink href={`/contact?type=${s.id}`} variant="outline">
                      {s.cta}
                    </ButtonLink>
                  </Reveal>
                </div>
              </div>
            </section>
          );
        })}
      </div>

      <Marquee items={["Discover", "Develop", "Produce", "Deliver"]} />

      {/* Engagement models */}
      <section aria-labelledby="engage-title" className="gl-clear border-t border-line bg-coal">
        <div className="shell py-28 md:py-40">
          <div className="grid gap-12 md:grid-cols-12 md:gap-x-8">
            <div className="md:col-span-5">
              <Reveal>
                <SectionMarker>Working together</SectionMarker>
              </Reveal>
              <h2 id="engage-title" className="type-headline mt-6 text-cream">
                <Reveal as="span" variant="mask" className="block">
                  Two ways to engage
                </Reveal>
              </h2>
              <Reveal as="p" delay={100} className="mt-8 max-w-[42ch] text-mute">
                We don&apos;t publish fixed packages. Every proposal is written for the scope, schedule and budget in
                front of us, so you only pay for what the work actually needs.
              </Reveal>
            </div>
            <div className="divide-y divide-line border-y border-line md:col-span-6 md:col-start-7">
              {engagementModels.map((m, i) => (
                <Reveal key={m.name} delay={i * 80} className="py-10">
                  <h3 className="type-title text-cream">{m.name}</h3>
                  <p className="mt-4 text-bone">{m.body}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Process */}
      <section aria-labelledby="process-title" className="shell py-28 md:py-40">
        <Reveal>
          <SectionMarker>Process</SectionMarker>
        </Reveal>
        <h2 id="process-title" className="type-headline mt-6 text-cream">
          <Reveal as="span" variant="mask" className="block">
            How a project moves
          </Reveal>
        </h2>
        <ol className="mt-16 grid gap-px bg-line sm:grid-cols-2 lg:grid-cols-4">
          {process.map((p, i) => (
            <Reveal
              as="li"
              key={p.name}
              delay={i * 80}
              className="bg-ink pt-8 pr-6 pb-12 sm:pl-0 lg:pl-6 lg:first:pl-0"
            >
              <span className="type-label text-gold">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="mt-6 font-display text-4xl text-cream">{p.name}</h3>
              <p className="mt-4 max-w-[30ch] text-mute">{p.body}</p>
            </Reveal>
          ))}
        </ol>
      </section>

      {/* FAQ */}
      <section aria-labelledby="faq-title" className="shell pb-28 md:pb-40">
        <div className="grid gap-12 border-t border-line pt-14 md:grid-cols-12 md:gap-x-8">
          <div className="md:col-span-4">
            <h2 id="faq-title" className="type-headline text-cream">
              Questions
            </h2>
          </div>
          <div className="md:col-span-7 md:col-start-6">
            {faqs.map((f) => (
              <details key={f.q} className="group border-b border-line first:border-t">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-6 text-lg text-cream marker:hidden [&::-webkit-details-marker]:hidden">
                  {f.q}
                  <span
                    aria-hidden
                    className="relative size-4 shrink-0 before:absolute before:top-1/2 before:left-0 before:h-px before:w-full before:bg-gold after:absolute after:top-0 after:left-1/2 after:h-full after:w-px after:bg-gold after:transition-transform after:duration-500 group-open:after:scale-y-0"
                  />
                </summary>
                <p className="max-w-[60ch] pb-8 text-bone">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <CtaSection />
      <JsonLd data={faqJsonLd} />
      <JsonLd data={servicesJsonLd} />
    </>
  );
}
