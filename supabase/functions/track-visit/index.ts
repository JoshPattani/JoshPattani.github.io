import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const DEFAULT_ALLOWED_ORIGINS = [
  "https://www.jpattani.me",
  "https://jpattani.me",
  "https://joshpattani.github.io",
  "http://localhost:8000",
  "http://127.0.0.1:8000",
  "http://localhost:5500",
  "http://127.0.0.1:5500"
];

const ALLOWED_EVENTS = new Set([
  "page_view",
  "project_view",
  "project_click",
  "resume_click",
  "contact_click",
  "contact_submit",
  "github_click",
  "linkedin_click",
  "outbound_click",
  "outbound_project_click"
]);

const DEVICE_TYPES = new Set(["desktop", "tablet", "mobile", "unknown"]);
const BROWSER_FAMILIES = new Set(["chrome", "safari", "firefox", "edge", "unknown"]);
const OS_FAMILIES = new Set(["windows", "macos", "ios", "android", "linux", "unknown"]);
const WIDTH_BUCKETS = new Set(["lt_480", "480_767", "768_1023", "1024_1439", "gte_1440"]);
const MAX_BODY_BYTES = 8192;
const MAX_METADATA_BYTES = 1024;
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 120;
const rateLimitStore = new Map<string, { count: number; expiresAt: number }>();

type JsonObject = Record<string, unknown>;

function env(name: string): string {
  return Deno.env.get(name)?.trim() || "";
}

function parseList(value: string): string[] {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

const allowedOrigins = parseList(env("ALLOWED_ORIGINS"));
const corsOrigins = allowedOrigins.length ? allowedOrigins : DEFAULT_ALLOWED_ORIGINS;
const expectedSiteId = env("ANALYTICS_SITE_ID") || "portfolio";

function corsHeaders(origin: string): Record<string, string> {
  const headers: Record<string, string> = {
    "Vary": "Origin",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "content-type"
  };

  if (origin) {
    headers["Access-Control-Allow-Origin"] = origin;
  }

  return headers;
}

function allowedOrigin(request: Request): string {
  const origin = request.headers.get("origin") || "";
  if (!origin) {
    return "";
  }

  return corsOrigins.includes(origin) ? origin : "";
}

function jsonResponse(body: JsonObject, status: number, origin: string): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders(origin),
      "Content-Type": "application/json"
    }
  });
}

function sanitizeString(value: unknown, maxLength: number): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const clean = value
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);

  return clean || null;
}

function sanitizeEnum(value: unknown, allowed: Set<string>): string | null {
  const clean = sanitizeString(value, 40)?.toLowerCase();
  return clean && allowed.has(clean) ? clean : null;
}

function normalizePath(value: unknown): string | null {
  const text = sanitizeString(value, 512);
  if (!text) {
    return null;
  }

  try {
    const url = /^https?:\/\//i.test(text)
      ? new URL(text)
      : new URL(text, "https://portfolio.local");
    const path = url.pathname.replace(/\/{2,}/g, "/").slice(0, 240);
    return path.startsWith("/") ? path : null;
  } catch (_error) {
    return null;
  }
}

function sanitizeDomain(value: unknown): string | null {
  const text = sanitizeString(value, 240);
  if (!text) {
    return null;
  }

  try {
    const url = text.includes("://") ? new URL(text) : new URL(`https://${text}`);
    const host = url.hostname.toLowerCase().replace(/^www\./, "").slice(0, 120);
    return /^[a-z0-9.-]+$/.test(host) ? host : null;
  } catch (_error) {
    return null;
  }
}

function referrerDomain(payload: JsonObject, request: Request): string | null {
  const fromPayload = sanitizeDomain(payload.referrer_domain);
  if (fromPayload) {
    return fromPayload;
  }

  return sanitizeDomain(request.headers.get("referer"));
}

function sanitizeInteger(value: unknown, min: number, max: number): number | null {
  if (typeof value !== "number" || !Number.isInteger(value)) {
    return null;
  }

  return value >= min && value <= max ? value : null;
}

function sanitizeMetadata(value: unknown): { metadata: JsonObject; tooLarge: boolean } {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return { metadata: {}, tooLarge: false };
  }

  if (new TextEncoder().encode(JSON.stringify(value)).length > MAX_METADATA_BYTES) {
    return { metadata: {}, tooLarge: true };
  }

  const metadata: JsonObject = {};
  for (const [key, rawValue] of Object.entries(value).slice(0, 12)) {
    const safeKey = sanitizeString(key, 40);
    if (!safeKey) {
      continue;
    }

    if (typeof rawValue === "string") {
      const safeValue = sanitizeString(rawValue, 120);
      if (safeValue) metadata[safeKey] = safeValue;
    } else if (typeof rawValue === "number" && Number.isFinite(rawValue)) {
      metadata[safeKey] = rawValue;
    } else if (typeof rawValue === "boolean") {
      metadata[safeKey] = rawValue;
    }
  }

  return { metadata, tooLarge: false };
}

function isLikelyBot(request: Request): boolean {
  const userAgent = request.headers.get("user-agent") || "";
  return /bot|crawler|spider|slurp|preview|facebookexternalhit|linkedinbot|discordbot|headless/i.test(userAgent);
}

function clientIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for") || "";
  const firstForwarded = forwardedFor.split(",")[0]?.trim() || "";
  return firstForwarded ||
    request.headers.get("cf-connecting-ip") ||
    request.headers.get("x-real-ip") ||
    "";
}

