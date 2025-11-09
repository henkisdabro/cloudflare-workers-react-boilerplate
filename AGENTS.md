# AGENTS.md

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


## Common Commands

- `npm run dev` - Start local development server
- `npm run build` - Build for production (TypeScript compilation + Vite build)
- `npm run lint` - Run ESLint
- `npm run preview` - Build and preview production build locally
- `npm run deploy` - Build and deploy to Cloudflare Workers
- `npm run cf-typegen` - Generate TypeScript types for Cloudflare bindings

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

## Deployment Flow

Deployment is fully automated on push to `main`:

1. Developer pushes commits to `main` branch
2. GitHub Actions workflow (`.github/workflows/deploy.yml`) triggers
3. Workflow uses `cloudflare/wrangler-action` to build and deploy
4. Wrangler builds both the Vite app and Worker, then deploys to Cloudflare


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