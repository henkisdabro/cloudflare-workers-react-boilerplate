# Product Requirement Plan: [Authentication Feature Name]

> **Template Type**: Authentication Feature PRP
>
> This template extends `prp_base.md` with authentication and security-specific sections.
> Use this for features involving user authentication, authorization, sessions, or security.

## Metadata

- **Feature**: [Feature name]
- **Auth Type**: [Session-based / Token-based / OAuth / Other]
- **Target Completion**: [Timeline estimate]
- **Confidence Score**: [1-10] - Likelihood of one-pass implementation success
- **Created**: [Date]

## Executive Summary

[2-3 sentences describing what this authentication feature does and why it's valuable]

## Security Model

### Threat Model

**Assets to Protect**:
- [User credentials]
- [Session tokens]
- [User data]
- [API endpoints]

**Threats**:
- ⚠️ **Brute Force Attacks**: [Mitigation strategy]
- ⚠️ **Credential Stuffing**: [Mitigation strategy]
- ⚠️ **Session Hijacking**: [Mitigation strategy]
- ⚠️ **XSS (Cross-Site Scripting)**: [Mitigation strategy]
- ⚠️ **CSRF (Cross-Site Request Forgery)**: [Mitigation strategy]
- ⚠️ **SQL Injection**: [Mitigation strategy]
- ⚠️ **Man-in-the-Middle**: [Mitigation strategy]

### Security Controls

**Implemented Controls**:
- ✅ **Password Hashing**: [Algorithm used - bcrypt, scrypt, Argon2]
- ✅ **Secure Cookies**: HttpOnly, Secure, SameSite flags
- ✅ **Rate Limiting**: [Strategy and limits]
- ✅ **Input Validation**: Server-side validation of all inputs
- ✅ **HTTPS Only**: Enforce secure connections
- ✅ **Session Expiration**: Automatic timeout
- ✅ **Password Requirements**: [Minimum length, complexity]

**Future Enhancements**:
- [ ] Two-factor authentication (2FA)
- [ ] Account lockout after failed attempts
- [ ] Email verification
- [ ] Password reset flow
- [ ] Device fingerprinting
- [ ] Anomaly detection

### Compliance Considerations

**GDPR** (if applicable):
- [ ] User consent for data collection
- [ ] Right to data deletion
- [ ] Data portability
- [ ] Privacy policy

**Other Regulations**:
- [List any other relevant regulations: CCPA, HIPAA, etc.]

## Authentication Flow

### User Registration Flow

```
1. User submits registration form
   ↓
2. Validate email format and password strength
   ↓
3. Check if email already exists
   ↓
4. Hash password (never store plain text!)
   ↓
5. Create user record in database
   ↓
6. [Optional] Send verification email
   ↓
7. Create session or return success
```

**Endpoints**:
- `POST /api/auth/register`

**Security Considerations**:
- Email validation
- Password strength requirements
- Rate limiting on registration
- Email uniqueness check
- CAPTCHA (if needed)

### Login Flow

```
1. User submits credentials
   ↓
2. Validate input format
   ↓
3. Look up user by email
   ↓
4. Compare password hash
   ↓
5. [If invalid] Return generic error
   ↓
6. [If valid] Create session
   ↓
7. Set secure cookie
   ↓
8. Return user data
```

**Endpoints**:
- `POST /api/auth/login`

**Security Considerations**:
- Generic error messages (don't reveal if email exists)
- Rate limiting per IP
- Account lockout after N failed attempts
- Timing attack prevention (constant-time comparison)
- Secure session ID generation

### Logout Flow

```
1. User initiates logout
   ↓
2. Get session ID from cookie
   ↓
3. Delete session from storage
   ↓
4. Clear cookie
   ↓
5. Return success
```

**Endpoints**:
- `POST /api/auth/logout`

**Security Considerations**:
- Delete session from storage (not just cookie)
- Clear all session data
- Optional: Invalidate all user sessions

### Session Validation Flow

```
1. Request includes session cookie
   ↓
2. Extract session ID
   ↓
3. Look up session in storage
   ↓
4. Check expiration
   ↓
5. [If expired] Delete and return unauthorized
   ↓
6. [If valid] Return session data
   ↓
7. [Optional] Extend session TTL
```

**Used By**: Protected endpoints

**Security Considerations**:
- Validate session on every request
- Check expiration
- Session refresh strategy
- Detect session anomalies (IP changes, etc.)

### Password Reset Flow (if applicable)

```
1. User requests password reset
   ↓
2. Generate unique reset token
   ↓
3. Store token with expiration (15-60 min)
   ↓
4. Send email with reset link
   ↓
5. User clicks link with token
   ↓
6. Validate token and expiration
   ↓
7. User submits new password
   ↓
8. Hash and update password
   ↓
9. Invalidate reset token
   ↓
10. Invalidate all existing sessions
   ↓
11. Return success
```

**Endpoints**:
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`

**Security Considerations**:
- Short-lived tokens (15-60 minutes)
- One-time use tokens
- Rate limiting on reset requests
- Invalidate all sessions on password change

## Authorization Rules

### Role-Based Access Control (if applicable)

**Roles**:
- **User**: [Permissions]
- **Admin**: [Permissions]
- **[Custom Role]**: [Permissions]

**Implementation**:
```typescript
interface User {
  id: string;
  email: string;
  role: 'user' | 'admin' | 'custom';
}

function hasPermission(user: User, permission: string): boolean {
  // Permission check logic
}
```

### Resource-Based Authorization

**Pattern**:
```typescript
// User can only access their own resources
if (resource.userId !== session.user.id) {
  return Response.json({ error: 'Forbidden' }, { status: 403 });
}
```

**Protected Resources**:
- [Resource 1]: [Who can access]
- [Resource 2]: [Who can access]

## Session Management

### Session Storage

**Storage Type**: [KV / D1 / Other]

**Session Structure**:
```typescript
interface SessionData {
  userId: string;
  email: string;
  role: string;
  createdAt: string;
  expiresAt: string;
  ipAddress?: string;  // Optional: for anomaly detection
  userAgent?: string;  // Optional: for device tracking
}
```

**Key Pattern**:
```
session:[sessionId]
```

### Session Configuration

**Settings**:
```typescript
{
  sessionTTL: 60 * 60 * 24 * 7,  // 7 days (in seconds)
  cookieName: 'session_id',
  cookieOptions: {
    httpOnly: true,    // Prevent JavaScript access
    secure: true,      // HTTPS only
    sameSite: 'lax',   // CSRF protection
    path: '/',
  },
}
```

**Security Rationale**:
- **HttpOnly**: Prevents XSS attacks
- **Secure**: Ensures HTTPS
- **SameSite**: CSRF protection
- **TTL**: Limits exposure window

### Session ID Generation

**Method**: Cryptographically secure random

**Implementation**:
```typescript
function generateSessionId(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, byte =>
    byte.toString(16).padStart(2, '0')
  ).join('');
}
```

**Requirements**:
- Minimum 128 bits of entropy
- Unpredictable
- Unique per session

### Session Expiration

**Strategy**: [Absolute / Sliding / Both]

**Absolute Expiration**: Session expires at a fixed time after creation

**Sliding Expiration**: Session extends on each request (extends TTL)

**Implementation**:
```typescript
// Check expiration
if (new Date(session.expiresAt) < new Date()) {
  await deleteSession(sessionId);
  return null;
}

// [Optional] Extend session on activity
if (useSlidingExpiration) {
  session.expiresAt = new Date(Date.now() + sessionTTL * 1000);
  await updateSession(sessionId, session);
}
```

## Token Strategy (if using JWT or similar)

### Token Type

**Type**: [JWT / Opaque Token / Other]

**Storage**: [Cookie / LocalStorage / SessionStorage / Header]

**⚠️ Security Warning**: Never store tokens in localStorage if they contain sensitive data (vulnerable to XSS)

### JWT Configuration (if applicable)

**Structure**:
```typescript
interface JWTPayload {
  sub: string;      // Subject (user ID)
  email: string;
  role: string;
  iat: number;      // Issued at
  exp: number;      // Expiration
  iss: string;      // Issuer
}
```

**Signing Algorithm**: [HS256 / RS256 / ES256]

**Secret Management**:
- Store secret in [Cloudflare environment variables / Secrets]
- Rotate secrets periodically
- Use strong, random secrets (minimum 256 bits)

**Token Validation**:
- Verify signature
- Check expiration
- Validate issuer
- Validate audience (if used)

## Password Security

### Password Requirements

**Minimum Requirements**:
- Minimum length: [8-16 characters]
- Maximum length: [100-200 characters]
- Must contain: [Uppercase, lowercase, numbers, special characters]
- Cannot contain: [Common passwords, user's email]

**Validation**:
```typescript
function validatePassword(password: string): boolean {
  const minLength = 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*]/.test(password);

  return (
    password.length >= minLength &&
    hasUppercase &&
    hasLowercase &&
    hasNumber &&
    hasSpecial
  );
}
```

### Password Hashing

**Algorithm**: [bcrypt / scrypt / Argon2]

**Configuration**:
```typescript
// Example for bcrypt
const saltRounds = 10;  // Cost factor
const hash = await bcrypt.hash(password, saltRounds);
const isValid = await bcrypt.compare(password, hash);
```

**⚠️ NEVER**:
- Store passwords in plain text
- Log passwords
- Send passwords in responses
- Use weak hashing (MD5, SHA1)

### Password Storage

**Database Schema**:
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,  -- Hashed password only!
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## Rate Limiting

### Rate Limit Strategy

**Sensitive Endpoints**:

| Endpoint | Limit | Window | Key |
|----------|-------|--------|-----|
| POST /api/auth/login | 5 attempts | 15 min | IP address |
| POST /api/auth/register | 3 attempts | 1 hour | IP address |
| POST /api/auth/forgot-password | 3 attempts | 1 hour | Email |

**Implementation Approach**:
```typescript
async function checkRateLimit(
  env: Env,
  key: string,
  limit: number,
  windowSeconds: number
): Promise<boolean> {
  const rateLimitKey = `ratelimit:${key}`;
  const current = await env.KV.get(rateLimitKey);

  if (!current) {
    await env.KV.put(rateLimitKey, '1', { expirationTtl: windowSeconds });
    return true;  // Allow
  }

  const count = parseInt(current);
  if (count >= limit) {
    return false;  // Block
  }

  await env.KV.put(rateLimitKey, String(count + 1), {
    expirationTtl: windowSeconds,
  });
  return true;  // Allow
}
```

**Storage**: [KV with TTL]

### Lockout Strategy

**Account Lockout**:
- After [5] failed login attempts
- Lockout duration: [15 minutes]
- Notify user via email
- Require password reset (optional)

## Security Testing Checklist

### Authentication Tests

- [ ] Cannot login with invalid credentials
- [ ] Cannot login with wrong password
- [ ] Cannot login with non-existent email
- [ ] Password comparison is constant-time
- [ ] Passwords are never logged
- [ ] Passwords are never returned in responses
- [ ] Rate limiting blocks brute force attempts

### Session Tests

- [ ] Session cookies have HttpOnly flag
- [ ] Session cookies have Secure flag (HTTPS)
- [ ] Session cookies have SameSite flag
- [ ] Sessions expire after TTL
- [ ] Expired sessions are rejected
- [ ] Session IDs are unpredictable
- [ ] Session IDs are sufficiently long

### Authorization Tests

- [ ] Protected endpoints reject unauthenticated requests
- [ ] Users cannot access other users' resources
- [ ] Role-based access controls work correctly
- [ ] Tampering with session data is detected

### Security Vulnerability Tests

- [ ] XSS attempts are prevented (HttpOnly cookies)
- [ ] CSRF attempts are prevented (SameSite cookies)
- [ ] SQL injection attempts are prevented (parameterized queries)
- [ ] Timing attacks are mitigated (constant-time comparison)
- [ ] Session hijacking is difficult (secure, random IDs)

## Research Findings

### Codebase Analysis

#### Similar Patterns Found

- **Pattern**: [Pattern name]
  - **Location**: `path/to/file.ts:line`
  - **Description**: [What this pattern does]
  - **Relevance**: [Why this is useful for the current feature]

### External Research

#### Documentation References

- **Resource**: [OWASP Authentication Cheat Sheet]
  - **URL**: https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html
  - **Key Sections**: Password storage, session management
  - **Gotchas**: [Known issues or quirks]

- **Resource**: [Cloudflare Workers Sessions]
  - **URL**: https://developers.cloudflare.com/workers/examples/sessions/
  - **Key Sections**: Cookie handling
  - **Gotchas**: [Known issues or quirks]

#### Best Practices

- **Practice**: Password Hashing
  - **Why**: Protects credentials even if database is compromised
  - **How**: Use bcrypt, scrypt, or Argon2 with appropriate cost factors
  - **Warning**: NEVER use MD5, SHA1, or plain SHA256 for passwords

- **Practice**: HttpOnly Cookies
  - **Why**: Prevents JavaScript access to session tokens (XSS protection)
  - **How**: Set httpOnly: true in cookie options
  - **Warning**: Cannot be read by client-side JavaScript (by design)

- **Practice**: Rate Limiting
  - **Why**: Prevents brute force and credential stuffing attacks
  - **How**: Use KV to track attempts per IP/email
  - **Warning**: Consider legitimate users (don't be too restrictive)

## Technical Specification

### Architecture Overview

```
┌─────────────┐    Login     ┌──────────────┐   Validate   ┌─────────────┐
│   React     │ ──────────>  │    Worker    │ ──────────>  │  Database   │
│   Client    │              │   Auth API   │              │  (D1/KV)    │
│             │ <──────────  │              │ <──────────  │             │
│             │  Set-Cookie  │              │  User Data   │             │
└─────────────┘              └──────────────┘              └─────────────┘
                                     │
                                     │ Middleware
                                     ▼
                             ┌──────────────┐
                             │  Protected   │
                             │  Endpoints   │
                             └──────────────┘
