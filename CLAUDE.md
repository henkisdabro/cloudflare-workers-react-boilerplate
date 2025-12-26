# CLAUDE.md

Instructions for Claude Code when working with this repository.

## Stack

- **Frontend:** Vite + React 19 + TypeScript
- **Backend:** Cloudflare Workers
- **Database:** D1 (SQL) or KV (key-value) - see CLOUDFLARE_WORKERS.md
- **CI/CD:** GitHub Actions (auto-deploys on push to `main`)

## Conventions

### Language
- **British English** spelling: colour, optimise, analyse, behaviour
- Use **hyphens** with spaces, NOT em-dashes

### Development Philosophy
- **KISS** - Choose straightforward solutions over complex ones
- **YAGNI** - Implement only what's needed now

## Commands

```bash
npm run dev          # Local dev server
npm run build        # Production build
npm run lint         # ESLint
npm run test         # Run tests
npm run deploy       # Build + deploy to Cloudflare
npm run cf-typegen   # Generate types after adding bindings
```

## Key Files

| File | Purpose |
|------|---------|
| `src/main.tsx` | React entry point |
| `worker/index.ts` | Worker fetch handler, API routes |
| `wrangler.jsonc` | Cloudflare Worker config |
| `vite.config.ts` | Vite config |
| `.github/workflows/deploy.yml` | CI/CD pipeline |

## Request Routing

- `/api/*` → Worker (`worker/index.ts`)
- All other routes → Static React SPA
- Non-existent routes → Falls back to `index.html`

## TypeScript

Three separate configs:
- `tsconfig.app.json` - Frontend
- `tsconfig.worker.json` - Worker
- `tsconfig.node.json` - Vite tooling

## Secrets

- **Local:** `.dev.vars` (gitignored)
- **Production:** `npx wrangler secret put SECRET_NAME`
- **CI/CD:** GitHub repository secrets

## Directives

- **NEVER assume or guess** - ask for clarification
- **Verify paths and modules** before use
- **Test your code** - no feature is complete without tests
- **Use `rg`** instead of `grep` and `find`
- **Run `npm run cf-typegen`** after adding any Cloudflare binding

## Documentation

- [CLOUDFLARE_WORKERS.md](CLOUDFLARE_WORKERS.md) - Workers guide
- [AI_INTEGRATION.md](AI_INTEGRATION.md) - AI patterns
- [SANDBOX.md](SANDBOX.md) - Sandbox SDK
- [docs/CONVENTIONS.md](docs/CONVENTIONS.md) - Style guide
- [.claude/README.md](.claude/README.md) - Slash commands
