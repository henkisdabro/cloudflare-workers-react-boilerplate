# CLAUDE.md

This file provides guidance to Claude Code when working with this repository.

## Core Technology Stack

- **Framework:** Vite + React 19
- **Language:** TypeScript
- **Platform:** Cloudflare Workers (static assets + API)
- **Version Control:** Git, hosted on GitHub
- **CI/CD:** GitHub Actions

## Development Philosophy

### KISS (Keep It Simple, Stupid)
Choose straightforward solutions over complex ones. Simple solutions are easier to understand, maintain, and debug.

### YAGNI (You Aren't Gonna Need It)
Implement features only when needed, not when you anticipate they might be useful.

## Language Conventions

**ALL text content MUST use British English spelling and grammar.**

Quick reference: colour (not color), optimise (not optimize), analyse (not analyze), behaviour (not behavior).

**Use hyphens `-` with spaces, NOT em-dashes `—`.**

For complete spelling/punctuation guidelines, see **[docs/CONVENTIONS.md](docs/CONVENTIONS.md)**.

## Common Commands

### Development
- `npm run dev` - Start local development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run deploy` - Build and deploy to Cloudflare Workers

### Testing
- `npm run test` - Run tests once
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report

### Cloudflare Bindings
- `npm run cf-typegen` - Generate TypeScript types for bindings (run after adding any binding)
- `npx wrangler d1 create <database-name>` - Create D1 database
- `npx wrangler kv namespace create <namespace-name>` - Create KV namespace

## Project Architecture

### TypeScript Setup
- `tsconfig.app.json` - Frontend React application
- `tsconfig.worker.json` - Cloudflare Worker
- `tsconfig.node.json` - Vite config and tooling
- `tsconfig.json` - Root config referencing all three

### Request Routing
- `/api/*` routes → Handled by Worker (`worker/index.ts`)
- All other routes → Static assets (React SPA)
- Non-existent routes → Falls back to `index.html` (SPA mode)

### Key Files
- `src/main.tsx` - React entry point
- `worker/index.ts` - Worker fetch handler (includes security headers and `/api/health` endpoint)
- `wrangler.jsonc` - Cloudflare Worker configuration
- `vite.config.ts` - Vite configuration
- `.github/workflows/deploy.yml` - CI/CD pipeline

## Claude Code Configuration

### Tool Permissions
`.claude/settings.json` includes pre-approved permissions for common operations (git, file editing, testing).

### Slash Commands
- `/start` - Complete project setup (run first!) - config, credentials, domain, deployment
- `/generate-prp` - Create Product Requirement Plans
- `/execute-prp` - Implement features from PRPs
- `/add-ai-feature` - Add AI capabilities (Claude API, Workers AI, AI Gateway)
- `/setup-database` - Configure D1 or KV storage
- `/setup-sandbox` - Configure Cloudflare Sandbox SDK for code execution
- `/add-binding` - Add Cloudflare bindings (R2, Queues, etc.)

See `.claude/README.md` for complete slash command documentation.

## Data Storage

### D1 (SQL Database)
Use for: relational data, structured queries, transactions, ACID guarantees.

```jsonc
"d1_databases": [{
  "binding": "DB",
  "database_name": "my-database",
  "database_id": "uuid-from-wrangler-create"
}]
```

### KV (Key-Value)
Use for: caching, sessions, config, high-read/low-write workloads.

```jsonc
"kv_namespaces": [{
  "binding": "KV",
  "id": "namespace-id-from-wrangler-create"
}]
```

### Sandbox SDK (Beta)
Use for: AI code execution, REPLs, data analysis, isolated environments.

```jsonc
"unsafe": {
  "bindings": [{ "name": "Sandbox", "type": "sandbox" }]
}
```

**Always run `npm run cf-typegen` after adding bindings.**

For detailed patterns and examples:
- **[CLOUDFLARE_WORKERS.md](CLOUDFLARE_WORKERS.md)** - Complete Cloudflare Workers guide
- **[AI_INTEGRATION.md](AI_INTEGRATION.md)** - AI integration patterns
- **[SANDBOX.md](SANDBOX.md)** - Sandbox SDK for code execution
- **[examples/](examples/)** - Working code examples

## AI Integration

### Quick Reference
- **Claude API** - Advanced reasoning, long conversations
- **Workers AI** - Edge inference, cost-effective
- **AI Gateway** - Caching and rate limiting for AI APIs
- **Sandbox SDK** - Safe execution of AI-generated code

Use `/add-ai-feature` for guided setup. See **[AI_INTEGRATION.md](AI_INTEGRATION.md)** for details.

## Security Best Practices

- Never commit secrets - use environment variables and `wrangler secret put`
- Use parameterised queries for database operations
- Implement rate limiting for APIs
- Worker includes built-in security headers (CSP, X-Frame-Options, etc.)

### Secrets Management
- **Local:** `.dev.vars` file (gitignored)
- **Production:** `npx wrangler secret put SECRET_NAME`
- **GitHub Actions:** Repository secrets (`CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`)

## Deployment

Automated on push to `main`:
1. GitHub Actions workflow triggers
2. Installs dependencies (`npm ci`)
3. Runs linter (`npm run lint`)
4. Runs tests (`npm run test`)
5. Builds Vite app and Worker (`npm run build`)
6. Deploys to Cloudflare's global edge network

Run `/start` to configure the required GitHub secrets and complete project setup.

## Important Notes

- **NEVER ASSUME OR GUESS** - Ask for clarification when uncertain
- **Verify file paths and module names** before use
- **Keep CLAUDE.md updated** when adding new patterns
- **Test your code** - No feature is complete without tests
- **Use `rg` (ripgrep)** instead of `grep` and `find`

## Search Commands

```bash
# Use rg instead of grep
rg "pattern"

# Use rg instead of find
rg --files -g "*.ts"
```
