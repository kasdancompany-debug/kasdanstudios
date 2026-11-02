import Link from "next/link";
import { activeSocials, site } from "@content/site";
import { ContactForm } from "@/components/contact/ContactForm";
import { Reveal } from "@/components/ui/Reveal";
import { Label, SectionMarker } from "@/components/ui/Label";
import { pageMetadata } from "@/lib/seo";
import { GLText } from "@/components/gl/GLText";

export const metadata = pageMetadata({
  title: "Contact",
  path: "/contact",
  description:
    "Start a project with Kasdan Studios — film, creative, content and marketing strategy from Sault Ste. Marie, Ontario. Tell us what you're working on.",
});

export default function ContactPage() {
  const socials = activeSocials();

  return (
    <section className="shell pt-36 pb-28 md:pt-52 md:pb-44">
      <div className="grid gap-16 lg:grid-cols-12 lg:gap-x-8">
        <div className="lg:col-span-5">
          <Reveal>
            <SectionMarker>Contact</SectionMarker>
          </Reveal>
          <GLText as="h1" className="type-display mt-8 text-cream">
            <Reveal as="span" variant="mask" className="block">
              Have something
            </Reveal>
            <Reveal as="span" variant="mask" delay={120} className="block italic text-bone">
              worth making?
            </Reveal>
          </GLText>
          <Reveal as="p" delay={200} className="type-lede mt-8 max-w-[30ch] text-bone">
            Tell us what you&apos;re working on. We&apos;ll take it from there.
          </Reveal>

          <Reveal delay={260} className="mt-16 hidden space-y-10 lg:block">
            <ContactDetails socials={socials} />
          </Reveal>
        </div>

        <div className="lg:col-span-6 lg:col-start-7 lg:pt-6">
          <ContactForm />
        </div>

        <div className="space-y-10 border-t border-line pt-12 lg:hidden">
          <ContactDetails socials={socials} />
        </div>
      </div>
    </section>
  );
}

function ContactDetails({ socials }: { socials: { label: string; href: string }[] }) {
  return (
    <>
      {site.email && (
        <div>
          <Label>Email</Label>
          <a href={`mailto:${site.email}`} className="link-line mt-3 inline-block break-all text-lg text-cream">
            {site.email}
          </a>
        </div>
      )}
      <div>
        <Label>Studio</Label>
        <address className="mt-3 text-lg not-italic text-cream">
          {site.location.city}, {site.location.region}
          <br />
          <span className="text-mute">{site.location.country}</span>
        </address>
        <p className="mt-3 max-w-[34ch] text-mute">
          Working across Northern Ontario, and remotely for strategy, creative and post-production.
        </p>
      </div>
      {socials.length > 0 && (
        <div>
          <Label>Follow</Label>
          <ul className="mt-3 flex flex-wrap gap-x-6 gap-y-2">
            {socials.map((s) => (
              <li key={s.label}>
                <a href={s.href} target="_blank" rel="noopener noreferrer" className="link-line text-cream">
                  {s.label}
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
      <p className="text-sm text-dim">
        Your details are used only to reply to you. See our{" "}
        <Link href="/privacy" className="underline underline-offset-4 hover:text-cream">
          privacy policy
        </Link>
        .
      </p>
    </>
  );
}
