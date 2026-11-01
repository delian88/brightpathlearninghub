import { NextResponse } from "next/server";

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

export interface RateLimitConfig {
  /** Unique namespace for the route (e.g., "admin-auth", "bookings") */
  namespace: string;
  /** Maximum allowed requests within the window */
  maxRequests: number;
  /** Window duration in milliseconds */
  windowMs: number;
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }
  return "127.0.0.1";
}

export function checkRateLimit(
  request: Request,
  config: RateLimitConfig
): {
  allowed: boolean;
  remaining: number;
  resetAt: number;
  retryAfterSeconds: number;
  headers: Record<string, string>;
} {
  const now = Date.now();
  const ip = getClientIp(request);
  const key = `${config.namespace}:${ip}`;

  // Clean up expired entries periodically
  if (rateLimitStore.size > 1000) {
    for (const [k, v] of rateLimitStore.entries()) {
      if (v.resetAt <= now) {
        rateLimitStore.delete(k);
      }
    }
  }

  let entry = rateLimitStore.get(key);
  if (!entry || entry.resetAt <= now) {
    entry = {
      count: 1,
      resetAt: now + config.windowMs,
    };
    rateLimitStore.set(key, entry);
  } else {
    entry.count += 1;
  }

  const remaining = Math.max(0, config.maxRequests - entry.count);
  const retryAfterSeconds = Math.max(1, Math.ceil((entry.resetAt - now) / 1000));
  const allowed = entry.count <= config.maxRequests;

  const headers: Record<string, string> = {
    "X-RateLimit-Limit": String(config.maxRequests),
    "X-RateLimit-Remaining": String(remaining),
    "X-RateLimit-Reset": String(Math.ceil(entry.resetAt / 1000)),
  };

  if (!allowed) {
    headers["Retry-After"] = String(retryAfterSeconds);
  }

  return {
    allowed,
    remaining,
    resetAt: entry.resetAt,
    retryAfterSeconds,
    headers,
  };
}

export function rateLimitExceededResponse(
  retryAfterSeconds: number,
  headers: Record<string, string>,
  customMessage?: string
) {
  const mins = Math.ceil(retryAfterSeconds / 60);
  return NextResponse.json(
    {
      success: false,
      rateLimited: true,
      retryAfterSeconds,
      message:
        customMessage ||
        `Too many attempts. Please wait ${
          retryAfterSeconds > 60 ? `${mins} minute(s)` : `${retryAfterSeconds} seconds`
        } before trying again.`,
    },
    { status: 429, headers }
  );
}

