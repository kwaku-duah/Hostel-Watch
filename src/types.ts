export interface University { id: string; name: string; type: "public" | "private" | "other" }
export interface RoomType { id: string; label: string; occupants: number }
export interface Report {
  id: number; created_at: string; hostel_name: string; room_type: string;
  price_per_year: number; academic_year: string; comment: string | null;
}
export interface UniSummary {
  university_id: string; reports: number; hostels: number;
  avg_price: number; min_price: number; max_price: number;
}
export interface Summary { total: number; universities: UniSummary[] }
