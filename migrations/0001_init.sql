CREATE TABLE IF NOT EXISTS reports (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  university_id TEXT NOT NULL,
  hostel_name TEXT NOT NULL,
  hostel_key TEXT NOT NULL,
  room_type TEXT NOT NULL,
  price_per_year INTEGER NOT NULL,
  academic_year TEXT NOT NULL,
  comment TEXT,
  comment_approved INTEGER NOT NULL DEFAULT 0,
  reporter_hash TEXT NOT NULL,
  ip_hash TEXT NOT NULL,
  hidden INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_reports_uni ON reports (university_id, hidden);
CREATE UNIQUE INDEX IF NOT EXISTS uq_reporter_entry
  ON reports (reporter_hash, university_id, hostel_key, room_type, academic_year);
CREATE INDEX IF NOT EXISTS idx_reports_ip ON reports (ip_hash, created_at);
