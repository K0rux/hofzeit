-- Migration: Add user management fields to users table
-- PROJ-2: Admin User Management Backend
-- Date: 2026-02-12

-- Add missing fields to users table
ALTER TABLE users
  ADD COLUMN first_name TEXT NOT NULL DEFAULT '',
  ADD COLUMN last_name TEXT NOT NULL DEFAULT '',
  ADD COLUMN vacation_days INTEGER NOT NULL DEFAULT 30,
  ADD COLUMN updated_at TIMESTAMP DEFAULT NOW() NOT NULL;

-- Create index for search performance (search by name)
CREATE INDEX idx_users_first_name ON users(first_name);
CREATE INDEX idx_users_last_name ON users(last_name);

-- Create trigger to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
