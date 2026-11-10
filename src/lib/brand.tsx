import { Fragment, type ReactNode } from "react";

const BRAND = /(kasdan studios|kasdan co.?)/i;

/**
 * Renders text with the brand names kept lowercase, even where the
 * surrounding type is set uppercase by CSS (display headings, labels).
 */
export function brandCase(text: string): ReactNode {
  const parts = text.split(BRAND);
  if (parts.length === 1) return text;
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <span key={i} className="brand-case">
        {part.toLowerCase()}
      </span>
    ) : (
      <Fragment key={i}>{part}</Fragment>
    ),
  );
}
