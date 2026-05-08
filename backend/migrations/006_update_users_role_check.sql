BEGIN TRANSACTION;

CREATE TABLE users_new (
  id INTEGER PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL CHECK (role IN ('student', 'teacher', 'lab_assistant', 'admin')),
  notes TEXT NOT NULL DEFAULT '',
  is_deleted INTEGER NOT NULL DEFAULT 0 CHECK (is_deleted IN (0, 1))
);

INSERT INTO users_new (id, full_name, email, role, notes, is_deleted)
SELECT
  id,
  full_name,
  email,
  role,
  notes,
  is_deleted
FROM users;

DROP TABLE users;

ALTER TABLE users_new RENAME TO users;

COMMIT;