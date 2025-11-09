# Product Requirement Plan: KV Session Management

## Metadata

- **Feature**: Session Management with Cloudflare KV
- **Target Completion**: 2-3 hours
- **Confidence Score**: 8/10 - Well-documented pattern but requires careful security considerations
- **Created**: 2025-11-09

## Executive Summary

A production-ready session management system using Cloudflare KV for storage. Includes authentication flow, secure cookie handling, React Context provider for global auth state, and middleware for protecting endpoints. This example demonstrates best practices for session management including security considerations, automatic expiration, and proper cookie configuration.

## Research Findings

### Codebase Analysis

#### Similar Patterns Found

- **Pattern**: Worker API Handler
  - **Location**: `worker/index.ts:1-12`
  - **Description**: Basic worker with URL routing pattern
  - **Relevance**: Foundation for adding auth API routes

- **Pattern**: TypeScript Configuration
  - **Location**: `tsconfig.worker.json`
  - **Description**: Worker-specific TypeScript config
  - **Relevance**: Ensures types work correctly for KV operations

- **Pattern**: React Context Pattern
  - **Location**: React 19 documentation
  - **Description**: Global state management with Context API
  - **Relevance**: Used for SessionProvider implementation

#### Existing Conventions

- **Convention**: Response.json for API responses
  - **Example**: `worker/index.ts:6-8`
  - **Application**: Use Response.json for all auth API responses

- **Convention**: URL pathname matching for routes
  - **Example**: `url.pathname.startsWith("/api/")`
  - **Application**: Route auth endpoints under `/api/auth`

#### Test Patterns

- **Test Framework**: Not currently configured
- **Pattern**: Manual testing via curl with cookie handling
- **Location**: Development workflow

### External Research

#### Documentation References

- **Resource**: Cloudflare KV
  - **URL**: https://developers.cloudflare.com/kv/
  - **Key Sections**: API, TTL, Best Practices
  - **Version**: Latest (Workers runtime)
  - **Gotchas**: Eventually consistent; use for read-heavy workloads

- **Resource**: Workers Sessions Pattern
  - **URL**: https://developers.cloudflare.com/workers/examples/sessions/
  - **Key Sections**: Cookie handling, Session storage
  - **Version**: Latest
  - **Gotchas**: Must use HttpOnly cookies for security

- **Resource**: HTTP Cookies (MDN)
  - **URL**: https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies
  - **Key Sections**: Security, SameSite, HttpOnly
  - **Version**: Latest
  - **Gotchas**: SameSite=Strict may break legitimate cross-site flows

#### Implementation Examples

- **Example**: Cloudflare Workers Sessions
  - **Source**: Cloudflare documentation
  - **Relevance**: Pattern for secure cookie handling
  - **Cautions**: Must include all security flags (HttpOnly, Secure, SameSite)

- **Example**: React Authentication Context
  - **Source**: React patterns
  - **Relevance**: Global auth state management
  - **Cautions**: Don't store sensitive data in context (it's not encrypted)

#### Best Practices

- **Practice**: HttpOnly Cookies
  - **Why**: Prevents XSS attacks by making cookies inaccessible to JavaScript
  - **How**: Set httpOnly: true in cookie options
  - **Warning**: Never store sensitive session data in localStorage

- **Practice**: Secure Session IDs
  - **Why**: Prevents session hijacking
  - **How**: Use crypto.getRandomValues() for session ID generation
  - **Warning**: Don't use predictable session IDs (timestamps, sequential numbers)

- **Practice**: Session Expiration
  - **Why**: Limits window of opportunity for stolen sessions
  - **How**: Use KV TTL for automatic cleanup
  - **Warning**: Balance security with user experience (not too short)

- **Practice**: Password Security (for production)
  - **Why**: Protects user credentials
  - **How**: Always hash passwords (bcrypt, scrypt, Argon2)
  - **Warning**: NEVER store plain-text passwords

## Technical Specification

### Architecture Overview

```
┌──────────────┐    Login     ┌──────────────┐   Session    ┌──────────┐
│    React     │ ──────────> │    Worker    │ ──────────>  │    KV    │
│ SessionProvider│ <────────── │   Endpoints  │ <──────────  │ Storage  │
│              │   Set-Cookie │              │   Get/Put    │          │
└──────────────┘              └──────────────┘              └──────────┘
                                      │
                                      │ Middleware
                                      ▼
                              ┌──────────────┐
                              │  Protected   │
                              │  Endpoints   │
                              └──────────────┘

Flow:
1. User submits login form → POST /api/auth/login
2. Worker validates credentials
3. Worker creates session ID and stores in KV
4. Worker sends Set-Cookie header with session ID
5. Browser includes cookie in subsequent requests
6. Worker validates session from cookie
7. Protected endpoints check for valid session
```

