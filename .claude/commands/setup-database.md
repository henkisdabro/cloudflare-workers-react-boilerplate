# Database Setup Wizard

Welcome! I'll help you set up database storage for your Cloudflare Workers application. This wizard will guide you through the process step-by-step.

## Step 1: Choose Database Type

First, let me explain the two options available:

### D1 (SQLite - Relational Database)

**Best for:**
- Structured data with relationships (users, posts, comments)
- Complex queries with JOINs
- Transactions and ACID guarantees
- Traditional SQL operations

**Examples:**
- User authentication systems
- Blog or CMS platforms
- E-commerce product catalogs
- Analytics and reporting

### KV (Key-Value Store)

**Best for:**
- Simple key-value storage
- Caching layer
- Session storage
- Configuration data
- High read, low write workloads

**Examples:**
- User sessions
- API response caching
- Feature flags
- Rate limiting counters

## Interactive Setup

I'll now ask you which type of database you need, then guide you through the setup process.

### Question 1: What type of database do you need?

Please choose:
- **D1** - Relational database (SQLite)
- **KV** - Key-value store

---

## D1 Setup Flow

If you chose D1, I will:

### Step 1: Get Database Name

I'll ask you for your desired database name. It should be:
- Lowercase with hyphens (e.g., "my-app-db")
- Descriptive of its purpose
- Unique within your Cloudflare account

### Step 2: Create D1 Database

I'll run:

```bash
npx wrangler d1 create <your-database-name>
```

This creates the database in your Cloudflare account and provides:
- Database ID
- Binding configuration

### Step 3: Update wrangler.jsonc

I'll automatically update `wrangler.jsonc` with the D1 binding:

```jsonc
{
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "your-database-name",
      "database_id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
    }
  ]
}
```

### Step 4: Generate TypeScript Types

I'll run:

```bash
npm run cf-typegen
```

This generates type-safe bindings in `worker-configuration.d.ts`, giving you autocomplete for `env.DB`.

### Step 5: Create Migrations Directory

I'll create the migrations directory structure:

```
migrations/
  └── 0001_initial_schema.sql
```

### Step 6: Create Example Migration

I'll create an example migration file with a sample schema:

```sql
-- migrations/0001_initial_schema.sql

-- Example: Users table
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  created_at INTEGER DEFAULT (unixepoch()),
  updated_at INTEGER DEFAULT (unixepoch())
);

-- Index for faster email lookups
CREATE INDEX idx_users_email ON users(email);

-- Example: Posts table (demonstrates relationships)
CREATE TABLE IF NOT EXISTS posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  published BOOLEAN DEFAULT 0,
  created_at INTEGER DEFAULT (unixepoch()),
  updated_at INTEGER DEFAULT (unixepoch()),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_posts_user_id ON posts(user_id);
CREATE INDEX idx_posts_published ON posts(published);
```

### Step 7: Generate Example Usage Code

I'll create a file `worker/db-examples.ts` with CRUD operations:

