"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // Only the digest is logged — never request data.
    console.error("[page error]", error.digest ?? error.name);
  }, [error]);

  return (
    <section className="shell flex min-h-[90svh] flex-col justify-center pt-28 pb-20">
      <p className="type-label text-gold">Something went wrong</p>
      <h1 className="type-display mt-8 max-w-[12ch] text-cream">
        We lost <span className="italic text-bone">the signal.</span>
      </h1>
      <p className="type-lede mt-8 max-w-[40ch] text-mute">
        This page didn&apos;t load properly. Try again, or head back to the homepage.
      </p>
      <div className="mt-12 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={reset}
          className="type-nav bg-cream px-7 py-[1.15rem] text-ink transition-colors hover:bg-gold"
        >
          Try again
        </button>
        <Link href="/" className="type-nav border border-line-strong px-7 py-[1.15rem] text-cream hover:border-cream">
          Homepage
        </Link>
      </div>
    </section>
  );
}