```

### Component Breakdown

#### Component 1: Authentication Middleware

- **Purpose**: Validate sessions and protect endpoints
- **Location**: `path/to/auth-middleware.ts`
- **Dependencies**: Session storage (KV)
- **Interface**: `requireAuth()`, `getOptionalSession()`

#### Component 2: Password Manager

- **Purpose**: Hash and verify passwords
- **Location**: `path/to/password.ts`
- **Dependencies**: [bcrypt / scrypt library]
- **Interface**: `hashPassword()`, `verifyPassword()`

#### Component 3: Session Manager

- **Purpose**: Create, validate, and destroy sessions
- **Location**: `path/to/session.ts`
- **Dependencies**: KV namespace
- **Interface**: `createSession()`, `validateSession()`, `destroySession()`

### Data Models

```typescript
interface User {
  id: string;
  email: string;
  passwordHash: string;  // Never expose this!
  role: 'user' | 'admin';
  createdAt: Date;
}

interface Session {
  sessionId: string;
  userId: string;
  expiresAt: Date;
}

interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}
```

### API Endpoints

- **Endpoint**: `POST /api/auth/register`
  - **Purpose**: Create new user account
  - **Request**: `{ email, password, name }`
  - **Response**: `{ success: true, data: Session }`
  - **Authentication**: None (public)
  - **Rate Limit**: 3 per hour per IP

- **Endpoint**: `POST /api/auth/login`
  - **Purpose**: Authenticate user
  - **Request**: `{ email, password }`
  - **Response**: `{ success: true, data: Session }` + Set-Cookie
  - **Authentication**: None (public)
  - **Rate Limit**: 5 per 15 min per IP

- **Endpoint**: `POST /api/auth/logout`
  - **Purpose**: Destroy session
  - **Request**: Session cookie
  - **Response**: `{ success: true }`
  - **Authentication**: Optional
  - **Rate Limit**: None

- **Endpoint**: `GET /api/auth/session`
  - **Purpose**: Get current session
  - **Request**: Session cookie
  - **Response**: `{ success: true, data: Session }`
  - **Authentication**: Required
  - **Rate Limit**: None

## Implementation Blueprint

### Prerequisites

1. [KV namespace for sessions]
2. [D1 database for users (if applicable)]
3. [Password hashing library installed]
4. [TypeScript types generated]

### Implementation Steps (in order)

#### Step 1: Set Up Session Storage

**Goal**: Configure KV namespace for sessions

**Commands**:
```bash
npx wrangler kv namespace create SESSIONS
```

**Files to Create/Modify**:
- `wrangler.jsonc` - Add KV binding

**Validation**: `npm run cf-typegen` succeeds

#### Step 2: Implement Password Hashing

**Goal**: Create secure password management

**Files to Create/Modify**:
- `[path]/password.ts` - Hashing utilities

**Pseudocode Approach**:
```typescript
async function hashPassword(password: string): Promise<string> {
  // Use bcrypt/scrypt with appropriate cost factor
}

