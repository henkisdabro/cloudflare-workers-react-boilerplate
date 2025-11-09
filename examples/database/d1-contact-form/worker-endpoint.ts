/**
 * D1 Contact Form API Endpoints
 *
 * This file contains API endpoint handlers for the contact form feature.
 * Integrate these into your worker/index.ts file.
 *
 * Prerequisites:
 * 1. D1 database configured in wrangler.jsonc as:
 *    [[d1_databases]]
 *    binding = "DB"
 *    database_name = "your-database-name"
 *    database_id = "your-database-id"
 *
 * 2. Run migrations:
 *    npx wrangler d1 migrations apply your-database-name --local (for local dev)
 *    npx wrangler d1 migrations apply your-database-name (for production)
 */

import type {
  ContactRow,
  ContactResponse,
  ContactListResponse,
  ErrorResponse
} from './types';
import { validateContactRequest, rowToContact } from './types';

/**
 * POST /api/contacts - Create a new contact
 */
export async function createContact(
  request: Request,
  env: Env
): Promise<Response> {
  try {
    // Parse request body
    const body = await request.json();

    // Validate request
    if (!validateContactRequest(body)) {
      const errorResponse: ErrorResponse = {
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Invalid request data. Ensure name, email, and message are provided and valid.',
      };
      return Response.json(errorResponse, { status: 400 });
    }

    const { name, email, message } = body;

    // Insert into database using parameterized query (prevents SQL injection)
    const result = await env.DB.prepare(
      'INSERT INTO contacts (name, email, message) VALUES (?, ?, ?)'
    )
      .bind(name.trim(), email.trim(), message.trim())
      .run();

    if (!result.success) {
      throw new Error('Failed to insert contact into database');
    }

    // Fetch the created contact
    const contact = await env.DB.prepare(
      'SELECT * FROM contacts WHERE id = ?'
    )
      .bind(result.meta.last_row_id)
      .first<ContactRow>();

    if (!contact) {
      throw new Error('Failed to retrieve created contact');
    }

    const response: ContactResponse = {
      success: true,
      data: rowToContact(contact),
    };

    return Response.json(response, { status: 201 });
  } catch (error) {
    console.error('Error creating contact:', error);

    const errorResponse: ErrorResponse = {
      success: false,
      error: 'SERVER_ERROR',
      message: 'An error occurred while creating the contact',
    };

    return Response.json(errorResponse, { status: 500 });
  }
}

/**
 * GET /api/contacts - List all contacts
 * Query parameters:
 * - limit: Number of contacts to return (default: 50, max: 100)
 * - offset: Number of contacts to skip (default: 0)
 */
export async function listContacts(
  request: Request,
  env: Env
): Promise<Response> {
  try {
    const url = new URL(request.url);
    const limit = Math.min(
      parseInt(url.searchParams.get('limit') || '50'),
      100
    );
    const offset = Math.max(
      parseInt(url.searchParams.get('offset') || '0'),
      0
    );

    // Fetch contacts with pagination
    const { results } = await env.DB.prepare(
      'SELECT * FROM contacts ORDER BY created_at DESC LIMIT ? OFFSET ?'
    )
      .bind(limit, offset)
      .all<ContactRow>();

    // Get total count
    const countResult = await env.DB.prepare(
      'SELECT COUNT(*) as count FROM contacts'
    ).first<{ count: number }>();

    const response: ContactListResponse = {
      success: true,
      data: results.map(rowToContact),
      count: countResult?.count || 0,
    };

    return Response.json(response);
  } catch (error) {
    console.error('Error listing contacts:', error);

    const errorResponse: ErrorResponse = {
      success: false,
      error: 'SERVER_ERROR',
      message: 'An error occurred while fetching contacts',
    };

    return Response.json(errorResponse, { status: 500 });
  }
}

/**
 * GET /api/contacts/:id - Get a single contact by ID
 */
