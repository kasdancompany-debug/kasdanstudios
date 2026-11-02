import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false },
};

export default function NotFound() {
  return (
    <section className="shell flex min-h-[90svh] flex-col justify-center pt-28 pb-20">
      <p className="type-label text-gold">Error 404 — Scene missing</p>
      <h1 className="type-display mt-8 max-w-[12ch] text-cream">
        This frame <span className="italic text-bone">didn&apos;t make the cut.</span>
      </h1>
      <p className="type-lede mt-8 max-w-[40ch] text-mute">
        The page you&apos;re looking for has moved, or never existed.
      </p>
      <div className="mt-12 flex flex-wrap gap-3">
        <ButtonLink href="/">Back to the start</ButtonLink>
        <ButtonLink href="/work" variant="outline">
          See the work
        </ButtonLink>
      </div>
    </section>
  );
}
