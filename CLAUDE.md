# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Core Technology Stack

- **Framework:** Vite + React 19
- **Language:** TypeScript
- **Platform:** Cloudflare Workers (handles both static asset serving for the React SPA and server-side API logic)
- **Version Control:** Git, hosted on GitHub
- **CI/CD:** GitHub Actions for automated deployments

## Core Development Philosophy

### KISS (Keep It Simple, Stupid)

Simplicity should be a key goal in design. Choose straightforward solutions over complex ones whenever possible. Simple solutions are easier to understand, maintain, and debug.

### YAGNI (You Aren't Gonna Need It)

Avoid building functionality on speculation. Implement features only when they are needed, not when you anticipate they might be useful in the future.

## AI Integration Patterns

This template supports integration with AI capabilities through multiple Cloudflare and Anthropic solutions. Choose the approach that best fits your use case:

### Quick Reference: AI Options

- **Claude API** - Direct integration with Anthropic's API for advanced AI features, best for complex reasoning and long conversations
- **Workers AI** - Cloudflare's native AI inference at the edge, best for low-latency, cost-effective AI operations
- **AI Gateway** - Cloudflare's caching and rate-limiting layer for AI APIs, best for production deployments with cost control

### Common Use Cases

- **Conversational AI**: Chat interfaces, customer support bots, interactive assistants
- **Content Generation**: Dynamic content creation, copywriting, summarization
- **Data Processing**: Text analysis, classification, sentiment analysis
- **Code Assistance**: Code generation, documentation, debugging help

### Basic Integration Example

```typescript
// worker/index.ts - Claude API integration
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.url.endsWith('/api/chat')) {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 1024,
          messages: [{ role: 'user', content: 'Hello, Claude!' }],
        }),
      });
      return response;
    }
  },
};
```

### Getting Started

Use the `/add-ai-feature` command for guided setup of AI capabilities in your project.

For detailed integration guides, best practices, and complete examples, see:
- **[AI_INTEGRATION.md](AI_INTEGRATION.md)** - Comprehensive AI integration documentation
- **[examples/ai/](examples/ai/)** - Working AI integration examples

## Common Commands

### Development & Build

- `npm run dev` - Start local development server
- `npm run build` - Build for production (TypeScript compilation + Vite build)
- `npm run lint` - Run ESLint
- `npm run preview` - Build and preview production build locally
- `npm run deploy` - Build and deploy to Cloudflare Workers

### Cloudflare Bindings & Types

- `npm run cf-typegen` - Generate TypeScript types for Cloudflare bindings (run after adding any binding)
- `npx wrangler d1 create <database-name>` - Create a new D1 database
- `npx wrangler d1 migrations create <database-name> <migration-name>` - Create a new D1 migration
- `npx wrangler d1 migrations apply <database-name>` - Apply D1 migrations
- `npx wrangler d1 migrations apply <database-name> --local` - Apply migrations to local database
- `npx wrangler kv namespace create <namespace-name>` - Create a new KV namespace
- `npx wrangler kv key put --binding=KV "key" "value"` - Set a KV key-value pair
- `npx wrangler kv key get --binding=KV "key"` - Get a KV value

### Local Development with Bindings

- `npm run dev` - Automatically uses local bindings (D1, KV) for development
- `npx wrangler d1 execute <database-name> --local --command="SELECT * FROM table"` - Query local D1 database
- `npx wrangler kv key list --binding=KV --local` - List local KV keys

## Project Architecture

### Dual-Build TypeScript Setup

This project uses TypeScript project references to separate concerns:

- `tsconfig.app.json` - Frontend React application configuration
- `tsconfig.worker.json` - Cloudflare Worker configuration
- `tsconfig.node.json` - Vite config and build tooling
- `tsconfig.json` - Root config that references all three

### Worker Request Handling

The Cloudflare Worker (`worker/index.ts`) uses a routing pattern:

- Routes matching `/api/*` are handled by the Worker's fetch handler and return JSON responses
- All other routes fall through (return 404) and are handled by the static asset serving
- Static assets use SPA mode (`not_found_handling: "single-page-application"` in `wrangler.jsonc`), which serves `index.html` for non-existent routes

### Key Files

- `src/main.tsx` - React application entry point
- `worker/index.ts` - Cloudflare Worker fetch handler for API routes
- `wrangler.jsonc` - Cloudflare Worker configuration (name, compatibility date, assets, bindings)
- `vite.config.ts` - Vite configuration with Cloudflare plugin (`@cloudflare/vite-plugin`)
- `.github/workflows/deploy.yml` - CI/CD pipeline using `cloudflare/wrangler-action@v3`

## Data Storage & Bindings

**This is a boilerplate template project** designed to be duplicated and customized for new website projects. When users request database or storage functionality, use Cloudflare's native storage products that integrate seamlessly with Workers:

### Cloudflare D1 (SQL Database)

