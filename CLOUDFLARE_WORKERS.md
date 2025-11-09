# Cloudflare Workers Guide

This guide provides comprehensive information about using Cloudflare Workers in this template, including setup, development, deployment, and troubleshooting.

## Table of Contents

- [Introduction](#introduction)
- [Wrangler CLI Reference](#wrangler-cli-reference)
- [D1 Database Workflows](#d1-database-workflows)
- [KV Namespace Workflows](#kv-namespace-workflows)
- [R2 Storage](#r2-storage)
- [Queues](#queues)
- [AI Bindings](#ai-bindings)
- [Secrets Management](#secrets-management)
- [Environment Management](#environment-management)
- [Local Development](#local-development)
- [Deployment Strategies](#deployment-strategies)
- [Observability](#observability)
- [Troubleshooting](#troubleshooting)

## Introduction

### What are Cloudflare Workers?

Cloudflare Workers is a serverless platform that runs your code at the edge, across Cloudflare's global network of data centers. Workers execute in V8 isolates, providing:

- **Near-zero cold starts** - Isolates start in under 5ms
- **Global distribution** - Code runs close to your users worldwide
- **No infrastructure management** - Cloudflare handles scaling automatically
- **Cost-effective** - Pay only for what you use, with generous free tier

### How This Template Uses Workers

This boilerplate combines a Vite + React 19 frontend with a Cloudflare Worker backend in a single deployment:

```
┌─────────────────────────────────────────┐
│      Cloudflare Worker Deployment       │
├─────────────────────────────────────────┤
│                                         │
│  ┌────────────────┐  ┌──────────────┐  │
│  │  Static Assets │  │    Worker    │  │
│  │  (React SPA)   │  │  (API Logic) │  │
│  │                │  │              │  │
│  │  index.html    │  │  /api/*      │  │
│  │  *.js, *.css   │  │  routes      │  │
│  └────────────────┘  └──────────────┘  │
│                                         │
└─────────────────────────────────────────┘
```

**Request Routing:**

1. **API Routes** (`/api/*`) → Handled by Worker fetch handler (`worker/index.ts`)
2. **All Other Routes** → Served as static assets (React SPA)
3. **Non-existent Routes** → Falls back to `index.html` (SPA mode)

### Architecture Overview

```typescript
// worker/index.ts - Worker entry point
export default {
  fetch(request, env, ctx) {
    const url = new URL(request.url);

    // API route handling
    if (url.pathname.startsWith("/api/")) {
      // Access bindings via env
      const value = await env.KV.get("key");
      const result = await env.DB.prepare("SELECT * FROM users").all();

      return Response.json({ data: result });
    }

    // 404 - falls through to static assets
    return new Response(null, { status: 404 });
  },
} satisfies ExportedHandler<Env>;
```

The `env` parameter provides type-safe access to all Cloudflare bindings (D1, KV, R2, etc.) configured in `wrangler.jsonc`.

## Wrangler CLI Reference

Wrangler is the official CLI tool for Cloudflare Workers. Common commands you'll use:

### Development

```bash
# Start local development server
npx wrangler dev

# Start with remote bindings (use production resources)
npx wrangler dev --remote

# Start with local persistence
npx wrangler dev --persist-to ./local-data

# Start on specific port
npx wrangler dev --port 8787
```

### Deployment

```bash
# Deploy to production
npx wrangler deploy

# Deploy with custom environment
npx wrangler deploy --env staging

# Dry run (see what would be deployed)
npx wrangler deploy --dry-run
```

### Database (D1)

```bash
# Create a new D1 database
npx wrangler d1 create <database-name>

# List all databases
npx wrangler d1 list

# Execute SQL query locally
npx wrangler d1 execute <database-name> --local --command "SELECT * FROM users"

# Execute SQL query in production
npx wrangler d1 execute <database-name> --command "SELECT * FROM users"

# Run migrations locally
npx wrangler d1 migrations apply <database-name> --local

# Run migrations in production
npx wrangler d1 migrations apply <database-name>

# Create migration file
npx wrangler d1 migrations create <database-name> <migration-name>

# Export database
npx wrangler d1 export <database-name> --output backup.sql

# Import database (local only)
npx wrangler d1 execute <database-name> --local --file backup.sql
```

### Key-Value (KV)

```bash
# Create KV namespace
npx wrangler kv namespace create <namespace-name>

# List all namespaces
npx wrangler kv namespace list

# Put a key-value pair
npx wrangler kv key put --namespace-id <id> "myKey" "myValue"

# Get a value
npx wrangler kv key get --namespace-id <id> "myKey"

# Delete a key
npx wrangler kv key delete --namespace-id <id> "myKey"

# List keys
npx wrangler kv key list --namespace-id <id>

# Bulk operations from file
npx wrangler kv bulk put --namespace-id <id> data.json
```

### Secrets

```bash
# Add a secret
npx wrangler secret put SECRET_NAME

# List all secrets (only shows names, not values)
npx wrangler secret list

# Delete a secret
npx wrangler secret delete SECRET_NAME
```

### Type Generation

```bash
# Generate TypeScript types for bindings
npx wrangler types

# Same as npm run cf-typegen
npm run cf-typegen
```

### Logging

```bash
# Tail logs in real-time
npx wrangler tail

# Tail with format
npx wrangler tail --format pretty

# Tail specific environment
npx wrangler tail --env production
```

### Other Utilities

```bash
# View Worker info
npx wrangler whoami

# List deployments
npx wrangler deployments list

# Rollback to previous deployment
npx wrangler rollback

# Delete Worker
npx wrangler delete
```

## D1 Database Workflows

D1 is Cloudflare's serverless SQL database built on SQLite. Use D1 when you need:

- Relational data with structured schemas
- SQL queries and transactions
- Strong consistency
- ACID guarantees

### Creating a D1 Database

**Step 1: Create the database**

```bash
npx wrangler d1 create my-database
```

Output:
```
✅ Successfully created DB 'my-database'!

[[d1_databases]]
binding = "DB"
database_name = "my-database"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

**Step 2: Update `wrangler.jsonc`**

Add the configuration block to your `wrangler.jsonc`:

```jsonc
{
  "name": "my-app",
  "main": "worker/index.ts",
  "compatibility_date": "2025-11-09",

  // Add D1 binding
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "my-database",
      "database_id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
    }
  ]
}
```

**Step 3: Generate TypeScript types**

```bash
npm run cf-typegen
```

This creates/updates `worker-configuration.d.ts` with proper types for `env.DB`.

### Running Migrations

**Step 1: Create migration directory**

```bash
mkdir -p migrations
```

**Step 2: Create migration file**

```bash
npx wrangler d1 migrations create my-database create_users_table
```

This creates a file like `migrations/0001_create_users_table.sql`.

**Step 3: Write migration SQL**

Edit `migrations/0001_create_users_table.sql`:

```sql
-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  created_at INTEGER DEFAULT (unixepoch()),
  updated_at INTEGER DEFAULT (unixepoch())
);

-- Create index on email
CREATE INDEX idx_users_email ON users(email);
```

**Step 4: Apply migration locally**

```bash
npx wrangler d1 migrations apply my-database --local
```

**Step 5: Apply migration to production**

```bash
npx wrangler d1 migrations apply my-database
```

### Querying Locally vs Production

**Local queries (development):**

```bash
# Interactive SQL shell
npx wrangler d1 execute my-database --local

# Single command
npx wrangler d1 execute my-database --local --command "SELECT * FROM users"

# From file
npx wrangler d1 execute my-database --local --file query.sql
```

**Production queries:**

```bash
# Remove --local flag
npx wrangler d1 execute my-database --command "SELECT * FROM users"
```

### Backup and Restore

**Backup (export to SQL):**

```bash
npx wrangler d1 export my-database --output backup-$(date +%Y%m%d).sql
```

**Restore (local only):**

```bash
npx wrangler d1 execute my-database --local --file backup-20250101.sql
```

**Production restore:**
D1 doesn't support direct production imports. To restore:
1. Import to local database
2. Test locally
3. Create migration file from backup
4. Apply migration to production

### Common Patterns (CRUD Operations)

**Create:**

```typescript
// worker/index.ts
async function createUser(env: Env, email: string, name: string) {
  const result = await env.DB.prepare(
    'INSERT INTO users (email, name) VALUES (?, ?) RETURNING *'
  ).bind(email, name).first();

  return result;
}
```

**Read:**

```typescript
async function getUser(env: Env, id: number) {
  return await env.DB.prepare(
    'SELECT * FROM users WHERE id = ?'
  ).bind(id).first();
}

async function getAllUsers(env: Env) {
  const { results } = await env.DB.prepare(
    'SELECT * FROM users ORDER BY created_at DESC'
  ).all();

  return results;
}
```

**Update:**

```typescript
async function updateUser(env: Env, id: number, name: string) {
  const result = await env.DB.prepare(
    'UPDATE users SET name = ?, updated_at = unixepoch() WHERE id = ? RETURNING *'
  ).bind(name, id).first();

  return result;
}
```

**Delete:**

```typescript
async function deleteUser(env: Env, id: number) {
  await env.DB.prepare(
    'DELETE FROM users WHERE id = ?'
  ).bind(id).run();

  return { success: true };
}
```

**Transactions:**

```typescript
async function transferCredits(env: Env, fromId: number, toId: number, amount: number) {
  const results = await env.DB.batch([
    env.DB.prepare('UPDATE accounts SET balance = balance - ? WHERE user_id = ?')
      .bind(amount, fromId),
    env.DB.prepare('UPDATE accounts SET balance = balance + ? WHERE user_id = ?')
      .bind(amount, toId),
  ]);

  return results;
}
```

### TypeScript Integration

After running `npm run cf-typegen`, you get full type safety:

```typescript
export default {
  async fetch(request, env, ctx): Promise<Response> {
    // env.DB is fully typed
    const user = await env.DB.prepare(
      'SELECT * FROM users WHERE id = ?'
    ).bind(1).first<User>();

    // Type-safe result
    if (user) {
      console.log(user.email); // TypeScript knows this field exists
    }

    return Response.json({ user });
  },
} satisfies ExportedHandler<Env>;
```

Define your schema types:

```typescript
// worker/types.ts
interface User {
  id: number;
  email: string;
  name: string;
  created_at: number;
  updated_at: number;
}
```

## KV Namespace Workflows

Cloudflare KV is a global, low-latency key-value store optimized for high read volumes. Use KV when you need:

- Simple key-value storage
- Caching layer
- Session storage
- Configuration data
- High read, low write workloads

### Creating KV Namespaces

**Step 1: Create namespace**

```bash
npx wrangler kv namespace create MY_KV
```

Output:
```
🌀 Creating namespace with title "my-app-MY_KV"
✨ Success!
Add the following to your configuration file in your kv_namespaces array:
{ binding = "MY_KV", id = "xxxxxxxxxxxxxxxxxxxx" }
```

**Step 2: Create preview namespace (for local dev)**

```bash
npx wrangler kv namespace create MY_KV --preview
```

**Step 3: Update `wrangler.jsonc`**

```jsonc
{
  "name": "my-app",
  "main": "worker/index.ts",

  // Add KV binding
  "kv_namespaces": [
    {
      "binding": "MY_KV",
      "id": "xxxxxxxxxxxxxxxxxxxx",
      "preview_id": "yyyyyyyyyyyyyyyyyyyy"
    }
  ]
}
```

**Step 4: Generate types**

```bash
npm run cf-typegen
```

### Local Development with KV

When using `wrangler dev`, KV data is ephemeral by default. For persistence:

```bash
# Persist KV data locally
npx wrangler dev --persist-to ./local-data
```

This creates a local SQLite database to store KV data.

### Reading/Writing Values

**Basic operations:**

```typescript
// Write
await env.MY_KV.put("user:123", JSON.stringify({ name: "Alice" }));

// Read
const data = await env.MY_KV.get("user:123");
const user = JSON.parse(data || "{}");

// Delete
await env.MY_KV.delete("user:123");
```

**With options:**

```typescript
// Write with TTL (expires in 1 hour)
await env.MY_KV.put("session:abc", sessionData, {
  expirationTtl: 3600,
});

// Write with expiration timestamp
await env.MY_KV.put("cache:data", data, {
  expiration: Math.floor(Date.now() / 1000) + 3600,
});

// Write with metadata
await env.MY_KV.put("file:123", fileContent, {
  metadata: { contentType: "image/png", size: 12345 },
});

// Read as different formats
const text = await env.MY_KV.get("key", "text");
const json = await env.MY_KV.get("key", "json");
const arrayBuffer = await env.MY_KV.get("key", "arrayBuffer");
const stream = await env.MY_KV.get("key", "stream");

// Read with metadata
const { value, metadata } = await env.MY_KV.getWithMetadata("file:123");
```

### Listing Keys

```typescript
// List all keys
const { keys, list_complete, cursor } = await env.MY_KV.list();

// List with prefix
const result = await env.MY_KV.list({ prefix: "user:" });

// Paginated listing
let cursor = undefined;
do {
  const result = await env.MY_KV.list({ cursor, limit: 100 });
  console.log(result.keys);
  cursor = result.cursor;
} while (!result.list_complete);
```

### TTL Management

KV keys can automatically expire:

```typescript
// Expire in 1 hour (3600 seconds)
await env.MY_KV.put("temp:data", value, {
  expirationTtl: 3600,
});

// Expire at specific timestamp
const expirationTime = Math.floor(Date.now() / 1000) + 86400; // 24 hours
await env.MY_KV.put("cache:key", value, {
  expiration: expirationTime,
});
```

**Important:** Expired keys are eventually deleted, but may still be readable briefly after expiration.

### Common Use Cases

**Session Storage:**

```typescript
interface Session {
  userId: string;
  createdAt: number;
}

async function createSession(env: Env, userId: string): Promise<string> {
  const sessionId = crypto.randomUUID();
  const session: Session = { userId, createdAt: Date.now() };

  // Store session with 7-day expiration
  await env.MY_KV.put(`session:${sessionId}`, JSON.stringify(session), {
    expirationTtl: 60 * 60 * 24 * 7,
  });

  return sessionId;
}

async function getSession(env: Env, sessionId: string): Promise<Session | null> {
  const data = await env.MY_KV.get(`session:${sessionId}`);
  return data ? JSON.parse(data) : null;
}
```

**Cache Layer:**

```typescript
async function getCachedData(env: Env, key: string) {
  // Try cache first
  const cached = await env.MY_KV.get(`cache:${key}`, "json");
  if (cached) return cached;

  // Fetch from origin
  const data = await fetchFromDatabase(key);

  // Store in cache for 1 hour
  await env.MY_KV.put(`cache:${key}`, JSON.stringify(data), {
    expirationTtl: 3600,
  });

  return data;
}
```

**Rate Limiting:**

```typescript
async function checkRateLimit(env: Env, ip: string): Promise<boolean> {
  const key = `ratelimit:${ip}`;
  const count = parseInt(await env.MY_KV.get(key) || "0");

  if (count >= 100) {
    return false; // Rate limited
  }

  // Increment counter (expires in 1 minute)
  await env.MY_KV.put(key, String(count + 1), {
    expirationTtl: 60,
  });

  return true;
}
```

**Feature Flags:**

```typescript
async function isFeatureEnabled(env: Env, featureName: string): Promise<boolean> {
  const value = await env.MY_KV.get(`feature:${featureName}`);
  return value === "true";
}
```

## R2 Storage

R2 is Cloudflare's object storage service, compatible with S3 API. Use R2 when you need:

- Large file storage (images, videos, documents)
- S3-compatible storage without egress fees
- CDN integration
- Backup storage

### When to Use R2

- **File uploads:** User-generated content, profile pictures, documents
- **Media hosting:** Images, videos, audio files
- **Static assets:** Alternative to Workers Assets for very large files
- **Backups:** Database exports, log archives
- **Data lakes:** Analytics data, logs, historical records

### Basic Setup

**Step 1: Create R2 bucket**

```bash
npx wrangler r2 bucket create my-bucket
```

**Step 2: Update `wrangler.jsonc`**

```jsonc
{
  "r2_buckets": [
    {
      "binding": "MY_BUCKET",
      "bucket_name": "my-bucket"
    }
  ]
}
```

**Step 3: Generate types**

```bash
npm run cf-typegen
```

### Integration Pattern

```typescript
// Upload file
async function uploadFile(env: Env, key: string, file: File) {
  await env.MY_BUCKET.put(key, file.stream(), {
    httpMetadata: {
      contentType: file.type,
    },
  });
}

// Download file
async function getFile(env: Env, key: string) {
  const object = await env.MY_BUCKET.get(key);

  if (!object) {
    return new Response("Not found", { status: 404 });
  }

  return new Response(object.body, {
    headers: {
      "Content-Type": object.httpMetadata?.contentType || "application/octet-stream",
    },
  });
}

// List files
async function listFiles(env: Env, prefix: string) {
  const { objects } = await env.MY_BUCKET.list({ prefix });
  return objects.map(obj => ({
    key: obj.key,
    size: obj.size,
    uploaded: obj.uploaded,
  }));
}

// Delete file
async function deleteFile(env: Env, key: string) {
  await env.MY_BUCKET.delete(key);
}
```

**Learn more:** [Cloudflare R2 Documentation](https://developers.cloudflare.com/r2/)

## Queues

Cloudflare Queues enables asynchronous message processing between Workers. Use Queues when you need:

- Background job processing
- Decoupled microservices
- Event-driven architectures
- Batch processing

### When to Use Queues

- **Email sending:** Queue email jobs to avoid blocking requests
- **Image processing:** Resize/optimize images asynchronously
- **Webhooks:** Reliable delivery with retries
- **Data processing:** ETL pipelines, log processing
- **Scheduled tasks:** Defer work to run later

### Basic Setup Pattern

**Step 1: Create queue**

```bash
npx wrangler queues create my-queue
```

**Step 2: Update `wrangler.jsonc`**

```jsonc
{
  // Producer Worker configuration
  "queues": {
    "producers": [
      {
        "binding": "MY_QUEUE",
        "queue": "my-queue"
      }
    ]
  }
}
```

**Step 3: Create consumer Worker**

Create a separate worker to consume messages, or add to existing worker:

```jsonc
{
  // Consumer Worker configuration
  "queues": {
    "consumers": [
      {
        "queue": "my-queue",
        "max_batch_size": 10,
        "max_batch_timeout": 30
      }
    ]
  }
}
```

**Step 4: Implementation**

```typescript
// Producer: Send messages to queue
export default {
  async fetch(request, env): Promise<Response> {
    await env.MY_QUEUE.send({
      type: "email",
      to: "user@example.com",
      subject: "Hello",
    });

    return Response.json({ queued: true });
  },
} satisfies ExportedHandler<Env>;

// Consumer: Process messages from queue
export default {
  async queue(batch, env): Promise<void> {
    for (const message of batch.messages) {
      const { type, to, subject } = message.body;

      // Process the message
      await sendEmail(to, subject);

      // Acknowledge successful processing
      message.ack();
    }
  },
} satisfies ExportedHandler<Env>;
```

**Learn more:** [Cloudflare Queues Documentation](https://developers.cloudflare.com/queues/)

## AI Bindings

Cloudflare provides AI capabilities through Workers AI and AI Gateway. Use AI bindings when you need:

- On-demand AI inference (LLMs, embeddings, image generation)
- AI Gateway for observability and caching
- Edge-based AI processing

### Workers AI Binding

**Step 1: Add to `wrangler.jsonc`**

```jsonc
{
  "ai": {
    "binding": "AI"
  }
}
```

**Step 2: Use in Worker**

```typescript
export default {
  async fetch(request, env): Promise<Response> {
    const response = await env.AI.run("@cf/meta/llama-2-7b-chat-int8", {
      messages: [
        { role: "user", content: "What is Cloudflare?" }
      ],
    });

    return Response.json(response);
  },
} satisfies ExportedHandler<Env>;
```

### AI Gateway Setup

AI Gateway provides caching, rate limiting, and analytics for AI requests.

**Step 1: Create gateway at:** [Cloudflare Dashboard > AI > AI Gateway](https://dash.cloudflare.com/?to=/:account/ai/ai-gateway)

**Step 2: Configure in code**

```typescript
// Route requests through AI Gateway
const gateway = "https://gateway.ai.cloudflare.com/v1/{account_id}/{gateway_id}/openai";

const response = await fetch(`${gateway}/chat/completions`, {
  method: "POST",
  headers: {
    "Authorization": `Bearer ${env.OPENAI_API_KEY}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    model: "gpt-4",
    messages: [{ role: "user", content: "Hello!" }],
  }),
});
```

For detailed AI integration patterns, see the `AI_INTEGRATION.md` guide (if available in your project).

**Learn more:**
- [Workers AI Documentation](https://developers.cloudflare.com/workers-ai/)
- [AI Gateway Documentation](https://developers.cloudflare.com/ai-gateway/)

## Secrets Management

Secrets are encrypted environment variables for sensitive data like API keys, tokens, and passwords.

### Creating Secrets

**Interactive method (recommended):**

```bash
npx wrangler secret put SECRET_NAME
```

This prompts you to enter the secret value securely (hidden input).

**From file:**

```bash
echo "secret-value" | npx wrangler secret put SECRET_NAME
```

**Bulk from .env file:**

```bash
# Not recommended for production, but useful for migration
cat .env | grep -v '^#' | while IFS='=' read -r key value; do
  echo "$value" | npx wrangler secret put "$key"
done
```

### Local Development with Secrets

**Use `.dev.vars` file (gitignored):**

Create `.dev.vars` in project root:

```bash
# .dev.vars
SECRET_NAME=local-secret-value
API_KEY=test-api-key-123
DATABASE_URL=postgresql://localhost/mydb
```

**Important:** Add `.dev.vars` to `.gitignore`!

```bash
echo ".dev.vars" >> .gitignore
```

Wrangler automatically loads `.dev.vars` during `wrangler dev`.

### Production Secrets

**Add secrets via CLI:**

```bash
# Production
npx wrangler secret put OPENAI_API_KEY

# Specific environment
npx wrangler secret put OPENAI_API_KEY --env staging
```

**Manage secrets:**

```bash
# List secrets (shows names only, not values)
npx wrangler secret list

# Delete secret
npx wrangler secret delete SECRET_NAME
```

### Accessing in Worker Code

```typescript
export default {
  async fetch(request, env): Promise<Response> {
    // Access secrets via env
    const apiKey = env.OPENAI_API_KEY;
    const dbUrl = env.DATABASE_URL;

    // Use in requests
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      headers: {
        "Authorization": `Bearer ${apiKey}`,
      },
    });

    return Response.json({ success: true });
  },
} satisfies ExportedHandler<Env>;
```

### Best Practices

1. **Never commit secrets** to version control
2. **Use different secrets** for dev/staging/production
3. **Rotate secrets regularly** (update with `secret put`)
4. **Minimize secret access** (principle of least privilege)
5. **Use `.dev.vars`** for local development
6. **Document required secrets** in README without values
7. **Use Wrangler secrets** instead of environment variables for sensitive data

**Example README section:**

```markdown
## Required Secrets

Set these secrets before deployment:

```bash
npx wrangler secret put OPENAI_API_KEY
npx wrangler secret put DATABASE_PASSWORD
npx wrangler secret put JWT_SECRET
```

For local development, create `.dev.vars`:

```bash
OPENAI_API_KEY=sk-...
DATABASE_PASSWORD=local-password
JWT_SECRET=local-secret
```
```

## Environment Management

Wrangler supports multiple environments (dev, staging, production) with environment-specific configuration.

### Development vs Production

**Default environment (production):**

```bash
npx wrangler deploy  # Deploys to production
```

**Named environments:**

```bash
npx wrangler deploy --env staging  # Deploys to staging
npx wrangler deploy --env dev      # Deploys to dev
```

### Environment-Specific Bindings

Configure different bindings per environment in `wrangler.jsonc`:

```jsonc
{
  "name": "my-app",
  "main": "worker/index.ts",
  "compatibility_date": "2025-11-09",

  // Production bindings
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "production-db",
      "database_id": "prod-id-xxx"
    }
  ],

  "kv_namespaces": [
    {
      "binding": "MY_KV",
      "id": "prod-kv-id"
    }
  ],

  // Staging environment
  "env": {
    "staging": {
      "name": "my-app-staging",
      "d1_databases": [
        {
          "binding": "DB",
          "database_name": "staging-db",
          "database_id": "staging-id-xxx"
        }
      ],
      "kv_namespaces": [
        {
          "binding": "MY_KV",
          "id": "staging-kv-id"
        }
      ]
    },
    "dev": {
      "name": "my-app-dev",
      "d1_databases": [
        {
          "binding": "DB",
          "database_name": "dev-db",
          "database_id": "dev-id-xxx"
        }
      ]
    }
  }
}
```

### Using wrangler.jsonc Environments

**Deploy to specific environment:**

```bash
npx wrangler deploy --env staging
```

**Local dev with environment:**

```bash
npx wrangler dev --env staging
```

**Manage secrets per environment:**

```bash
npx wrangler secret put API_KEY --env staging
```

### .dev.vars for Local Secrets

Use `.dev.vars` for local-only secrets and variables:

```bash
# .dev.vars (gitignored)
NODE_ENV=development
DEBUG=true
API_KEY=test-key-123
```

These are automatically loaded during `wrangler dev`.

### Environment Detection in Code

```typescript
export default {
  async fetch(request, env): Promise<Response> {
    // Check environment via custom variable
    const isProduction = env.ENVIRONMENT === "production";

    // Different behavior per environment
    const apiUrl = isProduction
      ? "https://api.example.com"
      : "https://staging-api.example.com";

    return Response.json({ environment: env.ENVIRONMENT });
  },
} satisfies ExportedHandler<Env>;
```

Set environment identifier:

```jsonc
{
  "vars": {
    "ENVIRONMENT": "production"
  },
  "env": {
    "staging": {
      "vars": {
        "ENVIRONMENT": "staging"
      }
    }
  }
}
```

## Local Development

### Setting Up Local Environment

**Start development server:**

```bash
npm run dev
# Or directly:
npx wrangler dev
```

This starts:
- Vite dev server for React app (usually http://localhost:5173)
- Worker runtime for API routes

### Using --local vs --remote

**Local mode (default):**

```bash
npx wrangler dev --local
```

- Bindings run locally (D1, KV, etc.)
- No network requests to Cloudflare
- Fast startup
- Data is ephemeral (lost on restart)

**Remote mode:**

```bash
npx wrangler dev --remote
```

- Uses production bindings
- Real Cloudflare infrastructure
- Slower startup
- Changes affect production data (use carefully!)

**Best practice:** Use `--local` for development, `--remote` only when you need to test with production data.

### Local Database Persistence

By default, local data is lost when dev server stops. To persist:

```bash
npx wrangler dev --persist-to ./local-data
```

This creates a `local-data/` directory with:
- D1 databases (SQLite files)
- KV namespaces
- Other binding data

**Add to `.gitignore`:**

```bash
echo "local-data/" >> .gitignore
```

### Hot Reloading

Wrangler dev supports hot reloading:

- **Worker code** (`worker/index.ts`) - Auto-reloads on save
- **React code** (`src/`) - Vite HMR (Hot Module Replacement)
- **Configuration** (`wrangler.jsonc`) - Requires manual restart

### Debugging

**Console logging:**

```typescript
export default {
  async fetch(request, env): Promise<Response> {
    console.log("Request received:", request.url);

    // Logs appear in terminal running `wrangler dev`
    console.log("Environment:", env);

    return Response.json({ ok: true });
  },
} satisfies ExportedHandler<Env>;
```

**Error handling:**

```typescript
export default {
  async fetch(request, env): Promise<Response> {
    try {
      const data = await riskyOperation();
      return Response.json(data);
    } catch (error) {
      console.error("Error:", error);
      return Response.json(
        { error: error.message },
        { status: 500 }
      );
    }
  },
} satisfies ExportedHandler<Env>;
```

**Debugging with breakpoints:**

Workers run in V8 isolates and don't support traditional debuggers. Use:
- `console.log()` for debugging
- Error stack traces
- Wrangler tail for production debugging

### Testing Local Changes

**Test Worker endpoints:**

```bash
# Start dev server
npm run dev

# In another terminal, test API endpoint
curl http://localhost:5173/api/users

# Test with payload
curl -X POST http://localhost:5173/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Alice"}'
```

**Test React app:**

Open http://localhost:5173 in browser. Vite provides:
- Fast HMR (Hot Module Replacement)
- Error overlay
- React DevTools support

## Deployment Strategies

### CI/CD with GitHub Actions

This template includes automated deployment via GitHub Actions (`.github/workflows/deploy.yml`):

```yaml
name: Deploy to Cloudflare Workers

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    name: Deploy
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Deploy to Cloudflare Workers
        uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
```

**Required secrets:**

Set these in GitHub repository settings (Settings > Secrets and variables > Actions):

- `CLOUDFLARE_API_TOKEN` - Workers deploy permission
- `CLOUDFLARE_ACCOUNT_ID` - Your Cloudflare account ID

**Get these values:**

1. **Account ID:** https://dash.cloudflare.com/ (right sidebar)
2. **API Token:** https://dash.cloudflare.com/profile/api-tokens
   - Use "Edit Cloudflare Workers" template
   - Or create custom token with Workers Scripts:Edit permission

### Preview Deployments

Deploy pull requests to preview environments:

```yaml
# .github/workflows/preview.yml
name: Preview Deployment

on:
  pull_request:
    types: [opened, synchronize, reopened]

jobs:
  preview:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run build

      - name: Deploy Preview
        uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          command: deploy --env preview-pr-${{ github.event.pull_request.number }}
```

This creates unique preview deployments per PR.

### Rollback Procedures

**View deployment history:**

```bash
npx wrangler deployments list
```

Output:
```
Created    Version ID  Deployment ID
---------  ----------  --------------
2 mins     abc123      def456         (current)
1 hour     xyz789      uvw012
2 hours    qrs345      mno678
```

**Rollback to previous version:**

```bash
npx wrangler rollback
```

Or rollback to specific version:

```bash
npx wrangler rollback --version-id xyz789
```

**Important:** Rollback only affects Worker code, not:
- Database state (D1 migrations)
- KV data
- R2 objects
- Secrets

### Custom Domains

**Step 1: Add route in wrangler.jsonc:**

```jsonc
{
  "routes": [
    {
      "pattern": "api.example.com/*",
      "zone_name": "example.com"
    }
  ]
}
```

**Step 2: Configure DNS:**

1. Go to Cloudflare Dashboard > DNS
2. Add CNAME record: `api.example.com` → `your-worker.workers.dev`
3. Enable "Proxy" (orange cloud)

**Step 3: Deploy:**

```bash
npx wrangler deploy
```

**Workers.dev subdomain:**

By default, workers are accessible at: `your-worker-name.your-subdomain.workers.dev`

### Route Configuration

**Pattern matching:**

```jsonc
{
  "routes": [
    // Exact match
    { "pattern": "api.example.com/v1", "zone_name": "example.com" },

    // Wildcard
    { "pattern": "api.example.com/*", "zone_name": "example.com" },

    // Multiple patterns
    { "pattern": "*.example.com/api/*", "zone_name": "example.com" }
  ]
}
```

**Multiple routes:**

```jsonc
{
  "routes": [
    { "pattern": "app.example.com/*", "zone_name": "example.com" },
    { "pattern": "api.example.com/*", "zone_name": "example.com" },
    { "pattern": "admin.example.com/*", "zone_name": "example.com" }
  ]
}
```

## Observability

### Tail Logs (wrangler tail)

**Real-time log streaming:**

```bash
# Tail production logs
npx wrangler tail

# Pretty format
npx wrangler tail --format pretty

# Specific environment
npx wrangler tail --env staging

# Filter by status code
npx wrangler tail --status 500

# Filter by HTTP method
npx wrangler tail --method POST

# Filter by sampling rate (10%)
npx wrangler tail --sampling-rate 0.1
```

**Output example:**

```
GET https://my-app.workers.dev/ - Ok @ 11/9/2025, 3:30:00 PM
  └ [log] Request received: https://my-app.workers.dev/
  └ [log] User agent: Mozilla/5.0...

POST https://my-app.workers.dev/api/users - Ok @ 11/9/2025, 3:30:15 PM
  └ [log] Creating user: alice@example.com
  └ [log] User created with ID: 123
```

### Workers Analytics

**Access analytics:**

1. Cloudflare Dashboard > Workers & Pages
2. Select your worker
3. View Metrics tab

**Available metrics:**

- **Requests:** Total requests over time
- **Errors:** 4xx and 5xx error rates
- **Latency:** P50, P75, P99 response times
- **CPU Time:** Execution time per request
- **Success Rate:** Percentage of successful requests

**Query analytics via API:**

```bash
curl -X GET "https://api.cloudflare.com/client/v4/accounts/{account_id}/workers/scripts/{script_name}/analytics" \
  -H "Authorization: Bearer {api_token}"
```

### Error Tracking

**Custom error logging:**

```typescript
export default {
  async fetch(request, env, ctx): Promise<Response> {
    try {
      // Your logic
      return Response.json({ success: true });
    } catch (error) {
      // Log error details
      console.error("Error occurred:", {
        message: error.message,
        stack: error.stack,
        url: request.url,
        method: request.method,
        timestamp: new Date().toISOString(),
      });

      // Send to external error tracking (optional)
      ctx.waitUntil(
        fetch("https://error-tracker.example.com/log", {
          method: "POST",
          body: JSON.stringify({
            error: error.message,
            stack: error.stack,
            context: { url: request.url },
          }),
        })
      );

      return Response.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  },
} satisfies ExportedHandler<Env>;
```

**Integration with external services:**

Popular error tracking services:
- Sentry (supports Workers)
- Datadog
- Honeybadger
- LogFlare

### Performance Monitoring

**Measure execution time:**

```typescript
export default {
  async fetch(request, env): Promise<Response> {
    const start = Date.now();

    // Your logic
    const result = await processRequest(request, env);

    const duration = Date.now() - start;
    console.log(`Request processed in ${duration}ms`);

    return Response.json(result, {
      headers: {
        "X-Response-Time": `${duration}ms`,
      },
    });
  },
} satisfies ExportedHandler<Env>;
```

**Track specific operations:**

```typescript
async function timedOperation<T>(
  name: string,
  operation: () => Promise<T>
): Promise<T> {
  const start = Date.now();
  try {
    const result = await operation();
    const duration = Date.now() - start;
    console.log(`${name} completed in ${duration}ms`);
    return result;
  } catch (error) {
    const duration = Date.now() - start;
    console.error(`${name} failed after ${duration}ms:`, error);
    throw error;
  }
}

// Usage
const users = await timedOperation(
  "Fetch users from DB",
  () => env.DB.prepare("SELECT * FROM users").all()
);
```

## Troubleshooting

### Common Issues and Solutions

#### Build Errors

**Issue: TypeScript compilation errors**

```
error TS2304: Cannot find name 'Env'
```

**Solution:**

1. Run `npm run cf-typegen` to generate binding types
2. Check that `worker-configuration.d.ts` is created
3. Ensure `tsconfig.worker.json` includes generated types

**Issue: Module not found**

```
error: Cannot find module 'some-package'
```

**Solution:**

```bash
# Install missing dependency
npm install some-package

# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### Type Errors with Bindings

**Issue: `Property 'DB' does not exist on type 'Env'`**

**Solution:**

1. Ensure binding is configured in `wrangler.jsonc`:

```jsonc
{
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "my-db",
      "database_id": "xxx"
    }
  ]
}
```

2. Generate types:

```bash
npm run cf-typegen
```

3. Check `worker-configuration.d.ts` includes the binding
4. Restart TypeScript server in your editor

#### Local Development Issues

**Issue: `wrangler dev` fails to start**

```
Error: Could not resolve "..."
```

**Solution:**

```bash
# Install dependencies
npm install

# Clear Wrangler cache
rm -rf ~/.wrangler

# Try again
npm run dev
```

**Issue: Database not found in local development**

```
D1_ERROR: database not found
```

**Solution:**

```bash
# Apply migrations locally
npx wrangler d1 migrations apply my-database --local

# Or use persistence
npx wrangler dev --persist-to ./local-data
```

**Issue: Changes not reflecting in dev server**

**Solution:**

1. Hard restart the dev server (Ctrl+C and restart)
2. Clear browser cache
3. Check file watcher isn't hitting limits:

```bash
# Linux: Increase inotify watchers
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

#### Deployment Failures

**Issue: Authentication error**

```
Error: Authentication error
```

**Solution:**

1. Check `CLOUDFLARE_API_TOKEN` is set correctly
2. Verify token has "Workers Scripts:Edit" permission
3. Check `CLOUDFLARE_ACCOUNT_ID` matches your account
4. Regenerate token if needed

**Issue: Deploy succeeds but worker doesn't work**

**Solution:**

1. Check recent logs:

```bash
npx wrangler tail
```

2. Verify bindings are configured correctly
3. Check compatibility date is recent
4. Review error logs in dashboard

**Issue: Build fails in CI/CD**

```
Error: Build failed with exit code 1
```

**Solution:**

1. Test build locally:

```bash
npm run build
```

2. Check Node.js version matches CI (20.x recommended)
3. Ensure all dependencies are in `package.json` (not just `devDependencies`)
4. Check for environment-specific issues

#### Runtime Errors

**Issue: D1 query errors**

```
D1_ERROR: no such table: users
```

**Solution:**

1. Verify migrations applied:

```bash
npx wrangler d1 migrations list my-database
```

2. Apply missing migrations:

```bash
npx wrangler d1 migrations apply my-database
```

3. Check table name spelling

**Issue: KV namespace not found**

```
Error: KV namespace not found
```

**Solution:**

1. Verify namespace exists:

```bash
npx wrangler kv namespace list
```

2. Check binding ID matches in `wrangler.jsonc`
3. Create namespace if missing:

```bash
npx wrangler kv namespace create MY_KV
```

**Issue: CORS errors**

```
Access to fetch at '...' has been blocked by CORS policy
```

**Solution:**

Add CORS headers in Worker:

```typescript
export default {
  async fetch(request, env): Promise<Response> {
    // Handle preflight
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    }

    const response = await handleRequest(request, env);

    // Add CORS headers to response
    response.headers.set("Access-Control-Allow-Origin", "*");

    return response;
  },
} satisfies ExportedHandler<Env>;
```

**Issue: Request body is null**

```
TypeError: Cannot read property 'email' of null
```

**Solution:**

Parse request body correctly:

```typescript
// JSON body
const body = await request.json();

// Form data
const formData = await request.formData();

// Text
const text = await request.text();

// Check Content-Type header
const contentType = request.headers.get("Content-Type");
```

### Getting Help

**Official resources:**

- **Documentation:** https://developers.cloudflare.com/workers/
- **Discord:** https://discord.gg/cloudflaredev
- **Community Forum:** https://community.cloudflare.com/
- **GitHub Issues:** https://github.com/cloudflare/workers-sdk/issues

**Debugging checklist:**

1. Check Wrangler version: `npx wrangler --version`
2. Review recent logs: `npx wrangler tail`
3. Test locally: `npx wrangler dev --local`
4. Check dashboard for errors
5. Verify configuration: `wrangler.jsonc`
6. Regenerate types: `npm run cf-typegen`
7. Clear cache and reinstall: `rm -rf node_modules && npm install`

---

**Last Updated:** 2025-11-09

For project-specific information, see `CLAUDE.md` and other documentation files in this repository.
