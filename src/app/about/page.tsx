import {
  awardsRoll,
  businessRecognition,
  founderEducation,
  founderExperience,
  kasdanCoFacts,
} from "@content/recognition";
import { site } from "@content/site";
import { CtaSection } from "@/components/sections/CtaSection";
import { AwardsReel } from "@/components/awards/AwardsReel";
import { GLText } from "@/components/gl/GLText";
import { AssetPlaceholder } from "@/components/ui/AssetPlaceholder";
import { Reveal } from "@/components/ui/Reveal";
import { Label, SectionMarker } from "@/components/ui/Label";
import { JsonLd } from "@/components/seo/JsonLd";
import { founderJsonLd, pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "About",
  path: "/about",
  description:
    "Kasdan Studios is an independent creative production and marketing studio in Sault Ste. Marie, Ontario, founded by Dan O'Brien and grown out of Kasdan Co.",
});

const philosophy = [
  {
    title: "Story first",
    body: "Before cameras, before colour palettes, there's the question of what we're actually trying to say. Everything else follows from the answer.",
  },
  {
    title: "Craft matters",
    body: "Framing, pacing, sound, the last two frames of a cut. Audiences may not name these things, but they feel them.",
  },
  {
    title: "Work should serve a purpose",
    body: "Creative work for a business has a job to do. We like it beautiful, and we like it useful — ideally at the same time.",
  },
];

