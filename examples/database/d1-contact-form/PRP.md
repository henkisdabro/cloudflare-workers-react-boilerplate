# Product Requirement Plan: D1 Contact Form

## Metadata

- **Feature**: Contact Form with D1 Database Integration
- **Target Completion**: 2-3 hours
- **Confidence Score**: 9/10 - Well-documented pattern with clear implementation path
- **Created**: 2025-11-09

## Executive Summary

A production-ready contact form feature that stores submissions in a Cloudflare D1 (SQLite) database. Includes full CRUD API endpoints, React form component with validation, and proper error handling. This example demonstrates best practices for D1 integration including migrations, SQL injection prevention, and type safety.

## Research Findings

### Codebase Analysis

#### Similar Patterns Found

- **Pattern**: Worker API Handler
  - **Location**: `worker/index.ts:1-12`
  - **Description**: Basic worker with URL routing pattern
  - **Relevance**: Foundation for adding contact API routes

- **Pattern**: TypeScript Configuration
  - **Location**: `tsconfig.worker.json`
  - **Description**: Worker-specific TypeScript config
  - **Relevance**: Ensures types work correctly in worker context

#### Existing Conventions

- **Convention**: Response.json for API responses
  - **Example**: `worker/index.ts:6-8`
  - **Application**: Use Response.json for all contact API responses

- **Convention**: URL pathname matching for routes
  - **Example**: `url.pathname.startsWith("/api/")`
  - **Application**: Route contact endpoints under `/api/contacts`

#### Test Patterns

- **Test Framework**: Not currently configured
- **Pattern**: Manual testing via curl commands
- **Location**: Development workflow

### External Research

#### Documentation References

- **Resource**: Cloudflare D1
  - **URL**: https://developers.cloudflare.com/d1/
  - **Key Sections**: Get started, Client API, Migrations
  - **Version**: Latest (Workers runtime)
  - **Gotchas**: Local vs production databases are separate; migrations must run on both

- **Resource**: D1 Client API
  - **URL**: https://developers.cloudflare.com/d1/platform/client-api/
  - **Key Sections**: Prepared statements, Parameter binding, Transactions
  - **Version**: Latest
  - **Gotchas**: Always use `.bind()` for parameters, never string concatenation

- **Resource**: Wrangler D1 Commands
  - **URL**: https://developers.cloudflare.com/workers/wrangler/commands/#d1
  - **Key Sections**: create, migrations, execute
  - **Version**: Wrangler 3.x+
  - **Gotchas**: `--local` flag needed for local development

#### Implementation Examples

- **Example**: D1 CRUD API
  - **Source**: Cloudflare D1 documentation examples
  - **Relevance**: Pattern for prepared statements and error handling
  - **Cautions**: Don't trust user input; always validate

- **Example**: React Form Validation
  - **Source**: React 19 patterns
  - **Relevance**: Modern form handling with hooks
  - **Cautions**: Validate on both client and server

#### Best Practices

- **Practice**: Parameterized Queries
  - **Why**: Prevents SQL injection attacks
  - **How**: Always use `.bind()` with prepared statements
  - **Warning**: Never concatenate user input into SQL strings

- **Practice**: Server-side Validation
  - **Why**: Client-side validation can be bypassed
  - **How**: Validate all inputs in worker before database operations
  - **Warning**: Don't rely solely on TypeScript types

- **Practice**: Pagination
  - **Why**: Prevents performance issues with large datasets
  - **How**: Use LIMIT and OFFSET with sensible defaults
  - **Warning**: Always enforce maximum limits

## Technical Specification

### Architecture Overview

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   React     │  POST   │   Worker     │  SQL    │     D1      │
│ ContactForm │ ───────>│  API Handler │ ───────>│  Database   │
│             │         │              │         │             │
│             │<─────── │              │<─────── │             │
│             │  JSON   │              │  Rows   │             │
└─────────────┘         └──────────────┘         └─────────────┘

