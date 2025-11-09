# D1 Contact Form Example

A complete, production-ready example of using Cloudflare D1 (SQLite) database with a React contact form. Includes CRUD operations, form validation, error handling, and SQL injection prevention.

## Features

- Create, Read, and Delete contact submissions
- Form validation on both client and server
- SQL injection prevention with parameterized queries
- Pagination support for contact listing
- TypeScript types throughout
- Error handling and user feedback
- Automatic timestamp management

## Setup Instructions

### 1. Create D1 Database

```bash
# Create a new D1 database
npx wrangler d1 create contacts-db
```

This will output something like:

```
✅ Successfully created DB 'contacts-db'

[[d1_databases]]
binding = "DB"
database_name = "contacts-db"
database_id = "xxxx-xxxx-xxxx-xxxx"
```

### 2. Configure wrangler.jsonc

Add the D1 database binding to your `wrangler.jsonc`:

```jsonc
{
  "name": "your-worker-name",
  // ... other config
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "contacts-db",
      "database_id": "xxxx-xxxx-xxxx-xxxx" // Use the ID from step 1
    }
  ]
}
```

### 3. Set Up Migrations

Copy the migration file to your project's migrations directory:

```bash
# Create migrations directory if it doesn't exist
mkdir -p migrations

# Copy the migration
cp examples/database/d1-contact-form/migrations/0001_create_contacts.sql migrations/
```

### 4. Run Migrations

```bash
# For local development
npx wrangler d1 migrations apply contacts-db --local

# For production
npx wrangler d1 migrations apply contacts-db
```

### 5. Generate TypeScript Types

```bash
npm run cf-typegen
```

This generates proper TypeScript types for your D1 binding in `worker-configuration.d.ts`.

### 6. Integrate the API Endpoints

Update your `worker/index.ts` to include the contact endpoints:

```typescript
import { handleContactRequest } from '../examples/database/d1-contact-form/worker-endpoint';

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // Handle contact API routes
    if (url.pathname.startsWith('/api/contacts')) {
      return handleContactRequest(request, env);
    }

    // ... other routes

    return new Response(null, { status: 404 });
  },
} satisfies ExportedHandler<Env>;
```

### 7. Add the React Component

Import and use the ContactForm component in your app:

```typescript
// src/App.tsx
import ContactForm from '../examples/database/d1-contact-form/ContactForm';

function App() {
  return (
    <div>
      <ContactForm />
    </div>
  );
}

export default App;
```

## Testing

### Local Development

```bash
# Start the development server
npm run dev
```

The contact form will be available at `http://localhost:5173`

### Testing the API Directly

```bash
# Create a contact
curl -X POST http://localhost:5173/api/contacts \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "message": "Hello, this is a test message!"
  }'

# List all contacts
curl http://localhost:5173/api/contacts

# Get a specific contact
curl http://localhost:5173/api/contacts/1

# Delete a contact
curl -X DELETE http://localhost:5173/api/contacts/1
```

### Production Testing

```bash
# Deploy to Cloudflare
npm run deploy

# Test on production URL
curl -X POST https://your-worker.your-subdomain.workers.dev/api/contacts \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Doe",
    "email": "jane@example.com",
    "message": "Production test!"
  }'
```

## API Endpoints

### POST /api/contacts

Create a new contact.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "message": "Your message here"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "message": "Your message here",
    "createdAt": "2025-11-09T12:00:00.000Z",
    "updatedAt": "2025-11-09T12:00:00.000Z"
  }
}
```

### GET /api/contacts

List all contacts with pagination.

**Query Parameters:**
- `limit` (optional): Number of contacts to return (default: 50, max: 100)
- `offset` (optional): Number of contacts to skip (default: 0)

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "message": "Your message here",
      "createdAt": "2025-11-09T12:00:00.000Z",
      "updatedAt": "2025-11-09T12:00:00.000Z"
    }
  ],
  "count": 1
}
```

### GET /api/contacts/:id

Get a single contact by ID.

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "message": "Your message here",
    "createdAt": "2025-11-09T12:00:00.000Z",
    "updatedAt": "2025-11-09T12:00:00.000Z"
  }
}
```

### DELETE /api/contacts/:id

Delete a contact by ID.

**Response (200 OK):**
```json
{
  "success": true
}
```

## SQL Query Examples

Useful queries for managing your data:

```sql
-- View all contacts
SELECT * FROM contacts ORDER BY created_at DESC;

-- Count total contacts
SELECT COUNT(*) as total FROM contacts;

-- Find contacts by email
SELECT * FROM contacts WHERE email = 'john@example.com';

-- Delete old contacts (older than 30 days)
DELETE FROM contacts WHERE created_at < datetime('now', '-30 days');

-- Get contacts from today
SELECT * FROM contacts
WHERE DATE(created_at) = DATE('now');
```

## Security Considerations

1. **SQL Injection Prevention**: All queries use parameterized statements (`.bind()`)
2. **Input Validation**: Server-side validation of all inputs
3. **Length Limits**: Enforced limits on name (100), email (255), and message (5000)
4. **Email Validation**: Regex validation for email format
5. **Error Messages**: Generic error messages to avoid exposing internal details

## Database Schema

```sql
CREATE TABLE contacts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_contacts_email ON contacts(email);
CREATE INDEX idx_contacts_created_at ON contacts(created_at DESC);
```

## Customization Ideas

- Add more fields (phone, company, subject, etc.)
- Implement search functionality
- Add email notifications when contacts are submitted
- Implement rate limiting per IP address
- Add contact status (new, read, archived)
- Export contacts to CSV
- Add admin authentication for viewing/deleting contacts

## Troubleshooting

### "Database not found" error

Make sure you've run the migrations:
```bash
npx wrangler d1 migrations apply contacts-db --local
```

### TypeScript errors about `env.DB`

Run the type generator:
```bash
npm run cf-typegen
```

### Changes not reflecting locally

Restart the dev server:
```bash
npm run dev
```

### Production database is empty

Run migrations on production:
```bash
npx wrangler d1 migrations apply contacts-db
```

## Resources

- [Cloudflare D1 Documentation](https://developers.cloudflare.com/d1/)
- [D1 Client API Reference](https://developers.cloudflare.com/d1/platform/client-api/)
- [SQLite SQL Reference](https://www.sqlite.org/lang.html)
- [Wrangler D1 Commands](https://developers.cloudflare.com/workers/wrangler/commands/#d1)
