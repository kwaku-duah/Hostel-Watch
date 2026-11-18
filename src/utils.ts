import universities from "./data/universities.json";
import roomTypes from "./data/roomTypes.json";
import type { University, RoomType } from "./types";

export const UNIS = universities as University[];
export const ROOMS = roomTypes as RoomType[];
export const uniName = (id: string) => UNIS.find((u) => u.id === id)?.name ?? id;
export const roomLabel = (id: string) => ROOMS.find((r) => r.id === id)?.label ?? id;
export const cedi = (n: number) => `GH₵${Math.round(n).toLocaleString("en-GH")}`;

export function median(xs: number[]): number {
  if (!xs.length) return 0;
  const s = [...xs].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

export function currentAcademicYear(): string {
  const d = new Date();
  const y = d.getMonth() >= 7 ? d.getFullYear() : d.getFullYear() - 1;
  return `${y}/${y + 1}`;
}

export function toCsv(rows: Record<string, string | number | null>[]): string {
  if (!rows.length) return "";
  const head = Object.keys(rows[0]);
  const esc = (v: string | number | null) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  return [head.join(","), ...rows.map((r) => head.map((h) => esc(r[h])).join(","))].join("\n");
}