```typescript
// worker/db-examples.ts
// Example D1 database operations

import type { D1Database } from '@cloudflare/workers-types';

interface User {
  id: number;
  email: string;
  name: string;
  created_at: number;
  updated_at: number;
}

interface Post {
  id: number;
  user_id: number;
  title: string;
  content: string;
  published: boolean;
  created_at: number;
  updated_at: number;
}

// CREATE operations
export async function createUser(db: D1Database, email: string, name: string): Promise<User> {
  const result = await db
    .prepare('INSERT INTO users (email, name) VALUES (?, ?) RETURNING *')
    .bind(email, name)
    .first<User>();

  if (!result) {
    throw new Error('Failed to create user');
  }

  return result;
}

export async function createPost(
  db: D1Database,
  userId: number,
  title: string,
  content: string
): Promise<Post> {
  const result = await db
    .prepare('INSERT INTO posts (user_id, title, content) VALUES (?, ?, ?) RETURNING *')
    .bind(userId, title, content)
    .first<Post>();

  if (!result) {
    throw new Error('Failed to create post');
  }

  return result;
}

// READ operations
export async function getUserById(db: D1Database, id: number): Promise<User | null> {
  return await db
    .prepare('SELECT * FROM users WHERE id = ?')
    .bind(id)
    .first<User>();
}

export async function getUserByEmail(db: D1Database, email: string): Promise<User | null> {
  return await db
    .prepare('SELECT * FROM users WHERE email = ?')
    .bind(email)
    .first<User>();
}

export async function getAllUsers(db: D1Database): Promise<User[]> {
  const { results } = await db
    .prepare('SELECT * FROM users ORDER BY created_at DESC')
    .all<User>();

  return results;
}

export async function getPostsByUser(db: D1Database, userId: number): Promise<Post[]> {
  const { results } = await db
    .prepare('SELECT * FROM posts WHERE user_id = ? ORDER BY created_at DESC')
    .bind(userId)
    .all<Post>();

  return results;
}

export async function getPublishedPosts(db: D1Database): Promise<Post[]> {
  const { results } = await db
    .prepare('SELECT * FROM posts WHERE published = 1 ORDER BY created_at DESC')
    .all<Post>();

  return results;
}

// UPDATE operations
export async function updateUser(
  db: D1Database,
  id: number,
  name: string
): Promise<User | null> {
  return await db
    .prepare('UPDATE users SET name = ?, updated_at = unixepoch() WHERE id = ? RETURNING *')
    .bind(name, id)
    .first<User>();
}

export async function publishPost(db: D1Database, id: number): Promise<Post | null> {
  return await db
    .prepare('UPDATE posts SET published = 1, updated_at = unixepoch() WHERE id = ? RETURNING *')
    .bind(id)
    .first<Post>();
}

// DELETE operations
export async function deleteUser(db: D1Database, id: number): Promise<boolean> {
  const result = await db
    .prepare('DELETE FROM users WHERE id = ?')
    .bind(id)
    .run();

  return result.success;
}

export async function deletePost(db: D1Database, id: number): Promise<boolean> {
  const result = await db
    .prepare('DELETE FROM posts WHERE id = ?')
    .bind(id)
    .run();

  return result.success;
}

// Advanced operations
export async function getUserWithPosts(db: D1Database, userId: number) {
  // Using batch for multiple queries
  const results = await db.batch([
    db.prepare('SELECT * FROM users WHERE id = ?').bind(userId),
    db.prepare('SELECT * FROM posts WHERE user_id = ? ORDER BY created_at DESC').bind(userId),
  ]);

  return {
    user: results[0].results[0] as User,
    posts: results[1].results as Post[],
  };
}

export async function searchPosts(db: D1Database, query: string): Promise<Post[]> {
  const { results } = await db
    .prepare('SELECT * FROM posts WHERE title LIKE ? OR content LIKE ? ORDER BY created_at DESC')
    .bind(`%${query}%`, `%${query}%`)
    .all<Post>();

  return results;
}

// Transaction example (using batch)
export async function transferPostOwnership(
  db: D1Database,
  postId: number,
  newUserId: number
): Promise<void> {
  await db.batch([
    db.prepare('UPDATE posts SET user_id = ?, updated_at = unixepoch() WHERE id = ?')
      .bind(newUserId, postId),
  ]);
}
```

### Step 8: Example Worker Integration

I'll show you how to use these functions in your Worker:

```typescript
// worker/index.ts
import { createUser, getUserByEmail, getAllUsers } from './db-examples';

export default {
  async fetch(request, env, ctx): Promise<Response> {
    const url = new URL(request.url);

    // Example: Create user endpoint
    if (url.pathname === '/api/users' && request.method === 'POST') {
      try {
        const { email, name } = await request.json() as { email: string; name: string };

        // Check if user exists
        const existing = await getUserByEmail(env.DB, email);
        if (existing) {
          return Response.json({ error: 'User already exists' }, { status: 400 });
        }

        // Create user
        const user = await createUser(env.DB, email, name);

        return Response.json({ user }, { status: 201 });
      } catch (error) {
        console.error('Error creating user:', error);
        return Response.json({ error: 'Failed to create user' }, { status: 500 });
      }
    }

    // Example: Get all users endpoint
    if (url.pathname === '/api/users' && request.method === 'GET') {
      try {
        const users = await getAllUsers(env.DB);
        return Response.json({ users });
      } catch (error) {
        console.error('Error fetching users:', error);
        return Response.json({ error: 'Failed to fetch users' }, { status: 500 });
      }
    }

    return new Response(null, { status: 404 });
  },
} satisfies ExportedHandler<Env>;
```

