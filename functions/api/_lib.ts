import universities from "../../src/data/universities.json";
import roomTypes from "../../src/data/roomTypes.json";

export interface Env {
  DB: D1Database;
  TURNSTILE_SECRET: string;
  HASH_PEPPER: string;
}

export const json = (data: unknown, status = 200, cache = false) =>
  new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json",
      "cache-control": cache ? "public, max-age=60" : "no-store",
    },
  });

export async function hmac(pepper: string, value: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(pepper),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function verifyTurnstile(secret: string, token: string, ip: string): Promise<boolean> {
  const body = new FormData();
  body.append("secret", secret);
  body.append("response", token);
  body.append("remoteip", ip);
  const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    body,
  });
  const data = (await res.json()) as { success: boolean };
  return data.success === true;
}

export const universityIds = new Set(universities.map((u) => u.id));
export const roomTypeIds = new Set(roomTypes.map((r) => r.id));

export const normaliseHostel = (name: string) =>
  name.trim().toLowerCase().replace(/\s+/g, " ").replace(/[^a-z0-9 ]/g, "");

const ACADEMIC_YEAR = /^20\d\d\/20\d\d$/;

export interface ReportInput {
  universityId: string;
  hostelName: string;
  roomType: string;
  pricePerYear: number;
  academicYear: string;
  comment?: string;
  deviceId: string;
  turnstileToken: string;
}

export function validate(b: any): { ok: true; v: ReportInput } | { ok: false; error: string } {
  if (!b || typeof b !== "object") return { ok: false, error: "Invalid body" };
  if (!universityIds.has(b.universityId)) return { ok: false, error: "Unknown university" };
  if (!roomTypeIds.has(b.roomType)) return { ok: false, error: "Unknown room type" };
  const hostelName = String(b.hostelName ?? "").trim();
  if (hostelName.length < 2 || hostelName.length > 80) return { ok: false, error: "Hostel name must be 2 to 80 characters" };
  const price = Number(b.pricePerYear);
  if (!Number.isInteger(price) || price < 200 || price > 200000)
    return { ok: false, error: "Price must be a whole number between GH₵200 and GH₵200,000 per year" };
  if (!ACADEMIC_YEAR.test(String(b.academicYear))) return { ok: false, error: "Academic year must look like 2025/2026" };
  const comment = b.comment ? String(b.comment).trim().slice(0, 500) : undefined;
  const deviceId = String(b.deviceId ?? "");
  if (deviceId.length < 16 || deviceId.length > 64) return { ok: false, error: "Missing device id" };
  const turnstileToken = String(b.turnstileToken ?? "");
  if (!turnstileToken) return { ok: false, error: "Please complete the verification" };
  return {
    ok: true,
    v: { universityId: b.universityId, hostelName, roomType: b.roomType, pricePerYear: price, academicYear: b.academicYear, comment, deviceId, turnstileToken },
  };
}
