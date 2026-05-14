CREATE TABLE IF NOT EXISTS events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ts TEXT NOT NULL,
  event TEXT NOT NULL,
  player_name TEXT,
  ip TEXT,
  country TEXT,
  region TEXT,
  city TEXT,
  timezone TEXT,
  latitude TEXT,
  longitude TEXT,
  user_agent TEXT,
  url TEXT,
  referrer TEXT,
  session_id TEXT,
  score INTEGER,
  bonus INTEGER,
  lives INTEGER,
  medals INTEGER,
  details TEXT
);

CREATE INDEX IF NOT EXISTS idx_events_ts ON events(ts);
CREATE INDEX IF NOT EXISTS idx_events_name ON events(player_name);
CREATE INDEX IF NOT EXISTS idx_events_ip ON events(ip);
