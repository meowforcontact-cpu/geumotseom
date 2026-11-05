-- Isolated playtest database. Never apply this to the bot's economy database.
CREATE TABLE IF NOT EXISTS pet_profiles (user_id TEXT PRIMARY KEY, display_name TEXT NOT NULL, pet_json TEXT, revision INTEGER NOT NULL DEFAULT 0, updated_at INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS pet_sessions (hash TEXT PRIMARY KEY, user_id TEXT NOT NULL, csrf TEXT NOT NULL, expires INTEGER NOT NULL);
CREATE INDEX IF NOT EXISTS pet_sessions_expiry ON pet_sessions(expires);
CREATE TABLE IF NOT EXISTS pet_oauth_states (hash TEXT PRIMARY KEY, expires INTEGER NOT NULL);
CREATE INDEX IF NOT EXISTS pet_oauth_expiry ON pet_oauth_states(expires);
CREATE TABLE IF NOT EXISTS pet_login_rates (hash TEXT PRIMARY KEY, count INTEGER NOT NULL, expires INTEGER NOT NULL);
