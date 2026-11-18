import { Env, json, hmac, verifyTurnstile, validate, normaliseHostel, universityIds } from "./_lib";

const MAX_PER_IP_PER_DAY = 60; // campus wifi shares IPs, so keep this generous
const MAX_PER_DEVICE_PER_DAY = 12;

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const uni = new URL(request.url).searchParams.get("universityId") ?? "";
  if (!universityIds.has(uni)) return json({ error: "Unknown university" }, 400);
  const { results } = await env.DB.prepare(
    `SELECT id, created_at, hostel_name, room_type, price_per_year, academic_year,
            CASE WHEN comment_approved = 1 THEN comment ELSE NULL END AS comment
     FROM reports WHERE university_id = ?1 AND hidden = 0
     ORDER BY created_at DESC LIMIT 1000`,
  ).bind(uni).all();
  return json({ reports: results }, 200, true);
};

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  let body: unknown;
  try { body = await request.json(); } catch { return json({ error: "Invalid JSON" }, 400); }
  const parsed = validate(body);
  if (!parsed.ok) return json({ error: parsed.error }, 400);
  const v = parsed.v;

  const ip = request.headers.get("CF-Connecting-IP") ?? "unknown";
  if (!(await verifyTurnstile(env.TURNSTILE_SECRET, v.turnstileToken, ip)))
    return json({ error: "Verification failed. Please try again." }, 403);

  const reporterHash = await hmac(env.HASH_PEPPER, "device:" + v.deviceId);
  const ipHash = await hmac(env.HASH_PEPPER, "ip:" + ip);

  const rl = await env.DB.prepare(
    `SELECT
       SUM(CASE WHEN ip_hash = ?1 THEN 1 ELSE 0 END) AS by_ip,
       SUM(CASE WHEN reporter_hash = ?2 THEN 1 ELSE 0 END) AS by_device
     FROM reports WHERE created_at > datetime('now', '-1 day')`,
  ).bind(ipHash, reporterHash).first<{ by_ip: number | null; by_device: number | null }>();
  if ((rl?.by_ip ?? 0) >= MAX_PER_IP_PER_DAY || (rl?.by_device ?? 0) >= MAX_PER_DEVICE_PER_DAY)
    return json({ error: "Too many submissions today. Please try again tomorrow." }, 429);

  try {
    await env.DB.prepare(
      `INSERT INTO reports (university_id, hostel_name, hostel_key, room_type, price_per_year,
                            academic_year, comment, reporter_hash, ip_hash)
       VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)`,
    ).bind(v.universityId, v.hostelName, normaliseHostel(v.hostelName), v.roomType, v.pricePerYear,
           v.academicYear, v.comment ?? null, reporterHash, ipHash).run();
  } catch (e) {
    if (String(e).includes("UNIQUE"))
      return json({ error: "You already reported this room type for this hostel and year." }, 409);
    throw e;
  }
  return json({ ok: true }, 201);
};