**Use D1 when:** Users need relational data, structured queries, transactions, or traditional database features.

- Serverless SQLite database with zero-latency reads
- Configure in `wrangler.jsonc` under `[[d1_databases]]`
- Access via `env.DB` binding in Worker code
- Create with: `npx wrangler d1 create <database-name>`
- Run migrations with: `npx wrangler d1 migrations apply <database-name>`
- Use `npm run cf-typegen` to generate TypeScript types for bindings

**Example configuration:**

```jsonc
[[d1_databases]]
binding = "DB"
database_name = "my-database"
database_id = "uuid-from-wrangler-create"
```

### Cloudflare KV (Key-Value Storage)

**Use KV when:** Users need simple key-value storage, caching, session data, or configuration storage.

- Low-latency key-value store optimized for high-read workloads
- Configure in `wrangler.jsonc` under `[[kv_namespaces]]`
- Access via `env.KV` binding in Worker code
- Create with: `npx wrangler kv namespace create <namespace-name>`
- Use `npm run cf-typegen` to generate TypeScript types for bindings

**Example configuration:**

```jsonc
[[kv_namespaces]]
binding = "KV"
id = "namespace-id-from-wrangler-create"
```

### General Guidance

- **Always recommend Cloudflare-native storage** over external databases (PostgreSQL, MongoDB, etc.) for this stack
- **Run `npm run cf-typegen`** after adding bindings to get proper TypeScript types in `env.d.ts`
- **Bindings are available** in the Worker's `env` parameter: `env.DB`, `env.KV`, etc.
- **Local development:** Use `--local` flag with wrangler commands for local testing
- **Multiple environments:** Use different bindings for dev/staging/production as needed
- **Guided setup:** Use `/setup-database` command for interactive database setup
- **Other bindings:** Use `/add-binding` command to add other Cloudflare bindings (R2, Queues, etc.)

### Working Examples

Explore practical implementations in the **[examples/database/](examples/database/)** directory:
- **D1 Contact Form** - Complete example with schema, migrations, and form handling
- **KV Sessions** - Session management with Cloudflare KV

## Database Patterns

### When to Use D1 vs KV

**Choose D1 (SQL Database) when you need:**
- Relational data with foreign keys and joins
- Complex queries with filtering, sorting, and aggregation
- Transactions and ACID guarantees
- Structured data with schemas
- Full-text search capabilities
- Examples: User accounts, blog posts, e-commerce orders, CMS content

**Choose KV (Key-Value Store) when you need:**
- Simple key-value lookups
- Caching frequently accessed data
- Session storage
- Configuration settings
- High-read, low-write workloads
- Eventually consistent data
- Examples: API response caching, feature flags, user sessions, temporary data

### Quick Setup Reference

```bash
# D1 Database Setup
npx wrangler d1 create my-database
# Add to wrangler.jsonc under [[d1_databases]]
npm run cf-typegen

# KV Namespace Setup
npx wrangler kv namespace create my-kv
# Add to wrangler.jsonc under [[kv_namespaces]]
npm run cf-typegen
```

### Common Patterns

**D1 CRUD Operations:**
```typescript
// Create
await env.DB.prepare('INSERT INTO users (name, email) VALUES (?, ?)')
  .bind(name, email)
  .run();

// Read
const user = await env.DB.prepare('SELECT * FROM users WHERE id = ?')
  .bind(userId)
  .first();

// Update
await env.DB.prepare('UPDATE users SET name = ? WHERE id = ?')
  .bind(newName, userId)
  .run();

// Delete
await env.DB.prepare('DELETE FROM users WHERE id = ?')
  .bind(userId)
  .run();
```

**KV Operations:**
```typescript
// Set value
await env.KV.put('session:123', JSON.stringify(sessionData), {
  expirationTtl: 3600, // 1 hour
});

// Get value
const sessionData = await env.KV.get('session:123', 'json');

// Delete value
await env.KV.delete('session:123');

// List keys
const keys = await env.KV.list({ prefix: 'session:' });
```

**Session Management with KV:**
```typescript
// Store session
const sessionId = crypto.randomUUID();
await env.KV.put(
  `session:${sessionId}`,
  JSON.stringify({ userId, createdAt: Date.now() }),
  { expirationTtl: 86400 } // 24 hours
);

// Retrieve session
const session = await env.KV.get(`session:${sessionId}`, 'json');
```

**Caching with KV:**
```typescript
// Check cache first
let data = await env.KV.get('api:data', 'json');
if (!data) {
  // Cache miss - fetch from source
  data = await fetchFromAPI();
  // Cache for 5 minutes
  await env.KV.put('api:data', JSON.stringify(data), { expirationTtl: 300 });
}
return data;
```

### Migration Workflows

**D1 Migration Best Practices:**

1. **Create Migration:**
   ```bash
   npx wrangler d1 migrations create my-database create_users_table
   ```