export async function getContact(
  request: Request,
  env: Env,
  id: string
): Promise<Response> {
  try {
    const contactId = parseInt(id);

    if (isNaN(contactId)) {
      const errorResponse: ErrorResponse = {
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Invalid contact ID',
      };
      return Response.json(errorResponse, { status: 400 });
    }

    const contact = await env.DB.prepare(
      'SELECT * FROM contacts WHERE id = ?'
    )
      .bind(contactId)
      .first<ContactRow>();

    if (!contact) {
      const errorResponse: ErrorResponse = {
        success: false,
        error: 'NOT_FOUND',
        message: 'Contact not found',
      };
      return Response.json(errorResponse, { status: 404 });
    }

    const response: ContactResponse = {
      success: true,
      data: rowToContact(contact),
    };

    return Response.json(response);
  } catch (error) {
    console.error('Error fetching contact:', error);

    const errorResponse: ErrorResponse = {
      success: false,
      error: 'SERVER_ERROR',
      message: 'An error occurred while fetching the contact',
    };

    return Response.json(errorResponse, { status: 500 });
  }
}

/**
 * DELETE /api/contacts/:id - Delete a contact by ID
 */
export async function deleteContact(
  request: Request,
  env: Env,
  id: string
): Promise<Response> {
  try {
    const contactId = parseInt(id);

    if (isNaN(contactId)) {
      const errorResponse: ErrorResponse = {
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Invalid contact ID',
      };
      return Response.json(errorResponse, { status: 400 });
    }

    // Check if contact exists
    const existingContact = await env.DB.prepare(
      'SELECT id FROM contacts WHERE id = ?'
    )
      .bind(contactId)
      .first();

    if (!existingContact) {
      const errorResponse: ErrorResponse = {
        success: false,
        error: 'NOT_FOUND',
        message: 'Contact not found',
      };
      return Response.json(errorResponse, { status: 404 });
    }

    // Delete the contact
    const result = await env.DB.prepare(
      'DELETE FROM contacts WHERE id = ?'
    )
      .bind(contactId)
      .run();

    if (!result.success) {
      throw new Error('Failed to delete contact');
    }

    return Response.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error deleting contact:', error);

    const errorResponse: ErrorResponse = {
      success: false,
      error: 'SERVER_ERROR',
      message: 'An error occurred while deleting the contact',
    };

    return Response.json(errorResponse, { status: 500 });
  }
}

/**
 * Router function to handle all contact-related requests
 * Add this to your worker/index.ts fetch handler:
 *
 * Example integration:
 *
 * import { handleContactRequest } from './examples/database/d1-contact-form/worker-endpoint';
 *
 * export default {
 *   async fetch(request, env) {
 *     const url = new URL(request.url);
 *
 *     // Handle contact API routes
 *     if (url.pathname.startsWith('/api/contacts')) {
 *       return handleContactRequest(request, env);
 *     }
 *
 *     // ... other routes
 *   }
 * }
 */
export async function handleContactRequest(
  request: Request,
  env: Env
): Promise<Response> {
  const url = new URL(request.url);
  const path = url.pathname;
  const method = request.method;

  // Match routes
  const contactIdMatch = path.match(/^\/api\/contacts\/(\d+)$/);

  // POST /api/contacts - Create contact
  if (path === '/api/contacts' && method === 'POST') {
    return createContact(request, env);
  }

  // GET /api/contacts - List contacts
  if (path === '/api/contacts' && method === 'GET') {
    return listContacts(request, env);
  }

  // GET /api/contacts/:id - Get single contact
  if (contactIdMatch && method === 'GET') {
    return getContact(request, env, contactIdMatch[1]);
  }

  // DELETE /api/contacts/:id - Delete contact
  if (contactIdMatch && method === 'DELETE') {
    return deleteContact(request, env, contactIdMatch[1]);
  }

  // Method not allowed
  const errorResponse: ErrorResponse = {
    success: false,
    error: 'METHOD_NOT_ALLOWED',
    message: 'Method not allowed for this endpoint',
  };

  return Response.json(errorResponse, { status: 405 });
}