### Step 9: Apply Migrations

I'll instruct you to apply the migration:

**Local (development):**

```bash
npx wrangler d1 migrations apply <database-name> --local
```

**Production:**

```bash
npx wrangler d1 migrations apply <database-name>
```

### Next Steps for D1

After setup completes, I'll provide these next steps:

1. **Customize the schema** - Edit `migrations/0001_initial_schema.sql` to match your data model
2. **Apply migrations** - Run the migration commands above
3. **Test locally** - Use `npx wrangler dev` and test your endpoints
4. **Add more migrations** - Create new migration files for schema changes:
   ```bash
   npx wrangler d1 migrations create <database-name> add_user_avatars
   ```
5. **Query your database** - Use the example functions or create your own
6. **Deploy** - Push to main branch to deploy with GitHub Actions

**Useful commands:**

```bash
# Query database directly (local)
npx wrangler d1 execute <database-name> --local --command "SELECT * FROM users"

# Query database directly (production)
npx wrangler d1 execute <database-name> --command "SELECT * FROM users"

# Export data
npx wrangler d1 export <database-name> --output backup.sql

# List all databases
npx wrangler d1 list
```

---

## KV Setup Flow

If you chose KV, I will:

### Step 1: Get Namespace Name

I'll ask you for your desired namespace name. It should be:
- Uppercase with underscores (e.g., "MY_CACHE", "USER_SESSIONS")
- Descriptive of its purpose
- Valid JavaScript identifier (will be used as `env.NAMESPACE_NAME`)

### Step 2: Create KV Namespace

I'll run:

```bash
npx wrangler kv namespace create <NAMESPACE_NAME>
```

This creates both production and preview namespaces.

### Step 3: Update wrangler.jsonc

I'll automatically update `wrangler.jsonc` with the KV binding:

```jsonc
{
  "kv_namespaces": [
    {
      "binding": "NAMESPACE_NAME",
      "id": "xxxxxxxxxxxxxxxxxxxx"
    }
  ]
}
```

### Step 4: Generate TypeScript Types

I'll run:

```bash
npm run cf-typegen
```

This generates type-safe bindings for `env.NAMESPACE_NAME`.

### Step 5: Generate Example Usage Code

I'll create a file `worker/kv-examples.ts` with common operations:

