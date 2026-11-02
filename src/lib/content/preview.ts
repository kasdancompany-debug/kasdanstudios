/**
 * Draft preview.
 *
 * Set CONTENT_PREVIEW=true locally or on a Vercel *preview* deployment to
 * render draft projects and articles (marked with a banner and noindex).
 * It is ignored on production deployments so drafts can never leak live.
 */
export function isPreviewEnabled(): boolean {
  if (process.env.CONTENT_PREVIEW !== "true") return false;
  if (process.env.VERCEL_ENV === "production") return false;
  return true;
}

/** True only on the real public deployment (or a local production build). */
export function isProductionDeployment(): boolean {
  if (process.env.VERCEL_ENV) return process.env.VERCEL_ENV === "production";
  return process.env.NODE_ENV === "production";
}

/**
 * Whether search engines may index the site. Requires a production
 * deployment *and* ALLOW_INDEXING=true, so the *.vercel.app address and any
 * pre-launch production deploy stay out of search until you switch it on.
 */
export function isIndexable(): boolean {
  return isProductionDeployment() && process.env.ALLOW_INDEXING === "true";
}
