# KV Sessions Example

A complete, production-ready example of session management using Cloudflare KV storage. Includes authentication flow, session middleware, React context provider, and secure cookie handling.

## Features

- Session creation and destruction
- Secure HTTP-only cookies
- Session expiration with TTL
- React Context API for global auth state
- Custom hooks for easy authentication
- TypeScript types throughout
- Protected route examples
- Automatic session refresh

## Security Notes

**IMPORTANT**: This is a simplified example for demonstration purposes. In production:

- **Use proper password hashing**: Never store plain-text passwords (use bcrypt, scrypt, or Argon2)
- **Store users in D1**: Don't use hardcoded mock users
- **Implement rate limiting**: Prevent brute-force attacks
- **Add CSRF protection**: Protect against cross-site request forgery
- **Use HTTPS**: Always use secure connections in production
- **Implement password reset**: Allow users to reset forgotten passwords
- **Add email verification**: Verify user email addresses

## Setup Instructions

### 1. Create KV Namespace

```bash
# Create a new KV namespace for sessions
npx wrangler kv namespace create SESSIONS

# For preview (local development)
npx wrangler kv namespace create SESSIONS --preview
```

This will output something like:

```
[[kv_namespaces]]
binding = "SESSIONS"
id = "xxxxxxxxxxxxxxxxxxxx"
preview_id = "yyyyyyyyyyyyyyyyyyyy"
```

### 2. Configure wrangler.jsonc

Add the KV namespace binding to your `wrangler.jsonc`:

```jsonc
{
  "name": "your-worker-name",
  // ... other config
  "kv_namespaces": [
    {
      "binding": "SESSIONS",
      "id": "xxxxxxxxxxxxxxxxxxxx",
      "preview_id": "yyyyyyyyyyyyyyyyyyyy"
    }
  ]
}
```

### 3. Generate TypeScript Types

```bash
npm run cf-typegen
```

This generates proper TypeScript types for your KV binding in `worker-configuration.d.ts`.

### 4. Integrate the API Endpoints

Update your `worker/index.ts` to include the auth endpoints:

```typescript
import { handleAuthRequest } from '../examples/database/kv-sessions/worker-endpoints';

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // Handle auth API routes
    if (url.pathname.startsWith('/api/auth')) {
      return handleAuthRequest(request, env);
    }

    // ... other routes

    return new Response(null, { status: 404 });
  },
} satisfies ExportedHandler<Env>;
```

### 5. Add Session Provider to React App

Wrap your app with the SessionProvider:

```typescript
// src/main.tsx
import { SessionProvider } from '../examples/database/kv-sessions/SessionProvider';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <SessionProvider>
      <App />
    </SessionProvider>
  </React.StrictMode>
);
```

### 6. Use Authentication in Components

```typescript
// src/App.tsx or any component
import { useSession } from '../examples/database/kv-sessions/useSession';
import { LoginForm, ProtectedComponent } from '../examples/database/kv-sessions/useSession';

function App() {
  const { isAuthenticated, isLoading } = useSession();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return isAuthenticated ? <ProtectedComponent /> : <LoginForm />;
}

export default App;
```

## Testing

### Local Development

```bash
# Start the development server
npm run dev
```

The login form will be available at `http://localhost:5173`

**Demo Credentials:**
- Email: `demo@example.com`
- Password: `password123`

### Testing the API Directly

```bash
# Login
curl -X POST http://localhost:5173/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "demo@example.com",
    "password": "password123"
  }' \
  -c cookies.txt

# Get current session (using cookies from login)
curl http://localhost:5173/api/auth/session \
  -b cookies.txt

# Logout
curl -X POST http://localhost:5173/api/auth/logout \
  -b cookies.txt
```

### Production Testing

```bash
# Deploy to Cloudflare
npm run deploy

# Test on production URL
curl -X POST https://your-worker.your-subdomain.workers.dev/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "demo@example.com",
    "password": "password123"
  }' \
  -c cookies.txt
```

## API Endpoints

### POST /api/auth/login

Authenticate a user and create a session.

**Request Body:**
```json
{
  "email": "demo@example.com",
  "password": "password123"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "sessionId": "abc123...",
    "user": {
      "id": "1",
      "email": "demo@example.com",
      "name": "Demo User",
      "createdAt": "2025-11-09T12:00:00.000Z"
    },
    "expiresAt": "2025-11-16T12:00:00.000Z"
  }
}
```

**Sets Cookie:**
```
Set-Cookie: session_id=abc123...; Max-Age=604800; Path=/; HttpOnly; Secure; SameSite=Lax
```

### POST /api/auth/logout

Destroy the current session.

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

**Clears Cookie:**
```
Set-Cookie: session_id=; Max-Age=0; Path=/; HttpOnly; Secure; SameSite=Lax
```

### GET /api/auth/session

