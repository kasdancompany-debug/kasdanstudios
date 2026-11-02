import "server-only";
import { createHash } from "node:crypto";

/**
 * Fixed-window rate limiter keyed by a salted hash of the client IP.
 *
 * Raw IPs are never stored. Entries expire after the window closes.
 *
 * Limitation: state lives in the memory of one server instance. On Vercel,
 * concurrent function instances keep separate counters, so this is a speed
 * bump rather than a hard guarantee. For stricter limits, swap `check` for
 * a shared store (e.g. Upstash Redis) — see README → Spam protection.
 */

const WINDOW_MS = 15 * 60 * 1000;
const MAX_REQUESTS = 5;

const hits = new Map<string, { count: number; resetAt: number }>();

function keyFor(ip: string) {
  const salt = process.env.RATE_LIMIT_SALT ?? "kasdan-studios";
  return createHash("sha256").update(`${salt}:${ip}`).digest("hex").slice(0, 32);
}

export function checkRateLimit(ip: string): { ok: boolean; retryAfterSec: number } {
  const now = Date.now();

  // Opportunistic cleanup so the map can't grow without bound.
  if (hits.size > 5000) {
    for (const [k, v] of hits) if (v.resetAt <= now) hits.delete(k);
  }

  const key = keyFor(ip);
  const entry = hits.get(key);
  if (!entry || entry.resetAt <= now) {
    hits.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return { ok: true, retryAfterSec: 0 };
  }
  entry.count++;
  if (entry.count > MAX_REQUESTS) {
    return { ok: false, retryAfterSec: Math.ceil((entry.resetAt - now) / 1000) };
  }
  return { ok: true, retryAfterSec: 0 };
}
