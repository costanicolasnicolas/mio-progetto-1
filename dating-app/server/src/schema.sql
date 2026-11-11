-- Schema del prototipo (SQLite). In produzione: PostgreSQL + PostGIS (vedi docs/03-database.md).
PRAGMA foreign_keys = ON;
PRAGMA journal_mode = WAL;

CREATE TABLE IF NOT EXISTS users (
  id              INTEGER PRIMARY KEY,
  email           TEXT NOT NULL UNIQUE COLLATE NOCASE,
  password_hash   TEXT NOT NULL,
  role            TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user','admin')),
  status          TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','suspended','banned','deleted')),
  plan            TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free','premium','plus')),
  plan_expires_at INTEGER,                         -- epoch ms; NULL = nessun piano a pagamento
  consent_sensitive_at INTEGER,                    -- consenso esplicito art. 9 GDPR (orientamento)
  consent_ai_at   INTEGER,                         -- consenso all'invio di dati al fornitore AI
  created_at      INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS profiles (
  user_id         INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  birthdate       TEXT NOT NULL,                   -- YYYY-MM-DD, deve risultare >= 18 anni
  gender          TEXT NOT NULL CHECK (gender IN ('man','woman','nonbinary')),
  interested_in   TEXT NOT NULL,                   -- CSV di generi: 'woman' | 'man,woman' ...
  bio             TEXT NOT NULL DEFAULT '',
  interests       TEXT NOT NULL DEFAULT '[]',      -- JSON array di tag normalizzati
  city            TEXT NOT NULL DEFAULT '',
  lat             REAL,
  lng             REAL,
  max_distance_km INTEGER NOT NULL DEFAULT 50,
  age_min         INTEGER NOT NULL DEFAULT 18,
  age_max         INTEGER NOT NULL DEFAULT 99,
  verified        INTEGER NOT NULL DEFAULT 0,
  only_verified   INTEGER NOT NULL DEFAULT 0,      -- filtro avanzato (Premium+)
  last_active_at  INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS photos (
  id          INTEGER PRIMARY KEY,
  user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  path        TEXT NOT NULL,
  position    INTEGER NOT NULL DEFAULT 0,
  moderation  TEXT NOT NULL DEFAULT 'pending' CHECK (moderation IN ('pending','approved','rejected')),
  created_at  INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_photos_user ON photos(user_id, position);

CREATE TABLE IF NOT EXISTS swipes (
  swiper_id  INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  target_id  INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  direction  TEXT NOT NULL CHECK (direction IN ('like','pass','superlike')),
  created_at INTEGER NOT NULL,
  PRIMARY KEY (swiper_id, target_id)
);
CREATE INDEX IF NOT EXISTS idx_swipes_target ON swipes(target_id, direction, created_at);

CREATE TABLE IF NOT EXISTS matches (
  id           INTEGER PRIMARY KEY,
  user_a       INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,  -- sempre user_a < user_b
  user_b       INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at   INTEGER NOT NULL,
  unmatched_at INTEGER,
  UNIQUE (user_a, user_b),
  CHECK (user_a < user_b)
);

CREATE TABLE IF NOT EXISTS messages (
  id         INTEGER PRIMARY KEY,
  match_id   INTEGER NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  sender_id  INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  body       TEXT NOT NULL,
  flagged    TEXT,                                -- motivo del flag antifrode, NULL se pulito
  created_at INTEGER NOT NULL,
  read_at    INTEGER
);
CREATE INDEX IF NOT EXISTS idx_messages_match ON messages(match_id, id);

CREATE TABLE IF NOT EXISTS blocks (
  blocker_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  blocked_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at INTEGER NOT NULL,
  PRIMARY KEY (blocker_id, blocked_id)
);

CREATE TABLE IF NOT EXISTS reports (
  id          INTEGER PRIMARY KEY,
  reporter_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reported_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reason      TEXT NOT NULL CHECK (reason IN ('fake','scam','harassment','inappropriate','underage','other')),
  details     TEXT NOT NULL DEFAULT '',
  status      TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','actioned','dismissed')),
  resolved_by INTEGER REFERENCES users(id),
  resolution  TEXT,                               -- motivazione (DSA: statement of reasons)
  created_at  INTEGER NOT NULL,
  resolved_at INTEGER
);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status, created_at);

CREATE TABLE IF NOT EXISTS verifications (
  id          INTEGER PRIMARY KEY,
  user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  gesture     TEXT NOT NULL,                      -- gesto richiesto nel selfie (anti-foto rubata)
  selfie_path TEXT NOT NULL,
  status      TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  reviewed_by INTEGER REFERENCES users(id),
  created_at  INTEGER NOT NULL,
  reviewed_at INTEGER
);

CREATE TABLE IF NOT EXISTS subscriptions (
  id                 INTEGER PRIMARY KEY,
  user_id            INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan               TEXT NOT NULL CHECK (plan IN ('premium','plus')),
  status             TEXT NOT NULL CHECK (status IN ('active','canceled','past_due','expired')),
  provider           TEXT NOT NULL CHECK (provider IN ('mock','stripe','apple','google')),
  provider_ref       TEXT,
  current_period_end INTEGER NOT NULL,
  cancel_at_period_end INTEGER NOT NULL DEFAULT 0,
  created_at         INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_subs_user ON subscriptions(user_id, status);

-- Idempotenza dei webhook di pagamento: lo stesso evento non viene mai applicato due volte.
CREATE TABLE IF NOT EXISTS payment_events (
  provider   TEXT NOT NULL,
  event_id   TEXT NOT NULL,
  type       TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  PRIMARY KEY (provider, event_id)
);

CREATE TABLE IF NOT EXISTS notifications (
  id         INTEGER PRIMARY KEY,
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type       TEXT NOT NULL,
  payload    TEXT NOT NULL DEFAULT '{}',
  created_at INTEGER NOT NULL,
  read_at    INTEGER
);
CREATE INDEX IF NOT EXISTS idx_notif_user ON notifications(user_id, read_at);

-- Contatori giornalieri per i limiti del piano Free (like e suggerimenti AI; MAI i messaggi).
CREATE TABLE IF NOT EXISTS usage_counters (
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  day     TEXT NOT NULL,
  kind    TEXT NOT NULL,
  count   INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, day, kind)
);

CREATE TABLE IF NOT EXISTS audit_log (
  id         INTEGER PRIMARY KEY,
  actor_id   INTEGER,
  action     TEXT NOT NULL,
  target_id  INTEGER,
  details    TEXT NOT NULL DEFAULT '{}',
  created_at INTEGER NOT NULL
);