async function verifyPassword(password: string, hash: string): Promise<boolean> {
  // Constant-time comparison
}
```

**Validation**: Unit tests pass

#### Step 3: Create User Database Schema (if applicable)

**Goal**: Define user table

**Files to Create/Modify**:
- `migrations/YYYYMMDD_create_users.sql`

**Validation**: Migration runs successfully

#### Step 4: Implement Session Manager

**Goal**: Session CRUD operations

**Files to Create/Modify**:
- `[path]/session-manager.ts`

**Reference Pattern**: See `examples/database/kv-sessions/worker-middleware.ts`

**Validation**: Session creation/validation works

#### Step 5: Implement Auth Endpoints

**Goal**: Login, logout, register handlers

**Files to Create/Modify**:
- `[path]/auth-endpoints.ts`

**Validation**: Test with curl/fetch

#### Step 6: Implement Rate Limiting

**Goal**: Protect against brute force

**Files to Create/Modify**:
- `[path]/rate-limit.ts`

**Validation**: Excessive requests are blocked

#### Step 7: Create React Auth Context

**Goal**: Global auth state management

**Files to Create/Modify**:
- `[path]/AuthProvider.tsx`
- `[path]/useAuth.ts`

**Reference Pattern**: See `examples/database/kv-sessions/SessionProvider.tsx`

**Validation**: Context provides auth state

### Error Handling Strategy

- **Invalid credentials**: Return generic "Invalid email or password" (don't reveal which is wrong)
- **Rate limit exceeded**: Return 429 Too Many Requests with retry-after header
- **Expired session**: Return 401 Unauthorized and clear cookie
- **Server errors**: Log details, return generic error to client

## Validation Gates

### Security Validation

```bash
# Test authentication
curl -X POST http://localhost:5173/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"wrong"}' \
  -c cookies.txt

