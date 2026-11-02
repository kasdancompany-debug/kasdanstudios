"use server";

import { headers } from "next/headers";
import { contactSchema, fieldErrors, formDataToInput, type ContactState } from "@/lib/contact/schema";
import { checkRateLimit } from "@/lib/contact/rate-limit";
import { deliverEnquiry } from "@/lib/contact/deliver";
import { site } from "@content/site";

/** Submissions faster than this after the form rendered are treated as bots. */
const MIN_FILL_MS = 2500;
/** A rendered form older than this is stale (prevents replaying an old token). */
const MAX_FORM_AGE_MS = 1000 * 60 * 60 * 6;

const fallbackContact = site.email ? ` You can also email us at ${site.email}.` : "";

export async function submitContact(_prev: ContactState, formData: FormData): Promise<ContactState> {
  const raw = formDataToInput(formData);
  const echo: ContactState["values"] = { ...raw, consent: raw.consent };

  // 1. Honeypot — real visitors never see or fill this field.
  if (String(formData.get("ks_hp") ?? "").length > 0) {
    return {
      status: "error",
      message: "Your message was blocked by our spam protection. If this is a mistake, please try again.",
      values: echo,
    };
  }

  // 2. Time trap. The timestamp is set by client JS on mount; visitors
  //    without JS submit it empty and rely on the honeypot + rate limit.
  const rawStarted = String(formData.get("ks_t") ?? "");
  const started = Number(rawStarted);
  const age = Date.now() - started;
  if (rawStarted && (!Number.isFinite(started) || age < MIN_FILL_MS || age > MAX_FORM_AGE_MS)) {
    return {
      status: "error",
      message: "That was quicker than we expected. Please wait a moment and submit again.",
      values: echo,
    };
  }

  // 3. Validate
  const parsed = contactSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      status: "error",
      message: "Please check the highlighted fields.",
      fieldErrors: fieldErrors(parsed.error),
      values: echo,
    };
  }

  // 4. Rate limit (after validation so typos don't burn attempts)
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
  const limit = checkRateLimit(ip);
  if (!limit.ok) {
    const minutes = Math.max(1, Math.round(limit.retryAfterSec / 60));
    return {
      status: "error",
      message: `Too many messages from this connection. Please try again in about ${minutes} minute${minutes === 1 ? "" : "s"}.${fallbackContact}`,
      values: echo,
    };
  }

  // 5. Deliver — success is only reported when the provider confirms.
  const result = await deliverEnquiry(parsed.data);
  if (!result.ok) {
    return {
      status: "error",
      message:
        result.reason === "not-configured"
          ? `Our contact form isn't accepting messages right now, so nothing was sent.${fallbackContact}`
          : `We couldn't send your message — our email provider didn't accept it. Please try again shortly.${fallbackContact}`,
      values: echo,
    };
  }

  return {
    status: "success",
    message: `Thanks, ${parsed.data.name.split(" ")[0]}. Your message is with us and we'll reply to ${parsed.data.email}.`,
    devDelivery: result.transport === "console",
  };
}