Get the current session data.

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "sessionId": "abc123...",
    "user": {
      "id": "1",
      "email": "demo@example.com",
      "name": "Demo User",
      "createdAt": "2025-11-09T12:00:00.000Z"
    },
    "expiresAt": "2025-11-16T12:00:00.000Z"
  }
}
```

**Response (401 Unauthorized) - No session:**
```json
{
  "success": false,
  "error": "NO_SESSION",
  "message": "No active session"
}
```

## Session Configuration

Default configuration in `types.ts`:

```typescript
{
  cookieName: 'session_id',
  sessionTTL: 60 * 60 * 24 * 7, // 7 days
  cookieOptions: {
    httpOnly: true,   // Prevent JavaScript access (XSS protection)
    secure: true,     // HTTPS only
    sameSite: 'lax',  // CSRF protection
    path: '/',        // Cookie available on all paths
  },
}
```

### Customizing Configuration

```typescript
import { SessionManager } from './worker-middleware';

const customConfig = {
  cookieName: 'my_session',
  sessionTTL: 60 * 60 * 24, // 1 day instead of 7
  cookieOptions: {
    httpOnly: true,
    secure: true,
    sameSite: 'strict' as const, // More restrictive
    path: '/',
  },
};

const sessionManager = new SessionManager(env.SESSIONS, customConfig);
```

## Usage Patterns

### Protecting Worker Endpoints

```typescript
import { SessionManager } from './examples/database/kv-sessions/worker-middleware';

async function protectedEndpoint(request: Request, env: Env) {
  const sessionManager = new SessionManager(env.SESSIONS);
  const session = await sessionManager.getSessionFromRequest(request);

  if (!session) {
    return Response.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  // User is authenticated
  return Response.json({
    message: `Hello, ${session.user.name}!`,
    user: session.user,
  });
}
```

### Using Session in React Components

```typescript
import { useSession } from './examples/database/kv-sessions/useSession';

function MyComponent() {
  const { user, isAuthenticated, login, logout, isLoading } = useSession();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <LoginForm onLogin={login} />;
  }

  return (
    <div>
      <h1>Welcome, {user.name}!</h1>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

### Conditional Rendering

```typescript
import { useSession } from './examples/database/kv-sessions/useSession';

function Navigation() {
  const { isAuthenticated, user, logout } = useSession();

  return (
    <nav>
      {isAuthenticated ? (
        <>
          <span>Logged in as {user.email}</span>
          <button onClick={logout}>Logout</button>
        </>
      ) : (
        <a href="/login">Login</a>
      )}
    </nav>
  );
}
```

## KV Operations

Behind the scenes, this example uses these KV operations:

```typescript
// Store session (with automatic expiration)
await env.SESSIONS.put(
  `session:${sessionId}`,
  JSON.stringify(sessionData),
  { expirationTtl: 604800 } // 7 days
);

// Retrieve session
const data = await env.SESSIONS.get(`session:${sessionId}`, 'json');

// Delete session
await env.SESSIONS.delete(`session:${sessionId}`);
```

## Security Best Practices

1. **HttpOnly Cookies**: Prevents XSS attacks by making cookies inaccessible to JavaScript
2. **Secure Flag**: Ensures cookies are only sent over HTTPS
3. **SameSite**: Protects against CSRF attacks
4. **Session Expiration**: Automatic cleanup via KV TTL
5. **Password Validation**: Client and server-side validation
6. **Error Messages**: Generic messages that don't expose system details

## Production Enhancements

For a production application, consider adding:

1. **Password Hashing**: Use bcrypt, scrypt, or Argon2
   ```typescript
   import bcrypt from 'bcryptjs';
   const hash = await bcrypt.hash(password, 10);
   const isValid = await bcrypt.compare(password, hash);
   ```

2. **User Database**: Store users in D1 instead of hardcoded array
   ```sql
   CREATE TABLE users (
     id INTEGER PRIMARY KEY AUTOINCREMENT,
     email TEXT UNIQUE NOT NULL,
     password_hash TEXT NOT NULL,
     name TEXT NOT NULL,
     created_at DATETIME DEFAULT CURRENT_TIMESTAMP
   );
   ```

3. **Rate Limiting**: Prevent brute-force attacks
   ```typescript
   const attempts = await env.SESSIONS.get(`login_attempts:${ip}`);
   if (attempts > 5) {
     return Response.json({ error: 'Too many attempts' }, { status: 429 });
   }
   ```

4. **Email Verification**: Verify user email addresses
5. **Password Reset**: Allow users to reset forgotten passwords
6. **Remember Me**: Optional longer session duration
7. **Session Revocation**: Ability to revoke all sessions for a user
8. **Activity Logging**: Log login/logout events

## Troubleshooting

### "No active session" error immediately after login

Make sure cookies are being sent:
```typescript
fetch('/api/auth/login', {
  credentials: 'include', // Important!
});
```

### Session not persisting between requests

Check cookie settings in DevTools. Ensure:
- Cookie is being set (check Set-Cookie header)
- Cookie is being sent on subsequent requests
- SameSite settings are appropriate for your domain

### TypeScript errors about `env.SESSIONS`

Run the type generator:
```bash
npm run cf-typegen
```

### Changes not reflecting locally

Restart the dev server:
```bash
npm run dev
```

## Resources

- [Cloudflare KV Documentation](https://developers.cloudflare.com/kv/)
- [KV API Reference](https://developers.cloudflare.com/kv/api/)
- [Workers Sessions Pattern](https://developers.cloudflare.com/workers/examples/sessions/)
- [HTTP Cookie Security](https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies)
- [React Context API](https://react.dev/reference/react/useContext)
