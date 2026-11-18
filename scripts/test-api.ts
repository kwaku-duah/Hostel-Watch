import { getPlatformProxy } from "wrangler";
import { readFileSync } from "node:fs";
import { onRequestPost, onRequestGet } from "../functions/api/reports";
import { onRequestGet as summaryGet } from "../functions/api/summary";

const real = globalThis.fetch;
globalThis.fetch = (async (input: any, init?: any) => {
  if (String(input).includes("turnstile/v0/siteverify")) {
    const tok = (init.body as FormData).get("response");
    return new Response(JSON.stringify({ success: tok === "good" }));
  }
  return real(input, init);
}) as typeof fetch;

const { env, dispose } = await getPlatformProxy<any>({ configPath: "wrangler.toml" });
env.TURNSTILE_SECRET = "x"; env.HASH_PEPPER = "pepper";
await env.DB.exec("DELETE FROM reports"); // local test DB only
await env.DB.exec(readFileSync("migrations/0001_init.sql", "utf8").replace(/\n/g, " "));

const post = (body: object, ip = "1.1.1.1") =>
  onRequestPost({ request: new Request("http://x/api/reports", { method: "POST", headers: { "CF-Connecting-IP": ip }, body: JSON.stringify(body) }), env } as any);
const base = { universityId: "knust", hostelName: "Unity Hall", roomType: "4", pricePerYear: 4200, academicYear: "2025/2026", deviceId: "a".repeat(20), turnstileToken: "good" };
const show = async (label: string, r: Response) => console.log(label.padEnd(34), r.status, JSON.stringify(await r.json()));

await show("valid submit", await post(base));
await show("duplicate same device", await post(base));
await show("same wifi, different student", await post({ ...base, deviceId: "b".repeat(20) }));
await show("bad turnstile", await post({ ...base, deviceId: "c".repeat(20), turnstileToken: "bad" }));
await show("price too low", await post({ ...base, deviceId: "d".repeat(20), pricePerYear: 5 }));
await show("unknown university", await post({ ...base, universityId: "hogwarts" }));
await show("bad year", await post({ ...base, deviceId: "e".repeat(20), academicYear: "25-26" }));
await post({ ...base, deviceId: "f".repeat(20), universityId: "ug", hostelName: "Evandy", comment: "unapproved comment", pricePerYear: 6000 });
await show("GET knust", await onRequestGet({ request: new Request("http://x/api/reports?universityId=knust"), env } as any));
await show("GET ug (comment hidden?)", await onRequestGet({ request: new Request("http://x/api/reports?universityId=ug"), env } as any));
await show("summary", await summaryGet({ env } as any));
for (let i = 0; i < 12; i++) await post({ ...base, deviceId: "z".repeat(20), hostelName: "H" + i }, "9.9.9.9");
await show("device rate limit (13th)", await post({ ...base, deviceId: "z".repeat(20), hostelName: "H99" }, "9.9.9.9"));
await dispose();