```typescript
// worker/kv-examples.ts
// Example KV namespace operations

import type { KVNamespace } from '@cloudflare/workers-types';

// Basic operations
export async function kvSet(kv: KVNamespace, key: string, value: string): Promise<void> {
  await kv.put(key, value);
}

export async function kvGet(kv: KVNamespace, key: string): Promise<string | null> {
  return await kv.get(key);
}

export async function kvDelete(kv: KVNamespace, key: string): Promise<void> {
  await kv.delete(key);
}

// JSON operations
export async function kvSetJSON<T>(kv: KVNamespace, key: string, value: T): Promise<void> {
  await kv.put(key, JSON.stringify(value));
}

export async function kvGetJSON<T>(kv: KVNamespace, key: string): Promise<T | null> {
  const data = await kv.get(key);
  return data ? JSON.parse(data) : null;
}

// Operations with TTL (expiration)
export async function kvSetWithTTL(
  kv: KVNamespace,
  key: string,
  value: string,
  ttlSeconds: number
): Promise<void> {
  await kv.put(key, value, {
    expirationTtl: ttlSeconds,
  });
}

export async function kvSetJSONWithTTL<T>(
  kv: KVNamespace,
  key: string,
  value: T,
  ttlSeconds: number
): Promise<void> {
  await kv.put(key, JSON.stringify(value), {
    expirationTtl: ttlSeconds,
  });
}

// Operations with metadata
export async function kvSetWithMetadata<M>(
  kv: KVNamespace,
  key: string,
  value: string,
  metadata: M
): Promise<void> {
  await kv.put(key, value, { metadata });
}

export async function kvGetWithMetadata<M>(
  kv: KVNamespace,
  key: string
): Promise<{ value: string | null; metadata: M | null }> {
  const { value, metadata } = await kv.getWithMetadata<M>(key);
  return { value, metadata };
}

// List operations
export async function kvListKeys(
  kv: KVNamespace,
  prefix?: string
): Promise<string[]> {
  const { keys } = await kv.list({ prefix });
  return keys.map(k => k.name);
}

export async function kvListKeysWithMetadata<M>(
  kv: KVNamespace,
  prefix?: string
): Promise<Array<{ name: string; metadata: M | undefined }>> {
  const { keys } = await kv.list<M>({ prefix });
  return keys.map(k => ({ name: k.name, metadata: k.metadata }));
}

// Paginated list
export async function kvListAllKeys(kv: KVNamespace, prefix?: string): Promise<string[]> {
  const allKeys: string[] = [];
  let cursor: string | undefined = undefined;

  do {
    const result = await kv.list({ prefix, cursor });
    allKeys.push(...result.keys.map(k => k.name));
    cursor = result.cursor;
  } while (cursor);

  return allKeys;
}

// Common patterns

// Session management
export interface Session {
  userId: string;
  email: string;
  createdAt: number;
}

export async function createSession(
  kv: KVNamespace,
  userId: string,
  email: string
): Promise<string> {
  const sessionId = crypto.randomUUID();
  const session: Session = {
    userId,
    email,
    createdAt: Date.now(),
  };

  // Store session with 7-day expiration
  await kvSetJSONWithTTL(kv, `session:${sessionId}`, session, 60 * 60 * 24 * 7);

  return sessionId;
}

export async function getSession(kv: KVNamespace, sessionId: string): Promise<Session | null> {
  return await kvGetJSON<Session>(kv, `session:${sessionId}`);
}

export async function deleteSession(kv: KVNamespace, sessionId: string): Promise<void> {
  await kvDelete(kv, `session:${sessionId}`);
}

// Cache layer
export async function getCachedOrFetch<T>(
  kv: KVNamespace,
  key: string,
  fetchFn: () => Promise<T>,
  ttlSeconds: number = 3600
): Promise<T> {
  // Try cache first
  const cached = await kvGetJSON<T>(kv, `cache:${key}`);
  if (cached !== null) {
    return cached;
  }

  // Fetch from origin
  const data = await fetchFn();

  // Store in cache
  await kvSetJSONWithTTL(kv, `cache:${key}`, data, ttlSeconds);

  return data;
}

// Rate limiting
export async function checkRateLimit(
  kv: KVNamespace,
  identifier: string,
  limit: number = 100,
  windowSeconds: number = 60
): Promise<{ allowed: boolean; remaining: number }> {
  const key = `ratelimit:${identifier}`;
  const countStr = await kv.get(key);
  const count = countStr ? parseInt(countStr) : 0;

  if (count >= limit) {
    return { allowed: false, remaining: 0 };
  }

  // Increment counter
  await kv.put(key, String(count + 1), {
    expirationTtl: windowSeconds,
  });

  return { allowed: true, remaining: limit - count - 1 };
}

// Feature flags
export async function isFeatureEnabled(
  kv: KVNamespace,
  featureName: string
): Promise<boolean> {
  const value = await kv.get(`feature:${featureName}`);
  return value === 'true';
}

export async function setFeatureFlag(
  kv: KVNamespace,
  featureName: string,
  enabled: boolean
): Promise<void> {
  await kv.put(`feature:${featureName}`, enabled ? 'true' : 'false');
}

// Configuration storage
export interface AppConfig {
  apiUrl: string;
  maxUploadSize: number;
  enableAnalytics: boolean;
}

export async function getConfig(kv: KVNamespace): Promise<AppConfig | null> {
  return await kvGetJSON<AppConfig>(kv, 'config:app');
}

export async function setConfig(kv: KVNamespace, config: AppConfig): Promise<void> {
  await kvSetJSON(kv, 'config:app', config);
}
```

### Step 6: Example Worker Integration

I'll show you how to use KV in your Worker:

