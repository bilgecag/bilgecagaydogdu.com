-- Contact / interest form submissions for bilgecagaydogdu.com
CREATE TABLE IF NOT EXISTS submissions (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at    TEXT    NOT NULL,              -- ISO-8601 UTC
  org_type      TEXT,                          -- Q1 single choice
  applications  TEXT,                          -- Q2 multi, JSON array
  obstacles     TEXT,                          -- Q3 multi, JSON array
  interest      TEXT,                          -- Q4 single choice
  message       TEXT,                          -- Q5 free text
  contact_name  TEXT,                          -- optional
  contact_email TEXT,                          -- optional
  contact_org   TEXT,                          -- optional
  consent       INTEGER NOT NULL DEFAULT 0,    -- 1 if agreed to be contacted
  source        TEXT,                          -- where the form was opened from
  country       TEXT,                          -- coarse Cloudflare country code
  user_agent    TEXT
);
CREATE INDEX IF NOT EXISTS idx_submissions_created_at ON submissions (created_at);