### Component Breakdown

#### Component 1: TypeScript Types

- **Purpose**: Define session, user, and API response types
- **Location**: `examples/database/kv-sessions/types.ts`
- **Dependencies**: None
- **Interface**: Exported interfaces, validation functions, cookie helpers

#### Component 2: Session Middleware

- **Purpose**: Session management class for worker operations
- **Location**: `examples/database/kv-sessions/worker-middleware.ts`
- **Dependencies**: Types, KV binding
- **Interface**: SessionManager class with CRUD operations

#### Component 3: Worker API Endpoints

- **Purpose**: Handle login, logout, and session retrieval
- **Location**: `examples/database/kv-sessions/worker-endpoints.ts`
- **Dependencies**: Types, Middleware, KV binding
- **Interface**: Request handlers and router function

#### Component 4: React Session Provider

- **Purpose**: Global authentication state management
- **Location**: `examples/database/kv-sessions/SessionProvider.tsx`
- **Dependencies**: Types, Worker API
- **Interface**: React Context Provider component

#### Component 5: useSession Hook

- **Purpose**: Easy access to session context
- **Location**: `examples/database/kv-sessions/useSession.ts`
- **Dependencies**: SessionProvider
- **Interface**: Custom React hook + example components

### Data Models

```typescript
// User (application model)
interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
}

// Session data (stored in KV)
interface SessionData {
  userId: string;
  email: string;
  name: string;
  createdAt: string; // ISO string
  expiresAt: string;
}

// Session (API model)
interface Session {
  sessionId: string;
  user: User;
  expiresAt: Date;
}

// Login request
interface LoginRequest {
  email: string;
  password: string;
}

// Session configuration
interface SessionConfig {
  cookieName: string;
  sessionTTL: number;
  cookieOptions: {
    httpOnly: boolean;
    secure: boolean;
    sameSite: 'strict' | 'lax' | 'none';
    path: string;
  };
}
```

### API Endpoints

- **Endpoint**: `POST /api/auth/login`
  - **Purpose**: Authenticate user and create session
  - **Request**: `{ email, password }`
  - **Response**: `{ success: true, data: Session }` + Set-Cookie header
  - **Authentication**: None (public endpoint)

- **Endpoint**: `POST /api/auth/logout`
  - **Purpose**: Destroy session
  - **Request**: Session cookie
  - **Response**: `{ success: true, message }` + Clear-Cookie header
  - **Authentication**: Optional (works with or without session)

- **Endpoint**: `GET /api/auth/session`
  - **Purpose**: Get current session
  - **Request**: Session cookie
  - **Response**: `{ success: true, data: Session }` or 401
  - **Authentication**: Required (session cookie)

## Implementation Blueprint

### Prerequisites

1. Cloudflare account with Workers enabled
2. Wrangler CLI installed
3. Node.js 18+ and npm
4. Project set up with Vite + React + TypeScript

### Implementation Steps (in order)

#### Step 1: Create KV Namespace

**Goal**: Provision a KV namespace in Cloudflare

**Commands**:
```bash
npx wrangler kv namespace create SESSIONS
npx wrangler kv namespace create SESSIONS --preview
```

**Files to Create/Modify**:
- `wrangler.jsonc` - Add KV binding configuration

**Validation**: Namespace IDs appear in wrangler output

#### Step 2: Configure KV Binding

**Goal**: Connect KV namespace to the worker

**Files to Create/Modify**:
- `wrangler.jsonc` - Add `[[kv_namespaces]]` section

**Pseudocode Approach**:
```jsonc
{
  "kv_namespaces": [
    {
      "binding": "SESSIONS",
      "id": "xxxxx",
      "preview_id": "yyyyy"
    }
  ]
}
```

**Validation**: `npm run cf-typegen` succeeds and generates SESSIONS types

#### Step 3: Create TypeScript Types

**Goal**: Define all session-related types

**Files to Create/Modify**:
- `examples/database/kv-sessions/types.ts` - All interfaces and helpers

**Reference Pattern**: Standard TypeScript interface patterns

**Validation**: No TypeScript errors, types export correctly

#### Step 4: Implement Session Middleware

**Goal**: Create SessionManager class

**Files to Create/Modify**:
- `examples/database/kv-sessions/worker-middleware.ts` - SessionManager class

