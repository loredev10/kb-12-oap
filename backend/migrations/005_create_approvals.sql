CREATE TABLE IF NOT EXISTS approvals (
  id INTEGER PRIMARY KEY,
  access_request_id INTEGER NOT NULL,
  approved_by_user_id INTEGER NOT NULL,
  decision TEXT NOT NULL CHECK (decision IN ('approved', 'rejected')),
  comment TEXT NOT NULL DEFAULT '',
  approved_at TEXT NOT NULL,
  is_deleted INTEGER NOT NULL DEFAULT 0 CHECK (is_deleted IN (0, 1)),
  FOREIGN KEY (access_request_id) REFERENCES access_requests(id) ON DELETE RESTRICT,
  FOREIGN KEY (approved_by_user_id) REFERENCES users(id) ON DELETE RESTRICT
);