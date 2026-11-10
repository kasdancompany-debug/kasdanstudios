import Link from "next/link";
import { activeSocials, site } from "@content/site";
import { CurrentYear } from "./CurrentYear";

type NavItem = { label: string; href: string };

export function SiteFooter({ nav }: { nav: NavItem[] }) {
  const socials = activeSocials();

  return (
    <footer className="gl-clear relative border-t border-line bg-ink">
      <div className="shell pt-20 pb-10 md:pt-28">
        <div className="grid gap-14 md:grid-cols-12">
          <div className="md:col-span-6">
            <p className="font-display text-[clamp(2.5rem,6vw,5.5rem)] leading-[0.92] tracking-[-0.03em] text-cream">
              <span className="brand-case">
                kasdan <span className="italic text-bone">studios</span>
              </span>
            </p>
            <p className="mt-6 max-w-sm text-mute">
              {site.tagline} An independent creative studio from Northern Ontario.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3 md:col-span-6">
            <div>
              <h2 className="type-label text-gold-soft">Studio</h2>
              <ul className="mt-5 space-y-3">
                {nav.map((n) => (
                  <li key={n.href}>
                    <Link href={n.href} className="link-line text-bone hover:text-cream">
                      {n.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="type-label text-gold-soft">Contact</h2>
              <ul className="mt-5 space-y-3">
                <li>
                  <Link href="/contact" className="link-line text-bone hover:text-cream">
                    Start a project
                  </Link>
                </li>
                {site.email && (
                  <li>
                    <a href={`mailto:${site.email}`} className="link-line break-all text-bone hover:text-cream">
                      {site.email}
                    </a>
                  </li>
                )}
                <li className="pt-2 text-mute">
                  <address className="not-italic">
                    {site.location.city}
                    <br />
                    {site.location.region}, {site.location.country}
                  </address>
                </li>
              </ul>
            </div>

            {socials.length > 0 && (
              <div>
                <h2 className="type-label text-gold-soft">Follow</h2>
                <ul className="mt-5 space-y-3">
                  {socials.map((s) => (
                    <li key={s.label}>
                      <a
                        href={s.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="link-line text-bone hover:text-cream"
                      >
                        {s.label}
                        <span className="sr-only"> (opens in a new tab)</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        <div className="mt-20 flex flex-col gap-4 border-t border-line pt-6 text-sm text-mute md:mt-28 md:flex-row md:items-center md:justify-between">
          <p>
            © <CurrentYear /> {site.name}. A {site.parent} company.
          </p>
          <div className="flex gap-8">
            <Link href="/privacy" className="link-line hover:text-cream">
              Privacy
            </Link>
            <span className="type-label self-center text-dim">
              {site.location.city}, {site.location.regionCode}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
