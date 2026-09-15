CREATE TABLE IF NOT EXISTS media (id TEXT PRIMARY KEY, drive_file_id TEXT NOT NULL UNIQUE, name TEXT NOT NULL, mime_type TEXT NOT NULL, size INTEGER DEFAULT 0, public_url TEXT, alt TEXT DEFAULT '', caption TEXT DEFAULT '', category TEXT DEFAULT 'gallery', frame_type TEXT DEFAULT 'cover', position TEXT DEFAULT 'center', focus_x INTEGER DEFAULT 50, focus_y INTEGER DEFAULT 50, zoom REAL DEFAULT 1, radius INTEGER DEFAULT 18, sort_order INTEGER DEFAULT 0, published INTEGER DEFAULT 0, created_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS bookings (id TEXT PRIMARY KEY, name TEXT NOT NULL, phone TEXT NOT NULL, service TEXT DEFAULT '', preferred_date TEXT DEFAULT '', message TEXT DEFAULT '', status TEXT DEFAULT 'pending', created_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS sessions (id TEXT PRIMARY KEY, email TEXT NOT NULL, expires_at INTEGER NOT NULL, created_at INTEGER NOT NULL);
CREATE INDEX IF NOT EXISTS idx_media_published_order ON media(published, sort_order);
CREATE INDEX IF NOT EXISTS idx_bookings_status_created ON bookings(status, created_at);
