import Link from "next/link";
import { site } from "@content/site";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Privacy Policy",
  path: "/privacy",
  description: "How kasdan studios collects, uses and protects personal information submitted through this website.",
});

/**
 * Written to match what the site actually does. If you add analytics,
 * a newsletter, a CRM or any new processor, update this page first.
 * Review with a qualified advisor before launch.
 */
const LAST_UPDATED = "1 November 2026";

export default function PrivacyPage() {
  const contactLine = site.email ? (
    <>
      by emailing <a href={`mailto:${site.email}`}>{site.email}</a> or through our{" "}
      <Link href="/contact">contact form</Link>
    </>
  ) : (
    <>
      through our <Link href="/contact">contact form</Link>
    </>
  );

  return (
    <article className="shell pt-36 pb-28 md:pt-52 md:pb-44">
      <div className="grid gap-12 md:grid-cols-12 md:gap-x-8">
        <header className="md:col-span-4">
          <p className="type-label text-mute">Legal</p>
          <h1 className="type-headline mt-6 text-cream">Privacy policy</h1>
          <p className="type-label mt-6 text-dim">Last updated {LAST_UPDATED}</p>
        </header>

        <div className="prose-editorial md:col-span-7 md:col-start-6">
          <p>
            This policy explains what personal information {site.name} (&ldquo;we&rdquo;), a {site.parent} company based
            in {site.location.city}, {site.location.region}, collects through this website, why, and what you can ask us
            to do with it. We handle personal information in line with Canada&apos;s Personal Information Protection and
            Electronic Documents Act (PIPEDA).
          </p>

          <h2>What we collect</h2>
          <p>
            <strong>When you use the contact form</strong>, we collect the details you choose to give us: your name,
            email address, company or organization (optional), project type, budget range, desired timeline (optional)
            and your project description, plus your confirmation that you agree to this policy.
          </p>
          <p>
            <strong>When you browse the site</strong>, our hosting provider automatically processes standard technical
            information such as your IP address, browser type and the pages requested, in order to deliver the site and
            protect it from abuse.
          </p>
          <p>
            We do not use advertising trackers or third-party analytics, and we do not set cookies. We don&apos;t sell
            or rent personal information.
          </p>

          <h2>How we use it</h2>
          <ul>
            <li>To read and reply to your enquiry and, if we work together, to prepare a proposal.</li>
            <li>To protect the form from spam and abuse.</li>
          </ul>
          <p>We won&apos;t add you to a mailing list or use your details for marketing without separate consent.</p>

          <h2>How it&apos;s processed</h2>
          <p>
            When you submit the form, your message is checked on our server and sent as an email to the studio inbox
            through our email delivery provider, Resend. The website itself does not store your submission in a
            database.
          </p>
          <p>
            To limit spam, the server keeps a short-lived, one-way hashed version of your IP address in memory for up to
            15 minutes to count how many messages have been sent from that connection. The raw IP address is not stored
            by the form.
          </p>
          <p>Service providers involved:</p>
          <ul>
            <li>
              <strong>Vercel</strong> — website hosting and delivery. Processes request logs.
            </li>
            <li>
              <strong>Resend</strong> — transactional email delivery for contact form messages.
            </li>
            <li>
              <strong>Our email provider</strong> — hosts the studio inbox where enquiries are received.
            </li>
          </ul>
          <p>
            These providers may process information outside Canada, including in the United States, where it may be
            subject to the laws of those jurisdictions.
          </p>

          <h2>Embedded video</h2>
          <p>
            Some project pages include films hosted on Vimeo or YouTube. These players are not loaded until you press
            play. Once loaded, the provider&apos;s own privacy policy applies; we use YouTube&apos;s privacy-enhanced
            mode and Vimeo&apos;s &ldquo;do not track&rdquo; setting where available.
          </p>

          <h2>Browser storage</h2>
          <p>
            The site stores two small preferences in your browser — whether you&apos;ve already seen the homepage intro
            this session, and whether you&apos;ve turned the immersive mode off. They contain no personal information,
            never leave your device and can be cleared in your browser settings.
          </p>

          <h2>How long we keep it</h2>
          <p>
            Enquiry emails are kept for up to 24 months after our last contact so we can follow up on a conversation,
            and then deleted. If we go on to work together, project correspondence is kept as part of our business
            records for as long as required for accounting and legal purposes.
          </p>

          <h2>Your choices</h2>
          <p>
            You can ask to see the personal information we hold about you, ask us to correct it, or ask us to delete it,{" "}
            {contactLine}. We&apos;ll respond within 30 days. You can also withdraw consent at any time, which simply
            means we&apos;ll stop using your details to contact you.
          </p>
          <p>
            If you have concerns we haven&apos;t resolved, you can contact the{" "}
            <a href="https://www.priv.gc.ca/" target="_blank" rel="noopener noreferrer">
              Office of the Privacy Commissioner of Canada
            </a>
            .
          </p>

          <h2>Changes</h2>
          <p>If we change how we handle personal information, we&apos;ll update this page and the date above.</p>
        </div>
      </div>
    </article>
  );
}