**Pseudocode Approach**:
```typescript
class SessionManager {
  // 1. Parse cookies from request
  // 2. Get session from KV
  // 3. Validate expiration
  // 4. Create new sessions with crypto-secure IDs
  // 5. Store in KV with TTL
  // 6. Generate Set-Cookie headers
}
```

**Validation**: Class methods work correctly

#### Step 5: Implement Worker API Endpoints

**Goal**: Create login, logout, and session endpoints

**Files to Create/Modify**:
- `examples/database/kv-sessions/worker-endpoints.ts` - All endpoint handlers

**Pseudocode Approach**:
```typescript
async function login(request, env) {
  // 1. Validate credentials (mock for now)
  // 2. Create session with SessionManager
  // 3. Return JSON + Set-Cookie header
}
```

**Reference Pattern**: See existing worker handler in `worker/index.ts`

**Validation**: Test with curl commands

#### Step 6: Integrate Routes in Worker

**Goal**: Connect auth handlers to worker

**Files to Create/Modify**:
- `worker/index.ts` - Add routing for `/api/auth`

**Pseudocode Approach**:
```typescript
if (url.pathname.startsWith('/api/auth')) {
  return handleAuthRequest(request, env);
}
```

**Validation**: Routes respond correctly

#### Step 7: Create React SessionProvider

**Goal**: Global auth state management

**Files to Create/Modify**:
- `examples/database/kv-sessions/SessionProvider.tsx` - Context provider

**Pseudocode Approach**:
```typescript
function SessionProvider({ children }) {
  // 1. Manage session state
  // 2. Fetch session on mount
  // 3. Provide login/logout functions
  // 4. Handle loading and error states
  // 5. Provide context value
}
```

**Reference Pattern**: React 19 Context API

**Validation**: Provider renders without errors

#### Step 8: Create useSession Hook

**Goal**: Easy access to session context

**Files to Create/Modify**:
- `examples/database/kv-sessions/useSession.ts` - Hook and example components

**Pseudocode Approach**:
```typescript
function useSession() {
  // 1. Get context
  // 2. Throw if used outside provider
  // 3. Return context value
}
```

**Validation**: Hook works in components

#### Step 9: Integrate SessionProvider

**Goal**: Add provider to app root

**Files to Create/Modify**:
- `src/main.tsx` - Wrap app with SessionProvider

**Validation**: Session state available throughout app

### Error Handling Strategy