export default function AboutPage() {
  return (
    <>
      {/* 1. Hero */}
      <section className="shell pt-36 md:pt-52">
        <Reveal>
          <SectionMarker>About the studio</SectionMarker>
        </Reveal>
        <GLText as="h1" className="type-display mt-8 max-w-[15ch] text-cream md:mt-10">
          <Reveal as="span" variant="mask" className="block">
            Independent by design.
          </Reveal>
          <Reveal as="span" variant="mask" delay={140} className="block italic text-bone">
            Creative by nature.
          </Reveal>
        </GLText>
        <Reveal variant="frame" className="mt-16 md:mt-24">
          <AssetPlaceholder
            ratio="21/9"
            label="Behind-the-scenes or founder portrait"
            hint="Landscape 21:9, 3000 × 1286 — on set, natural light"
          />
        </Reveal>
      </section>

      {/* 2. Studio story */}
      <section aria-labelledby="story-title" className="shell py-28 md:py-44">
        <div className="grid gap-12 md:grid-cols-12 md:gap-x-8">
          <div className="md:col-span-4">
            <Reveal>
              <SectionMarker index="01">The story</SectionMarker>
            </Reveal>
          </div>
          <div className="md:col-span-7 md:col-start-6">
            <h2 id="story-title" className="type-title text-cream">
              <Reveal as="span" variant="mask" className="block">
                Strong ideas deserve exceptional execution. That belief is the whole reason the studio exists.
              </Reveal>
            </h2>
            <div className="mt-10 space-y-6 text-bone">
              <Reveal as="p">
                Kasdan Studios grew out of Kasdan Co., the café our founders run in {site.location.city}. Building that
                business meant doing our own marketing: shaping a brand, shooting content, figuring out what actually
                brings people through the door.
              </Reveal>
              <Reveal as="p" delay={80}>
                Alongside it ran a background in film and marketing — corporate films, wedding films, advertising,
                in-house marketing for an automotive dealership. Kasdan Studios brings those threads together: the
                storyteller&apos;s instinct and the owner&apos;s sense of what the work has to accomplish.
              </Reveal>
              <Reveal as="p" delay={140}>
                We&apos;re a young, independent studio, and we&apos;re building it carefully.
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Founder */}
      <section aria-labelledby="founder-title" className="border-t border-line">
        <div className="shell grid gap-14 py-28 md:grid-cols-12 md:gap-x-8 md:py-44">
          <Reveal variant="frame" className="md:col-span-5">
            <AssetPlaceholder ratio="4/5" label={`${site.founder.name} — portrait`} hint="Portrait 4:5, 1600 × 2000" />
          </Reveal>
          <div className="md:col-span-6 md:col-start-7">
            <Reveal>
              <SectionMarker index="02">Founder</SectionMarker>
            </Reveal>
            <h2 id="founder-title" className="type-headline mt-6 text-cream">
              <Reveal as="span" variant="mask" className="block">
                {site.founder.name}
              </Reveal>
            </h2>
            <div className="mt-8 space-y-5 text-bone">
              <Reveal as="p">
                Dan studied film at Sault College and Marketing Management and Project Management at Fanshawe College.
                His work has spanned corporate and wedding films, advertising and digital content, and marketing
                management at an automotive dealership — and today, the social content for Kasdan Co.
              </Reveal>
              <Reveal as="p" delay={80}>
                His work has been recognized with a Midsouth Emmy Award, a Gold Quill Award and a D&amp;AD New Blood
                Award.
              </Reveal>
            </div>

            <div className="mt-14 grid gap-10 sm:grid-cols-2">
              <Reveal>
                <Label as="h3">Education</Label>
                <ul className="mt-4 space-y-3">
                  {founderEducation.map((e) => (
                    <li key={e.label}>
                      <span className="block text-cream">{e.label}</span>
                      <span className="text-mute">{e.detail}</span>
                    </li>
                  ))}
                </ul>
              </Reveal>
              <Reveal delay={80}>
                <Label as="h3">Experience</Label>
                <ul className="mt-4 space-y-2 text-bone">
                  {founderExperience.map((x) => (
                    <li key={x}>{x}</li>
                  ))}
                </ul>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Building our own brand */}
      <section aria-labelledby="own-brand-title" className="bg-coal">
        <div className="shell grid gap-14 py-28 md:grid-cols-12 md:gap-x-8 md:py-44">
          <div className="md:col-span-6">
            <Reveal>
              <SectionMarker index="03">Building our own brand</SectionMarker>
            </Reveal>
            <h2 id="own-brand-title" className="type-headline mt-6 text-cream">
              <Reveal as="span" variant="mask" className="block">
                Kasdan Co.
              </Reveal>
            </h2>
            <div className="mt-8 space-y-5 text-bone">
              <Reveal as="p">
                Our café is where we test our own thinking. It&apos;s a real business with real customers, and we handle
                its brand, content and marketing ourselves — so the advice we give clients is advice we&apos;ve had to
                take.
              </Reveal>
              <Reveal as="p" delay={80}>
                The café&apos;s short-form content has passed one million cumulative views on TikTok, and the business
                was recognized in the 2025 Bridges to Better Business pitch competition.
              </Reveal>
            </div>
            <dl className="mt-14 grid grid-cols-1 gap-10 border-t border-line pt-10 sm:grid-cols-2">
              <Reveal>
                <dt className="sr-only">TikTok views</dt>
                <dd className="font-display text-[clamp(3.5rem,7vw,6rem)] leading-[0.85] text-cream">
                  {kasdanCoFacts.tiktokViews}
                </dd>
                <dd className="mt-3 text-mute">{kasdanCoFacts.tiktokViewsLabel}</dd>
              </Reveal>
              <Reveal delay={80}>
                <dt className="sr-only">Entrepreneurial recognition</dt>
                <dd className="font-display text-2xl leading-tight text-cream">{businessRecognition.label}</dd>
                <dd className="mt-3 text-mute">
                  {businessRecognition.recipient}
                  {businessRecognition.detail ? ` — ${businessRecognition.detail}` : ""}
                </dd>
              </Reveal>
            </dl>
          </div>
          <Reveal variant="frame" className="md:col-span-5 md:col-start-8">
            <AssetPlaceholder ratio="4/5" label="Kasdan Co. — café, product or content shoot" hint="Portrait 4:5" />
          </Reveal>
        </div>
      </section>

      {/* 5. Recognition */}
      <div className="border-t border-line pt-16">
        <AwardsReel id="awards" entries={awardsRoll} />
      </div>

      {/* 6. Philosophy */}
      <section aria-labelledby="philosophy-title" className="border-t border-line">
        <div className="shell py-28 md:py-44">
          <Reveal>
            <SectionMarker index="05">Philosophy</SectionMarker>
          </Reveal>
          <h2 id="philosophy-title" className="sr-only">
            Philosophy
          </h2>
          <div className="mt-14 grid gap-16 md:grid-cols-3 md:gap-x-10">
            {philosophy.map((p, i) => (
              <Reveal key={p.title} delay={i * 100}>
                <span className="type-label text-gold">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="type-title mt-6 text-cream">{p.title}</h3>
                <p className="mt-5 text-bone">{p.body}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 7. Location */}
      <section aria-labelledby="location-title" className="border-t border-line">
        <div className="shell grid gap-12 py-28 md:grid-cols-12 md:gap-x-8 md:py-44">
          <div className="md:col-span-6">
            <Reveal>
              <SectionMarker index="06">Where we are</SectionMarker>
            </Reveal>
            <h2 id="location-title" className="type-headline mt-6 text-cream">
              <Reveal as="span" variant="mask" className="block">
                {site.location.city},
              </Reveal>
              <Reveal as="span" variant="mask" delay={100} className="block italic text-bone">
                {site.location.region}.
              </Reveal>
            </h2>
          </div>
          <div className="space-y-5 text-bone md:col-span-5 md:col-start-8 md:pt-16">
            <Reveal as="p">
              The studio is based in Sault Ste. Marie, on the St. Marys River. We work with businesses and organizations
              across Northern Ontario, and travel for shoots when a project calls for it.
            </Reveal>
            <Reveal as="p" delay={80}>
              Strategy, creative development and post-production work just as well remotely, so we&apos;re glad to
              collaborate with teams elsewhere in Canada and beyond.
            </Reveal>
          </div>
        </div>
      </section>

      {/* 8. CTA */}
      <CtaSection title="Let's make something worth watching." cta="Start a Project" eyebrow="Work with us" />

      <JsonLd data={founderJsonLd()} />
    </>
  );
}