Routes:
- POST   /api/contacts     → createContact()
- GET    /api/contacts     → listContacts()
- GET    /api/contacts/:id → getContact()
- DELETE /api/contacts/:id → deleteContact()
```

### Component Breakdown

#### Component 1: Database Schema

- **Purpose**: Define the contacts table structure
- **Location**: `examples/database/d1-contact-form/schema.sql`
- **Dependencies**: None
- **Interface**: SQL schema with indexes and triggers

#### Component 2: Migration

- **Purpose**: Versioned database schema changes
- **Location**: `examples/database/d1-contact-form/migrations/0001_create_contacts.sql`
- **Dependencies**: D1 database
- **Interface**: SQL migration with up/down scripts

#### Component 3: TypeScript Types

- **Purpose**: Type definitions for contacts and API responses
- **Location**: `examples/database/d1-contact-form/types.ts`
- **Dependencies**: None
- **Interface**: Exported interfaces and validation functions

#### Component 4: Worker API Endpoints

- **Purpose**: Handle HTTP requests and database operations
- **Location**: `examples/database/d1-contact-form/worker-endpoint.ts`
- **Dependencies**: Types, D1 binding
- **Interface**: Request handlers and router function

#### Component 5: React Component

- **Purpose**: User interface for contact form
- **Location**: `examples/database/d1-contact-form/ContactForm.tsx`
- **Dependencies**: Types, Worker API
- **Interface**: React functional component with hooks

### Data Models

```typescript
// Database row (snake_case, matches SQLite schema)
interface ContactRow {
  id: number;
  name: string;
  email: string;
  message: string;
  created_at: string;
  updated_at: string;
}

// API model (camelCase, for JavaScript/TypeScript)
interface Contact {
  id: number;
  name: string;
  email: string;
  message: string;
  createdAt: Date;
  updatedAt: Date;
}

// Request payload
interface CreateContactRequest {
  name: string;
  email: string;
  message: string;
}

// API responses
interface ContactResponse {
  success: true;
  data: Contact;
}

interface ContactListResponse {
  success: true;
  data: Contact[];
  count: number;
}

