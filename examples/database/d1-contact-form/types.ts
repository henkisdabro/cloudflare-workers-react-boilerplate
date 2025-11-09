/**
 * Types for D1 Contact Form Example
 */

// Database row type (matches the schema exactly)
export interface ContactRow {
  id: number;
  name: string;
  email: string;
  message: string;
  created_at: string; // SQLite returns datetime as string
  updated_at: string;
}

// Contact type for API responses (client-facing)
export interface Contact {
  id: number;
  name: string;
  email: string;
  message: string;
  createdAt: Date;
  updatedAt: Date;
}

// Request body for creating a contact
export interface CreateContactRequest {
  name: string;
  email: string;
  message: string;
}

// API Response types
export interface ContactResponse {
  success: true;
  data: Contact;
}

export interface ContactListResponse {
  success: true;
  data: Contact[];
  count: number;
}

export interface ErrorResponse {
  success: false;
  error: string;
  message: string;
}

export type ApiResponse = ContactResponse | ContactListResponse | ErrorResponse;

// Helper function to convert database row to Contact object
export function rowToContact(row: ContactRow): Contact {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    message: row.message,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

// Validation helpers
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validateContactRequest(data: unknown): data is CreateContactRequest {
  if (typeof data !== 'object' || data === null) return false;

  const obj = data as Record<string, unknown>;

  return (
    typeof obj.name === 'string' &&
    obj.name.trim().length > 0 &&
    obj.name.length <= 100 &&
    typeof obj.email === 'string' &&
    validateEmail(obj.email) &&
    obj.email.length <= 255 &&
    typeof obj.message === 'string' &&
    obj.message.trim().length > 0 &&
    obj.message.length <= 5000
  );
}
