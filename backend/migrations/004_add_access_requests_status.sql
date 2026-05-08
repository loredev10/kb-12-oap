ALTER TABLE access_requests
ADD COLUMN status TEXT NOT NULL DEFAULT 'pending'
CHECK (status IN ('pending', 'approved', 'rejected'));