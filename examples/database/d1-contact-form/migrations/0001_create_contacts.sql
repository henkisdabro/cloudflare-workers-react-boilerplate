-- Migration: Create contacts table
-- Created: 2025-11-09
-- Description: Initial migration to create the contacts table with indexes and triggers

-- Up Migration
CREATE TABLE contacts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster queries by email
CREATE INDEX idx_contacts_email ON contacts(email);

-- Index for sorting by creation date
CREATE INDEX idx_contacts_created_at ON contacts(created_at DESC);

-- Trigger to automatically update updated_at timestamp
CREATE TRIGGER update_contacts_timestamp
AFTER UPDATE ON contacts
FOR EACH ROW
BEGIN
  UPDATE contacts SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;

-- Down Migration (commented out - uncomment to rollback)
-- DROP TRIGGER IF EXISTS update_contacts_timestamp;
-- DROP INDEX IF EXISTS idx_contacts_created_at;
-- DROP INDEX IF EXISTS idx_contacts_email;
-- DROP TABLE IF EXISTS contacts;
