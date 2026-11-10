import { z } from "zod";

/** Shared by the client form and the server action. */

// Values match the service ids in content/services.ts, so /contact?type=<id> preselects.
export const projectTypes = [
  { value: "marketing-strategy", label: "Marketing & strategy" },
  { value: "meta-ads-lead-gen", label: "Meta ads & lead generation" },
  { value: "graphic-design", label: "Graphic design & branding" },
  { value: "social-tiktok", label: "Social & TikTok" },
  { value: "photography", label: "Food & product photography" },
  { value: "web-design", label: "Website" },
  { value: "commercials-film", label: "Commercial / film" },
  { value: "real-estate", label: "Real estate media" },
  { value: "not-sure", label: "Not sure yet / a mix" },
] as const;

export const budgets = [
  { value: "under-1k", label: "Under $1,000" },
  { value: "1k-2.5k", label: "$1,000–$2,500" },
  { value: "2.5k-5k", label: "$2,500–$5,000" },
  { value: "5k-10k", label: "$5,000–$10,000" },
  { value: "10k-plus", label: "$10,000+" },
  { value: "discuss", label: "Prefer to discuss" },
] as const;

type Values<T extends readonly { value: string }[]> = T[number]["value"];
const values = <T extends readonly { value: string }[]>(list: T) =>
  list.map((x) => x.value) as unknown as [Values<T>, ...Values<T>[]];

export const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { error: "Please enter your name." })
    .max(120, { error: "That name is a little long." }),
  email: z
    .string()
    .trim()
    .max(254)
    .pipe(z.email({ error: "Please enter a valid email address." })),
  company: z.string().trim().max(160, { error: "Please shorten this to 160 characters." }).optional().default(""),
  projectType: z.enum(values(projectTypes), { error: "Please choose a project type." }),
  budget: z.enum(values(budgets), { error: "Please choose a budget range." }),
  timeline: z.string().trim().max(160, { error: "Please shorten this to 160 characters." }).optional().default(""),
  message: z
    .string()
    .trim()
    .min(20, { error: "A couple of sentences about the project helps us reply properly." })
    .max(5000, { error: "Please keep the description under 5,000 characters." }),
  consent: z.literal(true, { error: "Please confirm you agree to the privacy policy." }),
});

export type ContactInput = z.infer<typeof contactSchema>;
export type ContactField = keyof ContactInput;

export const contactFields: ContactField[] = [
  "name",
  "email",
  "company",
  "projectType",
  "budget",
  "timeline",
  "message",
  "consent",
];

/** Convert FormData (or a plain form snapshot) into the schema's input shape. */
export function formDataToInput(fd: FormData) {
  const str = (k: string) => {
    const v = fd.get(k);
    return typeof v === "string" ? v : "";
  };
  return {
    name: str("name"),
    email: str("email"),
    company: str("company"),
    projectType: str("projectType"),
    budget: str("budget"),
    timeline: str("timeline"),
    message: str("message"),
    consent: fd.get("consent") === "on",
  };
}

export function fieldErrors(error: z.ZodError): Partial<Record<ContactField, string>> {
  const out: Partial<Record<ContactField, string>> = {};
  for (const issue of error.issues) {
    const key = issue.path[0] as ContactField | undefined;
    if (key && !out[key]) out[key] = issue.message;
  }
  return out;
}

export type ContactState = {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Partial<Record<ContactField, string>>;
  /** Echoed back on error so no-JS submissions don't lose what was typed. */
  values?: Partial<Record<Exclude<ContactField, "consent">, string>> & { consent?: boolean };
  /** True when the dev "console" transport was used instead of real email. */
  devDelivery?: boolean;
};
