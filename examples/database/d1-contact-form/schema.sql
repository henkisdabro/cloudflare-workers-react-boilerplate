-- Contact Form Schema for Cloudflare D1
-- This schema defines the contacts table for storing form submissions

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
