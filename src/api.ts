import type { Report, Summary } from "./types";

async function req<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as { error?: string }).error ?? "Something went wrong");
  return data as T;
}

export const getSummary = () => req<Summary>("/api/summary");
export const getReports = (universityId: string) =>
  req<{ reports: Report[] }>(`/api/reports?universityId=${encodeURIComponent(universityId)}`);

export interface SubmitPayload {
  universityId: string; hostelName: string; roomType: string; pricePerYear: number;
  academicYear: string; comment?: string; turnstileToken: string;
}

export function deviceId(): string {
  try {
    let id = localStorage.getItem("hw_device");
    if (!id) { id = crypto.randomUUID(); localStorage.setItem("hw_device", id); }
    return id;
  } catch { return crypto.randomUUID(); }
}

export const submitReport = (p: SubmitPayload) =>
  req<{ ok: true }>("/api/reports", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ ...p, deviceId: deviceId() }),
  });