2. **Write Migration SQL** (in `migrations/` directory):
   ```sql
   -- Up migration
   CREATE TABLE users (
     id INTEGER PRIMARY KEY AUTOINCREMENT,
     name TEXT NOT NULL,
     email TEXT UNIQUE NOT NULL,
     created_at DATETIME DEFAULT CURRENT_TIMESTAMP
   );
   ```

3. **Test Locally:**
   ```bash
   npx wrangler d1 migrations apply my-database --local
   ```

4. **Deploy to Production:**
   ```bash
   npx wrangler d1 migrations apply my-database
   ```

### Additional Resources

- **[CLOUDFLARE_WORKERS.md](CLOUDFLARE_WORKERS.md)** - Detailed Cloudflare Workers and bindings documentation
- **[examples/database/](examples/database/)** - Working database integration examples
- Use **`/setup-database`** command for guided database setup

## Deployment Flow

Deployment is fully automated on push to `main`:

1. Developer pushes commits to `main` branch
2. GitHub Actions workflow (`.github/workflows/deploy.yml`) triggers
3. Workflow uses `cloudflare/wrangler-action` to build and deploy
4. Wrangler builds both the Vite app and Worker, then deploys to Cloudflare


## Working with Examples

The **`examples/`** directory contains production-ready reference implementations demonstrating common patterns and integrations. These examples are designed to be copied and adapted into your project.

### Available Examples

**AI Integration** (`examples/ai/`)
- **Simple Claude Chat** - Basic chat interface with Claude API
- **Streaming Chat** - Real-time streaming responses with Server-Sent Events
- **Workers AI Chat** - Edge AI with Cloudflare Workers AI
- **AI Gateway Integration** - Cost optimization and caching with AI Gateway

**Database & Storage** (`examples/database/`)
- **D1 Contact Form** - Complete form with D1 database storage, including schema and migrations
- **KV Sessions** - Session management using Cloudflare KV

### How to Use Examples

1. **Browse Examples**: Explore the `examples/` directory to find relevant patterns
2. **Read Documentation**: Each example has its own README with setup instructions
3. **Copy Code**: Copy relevant files to your project structure
4. **Adapt Configuration**: Update `wrangler.jsonc` with necessary bindings
5. **Generate Types**: Run `npm run cf-typegen` after adding bindings
6. **Test Locally**: Verify functionality with `npm run dev`

### Integration Workflow

```bash
# 1. Review the example you want to use
cat examples/database/d1-contact-form/README.md

# 2. Copy relevant files to your project
# Frontend: examples/ai/simple-chat/src/ → src/
# Worker: examples/ai/simple-chat/worker/ → worker/

# 3. Update wrangler.jsonc with bindings
# Add necessary D1, KV, or other bindings

# 4. Generate TypeScript types
npm run cf-typegen

# 5. Test locally
npm run dev
```

### Example File Locations

- **Frontend Code**: `examples/*/src/` - React components and hooks
- **Worker Code**: `examples/*/worker/` - API endpoints and business logic
- **Database**: `examples/*/migrations/` - D1 migration files
- **Configuration**: `examples/*/wrangler.example.jsonc` - Example binding configurations

For comprehensive guides and detailed explanations, see **[examples/README.md](examples/README.md)**.

## 🛡️ Security Best Practices

### Security Guidelines

- Never commit secrets - use environment variables
- Use parameterized queries for database operations
- Implement rate limiting for APIs
- Use HTTPS for all external communications
- Implement proper authentication and authorization

### Secrets Management

Cloudflare credentials are stored as GitHub Actions secrets (not in code):

- `CLOUDFLARE_API_TOKEN` - API token with Workers edit permissions
- `CLOUDFLARE_ACCOUNT_ID` - Cloudflare account identifier

Access these in workflows via `${{ secrets.VARIABLE_NAME }}` syntax.

## ⚠️ Important Notes

- **NEVER ASSUME OR GUESS** - When in doubt, ask for clarification
- **Always verify file paths and module names** before use
- **Keep CLAUDE.md updated** when adding new patterns or dependencies
- **Test your code** - No feature is complete without tests
- **Document your decisions** - Future developers (including yourself) will thank you

## 🔍 Search Command Requirements

**CRITICAL**: Always use `rg` (ripgrep) instead of traditional `grep` and `find` commands:

```bash
# ❌ Don't use grep
grep -r "pattern" .

# ✅ Use rg instead
rg "pattern"

# ❌ Don't use find with name
find . -name "*.py"

# ✅ Use rg with file filtering
rg --files | rg "\.py$"
# or
rg --files -g "*.py"
```

**Enforcement Rules:**

```
(
    r"^grep\b(?!.*\|)",
    "Use 'rg' (ripgrep) instead of 'grep' for better performance and features",
),
(
    r"^find\s+\S+\s+-name\b",
    "Use 'rg --files | rg pattern' or 'rg --files -g pattern' instead of 'find -name' for better performance",
),
```