# Verify password hashing (never plain text in DB)
npx wrangler d1 execute your-db --command "SELECT * FROM users LIMIT 1"

# Verify cookie flags
curl -v http://localhost:5173/api/auth/login (check Set-Cookie header)

# Test rate limiting
for i in {1..10}; do curl -X POST http://localhost:5173/api/auth/login ...; done
```

## Dependencies

### New Dependencies

```json
{
  "dependencies": {
    "bcryptjs": "^2.4.3"  // Password hashing
  }
}
```

## Success Criteria

- [ ] All validation gates pass
- [ ] Passwords are hashed (never plain text)
- [ ] Sessions use secure, HttpOnly cookies
- [ ] Rate limiting prevents brute force
- [ ] SQL injection prevented
- [ ] XSS prevented (HttpOnly cookies)
- [ ] CSRF prevented (SameSite cookies)
- [ ] Sessions expire correctly
- [ ] Protected endpoints require auth
- [ ] All security tests pass

## Known Limitations

[Document limitations and future security enhancements]

## References

### Internal Documentation

- `examples/database/kv-sessions/` - Session management example
- `CLAUDE.md` - Project guidelines

### External Resources

- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [OWASP Session Management](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html)
- [OWASP Password Storage](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)

## Appendix

### Security Checklist

- [ ] Passwords hashed with bcrypt/scrypt/Argon2
- [ ] HTTPS enforced
- [ ] HttpOnly cookies
- [ ] Secure cookies
- [ ] SameSite cookies
- [ ] Rate limiting implemented
- [ ] Input validation
- [ ] Parameterized queries
- [ ] Session expiration
- [ ] Account lockout (optional)
- [ ] CAPTCHA (optional)
- [ ] 2FA support (future)