- **Client-side errors**: Display in UI, maintain user session state
- **Server-side errors**: Return structured JSON errors with appropriate status codes
- **Validation errors**: Return 400 Bad Request for invalid credentials
- **Network errors**: Catch fetch errors and display user-friendly messages
- **Session errors**: Clear session and redirect to login
- **Cookie errors**: Log and return generic error (don't expose cookie details)

### Edge Cases

1. **Edge Case**: Expired session
   - **Solution**: Check expiration before returning session; auto-delete if expired

2. **Edge Case**: Invalid session ID
   - **Solution**: Return null session (treat as logged out)

3. **Edge Case**: Concurrent logins
   - **Solution**: Allow multiple sessions per user (each gets unique session ID)

4. **Edge Case**: Session revocation
   - **Solution**: Delete from KV; cookie becomes invalid

5. **Edge Case**: Cookie blocked by browser
   - **Solution**: Display message to enable cookies

6. **Edge Case**: XSS attempts to read cookies
   - **Solution**: HttpOnly flag prevents JavaScript access

7. **Edge Case**: CSRF attacks
   - **Solution**: SameSite cookie attribute provides protection

## Testing Strategy

### Unit Tests

- **Coverage Target**: Core session management functions
- **Key Test Cases**:
  - Session creation and validation
  - Cookie parsing and serialization
  - Session ID generation (randomness)
  - Expiration checking
- **Mock Strategy**: Mock KV namespace responses

### Integration Tests

- **Test Scenarios**:
  - Complete auth flow: Login → Get Session → Logout
  - Session expiration handling
  - Invalid credentials handling
  - Cookie handling across requests
- **Setup Required**: Local KV namespace

### Manual Testing Checklist

- [ ] Login with valid credentials
- [ ] Login with invalid credentials (should fail)
- [ ] Session persists across page refreshes
- [ ] Logout clears session
- [ ] Session expires after TTL
- [ ] Protected endpoints reject unauthenticated requests
- [ ] Protected endpoints accept authenticated requests
- [ ] Cookies have correct security flags (HttpOnly, Secure, SameSite)
- [ ] Test on both local and production environments

## Validation Gates

### Pre-Implementation Validation

```bash
# Ensure Wrangler is installed
wrangler --version

# Verify KV is available
wrangler kv --help

# Check Node version
node --version  # Should be 18+
```

### During Implementation Validation

```bash
# Type checking (run after each step)
npm run build

# Generate types after KV configuration
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

# Test login endpoint
curl -X POST https://your-worker.workers.dev/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@example.com","password":"password123"}' \
  -c cookies.txt \
  -v
```

### Manual Validation Steps

1. Open browser to development URL
2. Login with demo credentials
3. Verify session appears in React DevTools
4. Refresh page - verify session persists
5. Logout and verify session is cleared
6. Check browser DevTools:
   - Network tab: verify Set-Cookie headers
   - Application tab: verify cookie properties
7. Verify protected endpoints work when logged in

## Dependencies

### New Dependencies (if any)

None for basic implementation.

For production, consider:
```json
{
  "dependencies": {
    "bcryptjs": "^2.4.3"  // For password hashing
  }
}
```

### Version Compatibility

- **Node**: 18.x or higher
- **Wrangler**: 3.x or higher
- **React**: 19.x
- **TypeScript**: 5.x

## Migration & Rollout

### Database Migrations (if applicable)

Not applicable for KV-only implementation.

For production with D1 user storage:
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Feature Flags (if applicable)

Not applicable - this is an example feature

### Rollout Plan

1. Create and configure KV namespace
2. Test locally with `npm run dev`
3. Deploy worker with `npm run deploy`
4. Test production endpoints
5. Monitor session creation/deletion in KV dashboard
6. Check for errors in Workers logs

## Success Criteria

- [ ] All validation gates pass
- [ ] Login creates session successfully
- [ ] Session cookie is set with correct flags
- [ ] Session persists across requests
- [ ] Logout clears session
- [ ] Protected endpoints require authentication
- [ ] No TypeScript errors
- [ ] Build succeeds
- [ ] Cookies are HttpOnly, Secure, and SameSite
- [ ] Session expires automatically (TTL)
- [ ] Code follows existing conventions
- [ ] Documentation is complete
- [ ] Local and production environments work correctly

## Known Limitations

1. **Mock Authentication**: Uses hardcoded users (replace with D1 + password hashing for production)
2. **No Rate Limiting**: Vulnerable to brute-force (add rate limiting for production)
3. **No CSRF Tokens**: Relies only on SameSite cookies (consider CSRF tokens for sensitive operations)
4. **No Email Verification**: Users aren't verified (add for production)
5. **No Password Reset**: Can't reset forgotten passwords
6. **No Remember Me**: Fixed 7-day expiration (could add optional long-lived sessions)
7. **No Session Revocation**: Can't revoke all sessions for a user
8. **Eventually Consistent**: KV is eventually consistent (may see stale data briefly)

## References

### Internal Documentation

- `CLAUDE.md` - Project guidelines and conventions
- `README.md` - Project setup instructions
- `wrangler.jsonc` - Worker configuration

### External Resources

- [Cloudflare KV Documentation](https://developers.cloudflare.com/kv/)
- [Workers Sessions Example](https://developers.cloudflare.com/workers/examples/sessions/)
- [HTTP Cookie Security (MDN)](https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies)
- [React Context API](https://react.dev/reference/react/useContext)
- [OWASP Session Management](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html)

## Appendix

### Code Snippets from Research

```typescript
// Secure session ID generation
const array = new Uint8Array(16);
crypto.getRandomValues(array);
const sessionId = Array.from(array, byte =>
  byte.toString(16).padStart(2, '0')
).join('');

// KV operations with TTL
await env.KV.put(key, value, {
  expirationTtl: 604800 // 7 days
});

// Cookie parsing
const cookies = cookieHeader
  .split(';')
  .reduce((acc, cookie) => {
    const [name, value] = cookie.trim().split('=');
    acc[name] = decodeURIComponent(value);
    return acc;
  }, {});

// Secure cookie serialization
const cookie = [
  `${name}=${encodeURIComponent(value)}`,
  `Max-Age=${maxAge}`,
  'HttpOnly',
  'Secure',
  'SameSite=Lax',
  `Path=${path}`
].join('; ');
```

### Additional Notes

- This example prioritizes simplicity and education over production features
- It demonstrates fundamental session management patterns for Cloudflare Workers
- For production, add password hashing, rate limiting, CSRF protection, and user database
- Consider using established authentication libraries for production applications
- Monitor KV usage and costs if expecting high traffic
