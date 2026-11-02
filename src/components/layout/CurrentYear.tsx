"use client";

/**
 * Renders the current year on the client so a statically built page never
 * shows a stale copyright year. The server value is the build year.
 */
export function CurrentYear() {
  return <span suppressHydrationWarning>{new Date().getFullYear()}</span>;
}
