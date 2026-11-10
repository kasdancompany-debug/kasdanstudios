import "server-only";
import { Resend } from "resend";
import { budgets, projectTypes, type ContactInput } from "./schema";
import { isProductionDeployment } from "@/lib/content/preview";

export type DeliveryResult =
  { ok: true; transport: "resend" | "console" } | { ok: false; reason: "not-configured" | "provider-error" };

const labelOf = (list: readonly { value: string; label: string }[], v: string) =>
  list.find((x) => x.value === v)?.label ?? v;

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

/** Strip CR/LF so user input can never inject email headers via the subject. */
const oneLine = (s: string) => s.replace(/[\r\n]+/g, " ").trim();

function compose(input: ContactInput) {
  const rows: [string, string][] = [
    ["Name", input.name],
    ["Email", input.email],
    ["Company", input.company || "—"],
    ["Project type", labelOf(projectTypes, input.projectType)],
    ["Budget", labelOf(budgets, input.budget)],
    ["Timeline", input.timeline || "—"],
  ];

  const text = [...rows.map(([k, v]) => `${k}: ${v}`), "", "Project description:", input.message].join("\n");

  const html = `<!doctype html><html><body style="font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;color:#1b1916;line-height:1.5">
<h2 style="font-weight:500;margin:0 0 16px">New project enquiry</h2>
<table cellpadding="6" style="border-collapse:collapse">${rows
    .map(
      ([k, v]) =>
        `<tr><td style="color:#756e63;vertical-align:top;padding-right:16px">${k}</td><td>${escapeHtml(v)}</td></tr>`,
    )
    .join("")}</table>
<h3 style="font-weight:500;margin:24px 0 8px">Project description</h3>
<p style="white-space:pre-wrap;margin:0">${escapeHtml(input.message)}</p>
<p style="color:#9d9588;font-size:12px;margin-top:32px">Sent from the contact form on the kasdan studios website. Reply directly to respond to the sender.</p>
</body></html>`;

  return {
    subject: oneLine(`New enquiry — ${labelOf(projectTypes, input.projectType)} — ${input.name}`).slice(0, 180),
    text,
    html,
  };
}

/**
 * Sends the enquiry to the studio inbox.
 *
 * Transport is chosen by environment:
 * - Resend, when RESEND_API_KEY, CONTACT_TO_EMAIL and CONTACT_FROM_EMAIL are set.
 * - "console", only outside production and only when CONTACT_DELIVERY=console:
 *   logs a redacted summary (no names, emails or message text).
 * - Otherwise: "not-configured" — the visitor is told plainly that the
 *   message was not sent.
 */
export async function deliverEnquiry(input: ContactInput): Promise<DeliveryResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;
  const from = process.env.CONTACT_FROM_EMAIL;

  if (apiKey && to && from) {
    const { subject, text, html } = compose(input);
    try {
      const resend = new Resend(apiKey);
      const { error } = await resend.emails.send({
        from,
        to: to.split(",").map((s) => s.trim()),
        replyTo: input.email,
        subject,
        text,
        html,
      });
      if (error) {
        // Log the provider's error type only — never the enquiry contents.
        console.error("[contact] Resend rejected the message:", error.name);
        return { ok: false, reason: "provider-error" };
      }
      return { ok: true, transport: "resend" };
    } catch (err) {
      console.error("[contact] Resend request failed:", err instanceof Error ? err.name : "unknown");
      return { ok: false, reason: "provider-error" };
    }
  }

  if (process.env.CONTACT_DELIVERY === "console" && !isProductionDeployment()) {
    console.info("[contact] dev delivery (not emailed):", {
      projectType: input.projectType,
      budget: input.budget,
      messageLength: input.message.length,
      hasCompany: Boolean(input.company),
    });
    return { ok: true, transport: "console" };
  }

  console.error("[contact] Email delivery is not configured. See README → Contact form.");
  return { ok: false, reason: "not-configured" };
}
