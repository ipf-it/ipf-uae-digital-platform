import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const url = process.env.UPSTASH_REDIS_REST_URL?.trim();
const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();
const redis = url && token ? new Redis({ url, token }) : null;

const limiters = new Map<string, Ratelimit>();

function limiterFor(bucket: string, limit: number, windowSeconds: number) {
  if (!redis) return null;
  const key = `${bucket}:${limit}:${windowSeconds}`;
  let limiter = limiters.get(key);
  if (!limiter) {
    limiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(limit, `${windowSeconds} s`),
      prefix: `ipf-uae:${bucket}`,
    });
    limiters.set(key, limiter);
  }
  return limiter;
}

/**
 * Sliding-window rate limit keyed by bucket+identifier (e.g. an IP or phone number).
 * Silently allows every request (no-op) if Upstash isn't configured — safe for local dev,
 * but real protection requires UPSTASH_REDIS_REST_URL/TOKEN to be set in production.
 */
export async function rateLimit(bucket: string, identifier: string, limit: number, windowSeconds: number): Promise<{ allowed: boolean; remaining: number }> {
  const limiter = limiterFor(bucket, limit, windowSeconds);
  if (!limiter) return { allowed: true, remaining: limit };
  const result = await limiter.limit(identifier);
  return { allowed: result.success, remaining: result.remaining };
}

export function clientIp(headers: Record<string, string | string[] | undefined>): string {
  const forwarded = headers["x-forwarded-for"] ?? headers["X-Forwarded-For"];
  const value = Array.isArray(forwarded) ? forwarded[0] : forwarded;
  return value?.split(",")[0]?.trim() || "unknown";
}
