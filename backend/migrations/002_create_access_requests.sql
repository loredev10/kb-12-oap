CREATE TABLE IF NOT EXISTS access_requests (
  id INTEGER PRIMARY KEY,
  user_id INTEGER NOT NULL,
  start_date_time TEXT NOT NULL,
  end_date_time TEXT NOT NULL,
  comments TEXT NOT NULL,
  is_deleted INTEGER NOT NULL DEFAULT 0 CHECK (is_deleted IN (0, 1)),
  CHECK (end_date_time > start_date_time),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT
);