interface ErrorResponse {
  success: false;
  error: string;
  message: string;
}
```

### API Endpoints

- **Endpoint**: `POST /api/contacts`
  - **Purpose**: Create a new contact
  - **Request**: `{ name, email, message }`
  - **Response**: `{ success: true, data: Contact }`
  - **Authentication**: None (public form)

- **Endpoint**: `GET /api/contacts`
  - **Purpose**: List all contacts with pagination
  - **Request**: Query params `limit`, `offset`
  - **Response**: `{ success: true, data: Contact[], count: number }`
  - **Authentication**: None (could add in production)

- **Endpoint**: `GET /api/contacts/:id`
  - **Purpose**: Get a single contact
  - **Request**: ID in URL path
  - **Response**: `{ success: true, data: Contact }`
  - **Authentication**: None

- **Endpoint**: `DELETE /api/contacts/:id`
  - **Purpose**: Delete a contact
  - **Request**: ID in URL path
  - **Response**: `{ success: true }`
  - **Authentication**: None (should add in production)

## Implementation Blueprint

### Prerequisites

1. Cloudflare account with Workers enabled
2. Wrangler CLI installed (`npm install -g wrangler`)
3. Node.js 18+ and npm
4. Project set up with Vite + React + TypeScript

### Implementation Steps (in order)

#### Step 1: Create D1 Database

**Goal**: Provision a D1 database in Cloudflare

**Commands**:
```bash
npx wrangler d1 create contacts-db
```

**Files to Create/Modify**:
- `wrangler.jsonc` - Add D1 binding configuration

**Validation**: Database ID appears in wrangler output

#### Step 2: Configure D1 Binding

**Goal**: Connect D1 database to the worker

**Files to Create/Modify**:
- `wrangler.jsonc` - Add `[[d1_databases]]` section with binding name "DB"

**Pseudocode Approach**:
```jsonc
{
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "contacts-db",
      "database_id": "xxxxx"
    }
  ]
}
```

**Validation**: `npm run cf-typegen` succeeds and generates DB types

#### Step 3: Create Schema and Migration

**Goal**: Define database structure

**Files to Create/Modify**:
- `examples/database/d1-contact-form/schema.sql` - Full schema
- `examples/database/d1-contact-form/migrations/0001_create_contacts.sql` - Migration file

**Validation**: SQL syntax is valid (test with sqlite3)

#### Step 4: Run Migrations

**Goal**: Apply schema to database

**Commands**:
```bash
npx wrangler d1 migrations apply contacts-db --local
npx wrangler d1 migrations apply contacts-db
```

**Validation**: Tables exist in database (query with wrangler d1 execute)

#### Step 5: Create TypeScript Types

**Goal**: Define type-safe interfaces

**Files to Create/Modify**:
- `examples/database/d1-contact-form/types.ts` - All interfaces and validation

**Reference Pattern**: Standard TypeScript interface patterns

**Validation**: No TypeScript errors, types export correctly

#### Step 6: Implement Worker API Endpoints

**Goal**: Create CRUD operations

**Files to Create/Modify**:
- `examples/database/d1-contact-form/worker-endpoint.ts` - All endpoint handlers

**Pseudocode Approach**:
```typescript
async function createContact(request, env) {
  // 1. Parse and validate request body
  // 2. Execute INSERT with .bind() for SQL injection prevention
  // 3. Fetch created record
  // 4. Return JSON response
}
```

**Reference Pattern**: See existing worker handler in `worker/index.ts`

**Validation**: Test with curl commands

#### Step 7: Integrate Routes in Worker

**Goal**: Connect API handlers to worker

**Files to Create/Modify**:
- `worker/index.ts` - Add routing for `/api/contacts`

**Pseudocode Approach**:
```typescript
if (url.pathname.startsWith('/api/contacts')) {
  return handleContactRequest(request, env);
}
```

**Validation**: Routes respond correctly

#### Step 8: Create React Component

**Goal**: Build user interface

**Files to Create/Modify**:
- `examples/database/d1-contact-form/ContactForm.tsx` - Full component with form and list

**Pseudocode Approach**:
```typescript
function ContactForm() {
  // 1. Form state management
  // 2. Validation logic
  // 3. Submit handler (POST to API)
  // 4. Fetch and display contacts
  // 5. Delete handler
}
```

**Reference Pattern**: React 19 hooks pattern (useState, useEffect)

**Validation**: Component renders without errors

#### Step 9: Integrate Component

**Goal**: Add component to app

**Files to Create/Modify**:
- `src/App.tsx` - Import and render ContactForm

**Validation**: Form appears in browser

### Error Handling Strategy

- **Client-side errors**: Display error messages in UI, prevent form submission
- **Server-side errors**: Return structured JSON errors with appropriate HTTP status codes
- **Validation errors**: Return 400 Bad Request with descriptive messages
- **Network errors**: Catch fetch errors and display user-friendly messages
- **Database errors**: Log to console, return generic error to client (don't expose internals)

### Edge Cases

1. **Edge Case**: Duplicate email submissions
   - **Solution**: Allow duplicates (multiple submissions from same email are valid for contact forms)

2. **Edge Case**: Very long messages
   - **Solution**: Enforce 5000 character limit on both client and server

3. **Edge Case**: SQL injection attempts
   - **Solution**: Use parameterized queries exclusively (`.bind()`)

4. **Edge Case**: Empty database (no contacts)
   - **Solution**: Display "No contacts yet" message

5. **Edge Case**: Pagination beyond available records
   - **Solution**: Return empty array with total count

6. **Edge Case**: Invalid contact ID (non-numeric, negative)
   - **Solution**: Validate with parseInt, return 400 Bad Request

7. **Edge Case**: Database unavailable
   - **Solution**: Catch errors, return 500 Internal Server Error

## Testing Strategy

### Unit Tests

- **Coverage Target**: Core validation and type conversion functions
- **Key Test Cases**:
  - `validateEmail()` with valid/invalid emails
  - `validateContactRequest()` with various inputs
  - `rowToContact()` date conversion
- **Mock Strategy**: Mock D1 database responses

### Integration Tests

- **Test Scenarios**:
  - Complete flow: Create → List → Get → Delete
  - Pagination with various limit/offset values
  - Error responses for invalid inputs
- **Setup Required**: Local D1 database with test data

### Manual Testing Checklist

- [ ] Submit form with valid data
- [ ] Submit form with missing fields (should show validation errors)
- [ ] Submit form with invalid email (should show error)
- [ ] Submit form with very long message (should enforce limit)
- [ ] View list of contacts
- [ ] Delete a contact
- [ ] Test pagination with many contacts
- [ ] Verify SQL injection prevention (try malicious inputs)
- [ ] Test on both local and production environments
- [ ] Verify timestamps are correct

## Validation Gates

### Pre-Implementation Validation

```bash
# Ensure Wrangler is installed
wrangler --version