```typescript
// worker/index.ts
import {
  createSession,
  getSession,
  deleteSession,
  checkRateLimit,
  getCachedOrFetch,
  isFeatureEnabled
} from './kv-examples';

export default {
  async fetch(request, env, ctx): Promise<Response> {
    const url = new URL(request.url);

    // Example: Rate limiting
    const clientIP = request.headers.get('CF-Connecting-IP') || 'unknown';
    const rateLimit = await checkRateLimit(env.MY_KV, clientIP, 100, 60);

    if (!rateLimit.allowed) {
      return Response.json(
        { error: 'Rate limit exceeded' },
        { status: 429, headers: { 'X-RateLimit-Remaining': '0' } }
      );
    }

    // Example: Create session endpoint
    if (url.pathname === '/api/login' && request.method === 'POST') {
      try {
        const { email, userId } = await request.json() as { email: string; userId: string };

        const sessionId = await createSession(env.MY_KV, userId, email);

        return Response.json({ sessionId }, { status: 201 });
      } catch (error) {
        console.error('Error creating session:', error);
        return Response.json({ error: 'Login failed' }, { status: 500 });
      }
    }

    // Example: Get session endpoint
    if (url.pathname === '/api/session' && request.method === 'GET') {
      const sessionId = request.headers.get('X-Session-ID');

      if (!sessionId) {
        return Response.json({ error: 'No session ID provided' }, { status: 401 });
      }

      const session = await getSession(env.MY_KV, sessionId);

      if (!session) {
        return Response.json({ error: 'Session not found' }, { status: 401 });
      }

      return Response.json({ session });
    }

    // Example: Logout endpoint
    if (url.pathname === '/api/logout' && request.method === 'POST') {
      const sessionId = request.headers.get('X-Session-ID');

      if (sessionId) {
        await deleteSession(env.MY_KV, sessionId);
      }

      return Response.json({ success: true });
    }

    // Example: Cached API response
    if (url.pathname === '/api/data' && request.method === 'GET') {
      const data = await getCachedOrFetch(
        env.MY_KV,
        'api-data',
        async () => {
          // Fetch from external API or database
          return { message: 'Fresh data', timestamp: Date.now() };
        },
        300 // Cache for 5 minutes
      );

      return Response.json(data);
    }

    // Example: Feature flag check
    if (url.pathname === '/api/features' && request.method === 'GET') {
      const betaEnabled = await isFeatureEnabled(env.MY_KV, 'beta-feature');

      return Response.json({
        features: {
          beta: betaEnabled,
        },
      });
    }

    return new Response(null, { status: 404 });
  },
} satisfies ExportedHandler<Env>;
```

### Next Steps for KV

After setup completes, I'll provide these next steps:

1. **Customize the examples** - Adapt the provided functions to your use case
2. **Test locally** - Use `npx wrangler dev` and test your endpoints
3. **Add data via CLI** - Test by adding data manually:
   ```bash
   npx wrangler kv key put --binding NAMESPACE_NAME "test-key" "test-value"
   ```
4. **Monitor usage** - Check KV usage in Cloudflare Dashboard
5. **Deploy** - Push to main branch to deploy with GitHub Actions

**Useful commands:**

```bash
# Put a key-value pair
npx wrangler kv key put --binding NAMESPACE_NAME "myKey" "myValue"

# Get a value
npx wrangler kv key get --binding NAMESPACE_NAME "myKey"

# Delete a key
npx wrangler kv key delete --binding NAMESPACE_NAME "myKey"

# List all keys
npx wrangler kv key list --binding NAMESPACE_NAME

# List keys with prefix
npx wrangler kv key list --binding NAMESPACE_NAME --prefix "session:"

# List all namespaces
npx wrangler kv namespace list
```

---

## Error Handling

Throughout the process, I will:

1. **Validate inputs** - Ensure names follow conventions
2. **Check for conflicts** - Verify binding names don't already exist
3. **Handle wrangler errors** - Provide clear explanations if commands fail
4. **Verify file modifications** - Confirm configuration updates succeed
5. **Test type generation** - Ensure TypeScript types are generated correctly

If any step fails, I'll:
- Explain what went wrong
- Provide troubleshooting steps
- Offer to retry or take an alternative approach
- Guide you to manual fixes if needed

## Ready to Start

I'm ready to set up your database! Please tell me:

1. Which type do you need? (D1 or KV)
2. What name would you like to use?
3. (Optional) What will you use it for? (This helps me create more relevant examples)

Let's get started!
