/**
 * Recognition and credentials.
 *
 * Attribution matters: the three awards below were earned by founder
 * Dan O'Brien as an individual. They are never presented as awards won
 * by Kasdan Studios the company.
 *
 * Do not add award categories, project names or placements here unless they
 * have been verified against the awarding body's published records.
 * Official award logos may only be added once the assets and usage
 * permission have been obtained.
 */

export type Award = {
  year: number;
  /** The award as it is commonly named. */
  name: string;
  /** Awarding organization. */
  organization: string;
  recipient: string;
};

export const founderAwards: Award[] = [
  {
    year: 2025,
    name: "Midsouth Emmy Award",
    organization: "NATAS Mid-South Chapter",
    recipient: "Dan O'Brien",
  },
  {
    year: 2024,
    name: "Gold Quill Award",
    organization: "International Association of Business Communicators",
    recipient: "Dan O'Brien",
  },
  {
    year: 2021,
    name: "New Blood Award",
    organization: "D&AD",
    recipient: "Dan O'Brien",
  },
];

/**
 * The full awards roll shown in the "Awards & recognition" reel.
 *
 * Supplied by the owner (Nov 2026). For the five entries below the founder's
 * three, the owner has not yet confirmed the year (where null), who received
 * it, or the exact category — so none is shown. Fill these in as they are
 * confirmed; the site renders whatever is present and nothing more.
 */
export type RollEntry = {
  /** null = year not yet confirmed; the reel shows "—". */
  year: number | null;
  name: string;
  organization: string | null;
  /** null = recipient not yet confirmed; no attribution line is shown. */
  recipient: string | null;
};

export const awardsRoll: RollEntry[] = [
  ...founderAwards,
  // TODO(owner): confirm recipient (Dan O'Brien / Kasdan Co. / studio) and year for each entry below.
  { year: null, name: "Tokyo Design Awards", organization: null, recipient: null },
  { year: null, name: "Muse Creative Awards", organization: null, recipient: null },
  { year: null, name: "Craft Beverage Marketing Awards", organization: "CBMAs", recipient: null },
  { year: 2024, name: "Guinness World Record", organization: "Guinness World Records", recipient: null },
  { year: 2017, name: "iHorror Award", organization: null, recipient: null },
];

export type Credential = {
  label: string;
  detail: string;
};

export const founderEducation: Credential[] = [
  { label: "Film", detail: "Sault College" },
  { label: "Marketing Management", detail: "Fanshawe College" },
  { label: "Project Management", detail: "Fanshawe College" },
];

export const founderExperience: string[] = [
  "Corporate film production",
  "Wedding films",
  "Advertising and digital content",
  "Automotive dealership marketing management",
  "Social content for Kasdan Co.",
];

/**
 * Recognition earned by Kasdan Co., the café business.
 * TODO(owner): add the competition name, organizer and year once confirmed.
 */
export const businessRecognition = {
  label: "Business pitch competition recognition",
  recipient: "Kasdan Co.",
  detail: null as string | null,
};

export const kasdanCoFacts = {
  tiktokViews: "1M+",
  tiktokViewsLabel: "cumulative TikTok views across Kasdan Co. café content",
};