# Verify D1 is available
wrangler d1 --help

# Check Node version
node --version  # Should be 18+
```

### During Implementation Validation

```bash
# Type checking (run after each step)
npm run build

# Generate types after D1 configuration
npm run cf-typegen

# Test worker locally
npm run dev
```

### Post-Implementation Validation

```bash
# Build succeeds
npm run build

# Deploy to production
npm run deploy

# Test API endpoints
curl -X POST https://your-worker.workers.dev/api/contacts \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","message":"Test message"}'
```

### Manual Validation Steps

1. Open browser to development URL
2. Fill out and submit contact form
3. Verify contact appears in list below
4. Delete a contact
5. Verify contact is removed from list
6. Check browser console for errors
7. Verify network requests in DevTools

## Dependencies

### New Dependencies (if any)

None - uses existing dependencies (React, TypeScript, Cloudflare Workers runtime)

### Version Compatibility

- **Node**: 18.x or higher
- **Wrangler**: 3.x or higher
- **React**: 19.x
- **TypeScript**: 5.x

## Migration & Rollout

### Database Migrations

1. **Local Development**:
   ```bash
   npx wrangler d1 migrations apply contacts-db --local
   ```

2. **Production**:
   ```bash
   npx wrangler d1 migrations apply contacts-db
   ```

### Feature Flags (if applicable)

Not applicable - this is an example feature, not a gradual rollout

### Rollout Plan

1. Create and configure D1 database
2. Run migrations on local environment
3. Test locally with `npm run dev`
4. Run migrations on production database
5. Deploy worker with `npm run deploy`
6. Test production endpoints
7. Monitor for errors

## Success Criteria

- [ ] All validation gates pass
- [ ] Contact form submits successfully
- [ ] Contacts appear in list
- [ ] Delete functionality works
- [ ] No TypeScript errors
- [ ] No SQL injection vulnerabilities
- [ ] Build succeeds
- [ ] API endpoints return proper JSON
- [ ] Error handling provides user-friendly messages
- [ ] Code follows existing conventions
- [ ] Documentation is complete
- [ ] Local and production databases work correctly

## Known Limitations

1. **No Authentication**: Anyone can submit, view, and delete contacts (add auth for production)
2. **No Rate Limiting**: Could be abused with spam (add rate limiting for production)
3. **No Email Notifications**: Contacts are stored but not sent via email
4. **Basic Styling**: Uses inline styles for simplicity (replace with CSS/Tailwind)
5. **No Search**: Can't search contacts by name or email
6. **No Export**: Can't export contacts to CSV/Excel

## References

### Internal Documentation

- `CLAUDE.md` - Project guidelines and conventions
- `README.md` - Project setup instructions
- `wrangler.jsonc` - Worker configuration

### External Resources

- [Cloudflare D1 Documentation](https://developers.cloudflare.com/d1/)
- [D1 Client API Reference](https://developers.cloudflare.com/d1/platform/client-api/)
- [Wrangler D1 Commands](https://developers.cloudflare.com/workers/wrangler/commands/#d1)
- [SQLite SQL Reference](https://www.sqlite.org/lang.html)
- [React 19 Documentation](https://react.dev/)

## Appendix

### Code Snippets from Research

```typescript
// D1 Prepared Statement Pattern
const result = await env.DB.prepare(
  'INSERT INTO table (column) VALUES (?)'
)
  .bind(value)
  .run();

// Getting last inserted ID
const lastId = result.meta.last_row_id;

// Fetching all results
const { results } = await env.DB.prepare(
  'SELECT * FROM table'
).all();

// Fetching single result
const row = await env.DB.prepare(
  'SELECT * FROM table WHERE id = ?'
)
  .bind(id)
  .first();
```

### Additional Notes

- This example prioritizes simplicity and clarity over advanced features
- It demonstrates fundamental D1 patterns that can be extended for more complex use cases
- Consider adding authentication, rate limiting, and email notifications for production use
- The example uses inline styles for portability; replace with your preferred styling solution