async function sha256Hex(value: string): Promise<string> {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("")
    .slice(0, 32);
}

async function rateLimitKey(request: Request, siteId: string): Promise<string> {
  const windowId = Math.floor(Date.now() / RATE_LIMIT_WINDOW_MS);
  const salt = env("RATE_LIMIT_SALT");
  const ip = clientIp(request);

  if (salt && ip) {
    return `ip:${await sha256Hex(`${salt}:${windowId}:${ip}:${siteId}`)}`;
  }

  const origin = request.headers.get("origin") || "no-origin";
  return `origin:${windowId}:${origin}:${siteId}`;
}

async function isRateLimited(request: Request, siteId: string): Promise<boolean> {
  const now = Date.now();
  if (rateLimitStore.size > 1000) {
    for (const [key, entry] of rateLimitStore.entries()) {
      if (entry.expiresAt <= now) {
        rateLimitStore.delete(key);
      }
    }
  }

  const key = await rateLimitKey(request, siteId);
  const current = rateLimitStore.get(key);
  if (!current || current.expiresAt <= now) {
    rateLimitStore.set(key, { count: 1, expiresAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  current.count += 1;
  return current.count > RATE_LIMIT_MAX;
}

function cleanPayload(payload: JsonObject, request: Request): { record?: JsonObject; error?: string } {
  const eventName = sanitizeString(payload.event_name, 40)?.toLowerCase();
  if (!eventName || !ALLOWED_EVENTS.has(eventName)) {
    return { error: "invalid_event" };
  }

  const siteId = sanitizeString(payload.site_id, 80);
  if (!siteId || siteId !== expectedSiteId) {
    return { error: "invalid_site" };
  }

  const path = normalizePath(payload.path);
  if (!path) {
    return { error: "invalid_path" };
  }

  const metadataResult = sanitizeMetadata(payload.metadata);
  if (metadataResult.tooLarge) {
    return { error: "metadata_too_large" };
  }

  return {
    record: {
      event_name: eventName,
      path,
      page_title: sanitizeString(payload.page_title, 160),
      referrer_domain: referrerDomain(payload, request),
      utm_source: sanitizeString(payload.utm_source, 80),
      utm_medium: sanitizeString(payload.utm_medium, 80),
      utm_campaign: sanitizeString(payload.utm_campaign, 80),
      device_type: sanitizeEnum(payload.device_type, DEVICE_TYPES) || "unknown",
      browser_family: sanitizeEnum(payload.browser_family, BROWSER_FAMILIES) || "unknown",
      os_family: sanitizeEnum(payload.os_family, OS_FAMILIES) || "unknown",
      viewport_width_bucket: sanitizeEnum(payload.viewport_width_bucket, WIDTH_BUCKETS),
      language: sanitizeString(payload.language, 32),
      timezone_offset_minutes: sanitizeInteger(payload.timezone_offset_minutes, -840, 840),
      metadata: metadataResult.metadata,
      site_id: siteId,
      source: sanitizeString(payload.source, 40) || "portfolio",
      is_bot_likely: isLikelyBot(request)
    }
  };
}

Deno.serve(async (request: Request) => {
  const origin = allowedOrigin(request);
  const requestOrigin = request.headers.get("origin") || "";

  if (request.method === "OPTIONS") {
    if (requestOrigin && !origin) {
      return jsonResponse({ ok: false }, 403, "");
    }

    return new Response(null, {
      status: 204,
      headers: corsHeaders(origin)
    });
  }

  if (requestOrigin && !origin) {
    return jsonResponse({ ok: false, error: "origin_not_allowed" }, 403, "");
  }

  if (request.method !== "POST") {
    return jsonResponse({ ok: false, error: "method_not_allowed" }, 405, origin);
  }

  const contentLength = Number(request.headers.get("content-length") || 0);
  if (contentLength > MAX_BODY_BYTES) {
    return jsonResponse({ ok: false, error: "payload_too_large" }, 413, origin);
  }

  let payload: JsonObject;
  try {
    const rawBody = await request.text();
    if (new TextEncoder().encode(rawBody).length > MAX_BODY_BYTES) {
      return jsonResponse({ ok: false, error: "payload_too_large" }, 413, origin);
    }
    payload = JSON.parse(rawBody);
  } catch (_error) {
    return jsonResponse({ ok: false, error: "invalid_json" }, 400, origin);
  }

  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return jsonResponse({ ok: false, error: "invalid_payload" }, 400, origin);
  }

  const cleaned = cleanPayload(payload, request);
  if (cleaned.error || !cleaned.record) {
    return jsonResponse({ ok: false, error: cleaned.error || "invalid_payload" }, 400, origin);
  }

  if (await isRateLimited(request, cleaned.record.site_id as string)) {
    return jsonResponse({ ok: false, error: "rate_limited" }, 429, origin);
  }

  const supabaseUrl = env("SUPABASE_URL");
  const serviceRoleKey = env("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceRoleKey) {
    return jsonResponse({ ok: false, error: "server_not_configured" }, 500, origin);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });

  const { error } = await supabase.from("portfolio_events").insert(cleaned.record);
  if (error) {
    return jsonResponse({ ok: false, error: "insert_failed" }, 500, origin);
  }

  return jsonResponse({ ok: true }, 200, origin);
});
