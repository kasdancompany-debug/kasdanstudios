/**
 * Global studio configuration.
 *
 * Everything a non-developer is likely to change lives here: contact details,
 * social links, the showreel and navigation. Values set to `null` are hidden
 * on the site until a real value is supplied — nothing is faked.
 */

export type SocialLink = {
  label: string;
  /** Full URL. Leave null to hide the link until the account is confirmed. */
  href: string | null;
};

export type ShowreelConfig = {
  /** Path under /public, e.g. "/media/showreel-1080.mp4" (H.264, muted, ~8–15 MB max). */
  src: string | null;
  /** Optional lighter rendition served to small screens, e.g. "/media/showreel-720.mp4". */
  mobileSrc: string | null;
  /** Poster still under /public, e.g. "/media/showreel-poster.jpg" (2400×1350 recommended). */
  poster: string | null;
};

function resolveSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/$/, "");
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercel) return `https://${vercel}`;
  return "http://localhost:3000";
}

export const site = {
  name: "Kasdan Studios",
  parent: "Kasdan Co.",
  tagline: "Ideas worth watching.",
  disciplines: ["Marketing", "Design", "Content", "Film"],
  description:
    "Kasdan Studios is an independent creative and marketing studio in Sault Ste. Marie, Ontario — marketing strategy, Meta ads and lead generation, graphic design and branding, social content, web design and film.",
  url: resolveSiteUrl(),
  locale: "en_CA",

  location: {
    city: "Sault Ste. Marie",
    region: "Ontario",
    regionCode: "ON",
    country: "Canada",
    countryCode: "CA",
    regionLabel: "Northern Ontario",
  },

  /**
   * Public studio inbox. Shown on /contact and in the footer once set.
   * This is display-only — form delivery is configured with environment
   * variables (see README → Contact form).
   */
  email: null as string | null,

  socials: [
    { label: "Instagram", href: null },
    { label: "TikTok", href: "https://www.tiktok.com/@kasdan_co" },
    { label: "Vimeo", href: null },
    { label: "LinkedIn", href: null },
  ] satisfies SocialLink[] as SocialLink[],

  showreel: {
    src: null,
    mobileSrc: null,
    poster: null,
  } satisfies ShowreelConfig as ShowreelConfig,

  founder: {
    name: "Dan O'Brien",
  },
} as const;

export const primaryNav = [
  { label: "Work", href: "/work" },
  { label: "Services", href: "/services" },
  { label: "About", href: "/about" },
  // Journal is appended automatically once at least one article is published.
  { label: "Contact", href: "/contact" },
] as const;

export const activeSocials = () => site.socials.filter((s): s is SocialLink & { href: string } => Boolean(s.href));
